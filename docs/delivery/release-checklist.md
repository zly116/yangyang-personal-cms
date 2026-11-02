# 上线前纠偏与验收清单

## 已满足

- [x] 公开文章同时过滤 `PUBLISHED` 和 `deletedAt = null`
- [x] 公开评论只查询 `APPROVED`
- [x] 管理后台与写入操作均执行服务端 Session 鉴权
- [x] 管理员密码使用 scrypt 加盐哈希
- [x] 数据库 Session 只保存 Token 哈希
- [x] `.env` 已被 Git 忽略
- [x] 生产 Compose 不公开 MySQL 与 Next.js 主机端口
- [x] 生产数据库结构使用 `prisma migrate deploy`
- [x] Docker 数据卷与数据库备份在文档中明确区分

## 仍未闭环

- [ ] GitHub 最新提交需要确认已推送
- [ ] Docker 生产镜像需要在服务器实际构建
- [ ] Cloudflare Named Tunnel 需要创建并验证
- [ ] Public Hostname 需要配置并验证 HTTPS 访问
- [ ] 生产环境强密码需要人工生成
- [ ] 截图中暴露过的本地密码需要确认不在生产环境复用
- [ ] 评论接口缺少反向代理级限流与验证码
- [ ] 数据库定时备份与异地保存尚未配置
- [ ] 数据库恢复演练尚未执行
- [ ] 日志监控、磁盘告警和容器异常通知尚未配置
- [ ] 域名与服务器接入方式的备案合规需要人工确认

## 需要人工提供

- Cloudflare 账号与已接入 Cloudflare 的可用域名
- Cloudflare Tunnel Token（只写入服务器，不交给文档或 Git）
- 火山云服务器 SSH 或 1Panel 操作权限
- 生产管理员邮箱和新密码
- 生产 MySQL root 与应用用户密码
- 备份保存位置和保留周期

## 建议上线前阻断项

以下任一项未满足时，不应宣称正式上线：

1. 生产环境仍使用示例密码或截图中出现过的密码；
2. Tunnel Token、数据库密码或管理员密码进入 Git；
3. MySQL `3306` 或 Next.js `3000` 对公网开放；
4. 未完成至少一次数据库备份；
5. Cloudflare Public Hostname 指向错误服务或持续返回 502；
6. 后台未验证登录、退出和写入权限；
7. 未确认域名与服务器接入方式的备案及平台合规要求。

