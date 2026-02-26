# CLAUDE.md

## Project
广东全程创优建设技术有限公司 - 数字平台
CloudBase Env: quancheng-6gqxv3yz867d2966 | Region: ap-guangzhou | GitHub: Kechuan-ln/Haoyuan_website

## Stack
Vite 7 + React 19 + TypeScript 5.9 + Tailwind v4 + CloudBase @cloudbase/js-sdk (Auth + Database + Storage + Hosting)
Editor: Tiptap | Icons: lucide-react | Font: Noto Sans SC | Maps: AMap JS API 2.0

## Commands
```bash
npm run build        # tsc -b && vite build
npm run dev          # localhost:5173
tcb hosting deploy ./dist -e quancheng-6gqxv3yz867d2966  # 部署前端
```

## Architecture
```
src/
├── config/        # cloudbase.ts, routes.ts, constants.ts
├── types/         # TypeScript 类型
├── contexts/      # AuthContext (Auth + CloudBase user doc)
├── services/      # CloudBase CRUD 纯函数
├── components/
│   ├── layout/    # PublicLayout, AdminLayout, PortalLayout
│   └── shared/    # ImageUploader, RichTextEditor
├── pages/
│   ├── public/    # 官网 (首页/关于/服务/项目/新闻/联系)
│   ├── bidding/   # 招标大厅, 招标详情
│   ├── vendor/    # 供应商门户 (注册/仪表盘/投标/结果)
│   ├── admin/     # 管理后台 CMS (文章/项目/服务/团队/关于/首页/招标/供应商/评标/用户/设置)
│   └── auth/      # 登录/注册 (邮箱OTP验证)
├── utils/         # cn(), hash, format
└── styles/        # globals.css (Tailwind @theme + ProseMirror)
```

## Conventions
- `@/` → src/ | `import type` 必须 (verbatimModuleSyntax)
- 服务层纯函数 | React.lazy 懒加载 | 中文 UI
- 品牌色: navy(#1B3A5C) gold(#D4A843) teal(#2B8A9E) bg-gray(#F5F5F5)
- 角色: admin(manager/worker), vendor, reviewer | 角色存 CloudBase `users` 集合
- AdminLevel: manager 可管全部 | worker 不可访问供应商/用户/站点/评标
- Icon 动态化: CloudBase 存 iconName 字符串, `src/config/icon-map.ts` 解析
- 数据库安全规则: 通过 CloudBase 控制台配置
- 严格模式: noUnusedLocals, noUnusedParameters
- .env 管理 CloudBase 配置 (不提交 Git)
- CloudBase SDK 初始化: 同步 init, 不用动态 import, 全局单例复用
- 注册流程: 邮箱 + 密码 → OTP 验证 → 写用户文档 → 登出 → 成功页

## Status
- [x] Phase 1-5 完成 (官网 + 管理后台 + 招投标 + 图片上传 + 富文本)
- [x] Phase 6: CI/CD + 代码分割 + SEO
- [x] Phase 7: 管理员分级 + 内容动态化
- [x] Firebase → CloudBase 迁移完成 (Auth + Database + Storage)
- [ ] CloudBase 安全规则配置 (控制台手动)
- [ ] 数据迁移 (Firebase → CloudBase)
- [ ] CloudBase Hosting 部署 + 端到端测试
- [ ] 移动端响应式
