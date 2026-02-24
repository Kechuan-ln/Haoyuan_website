# CLAUDE.md

## Project
广东全程创优建设技术有限公司 - 数字平台
Live: https://haoyuan-web.web.app | Firebase: haoyuan-web | GitHub: Kechuan-ln/Haoyuan_website

## Stack
Vite 7 + React 19 + TypeScript 5.9 + Tailwind v4 + Firebase v12 (Auth + Firestore + Storage + Hosting)
Editor: Tiptap | Icons: lucide-react | Font: Noto Sans SC | Maps: AMap JS API 2.0

## Commands
```bash
npm run build        # tsc -b && vite build
npm run dev          # localhost:5173
firebase deploy --only hosting                # 前端
firebase deploy --only firestore:rules        # 数据库规则
firebase deploy --only storage                # 存储规则
```

## Architecture
```
src/
├── config/        # firebase.ts, routes.ts, constants.ts
├── types/         # TypeScript 类型
├── contexts/      # AuthContext (Auth + Firestore user doc)
├── services/      # Firestore CRUD 纯函数
├── components/
│   ├── layout/    # PublicLayout, AdminLayout, PortalLayout
│   └── shared/    # ImageUploader, RichTextEditor
├── pages/
│   ├── public/    # 官网 (首页/关于/服务/项目/新闻/联系)
│   ├── bidding/   # 招标大厅, 招标详情
│   ├── vendor/    # 供应商门户 (注册/仪表盘/投标/结果)
│   ├── admin/     # 管理后台 CMS (文章/项目/服务/团队/关于/首页/招标/供应商/评标/用户/设置)
│   └── auth/      # 登录/注册
├── utils/         # cn(), hash, format
└── styles/        # globals.css (Tailwind @theme + ProseMirror)
```

## Conventions
- `@/` → src/ | `import type` 必须 (verbatimModuleSyntax)
- 服务层纯函数 | React.lazy 懒加载 | 中文 UI
- 品牌色: navy(#1B3A5C) gold(#D4A843) teal(#2B8A9E) bg-gray(#F5F5F5)
- 角色: admin(manager/worker), vendor, reviewer | 角色存 Firestore `users` 集合
- AdminLevel: manager 可管全部 | worker 不可访问供应商/用户/站点/评标
- Icon 动态化: Firestore 存 iconName 字符串, `src/config/icon-map.ts` 解析
- Firestore Rules: helper 函数用 `exists()` 防护再 `get().data`
- 严格模式: noUnusedLocals, noUnusedParameters
- .env 管理 Firebase 配置 (不提交 Git)

## Status
- [x] Phase 1-5 完成 (官网 + 管理后台 + 招投标 + 图片上传 + 富文本)
- [x] Phase 6: CI/CD + 代码分割 + SEO
- [x] Phase 7: 管理员分级 + 内容动态化
- [ ] 移动端响应式
