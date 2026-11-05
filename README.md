# 盖洋阳的个人 CMS

这是一个从零实现的个人主页、博客和内容管理系统。项目用于学习一个 CMS 如何管理个人资料、文章、评论、权限和数据库，并把调研、技术选择与开发过程持续记录在公开博客中。

项目没有直接使用 WordPress，也不以复刻 WordPress 的全部能力为目标。第一版优先完成适合单站长个人网站的核心闭环。

## 已完成功能

### 公开网站

- 从数据库读取个人介绍和已发布文章
- 使用稳定的文章 `slug` 生成公开地址
- 草稿、下线文章和回收站文章不对访客公开
- 访客可提交昵称、评论和 `0～5` 星评分
- 只展示管理员审核通过的评论
- 响应式桌面和移动端布局

### 管理后台

- 管理员登录、退出和数据库 Session
- 编辑公开主页中的个人资料
- 创建、编辑、发布和下线文章
- 文章软删除、回收站和恢复
- 评论待审核、通过、拒绝及重新审核
- 后台概览统计文章、草稿和待审核评论

## 技术选型

| 层面 | 技术 | 选择原因 |
| --- | --- | --- |
| 应用框架 | Next.js 15 | 一个项目同时实现公开页面、后台页面和服务端逻辑，适合当前单人、小规模项目 |
| 页面开发 | React 19 | 与 Next.js 配合构建页面、表单和交互 |
| 开发语言 | TypeScript | 提供类型检查，降低字段名、参数和返回值错误 |
| 数据库 | MySQL 8.4 | 适合文章、评论、管理员和会话等关系明确的数据 |
| 数据访问 | Prisma 6 | 生成类型安全客户端，并记录数据库迁移 |
| 本地环境 | Docker Compose | 统一 MySQL 版本、端口和数据卷配置 |
| 版本控制 | Git + GitHub | 保存代码历史和远程仓库 |
| 生产部署 | Docker Compose + Cloudflare Named Tunnel | 统一运行环境，并让服务器无需公开 App 和数据库端口 |

第一版采用单体架构。当前只有一个开发者，过早拆分独立前端、后台服务或微服务会增加接口、跨域、认证、部署和排错成本，却不会直接增加用户价值。

## 系统架构

```text
访客或管理员浏览器
        |
        v
Next.js 页面、Server Actions 和 Route Handlers
        |  权限校验、输入校验、业务规则
        v
Prisma Client
        |
        v
MySQL 8.4
        |
        v
Docker 数据卷（本地持久化）
```

Next.js 负责接收请求、生成页面并执行规则；Prisma 负责把 TypeScript 数据操作转换为数据库查询；MySQL 负责保存数据；Docker 数据卷负责在容器重建后保留本地数据库文件。

## 数据模型

- `SiteProfile`：整站唯一的个人资料，固定使用 `id = 1`
- `Article`：文章内容、slug、草稿或发布状态、发布时间和软删除时间
- `ArticleFeedback`：访客昵称、评论、评分和审核状态
- `AdminUser`：管理员账号和密码哈希
- `AdminSession`：可撤销的后台登录会话

数据库结构变化记录在 `prisma/migrations`。迁移文件属于项目设计，应提交到 Git；真实文章、评论、密码哈希和 Session 属于运行数据，不进入代码仓库。

## 本地运行

### 1. 安装依赖

需要 Node.js 和 Docker Desktop。

```bash
npm install
```

### 2. 创建环境变量

复制 `.env.example` 为 `.env`，再替换其中的示例密码和管理员信息。`.env` 包含秘密，已被 `.gitignore` 排除，不能提交到 GitHub。管理员密码至少需要 12 个字符。

### 3. 启动 MySQL

```bash
docker compose up -d
docker compose ps
```

本地 MySQL 容器内部使用 `3306`，映射到电脑的 `3308`。数据库文件保存在名为 `mysql_data` 的 Docker 数据卷中。

### 4. 初始化数据库

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

