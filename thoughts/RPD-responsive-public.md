# RPD: feat/responsive-public — 公开页面 UI 打磨

## Stage 1: 修复两处响应式小问题

### 1A. `src/pages/public/HomePage.tsx` — 统计数字网格
```tsx
// 改前
className="grid grid-cols-2 lg:grid-cols-4"
// 改后
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

### 1B. `src/pages/public/ProjectsPage.tsx` — 项目统计网格
```tsx
// 改前
className="grid grid-cols-3 gap-6"
// 改后
className="grid grid-cols-1 sm:grid-cols-3 gap-6"
```

**验证**: 在 375px 宽度模拟器中检查不再挤压

---

## Stage 2: 共享 UI 组件

### 2A. `src/components/shared/Skeleton.tsx`
```tsx
// 通用 loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

### 2B. `src/components/shared/EmptyState.tsx`
```tsx
// 当 Firestore 返回空数组时显示
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-4">{icon ?? '📭'}</div>
      <h3 className="text-xl font-semibold text-navy mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
```

### 2C. `src/components/shared/ImageWithFallback.tsx`
```tsx
// 图片加载失败时优雅降级
export function ImageWithFallback({ src, alt, fallback, ...props }) {
  const [error, setError] = useState(false)
  if (!src || error) return fallback ?? <div className="bg-gray-100 flex items-center justify-center">{alt[0]}</div>
  return <img src={src} alt={alt} onError={() => setError(true)} {...props} />
}
```

---

## Stage 3: 各页面加 Loading Skeleton

为所有从 Firestore 取数据的页面加 loading 状态（替换 `if (loading) return null`）：

| 页面 | 使用组件 |
|------|----------|
| `ServicesPage.tsx` | `<CardSkeleton />` × 3 |
| `ProjectsPage.tsx` | `<CardSkeleton />` × 6 |
| `NewsPage.tsx` | `<CardSkeleton />` × 4 |
| `TeamPage.tsx` | `<CardSkeleton />` × 4 |
| `HomePage.tsx` | 各 section 保留现有 loading |

---

## Stage 4: Empty State 接入

各列表页 Firestore 返回空数组时显示 EmptyState：

```tsx
// ServicesPage
if (!loading && services.length === 0)
  return <EmptyState title="暂无服务信息" description="管理员正在完善内容，请稍后访问" />

// ProjectsPage
if (!loading && projects.length === 0)
  return <EmptyState title="暂无项目案例" description="项目信息正在整理中" />

// NewsPage
if (!loading && articles.length === 0)
  return <EmptyState title="暂无新闻资讯" description="敬请期待后续更新" />
```

---

## Stage 5: 视觉打磨

### 5A. 卡片 hover 效果（全局统一）
所有 card 组件加：
```tsx
className="... hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
```

### 5B. Section 标题统一样式
所有公开页面 section 标题加金色下划线 accent：
```tsx
<div className="text-center mb-12">
  <h2 className="text-3xl font-bold text-navy mb-3">{title}</h2>
  <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
  <p className="text-gray-600 mt-4">{subtitle}</p>
</div>
```
提取为 `SectionHeading` 组件复用。

### 5C. Footer 增强 (`src/components/layout/Footer.tsx`)
三栏布局：
- 左：公司名 + 简介 + logo
- 中：快速链接（官网各页面）
- 右：联系方式（电话、地址、邮箱）
- 底部：版权 + ICP 备案号

```tsx
<footer className="bg-navy text-white">
  <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* 公司信息 */}
    {/* 快速链接 */}
    {/* 联系方式 */}
  </div>
  <div className="border-t border-white/10 py-4 text-center text-sm text-white/60">
    © 2024 广东全程创优建设技术有限公司
  </div>
</footer>
```

### 5D. 按钮样式统一
定义两个标准按钮 class（可加入 `cn()` helper）：
```tsx
const btnPrimary = "px-6 py-3 bg-gold text-white rounded-lg font-medium hover:bg-gold/90 transition-colors"
const btnOutline = "px-6 py-3 border-2 border-navy text-navy rounded-lg font-medium hover:bg-navy hover:text-white transition-colors"
```

---

## Stage 6: 首页 Hero 优化

`src/pages/public/HomePage.tsx` Hero section：
- 背景加渐变 overlay（navy → navy/80）
- 副标题字号适配移动端
- CTA 按钮两个：「了解我们」(outline) + 「联系咨询」(primary)
- 统计数字加简单渐入动画（`animate-fade-in` via Tailwind `@keyframes`）

---

## 合并策略
完成后 → `git add` 相关文件 → commit → `git push origin feat/responsive-public` → PR 到 main
