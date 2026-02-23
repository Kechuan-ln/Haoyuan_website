# CLAUDE.md

本文件为 Claude Code 提供项目上下文和开发指导。

## 项目概述

**项目名称**: 广东全程创优建设技术有限公司 - 数字平台
**项目状态**: v1.0 已部署上线，Phase 1-3 全部完成
**线上地址**: https://haoyuan-web.web.app

**业务目标**: 为建设工程公司提供数字化官网展示、招投标管理和内部管理后台
**三大模块**:
- 公司官网 (Public) - 企业介绍、服务展示、项目案例、新闻资讯、联系我们
- 招投标门户 (Bidding/Vendor) - 招标大厅、投标提交、评标管理
- 管理后台 (Admin) - 内容管理 CMS、用户管理、系统设置

## 技术栈

**前端**:
- Vite 7 + React 19 + TypeScript 5.9
- Tailwind CSS v4 (CSS-first config, `src/styles/globals.css`)
- lucide-react 图标
- React Router v7 (SPA 路由)

**后端**:
- Firebase v12 (Firestore 数据库 + Auth 认证 + Storage 存储)
- Firebase Hosting 部署

**工具链**:
- 包管理器: npm
- 代码质量: ESLint 9 + TypeScript strict mode
- 字体: Noto Sans SC (Google Fonts)
- 大文件: Git LFS (PDF, PPTX)

## 开发指令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器
npm run build        # TypeScript 类型检查 + Vite 构建 (tsc -b && vite build)
npm run lint         # ESLint 代码检查
npm run preview      # 预览生产构建

# Firebase 部署
firebase deploy --only hosting           # 部署前端
firebase deploy --only firestore:rules   # 部署 Firestore 规则
firebase deploy --only storage           # 部署 Storage 规则
```

## 架构和约束

### 目录结构

```
src/
├── config/          # Firebase 配置、路由、常量
├── types/           # TypeScript 类型定义
├── contexts/        # AuthContext (Firebase Auth + Firestore user)
├── services/        # Firestore CRUD 服务 (纯函数)
├── hooks/           # 自定义 React Hooks
├── components/
│   ├── ui/          # shadcn/ui 基础组件
│   ├── layout/      # PublicLayout, AdminLayout, PortalLayout
│   └── shared/      # 可复用业务组件
├── pages/
│   ├── public/      # 官网页面
│   ├── bidding/     # 招投标页面
│   ├── vendor/      # 供应商门户页面
│   ├── admin/       # 管理后台页面 (6个 CMS 页面已完成)
│   └── auth/        # 登录/注册
├── utils/           # cn(), hash, format 工具函数
└── styles/          # globals.css (Tailwind @theme)
```

### 品牌色 (Tailwind 主题)

- `navy` (#1B3A5C) - 主色、标题
- `gold` (#D4A843) - CTA、高亮
- `teal` (#2B8A9E) - 强调色、供应商门户
- `bg-gray` (#F5F5F5) - 背景

### 关键约定

- 路径别名: `@/` 映射到 `src/`
- 类型导入: 必须使用 `import type` (verbatimModuleSyntax)
- 服务层: 纯函数，不使用 class
- 页面加载: 全部通过 `React.lazy` 懒加载
- 三套布局: PublicLayout (官网), AdminLayout (管理后台), PortalLayout (供应商门户)
- 用户角色: `admin`, `vendor`, `reviewer`
- 严格模式: `noUnusedLocals`, `noUnusedParameters` 开启

### 安全规范

- 所有用户输入通过 Firestore Rules 验证
- Auth 角色通过 Firestore `users` 集合管理
- 敏感配置通过 `.env` 文件管理 (不提交到 Git)

## 仓库信息

- **GitHub**: `Kechuan-ln/Haoyuan_website`
- **主分支**: `main`
- **Firebase 项目**: `haoyuan-web`
- **语言**: 中文项目，commit 信息和文档使用中文

## 当前任务

### 已完成

- [x] Phase 1: 项目脚手架 + 认证系统 + 三套布局 + 路由
- [x] Phase 2: 全部公开页面 UI (首页、关于、服务、项目、新闻、联系)
- [x] Phase 3: 管理后台 CMS + Firestore 对接 (6个管理页面)
- [x] 构建验证 + Firebase Hosting 部署

### 待开发

- [ ] 招投标门户功能实现 (BidHall, BidDetail, BidSubmission 等)
- [ ] 供应商门户功能实现 (VendorDashboard, VendorMyBids 等)
- [ ] 富文本编辑器集成 (文章编辑器)
- [ ] 图片上传功能 (Firebase Storage)
- [ ] 移动端响应式优化
- [ ] SEO 优化 (meta tags, sitemap)
