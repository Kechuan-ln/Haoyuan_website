# RPD: feat/hero-carousel — 首页动态轮播图

## 目标

将 `HomePage.tsx` 的静态 Hero 区域替换为动态 `HeroCarousel` 组件，从 Firestore `settings/site.heroSlides` 读取幻灯片数据。

---

## 现状分析

| 位置 | 说明 |
|------|------|
| `src/pages/public/HomePage.tsx` L119-174 | 静态 `<section>`，硬编码文字，无图片 |
| `src/types/contact.ts` | `HeroSlide { imageUrl, title, subtitle, linkUrl? }` |
| `src/services/site-settings.service.ts` | `getSiteSettings()` 读取 `settings/site`，返回含 `heroSlides[]` 的 `SiteSettings` |
| `src/pages/admin/SiteSettingsPage.tsx` | 已有 heroSlides CRUD 界面，Admin 可配置 |

**结论**：数据层和管理端均已完备，仅缺前端消费组件。

---

## 需求

### 功能需求

1. **动态数据**：从 `getSiteSettings()` 读取 `heroSlides`，有几条显示几张
2. **自动轮播**：默认 5 秒切换一张
3. **手动控制**：左右箭头 + 底部圆点指示器（可点击跳转）
4. **过渡动画**：幻灯片淡入淡出（fade），简洁稳重
5. **Fallback**：当 `heroSlides` 为空或所有 slide 的 `imageUrl` 为空时，退化为原来的静态 Hero（保持现有外观不变）
6. **背景图**：`imageUrl` 非空时，用全幅背景图 + 半透明深色遮罩 + 文字
7. **CTA 按钮**：每张幻灯片保留「了解我们」和「联系咨询」两个按钮（复用现有逻辑）；`linkUrl` 非空时，主按钮跳转到 `linkUrl`，否则跳转 `ROUTES.ABOUT`

### 非功能需求

- 鼠标 hover 时暂停自动轮播（防止用户点按钮被切走）
- 移动端隐藏箭头，仅保留圆点
- 加载中显示骨架屏（与现有 Loader2 风格一致）

---

## 实现方案

### Stage 1：新建 `HeroCarousel.tsx`

**文件**：`src/components/shared/HeroCarousel.tsx`

```tsx
// Props
interface HeroCarouselProps {
  slides: HeroSlide[]
  interval?: number   // ms，默认 5000
}
```

**渲染逻辑**：
- `slides.length === 0` → 渲染静态 Fallback（抽取现有 HomePage Hero JSX）
- `slides.length > 0` → 渲染轮播
  - 背景层：`imageUrl` 非空时 `<img>` 全幅 + `bg-gradient-to-t from-navy/70 to-transparent` 遮罩；为空时 `bg-gradient-to-br from-navy via-navy to-navy-dark`
  - 内容层：title / subtitle / CTA（居中，与现有 Hero 保持一致的文字风格）
  - 过渡：CSS `opacity` transition 300ms ease，当前幻灯片 `opacity-100`，其余 `opacity-0 pointer-events-none`（绝对定位叠放）
  - 控件：左右箭头（`ChevronLeft/ChevronRight`）+ 底部圆点

**自动轮播**：`useEffect` + `setInterval`，`onMouseEnter/Leave` 暂停/恢复

---

### Stage 2：改造 `HomePage.tsx`

1. 在 `fetchHomeContent` 旁边增加一个 `fetchHeroSlides` effect，调用 `getSiteSettings()` 取 `heroSlides`
2. 删除 L119-174 的静态 `<section>`
3. 替换为 `<HeroCarousel slides={heroSlides} />`
4. 若 `getSiteSettings()` 失败，`heroSlides` 回落为 `[]`（触发 Fallback）

**改动量**：~30 行替换

---

## 文件改动清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/shared/HeroCarousel.tsx` | 新建 | 轮播组件，含 Fallback |
| `src/pages/public/HomePage.tsx` | 修改 | 增加数据拉取 + 替换静态 Hero |

**不需要改动**：
- `src/types/contact.ts`（`HeroSlide` 类型已存在）
- `src/services/site-settings.service.ts`（接口已完备）
- `src/pages/admin/SiteSettingsPage.tsx`（管理端已可编辑 slides）
- Firestore Rules / Indexes（`settings/site` 已有读取权限）

---

## 验证标准

1. Firestore `settings/site.heroSlides` 有数据 → 轮播正常显示，5s 自动切换
2. `heroSlides` 为空数组 → 显示原静态 Hero，外观与当前一致
3. 某 slide `imageUrl` 为空 → 显示纯色渐变背景，不崩溃
4. 移动端（375px）→ 箭头隐藏，圆点可见，文字不溢出
5. `npm run build` 无 TypeScript 错误
