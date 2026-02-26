# Session: digital-platform
Updated: 2026-02-27T07:40:00Z

## Goal
建设公司数字平台。Done = 三大模块全部可用 + CloudBase 部署 + 国内可访问。

## State
- [x] Phase 1–8: 官网 + 管理后台 + 招投标 + CI/CD + 管理员分级 + 内容动态化
- [x] 内容审批流 + 通知系统 + 首页轮播图 + 多角色注册管理
- [x] Firebase → CloudBase 代码迁移 (62 files, 全部 Phase 完成):
  - Phase 1: cloudbase.ts + 11 types (Timestamp→Date) + format.ts
  - Phase 2: auth.service (2-step OTP signup) + AuthContext + RegisterPage (OTP UI) + LoginPage
  - Phase 3: 8 simple DB services
  - Phase 4: 7 complex DB services (articles/offset pagination, notifications/batch, bids/in-query)
  - Phase 5: storage.service (upload/download/delete via CloudBase)
  - Phase 6: 15 pages + 1 component (remove .toDate(), adapt pagination)
  - Phase 10: 移除 firebase npm 包 + 删除 firebase.ts/firebase.json/firestore.rules 等
- [x] `npm run build` 零错误 | src/ 中零 Firebase 引用
- Now: [→] 等待用户确认 → 提交代码
- Next:
  - [ ] CloudBase 安全规则 (控制台手动配置)
  - [ ] 数据迁移 (Firebase → CloudBase)
  - [ ] CloudBase Hosting 部署 + 端到端测试
  - [ ] 移动端响应式

## Key Decisions
- 三套布局: PublicLayout / AdminLayout / PortalLayout
- AdminLevel: manager/worker，无字段默认 manager（兼容旧数据）
- accountStatus 可选，默认 'active'（旧 admin 零迁移）
- CloudBase 配置: env=quancheng-6gqxv3yz867d2966, region=ap-guangzhou
- **注册改为 2 步**: signUp → OTP 验证 → 写用户文档 → 登出
- **分页改为 offset**: articles 从 DocumentSnapshot 游标改为 skip/limit
- **writeBatch → 条件更新**: notifications 批量标记已读用 .where().update()
- **Timestamp → Date**: 全局替换，CloudBase 返回 Date 对象
- **存储**: uploadFile → getTempFileURL(1年) 返回临时URL
- **AuthContext.user.uid**: 保持 uid 字段名兼容 20+ 消费组件
- **.add() 返回 id**: CloudBase SDK 类型缺少 id 字段，用 `as unknown as { id: string }` 桥接

## Constraints
- CloudBase Web SDK 同步初始化，全局单例
- 注册必须经过 OTP 邮箱验证
- 安全规则需在控制台手动配置（非代码部署）
- 数据迁移需通知用户重新注册（密码 hash 不可迁移）

## Working Set
- Branch: worktree-tengxunyun (worktree) | GitHub: Kechuan-ln/Haoyuan_website
- CloudBase: quancheng-6gqxv3yz867d2966 | Region: ap-guangzhou
- Build: npm run build | Dev: npm run dev (localhost:5173)
- Deploy: tcb hosting deploy ./dist -e quancheng-6gqxv3yz867d2966

## Architecture Quick Ref
- src/config/cloudbase.ts — requireApp/requireAuth/requireDb
- src/services/auth.service.ts — signUpStep1 (OTP) + signUpStep2 (verify+write)
- src/contexts/AuthContext.tsx — onAuthStateChange + CloudBaseUser {uid, email}
- src/pages/auth/RegisterPage.tsx — 3 tabs + OTP step + countdown resend
- src/services/articles.service.ts — offset pagination (skip/limit, hasMore)
- src/services/notifications.service.ts — .where().update() for batch

## CloudBase Collections (same as old Firestore)
- users/{id} — accountStatus?, adminApplication?, companyName?, _inviteCode?
- notifications/{id} — 6 notification types, toUserId + isRead
- settings/security — managerInviteCode (仅 manager 可读写)
- articles, projects, services, qualifications — status + isPublished workflow
- bids, bidSubmissions, evaluations — 招投标系统
- content/home, content/about, content/team — CMS 单文档
- heroSlides — 首页轮播图