- `db:generate`：根据 Prisma 模型生成客户端
- `db:migrate`：将尚未执行的结构迁移应用到本地数据库
- `db:seed`：写入示例文章，并根据 `.env` 创建或更新管理员

### 5. 启动网站

```bash
npm run dev
```

本地默认访问地址：

- 公开主页：`http://localhost:3000`
- 后台登录：`http://localhost:3000/admin/login`
- 个人资料：`http://localhost:3000/admin/profile`
- 文章管理：`http://localhost:3000/admin/articles`
- 评论审核：`http://localhost:3000/admin/feedback`

如果 `3000` 已被占用，Next.js 会在终端显示实际使用的其他端口。

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建和类型检查
npm run db:generate  # 生成 Prisma Client
npm run db:migrate   # 创建或执行开发迁移
npm run db:seed      # 初始化文章和管理员
npm run db:studio    # 用浏览器查看数据库内容
```

## 安全设计

- 网站使用权限受限的 `cms_user`，不使用 MySQL `root` 运行应用
- 管理员密码使用带随机盐的 scrypt 哈希，不保存明文密码
- 后台使用数据库 Session，退出时可立即撤销
- 浏览器只保存 Session 原始令牌，Cookie 使用 `HttpOnly` 和 `SameSite=Lax`
- 数据库只保存 Session 令牌的 SHA-256 哈希
- 每个写入操作都在服务端重新执行管理员鉴权和输入校验
- 公开文章查询同时过滤发布状态和软删除状态
- 公开评论查询只返回 `APPROVED`，未审核内容不会发送到浏览器
- 访客反馈包含蜜罐字段和基于匿名 Cookie 的基础防重复策略
- `.env`、数据库密码、服务器密码和备案资料不提交到公开仓库

当前反馈防刷只是基础保护，不能替代生产环境的反向代理限流、验证码和日志监控。

## 关键设计决定

- **slug 用于公开网址，id 用于后台定位**：标题和 slug 可能修改，数据库 id 保持稳定。
- **数据库 Session 而不是 JWT**：当前只有一个后台，数据库会话更容易撤销，不需要额外实现 JWT 刷新和黑名单。
- **软删除使用 `deletedAt`**：保留文章删除前的草稿或发布状态，恢复时无需猜测原状态。
- **评论拒绝不直接删除**：保存审核记录，也允许纠正误操作。
- **个人资料使用固定 `id = 1`**：当前只有一个站长，避免产生多份资料和读取歧义。
- **普通文本而不是任意 HTML**：降低脚本注入风险，暂不引入富文本清洗复杂度。

## 学习记录

开发过程记录在 `docs/learning`，包括数据模型、动态路由、认证、文章管理、软删除、访客反馈、评论审核和个人资料管理。

## 交付文档

- [CMS 项目测试手册](docs/delivery/test-manual.md)
- [服务器与 Cloudflare Named Tunnel 部署手册](docs/delivery/cloudflare-named-tunnel-deployment-guide.md)
- [上线前纠偏与验收清单](docs/delivery/release-checklist.md)

## 当前限制与后续计划

- 文章正文目前是普通文本，还未支持 Markdown 或经过清洗的富文本
- 访客没有账号系统，防重复策略可以通过更换浏览器或清理 Cookie 绕过
- 已部署到火山云服务器，并通过 Cloudflare Named Tunnel 使用 `https://blog.geyangyang.vip` 对外访问
- 已完成数据库手工备份，但自动定时备份、异地保存和恢复演练仍未完成
- 尚未配置日志监控、磁盘告警和容器异常通知
- 评论接口目前只有基础防重复策略，仍缺少反向代理级限流和验证码
- 测试手册与部署手册已经生成，测试手册真实截图已归档

DeepSeek 问答不属于第一版 CMS 的核心闭环，因此暂不接入。项目开发过程中使用 AI 辅助需求分析、代码实现和复盘，但每项功能仍需要人工确认范围、验证结果并理解技术选择。
