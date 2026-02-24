# Session: digital-platform
Updated: 2026-02-24T14:00:28.145Z

## Goal
建设公司数字平台。Done = 三大模块全部可用 + 已部署。✅ 核心功能全部完成。

## State
- [x] Phase 1–7: 官网 + 管理后台 + 招投标 + 富文本 + 图片 + CI/CD + 管理员分级 + 内容动态化
- [x] Phase 8: 移动端响应式 (PR #1 + PR #2 合并, deploy c3f68f3)
  - responsive-public: Skeleton/EmptyState/SectionHeading + Hero + Footer + 3页推广SectionHeading
  - responsive-admin: Sidebar onClose + RichTextEditor 工具栏横向滚动
- [x] Track A: CMS 完整性 (deploy b9a18f5)
  - 资质管理后台 /admin/qualifications (CRUD)
  - QualificationsPage Firestore + fallback
  - ContactPage 联系方式动态化 + 表单真实提交 Firestore
  - SiteSettings 加 workingHours 字段
- [x] Bug Fix: Dashboard 最近动态真实数据 + 资质管理种子数据 (merged bd8ba45)
  - contacts/projects/articles 并行查询，formatRelativeTime，empty state
  - DEFAULT_QUALIFICATIONS 提取到 src/config/qualification-defaults.ts
  - QualificationsManagePage 空状态加「初始化默认资质」seed 按钮
- [x] public-pages worktree: 公开页面 UI 优化（已合并 dd84a5c，已部署）
  - AnimatedSection / HeroSection / CTASection 新共享组件
  - 所有公开页滚动动画 + 设计令牌统一
- [x] Firestore 复合索引修复 (fe6b827，已部署)
- Now: [→]
  - [ ] approval-workflow worktree: 内容审批流（进行中，PRD: APPROVAL_WORKFLOW_PRD.md）
- Next（approval-workflow 合并后新对话处理）：
  - [ ] 首页轮播图：HomePage.tsx 静态 Hero 改为从 Firestore heroSlides 动态读取并轮播
  - [ ] 关于页「企业形象展示」：替换占位符为公司实体照片（静态或可上传）

## Key Decisions
- Firebase 条件初始化：无 .env 时跳过不崩溃
- 三套布局: PublicLayout / AdminLayout / PortalLayout
- AdminLevel: manager/worker，无字段默认 manager（兼容旧数据）
- Icon 方案: Firestore 存 iconName 字符串, 前端 ICON_MAP 解析
- Qualification colorTheme: 'navy'|'teal'|'gold'
- Skeleton layout 必须与实际内容 layout 一致（grid vs space-y）
- Loading 时不 early return，保留 Hero section 常驻
- QualificationsPage: Firestore 无数据时 fallback 到硬编码 DEFAULT_QUALIFICATIONS
- ContactPage: useEffect 异步拉 SiteSettings，state 初始值为 COMPANY 常量（无闪烁）
- SSH: github.com port 22 被封 → ~/.ssh/config 改为 ssh.github.com:443
- 首页 Hero: UI 优化后改为静态 HeroSection 组件，heroSlides 数据存在但未被消费
- heroSlides 下一步：HomePage 改为动态轮播（从 Firestore settings/site 读取）
- 关于页「企业形象展示」：目前是占位符，下一步放公司实体照片

## Working Set
- Branch: `main` (HEAD: dd84a5c) | GitHub: Kechuan-ln/Haoyuan_website
- Firebase: haoyuan-web | URL: https://haoyuan-web.web.app
- Build: `npm run build` | Dev: `npm run dev`
- Deploy: `firebase deploy --only hosting,firestore:rules,firestore:indexes`
- Worktrees:
  - `.claude/worktrees/approval-workflow` — 审批流（进行中）
  - `.claude/worktrees/responsive-admin/public` — 旧的待清理

## Architecture Quick Ref
```
src/types/           qualification.ts, contact.ts (SiteSettings+workingHours), service.ts...
src/services/        qualifications.service.ts, site-settings.service.ts, contacts.service.ts...
src/pages/admin/     QualificationsManagePage.tsx (新), SiteSettingsPage.tsx (workingHours)
src/pages/public/    QualificationsPage.tsx (Firestore+fallback), ContactPage.tsx (动态)
src/components/layout/AdminLayout.tsx  → 侧边栏含「资质管理」(BadgeCheck icon)
```

## Firestore Collections
- `qualifications/{id}` — isPublished, iconName, colorTheme, sortOrder...
- `settings/site` — companyPhone/Email/Address/workingHours, heroSlides, SEO...
- `contacts/{id}` — name/phone/email/company/subject/message, isRead
- `content/{team|about|home}` — 单文档动态内容
- `services/{id}`, `projects/{id}`, `articles/{id}`, `users/{id}`
- `notifications/{id}` — (待建) type, contentType, contentId, toUserId, message, isRead

## Approval Workflow (审批流) Key Decisions
- 状态: draft → pending_review → published | rejected → draft
- Worker: 只能提交审核，不能直接发布；pending 时内容锁定
- Manager: 可直接发布自己内容（需预览确认弹窗），可审核他人
- 通知: 站内通知（notifications 集合），Header 铃铛 + 未读红点
- 拒绝必填原因，原因通过 notification.message 传递给 worker
- 受影响集合: articles/projects/services/qualifications 加 status 字段
- PRD: APPROVAL_WORKFLOW_PRD.md（根目录）
