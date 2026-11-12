# 上线前纠偏与验收清单

## 已满足

- [x] 公开文章同时过滤 `PUBLISHED` 和 `deletedAt = null`
- [x] 公开评论只查询 `APPROVED`
- [x] NocoBase 后台要求管理员认证
- [x] Next.js 使用独立的最小权限 NocoBase API Token
- [x] 评论创建权限不允许网站 Token 写入审核状态
- [x] `.env` 已被 Git 忽略
- [x] 生产 Compose 不公开 MySQL 与 Next.js 主机端口
- [x] 生产数据库结构使用 `prisma migrate deploy`
- [x] Docker 数据卷与数据库备份在文档中明确区分
- [x] GitHub 最新部署代码已推送
- [x] Docker 生产镜像已在火山云服务器实际构建
- [x] Cloudflare Named Tunnel 已创建并验证
- [x] Public Hostname 已通过 HTTPS 访问验证
- [x] App、NocoBase、MySQL 和 cloudflared 生产服务正常运行
- [x] `blog.geyangyang.vip/admin` 跳转 NocoBase 已验证
- [x] 前台评论提交、NocoBase 审核与公开展示已验证
- [x] 已完成至少一次数据库手工备份
- [x] Next.js 已升级到无已知致命审计漏洞的安全补丁版本
- [x] 当前 NocoBase 后台的脱敏验收截图已保存到仓库
- [x] 已提供生产 NocoBase 自动备份与隔离恢复校验脚本

## 仍未闭环

- [ ] 评论接口缺少反向代理级限流与验证码
- [ ] 生产服务器尚未安装定时备份任务，异地保存位置尚未确定
- [ ] 生产数据库隔离恢复演练尚未执行
- [ ] 日志监控、磁盘告警和容器异常通知尚未配置
- [ ] 域名与服务器接入方式的备案合规需要人工确认

## 需要人工提供

- 异地备份保存位置（本机默认保留周期为 14 天）
- 监控告警的接收渠道
- 域名与服务器接入方式的合规确认结果

## 建议上线前阻断项

以下任一项未满足时，不应宣称正式上线：

1. 生产环境仍使用示例密码或截图中出现过的密码；
2. Tunnel Token、数据库密码或管理员密码进入 Git；
3. MySQL `3306` 或 Next.js `3000` 对公网开放；
4. 未完成至少一次数据库备份；
5. Cloudflare Public Hostname 指向错误服务或持续返回 502；
6. 后台未验证登录、退出和写入权限；
7. 未确认域名与服务器接入方式的备案及平台合规要求。

