# RPD: Infrastructure — CI/CD + 性能优化 + SEO

## Stage 1: CI/CD 流水线

### 1A. `.github/workflows/ci.yml`
- 触发: push 到任意分支, PR 到 main
- Steps: checkout → setup-node 20 → npm ci → npm run lint → npm run build
- 缓存 node_modules (actions/cache)

### 1B. `.github/workflows/deploy.yml`
- 触发: push 到 main
- Steps: checkout → setup-node → npm ci → npm run build → firebase deploy
- 需要 GitHub Secret: `FIREBASE_SERVICE_ACCOUNT_HAOYUAN_WEB`
- 使用 `FirebaseExtended/action-hosting-deploy@v0`

**验证**: Push 一个空 commit, 确认 CI 运行通过

---

## Stage 2: 代码分割

### 2A. `vite.config.ts` — manualChunks
当前 index.js 669KB (gzip 209KB), ArticleEditorPage 390KB。

拆分策略:
```ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
  'vendor-tiptap': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-placeholder'],
}
```

**目标**: index.js < 300KB gzip, 每个 vendor chunk < 150KB gzip
**验证**: `npm run build` 检查 chunk 大小

---

## Stage 3: SEO

### 3A. `index.html` — 默认 meta tags
```html
<meta name="description" content="广东全程创优建设技术有限公司 - 专业建设工程咨询与管理服务">
<meta property="og:title" content="全程创优建设">
<meta property="og:description" content="...">
<meta property="og:image" content="/og-image.png">
<meta property="og:url" content="https://haoyuan-web.web.app">
```

### 3B. `public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /vendor
Sitemap: https://haoyuan-web.web.app/sitemap.xml
```

### 3C. `public/sitemap.xml`
静态 sitemap, 包含所有公开路由:
/, /about, /services, /projects, /news, /team, /qualifications, /contact, /bids

### 3D. `firebase.json` — 缓存 headers
```json
"headers": [
  { "source": "/assets/**", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}] },
  { "source": "**/*.html", "headers": [{"key": "Cache-Control", "value": "no-cache"}] }
]
```

**验证**: `npm run build` 通过, 检查 robots.txt/sitemap.xml 在 dist/ 中

---

## 合并策略
完成后 → `git push origin feat/infra` → PR 到 main → merge (无冲突)
