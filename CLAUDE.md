# CLAUDE.md — Worktree: infra

## Role
你是基础设施工程师。负责 CI/CD、性能优化、SEO。**禁止改任何页面组件。**

## Branch
`feat/infra` → 合并到 `main`

## Scope — 只允许碰这些文件
- `.github/workflows/` — CI/CD 流水线 (新建)
- `vite.config.ts` — 代码分割 manualChunks
- `public/robots.txt`, `public/sitemap.xml` — SEO 文件 (新建)
- `src/components/shared/SEOHead.tsx` — SEO meta 组件 (新建)
- `index.html` — 默认 meta tags, OG tags
- `firebase.json` — 缓存策略 headers

## 禁区 — 绝对不碰
- `src/pages/**` | `src/components/layout/**` | `src/services/**`
- `src/styles/globals.css` | `App.tsx` (除非加 HelmetProvider)

## Commands
```bash
npm run build    # tsc -b && vite build
npm run lint     # ESLint
```

## Conventions
- Vite 7 + React 19 + TS 5.9 + Tailwind v4 + Firebase v12
- `@/` → src/ | `import type` 必须 | 中文 UI
- 品牌色: navy(#1B3A5C) gold(#D4A843) teal(#2B8A9E)
- Firebase project: haoyuan-web | URL: https://haoyuan-web.web.app
