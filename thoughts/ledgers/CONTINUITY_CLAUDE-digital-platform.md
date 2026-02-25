# Session: digital-platform
Updated: 2026-02-25T12:29:38.627Z

## Goal
建设公司数字平台。Done = 三大模块全部可用 + 已部署。

## State
- [x] Phase 1–8: 官网 + 管理后台 + 招投标 + CI/CD + 管理员分级 + 内容动态化 + 移动端响应式
- [x] CMS 完整性 + Dashboard 真实动态 + 资质种子数据 + Firestore 复合索引
- [x] 公开页面 UI 优化 — AnimatedSection/HeroSection/CTASection + 滚动动画
- [x] 内容审批流 + 通知系统 (8155f5f) — draft→pending→published, NotificationBell, ReviewQueuePage
- [x] 首页轮播图动态化 (4d35cab) — HeroCarousel 消费 Firestore heroSlides
- [x] 多角色注册管理系统 (7 phases 全部完成):
  - Phase 1–7 + Bug fix 详见上一版本
- [x] 已部署 (hosting + firestore:rules + firestore:indexes)
- [x] Bug fix: getBids() 无过滤器导致 vendor/公开页 Firestore 权限拒绝
  - 根因: Firestore rules 不是过滤器，非 admin 查询需 status `in` 约束
  - 修复: BidFilters 新增 statusIn，VendorDashboardPage/VendorMyBidsPage/BidHallPage 使用 statusIn 过滤
  - 新增修改文件: src/services/bids.service.ts, src/pages/vendor/VendorMyBidsPage.tsx, src/pages/bidding/BidHallPage.tsx
- Now: [→] 端到端测试验证（供应商密码已通过忘记密码重置解决）
- Next:
  - [ ] 提交所有未提交的改动
  - [ ] 关于页「企业形象展示」：占位符 → 公司实体照片

## Key Decisions
- Firebase 条件初始化：无 .env 时跳过不崩溃
- 三套布局: PublicLayout / AdminLayout / PortalLayout
- AdminLevel: manager/worker，无字段默认 manager（兼容旧数据）
- accountStatus 可选，默认 'active'（旧 admin 零迁移）
- 安全码明文存 Firestore（rules 无法 hash），settings/security 仅 manager 可读
- 注册时不自动通知 manager（避免非 admin 写 notification rules），靠 badge 发现
- _inviteCode 审计字段持久保留在用户文档
- 所有注册（含供应商）均 signOut + 显示成功页 → 跳转登录页（避免 AuthContext race condition）
- signUp 中 setDoc 失败时 deleteUser 清理孤儿 Auth 用户
- 审批流通知: 站内轮询（60s），不做邮件/短信
- **getBids 必须带 statusIn 过滤**: 非 admin 用户查询 bids 集合必须带 `where('status', 'in', [...])` 约束，否则 Firestore 拒绝

## Working Set
- Branch: main (未提交改动) | GitHub: Kechuan-ln/Haoyuan_website
- Firebase: haoyuan-web | URL: https://haoyuan-web.web.app
- Build: npm run build | Dev: npm run dev (localhost:5173)
- Deploy: firebase deploy --only hosting,firestore:rules,firestore:indexes

## 已修改文件 (未提交)
- src/types/user.ts, notification.ts
- src/config/constants.ts, routes.ts
- src/services/auth.service.ts, security-code.service.ts (新), users.service.ts, notifications.service.ts, bids.service.ts
- src/contexts/AuthContext.tsx
- src/components/shared/ProtectedRoute.tsx, NotificationBell.tsx
- src/components/layout/PortalLayout.tsx
- src/pages/auth/RegisterPage.tsx, LoginPage.tsx, AccountPendingPage.tsx (新)
- src/pages/admin/UserManagePage.tsx, SiteSettingsPage.tsx
- src/pages/vendor/VendorDashboardPage.tsx, VendorMyBidsPage.tsx
- src/pages/bidding/BidHallPage.tsx
- src/App.tsx
- firestore.rules, firestore.indexes.json

## Architecture Quick Ref
- src/types/           content-status.ts, notification.ts, user.ts (AccountStatus, AdminApplication)
- src/services/        auth.service (SignUpOptions), security-code.service, bids.service (BidFilters.statusIn), workflow.service, notifications.service
- src/components/shared/ NotificationBell (6 notification types), ProtectedRoute (accountStatus gate)
- src/pages/auth/      RegisterPage (3 tabs), AccountPendingPage, LoginPage (accountStatus redirect)
- src/pages/admin/     UserManagePage (待审批 tab), SiteSettingsPage (安全码管理), ReviewQueuePage
- settings/site — 公开读 | settings/security — manager 读写 (managerInviteCode)

## Firestore Collections
- users/{id} — 新增: accountStatus?, adminApplication?, companyName?, registrationReason?, _inviteCode?
- notifications/{id} — contentType/contentId 改为可选, 新增 account_approved/rejected/admin_application 类型
- settings/security — managerInviteCode, updatedAt (仅 manager 可读写)
- Indexes: users (role + accountStatus + createdAt DESC) 新增
