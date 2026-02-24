# 内容审批流 PRD

## 背景
系统存在两级管理员：manager（最高权限）和 worker（内容编辑）。
当前 worker 可直接发布内容，缺乏审核机制。
本功能引入审批流，确保所有内容经过 manager 审核后才能对外发布。

---

## 用户角色与权限

| 操作 | Worker | Manager |
|------|--------|---------|
| 新建/编辑内容 | ✅ | ✅ |
| 提交审核 | ✅ | — |
| 直接发布 | ❌ | ✅（自己的内容，需先预览确认）|
| 审核他人内容（通过/退回） | ❌ | ✅ |
| 查看审核队列 | ❌ | ✅ |
| 收到审核结果通知 | ✅ | — |
| 收到新内容待审核通知 | — | ✅ |

---

## 内容状态流

```
draft ──→ pending_review ──→ published
               │
               └──→ rejected ──→ draft（可重新编辑后再次提交）
```

**状态说明：**
- `draft`：草稿，仅本人可见，可编辑
- `pending_review`：已提交审核，内容锁定不可编辑，等待 manager 处理
- `published`：已发布，对外可见
- `rejected`：被退回，附带原因，worker 可修改后重新提交

**适用集合：** articles / projects / services / qualifications

---

## 功能模块

### 1. 内容编辑页（Worker 视角）
- 保存按钮保持不变（保存为 draft）
- **原「发布」按钮改为「提交审核」**
- 状态为 `pending_review` 时：表单全部禁用，显示「审核中，请等待」
- 状态为 `rejected` 时：显示退回原因横幅，表单重新可编辑，显示「重新提交」按钮

### 2. 内容编辑页（Manager 视角）
- 保存草稿同上
- **保留「发布」按钮**，但点击后弹出确认预览弹窗，确认后才真正发布
- Manager 无需他人审核，自己审查后直接发布

### 3. 审核队列页 `/admin/review`（Manager 专属）
- 顶部 tab 过滤：全部 / 文章 / 项目 / 服务 / 资质
- 列表每条显示：内容类型标签、标题、提交人、提交时间、「审核」按钮
- 点击「审核」进入内容详情，底部固定操作栏：
  - 「通过并发布」按钮
  - 「退回」按钮 → 弹窗填写原因（必填）→ 确认退回
- 侧边栏「审核队列」入口显示待处理数量角标

### 4. 通知系统
- Header 铃铛图标，显示未读通知数量红点
- 通知列表页或下拉面板，按时间倒序
- 通知类型：
  - Manager 收到：「[Worker名] 提交了 [内容类型]《[标题]》待审核」
  - Worker 收到（通过）：「你的 [内容类型]《[标题]》已通过审核并发布」
  - Worker 收到（退回）：「你的 [内容类型]《[标题]》被退回：[原因]」
- 点击通知跳转到对应内容

---

## 数据模型

### 现有集合：新增 `status` 字段
```typescript
// articles / projects / services / qualifications
status: 'draft' | 'pending_review' | 'published' | 'rejected'
rejectedReason?: string   // 退回原因
submittedAt?: Timestamp   // 提交审核时间
submittedBy?: string      // 提交人 userId
reviewedBy?: string       // 审核人 userId
reviewedAt?: Timestamp    // 审核时间
```

### 新增 `notifications` 集合
```typescript
notifications/{id}:
  type: 'review_request' | 'approved' | 'rejected'
  contentType: 'article' | 'project' | 'service' | 'qualification'
  contentId: string
  contentTitle: string
  fromUserId: string
  toUserId: string        // 具体接收人；manager审核请求可广播给所有manager
  message: string         // 退回原因或空字符串
  isRead: boolean
  createdAt: Timestamp
```

---

## Firestore Rules 要求
- worker 只能将自己内容的 status 从 `draft` 改为 `pending_review`（提交）
- worker 不能直接设置 `published`
- manager 可以设置任意 status
- `pending_review` 状态下 worker 不能修改内容字段

---

## 实现范围（不在本次做）
- 邮件/短信通知（站内通知已足够）
- 内容版本历史
- 批量审核
