# NocoBase 2.4 Alpha、AI Portal、邮件与地图验证指南

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

当前已确认的官方测试镜像为 `nocobase/nocobase:2.4-alpha`。启动前再执行镜像清单验证：

```bash
docker manifest inspect nocobase/nocobase:2.4-alpha >/dev/null
```

只有命令返回成功才继续。测试期间保持该标签，不使用不固定版本的 `latest`。Alpha 同一标签的镜像内容仍可能被更新，正式验收时需额外记录镜像 digest。

### 2.3 创建测试环境变量

```bash
cp .env.nocobase-alpha.example .env.nocobase-alpha
chmod 600 .env.nocobase-alpha
```

替换所有示例秘密。DeepSeek、邮件和地图凭据不得写入 Git，也不要在截图或聊天中发送。

## 3. 启动隔离 Alpha 实例

Alpha Compose 是完全独立的本地测试环境，使用独立网络、数据库和 storage 数据卷，只将 NocoBase 绑定到本机 `127.0.0.1:13001`：

```bash
docker compose \
  --env-file .env.nocobase-alpha \
  -f docker-compose.nocobase-alpha.yml \
  config --quiet

docker compose \
  --env-file .env.nocobase-alpha \
  -f docker-compose.nocobase-alpha.yml \
  up -d nocobase-alpha-mysql nocobase-alpha
```

检查：

```bash
docker compose \
  --env-file .env.nocobase-alpha \
  -f docker-compose.nocobase-alpha.yml \
  ps nocobase-alpha-mysql nocobase-alpha
```

本地访问 `http://127.0.0.1:13001`。该文件不直接用于生产 Cloudflare Tunnel；服务器恢复后需单独设计测试域名与 Docker 网络，测试完成前不修改 `cms.geyangyang.vip` 和 `blog.geyangyang.vip`。

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

本地 Alpha 实例已启用官方 `AI employees` 和 `AI: MCP server` 插件，并创建 Modern page (v2) 页面 `AI Portal`。插件名称、授权类型和可用范围以 2.4 Alpha 界面为准；如果插件显示为商业版或需要许可证，不使用非官方包绕过授权。

DeepSeek 建议配置：

| 配置 | 值 |
| --- | --- |
| Provider 类型 | NocoBase 内置 `DeepSeek` |
| Base URL | 留空，使用 Provider 默认地址 |
| API Key | 在 NocoBase 密钥配置中填写，不写入页面文本和 Git |
| 模型 | `Deepseek Flash` |
| 用途 | 内容草稿、摘要、分类建议和内部问答 |

Atlas 已启用 dedicated model configuration 并固定使用 `Deepseek Flash`。测试提示词成功得到中文回复，说明 AI Portal、NocoBase Provider 与 DeepSeek API 链路可用。

首次验证只发送不含密码、Token、个人隐私和未公开评论的测试文本。设置调用额度，并检查日志不会输出完整 API Key。该能力只在隔离 Alpha 环境验证，尚未接入生产 CMS。

## 6. 邮件功能

本次启用 `Notification manager` 和 `Notification: Email`，插件提供 SMTP 传输方式。个人 Gmail 测试渠道采用以下配置：

| 配置 | 值 |
| --- | --- |
| Transport | SMTP |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Secure | `True` |
| Account / From | 测试 Gmail 地址 |
| Password | Google 应用专用密码，不使用 Gmail 日常密码 |

`Gmail SMTP 测试` 工作流通过 Notification 节点完成 Test run，测试邮件已发送。工作流保持 `Off`，避免定时重复发送。该方案只用于功能验证，不作为正式群发服务；凭据和日志不得进入 Git，截图需遮挡邮箱和应用专用密码。

## 7. 高德地图

NocoBase 的 `Block: Map` 同时支持 AMap 和 Google Maps。Google Maps Platform 要求 Google Cloud 结算账号，而中国大陆无法按真实地区创建对应结算资料，因此本次不使用虚假地区或第三方结算账号，改用高德开放平台。

1. 启用 `Block: Map` 插件；
2. 在 Map manager 的 AMap 配置中填写 Web 端 JS API Key 和 `securityJsCode`；
3. 创建 `locations` 测试集合，包含 `name` 字符串字段和 `location` Point 字段；
4. 创建测试地点并通过 AMap 选点；
5. 添加 Map 区块，以 `location` 为 Map field、`name` 为 Marker field；
6. 验证底图和地点标记均能正常显示。

Key 和 `securityJsCode` 不写入项目文件或截图。测试页面只需保留一个 Map 区块；该地图用于验证第三方地图与 NocoBase 数据驱动展示，不属于当前个人博客的核心功能。

## 8. 验收清单

- [x] Alpha 镜像标签来自官方并记录镜像 digest
- [x] Alpha 使用独立网络、数据库和 storage 数据卷
- [ ] 三个集合和关联迁移成功
- [x] 原生产后台和博客在测试期间持续可用
- [x] 标准后台与 AI Portal 均可登录
- [x] DeepSeek 对话成功，Key 未进入 Git
- [x] Gmail SMTP 测试成功，凭据未进入 Git
- [x] 高德地图底图与地点标记显示成功，凭据未进入 Git
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

