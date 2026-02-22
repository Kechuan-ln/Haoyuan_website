# CLAUDE.md

## Project Overview

广东全程创优建设技术有限公司 数字平台 - 包含公司官网展示、招投标管理和内部管理后台三大模块。

## Tech Stack

- **Build**: Vite 7 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config in `src/styles/globals.css`)
- **UI**: shadcn/ui (to be installed) + lucide-react icons
- **Routing**: React Router v7
- **Backend**: Firebase v12 (Firestore + Auth + Storage)
- **Font**: Noto Sans SC (loaded via Google Fonts)

## Commands

```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── config/          # Firebase config, routes, constants
├── types/           # TypeScript type definitions
├── contexts/        # AuthContext (Firebase Auth + Firestore user)
├── services/        # Firestore CRUD services (plain functions)
├── hooks/           # Custom React hooks
├── components/
│   ├── ui/          # shadcn/ui base components
│   ├── layout/      # PublicLayout, AdminLayout, PortalLayout
│   └── shared/      # Reusable business components
├── pages/
│   ├── public/      # Public website pages
│   ├── bidding/     # Bidding portal pages
│   ├── vendor/      # Vendor portal pages
│   ├── admin/       # Admin dashboard pages
│   └── auth/        # Login/Register
├── utils/           # cn(), hash, format utilities
└── styles/          # globals.css with Tailwind @theme
```

## Brand Colors (Tailwind theme)

- `navy` (#1B3A5C) - Primary, headers
- `gold` (#D4A843) - CTA, highlights
- `teal` (#2B8A9E) - Accents, vendor portal
- `bg-gray` (#F5F5F5) - Background

## Key Patterns

- Path alias: `@/` maps to `src/`
- `import type` required (verbatimModuleSyntax enabled)
- Services are plain functions, not classes
- All pages lazy-loaded via React.lazy
- Three layouts: PublicLayout (官网), AdminLayout (管理后台), PortalLayout (供应商门户)
- Auth roles: `admin`, `vendor`, `reviewer`

## Repository

- Large files (PDF, PPTX) managed via **Git LFS**
- GitHub remote: `Kechuan-ln/Haoyuan_website`

## Language

Chinese company website project. Commit messages and documentation in Chinese.
