# 盖洋阳的个人 CMS

这是一个从零实现的个人主页、博客和内容管理系统。项目先用 Next.js、Prisma 和 MySQL 手写公开站点与后台，再将最终管理后台迁移到 NocoBase。这个过程用于理解 CMS 的数据、权限、审核、部署和运维闭环。

公开站点：[https://blog.geyangyang.vip](https://blog.geyangyang.vip)

管理后台：[https://cms.geyangyang.vip/admin](https://cms.geyangyang.vip/admin)

## 已完成功能

### 公开站点

- 从 NocoBase 读取个人介绍和已发布文章
- 使用稳定的文章 `slug` 生成公开地址
- 服务端隐藏草稿、下线和软删除文章
- 访客可提交昵称、评论和 `0～5` 星评分
- 新评论默认为 `PENDING`，只展示 `APPROVED` 评论

### NocoBase 管理后台

- 管理个人资料
- 创建、编辑、发布和下线文章
- 管理文章状态与软删除字段
- 将评论修改为 `APPROVED` 或 `REJECTED`
- 用角色、操作和字段权限限制网站 API Token
- 访问 `blog.geyangyang.vip/admin` 自动跳转到 NocoBase

## 最终架构

```text
访客 -> Cloudflare Tunnel -> Next.js 公开站点
                              -> NocoBase REST API
                              -> NocoBase MySQL

管理员 -> Cloudflare Tunnel -> NocoBase 管理后台
                                    -> NocoBase MySQL
```

Next.js 专注公开页面、服务端过滤和评论提交；NocoBase 是唯一管理后台；MySQL 保存数据；Docker Compose 管理服务；Cloudflare Tunnel 提供两个 HTTPS 入口。旧 Prisma 数据源和手写后台代码暂时保留为学习记录与迁移回退路径，生产环境使用 `CONTENT_SOURCE=nocobase`。

## 技术选型

| 层面 | 技术 | 选择原因 |
| --- | --- | --- |
| 公开站点 | Next.js 15 + React 19 | 同时处理页面、服务端查询和表单提交 |
| 开发语言 | TypeScript | 通过类型检查减少字段和参数错误 |
| 内容管理 | NocoBase 2.2.40 | 快速配置数据集、表格、表单、审核和权限 |
| 数据库 | MySQL 8.4 | 适合文章、评论和关联数据 |
| 旧系统数据访问 | Prisma 6 | 生成类型安全客户端并记录数据库迁移 |
| 运行环境 | Docker Compose | 统一本地与服务器容器配置 |
| 公网入口 | Cloudflare Named Tunnel | 通过 HTTPS 访问服务，不直接公开 App 和数据库端口 |

## NocoBase 数据集

- `siteProfiles`：个人资料，公开站点读取 `id = 1`
- `articles`：文章、slug、状态、发布时间和软删除时间
- `articleFeedback`：昵称、评论、评分和审核状态

网站 API Token 只能读取资料与已发布文章、读取已通过评论、创建待审核评论。它不具备管理员权限，也不能将新评论直接写成 `APPROVED`。

## 本地运行

1. 安装 Node.js 和 Docker Desktop。
2. 将 `.env.example` 复制为 `.env`，填写本地密密。
3. 启动所有服务：

```bash
npm install
docker compose up -d
npm run db:generate
npm run dev
```

本地公开站点默认为 `http://localhost:3000`，NocoBase 默认为 `http://localhost:13000`。完整的数据集、权限与切换步骤见 [NocoBase 后台迁移说明](docs/delivery/nocobase-migration-guide.md)。

## 生产部署

生产 Compose 运行 `app`、`nocobase`、`nocobase-mysql`、旧数据回退用 `mysql` 和 `cloudflared`。Next.js 使用 standalone 输出减少运行镜像体积。部署步骤见 [服务器与 Cloudflare Named Tunnel 部署手册](docs/delivery/cloudflare-named-tunnel-deployment-guide.md)。

## 安全设计

- NocoBase API 使用独立的最小权限角色
- 公开文章必须同时满足 `PUBLISHED` 和 `deletedAt = null`
- 公开评论只查询 `APPROVED`
- 评分、文本长度和文章状态在服务端再次校验
- 密码、API Token 和 Tunnel Token 只保存在环境变量中
- MySQL、Next.js 和 NocoBase 容器端口不直接暴露到公网
- Docker 数据卷用于持久化，但不替代数据库备份

## 项目文档

- [带图表的项目文章](docs/articles/personal-cms-project.md)
- [CMS 项目测试手册](docs/delivery/test-manual.md)
- [NocoBase 后台迁移说明](docs/delivery/nocobase-migration-guide.md)
- [NocoBase 2.4 Alpha、AI Portal、邮件与地图验证指南](docs/delivery/nocobase-2.4-alpha-ai-portal-guide.md)
- [服务器与 Cloudflare Named Tunnel 部署手册](docs/delivery/cloudflare-named-tunnel-deployment-guide.md)
- [上线前纠偏与验收清单](docs/delivery/release-checklist.md)
- [`docs/learning`](docs/learning) 中的分阶段学习记录

## 运维脚本

- `ops/backup-nocobase.sh`：压缩备份生产 NocoBase MySQL，并按保留周期清理旧文件
- `ops/verify-nocobase-restore.sh`：将备份导入临时数据库进行隔离恢复校验，完成后自动清理

脚本不包含密码，运行时从服务器的 `.env.production` 读取数据库配置。定时任务和恢复校验命令见部署手册。

## 已知边界

- 评论接口只有基础防重复策略，尚未增加网关限流和验证码
- 数据库已验证手工备份，尚未完成定时备份、异地保存和恢复演练
- 尚未配置磁盘、容器和异常日志告警
- 文章正文仍是普通文本，网站暂未渲染 Markdown

DeepSeek 问答不属于当前 CMS 核心闭环，因此未接入生产系统。

NocoBase 2.4 Alpha 已在完全隔离的本地实例中完成 AI Portal + DeepSeek Flash、Gmail SMTP 和高德地图功能验证。生产后台仍使用 NocoBase 2.2.40；数据迁移、权限复验和回滚演练完成前不升级生产实例。
