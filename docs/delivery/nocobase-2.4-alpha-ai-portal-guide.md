# NocoBase 2.4 Alpha、AI Portal 与 Google 服务接入方案

> 原则：先在隔离测试实例验证，再决定是否替换生产 `nocobase/nocobase:2.2.40`。Alpha 实例不得直接连接生产数据库卷。

## 1. 双后台目标

双后台共享同一套业务概念，但测试阶段不共享生产数据库：

```text
cms.geyangyang.vip        -> NocoBase 2.2.40 稳定生产后台
cms-alpha.geyangyang.vip  -> NocoBase 2.4 Alpha 测试后台
                               |- 标准管理界面
                               `- AI Portal
```

完成数据兼容、权限和插件验收后，才可以讨论把生产域名切换到 2.4。不要同时让两个不同版本写入同一个 MySQL 数据库。

## 2. 启动前检查

### 2.1 备份生产数据

```bash
mkdir -p /opt/backups/yangyang-cms

docker compose \
  --env-file .env.production \
  -f docker-compose.production.yml \
  exec -T nocobase-mysql \
  sh -c 'exec mysqldump --no-tablespaces -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > /opt/backups/yangyang-cms/nocobase-before-alpha-$(date +%F-%H%M%S).sql
```

备份文件必须非空，并复制到服务器之外。Docker 数据卷不是备份。

### 2.2 验证官方镜像标签

从 NocoBase 官方发布页或官方 Docker 仓库取得准确的 2.4 Alpha 标签，再执行：

```bash
docker manifest inspect nocobase/nocobase:<准确标签> >/dev/null
```

只有命令返回成功，才能把完整镜像名写入服务器 `.env.nocobase-alpha` 的 `NOCOBASE_ALPHA_IMAGE`。不得猜测标签，也不要使用不固定版本的 `latest`。

### 2.3 创建测试环境变量

```bash
cp .env.nocobase-alpha.example .env.nocobase-alpha
chmod 600 .env.nocobase-alpha
```

替换所有示例秘密。DeepSeek 和 Google 凭据先不要写入 Git，也不要在截图或聊天中发送。

## 3. 启动隔离 Alpha 实例

Alpha 覆盖文件复用生产 Compose 的 `cms_internal` 网络，但使用独立数据库和 storage 数据卷：

```bash
docker compose \
  --env-file .env.production \
  --env-file .env.nocobase-alpha \
  -f docker-compose.production.yml \
  -f docker-compose.nocobase-alpha.yml \
  config --quiet

docker compose \
  --env-file .env.production \
  --env-file .env.nocobase-alpha \
  -f docker-compose.production.yml \
  -f docker-compose.nocobase-alpha.yml \
  up -d nocobase-alpha-mysql nocobase-alpha
```

检查：

```bash
docker compose \
  --env-file .env.production \
  --env-file .env.nocobase-alpha \
  -f docker-compose.production.yml \
  -f docker-compose.nocobase-alpha.yml \
  ps nocobase-alpha-mysql nocobase-alpha
```

在 Cloudflare Tunnel 增加临时主机名 `cms-alpha.geyangyang.vip`，服务目标使用 `http://nocobase-alpha:80`。测试完成前不要修改 `cms.geyangyang.vip` 和 `blog.geyangyang.vip`。

## 4. 数据兼容验证

不要手工复制数据库数据目录。使用 SQL 备份恢复到 Alpha 数据库，让 NocoBase 自己执行版本迁移。

恢复前必须确认目标是 `nocobase-alpha-mysql`，不是生产 `nocobase-mysql`。恢复后依次检查：

1. `siteProfiles`、`articles`、`articleFeedback` 集合存在；
2. 记录数量、文章 slug 和状态正确；
3. 文章与评论关联正确；
4. 网站接口角色仍然是最小权限；
5. API Token 是否需要重新创建；
6. 草稿、软删除文章和待审核评论不会被公开读取；
7. 评论编辑表单包含 `status` 字段。

Alpha 验证期间，Next.js 生产站点继续读取 2.2.40，不切换 `NOCOBASE_INTERNAL_URL`。

## 5. AI Portal 与内置 AI

在 Alpha 后台的插件管理器中确认并启用官方 AI、LLM Provider 和 AI Portal 相关插件。插件名称、授权类型和可用范围以 2.4 Alpha 界面为准；如果插件显示为商业版或需要许可证，不使用非官方包绕过授权。

DeepSeek 建议配置：

| 配置 | 值 |
| --- | --- |
| Provider 类型 | OpenAI-compatible（以插件实际选项为准） |
| Base URL | `https://api.deepseek.com` |
| API Key | 在 NocoBase 密钥配置中填写，不写入页面文本和 Git |
| 模型 | 先选择账号实际可用的对话模型 |
| 用途 | 内容草稿、摘要、分类建议和内部问答 |

首次验证只发送不含密码、Token、个人隐私和未公开评论的测试文本。设置调用额度，并检查日志不会输出完整 API Key。

## 6. 邮件功能

先在插件管理器确认邮件插件支持的协议：

- 如果支持 SMTP：优先使用 Google Workspace SMTP Relay；
- 如果只拥有个人 Gmail：可以评估两步验证后的应用专用密码，但不建议作为正式批量邮件服务；
- 如果支持 Gmail API/OAuth：在 Google Cloud 创建 OAuth 客户端并按最小 scope 授权；
- 如果插件不支持 Gmail API：不能仅凭 Google Cloud API Key 实现发信，需要 SMTP Relay 或适配插件。

第一阶段只配置“管理员测试邮件”，不向访客群发。发件地址、回复地址和失败日志需要可追踪，但日志不得记录 OAuth Secret 或邮箱密码。

## 7. Google Maps Platform

1. 在 Google Cloud 创建或选择独立项目并绑定结算账号；
2. 只启用实际需要的 Maps JavaScript API、Places API 或 Geocoding API；
3. 创建单独的浏览器 API Key；
4. 使用 HTTP referrer 限制，只允许 `cms-alpha.geyangyang.vip/*`；
5. 添加 API 限制和预算告警；
6. 在 NocoBase 地图字段或地图插件中填写受限 Key；
7. 生产切换后再增加正式域名，不能使用无域名限制的 Key。

地图浏览器 Key 本身会出现在浏览器请求中，安全性依赖域名限制、API 限制和配额，而不是把它当成完全不可见的秘密。

## 8. 验收清单

- [ ] Alpha 镜像标签来自官方并通过 manifest 验证
- [ ] Alpha 使用独立数据库和 storage 数据卷
- [ ] 三个集合和关联迁移成功
- [ ] 原生产后台和博客在测试期间持续可用
- [ ] 标准后台与 AI Portal 均可登录
- [ ] DeepSeek 对话成功，Key 未出现在浏览器和日志中
- [ ] 邮件测试成功，凭据未进入 Git
- [ ] 地图显示成功，Key 已限制域名、API 和配额
- [ ] 网站接口角色仍符合最小权限
- [ ] 已完成回滚演练

## 9. 生产切换门槛

只有全部验收通过后，才允许：

1. 再次备份生产 NocoBase 数据库与 storage；
2. 在维护窗口停止生产写入；
3. 升级生产实例或将域名切换到已验证实例；
4. 验证博客读取、评论提交、评论审核和 `/admin` 跳转；
5. 保留 2.2.40 镜像和升级前备份，直到观察期结束。

出现迁移错误、插件缺失、API 权限扩大、评论链路失败或无法回滚时，禁止切换生产。

