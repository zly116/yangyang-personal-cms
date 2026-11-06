# NocoBase 后台迁移说明

> 当前状态：集合、权限、数据导入、读写代码和生产切换均已完成；生产环境使用 `CONTENT_SOURCE=nocobase`。

## 1. 目标架构

```text
访客浏览器 -> Next.js 公开页面 -> NocoBase REST API -> NocoBase MySQL
                                      ^
管理员浏览器 -> NocoBase 后台 ---------|
```

旧 `/admin`、旧 MySQL 和 Prisma 暂时保留，作为迁移期间的回退路径。

## 2. 启动本地 NocoBase

在 `.env` 中补齐 `.env.example` 新增的 `NOCOBASE_*` 配置，然后运行：

```bash
docker compose up -d nocobase-mysql nocobase
docker compose ps
```

本地访问：`http://localhost:13000`

首次打开时按照 NocoBase 初始化页面创建管理员。生产密码不得与旧 CMS 管理员密码相同。

## 3. 集合标识

集合的“名称”必须使用下列英文标识，显示名称可以使用中文。

### `siteProfiles`

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | 整数 | 主键；公开资料固定为 `1` |
| `name` | 单行文本 | 必填 |
| `role` | 单行文本 | 必填 |
| `heroTitle` | 单行文本 | 必填 |
| `heroHighlight` | 单行文本 | 必填 |
| `introduction` | 多行文本 | 必填 |
| `statusText` | 单行文本 | 必填 |
| `aboutTitle` | 单行文本 | 必填 |
| `aboutParagraphOne` | 多行文本 | 必填 |
| `aboutParagraphTwo` | 多行文本 | 必填 |

### `articles`

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | 整数 | 主键 |
| `slug` | 单行文本 | 必填、唯一 |
| `title` | 单行文本 | 必填 |
| `excerpt` | 多行文本 | 必填 |
| `content` | 长文本 | 必填 |
| `category` | 单行文本 | 必填 |
| `status` | 单选 | `DRAFT`、`PUBLISHED` |
| `publishedAt` | 日期时间 | 发布时填写 |
| `deletedAt` | 日期时间 | 空值表示未删除 |
| `createdAt` | 创建时间 | 系统字段 |
| `updatedAt` | 更新时间 | 系统字段 |

### `articleFeedback`

| 字段 | 类型 | 约束 |
| --- | --- | --- |
| `id` | 整数 | 主键 |
| `articleId` | 整数 | 对应文章 id |
| `nickname` | 单行文本 | 必填 |
| `content` | 多行文本 | 必填 |
| `rating` | 整数 | 0～5 |
| `status` | 单选 | `PENDING`、`APPROVED`、`REJECTED` |
| `visitorHash` | 单行文本 | 不在普通后台列表展示 |
| `createdAt` | 创建时间 | 系统字段 |
| `reviewedAt` | 日期时间 | 可为空 |

## 4. API 权限

为 Next.js 创建专用 API Token，只允许：

- `siteProfiles`：查看；
- `articles`：查看；
- `articleFeedback`：查看已审核评论、创建待审核评论；
- 评论创建仅开放 `articleId`、`nickname`、`content`、`rating`、`visitorHash` 字段，不能写入审核状态。

禁止创建、更新、删除和管理用户。Token 只写入服务器环境变量 `NOCOBASE_API_TOKEN`，不得放入浏览器代码、截图、文档正文或 Git。

## 5. 切换前检查

1. 对现有数据库执行备份。
2. 导入个人资料、文章和评论。
3. 核对记录数量、slug、状态、发布时间和文章评论关联。
4. 使用 API Token 验证三个集合能够读取。
5. 验证草稿、软删除文章和未审核评论不会被公开查询。
6. 将 `CONTENT_SOURCE` 从 `prisma` 改为 `nocobase`。
7. 重建 App，并测试主页与文章详情。

启用 NocoBase 后，旧 `/admin` 会通过 `NOCOBASE_PUBLIC_ADMIN_URL` 重定向到 NocoBase 后台，避免管理员误用仍连接 Prisma 的旧后台。

评论提交在 NocoBase 模式下写入 `articleFeedback`，审核状态使用集合默认值 `PENDING`。10 分钟重复提交限制保存在 HttpOnly Cookie 中，因此无需扩大 API Token 对待审核评论和访客哈希的读取权限。
