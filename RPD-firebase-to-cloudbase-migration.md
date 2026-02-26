# RPD: Firebase → 腾讯云 CloudBase 迁移方案

> 版本: 1.0 | 日期: 2026-02-26
> 项目: 广东全程创优建设技术有限公司数字平台

---

## 一、迁移背景

Firebase 依赖的 Google 服务 (`*.googleapis.com`) 在中国大陆被 GFW 屏蔽，导致：
- 注册/登录超时（Auth API 不可达）
- 数据库读写失败（Firestore API 不可达）
- 文件上传失败（Storage API 不可达）

**目标**: 将 Firebase Auth + Firestore + Storage + Hosting 全部迁移到腾讯云 CloudBase (TCB)，实现国内用户 20-40ms 延迟的正常访问。

---

## 二、腾讯云准备清单（迁移前必须完成）

### 2.1 账号与环境

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 注册腾讯云账号 | https://cloud.tencent.com 实名认证（企业认证更佳） |
| 2 | 开通 CloudBase | 控制台 → 云开发 CloudBase → 创建环境 |
| 3 | 选择地域 | **ap-guangzhou**（广州，离公司最近）|
| 4 | 选择套餐 | **标准版 199 元/月**（100GB 存储, 800M API, 120GB CDN）|
| 5 | 记录环境 ID | 格式如 `haoyuan-xxx`，后续配置需要 |

### 2.2 认证配置

| 步骤 | 操作 | 位置 |
|------|------|------|
| 1 | 开启邮箱密码登录 | 控制台 → 用户管理 → 登录方式 → 邮箱登录 → 开启 |
| 2 | 配置邮件模板 | 验证邮件/重置密码邮件的发件人和模板 |
| 3 | 配置授权域名 | 添加 `localhost:5173`（开发）和生产域名 |
| 4 | 获取 Access Key | 控制台 → 环境设置 → 安全配置 → Web 安全密钥 |

### 2.3 ICP 备案（自定义域名必须）

| 项目 | 说明 |
|------|------|
| 是否必须 | 如果用自定义域名（如 `www.haoyuan.com`）则**必须备案** |
| 默认域名 | 不备案可先用 `<env-id>.tcloudbaseapp.com`（无需备案）|
| 备案流程 | 腾讯云控制台 → 备案 → 提交企业资料 → 1-4 周审批 |
| 建议 | **立即启动备案**，与开发并行进行，不阻塞迁移 |

### 2.4 安装 CLI 工具

```bash
npm install -g @cloudbase/cli
tcb login  # 浏览器授权登录
```

### 2.5 数据导出准备

从 Firebase Console 导出现有数据：
- Firestore → 导出为 JSON（Firebase Console → Firestore → 导出）
- Storage → 下载所有文件（可用 `gsutil` 或手动）
- Auth 用户列表 → Firebase Console → Authentication → 导出用户

---

## 三、当前 Firebase 使用盘点

### 3.1 服务依赖总览

| Firebase 服务 | 涉及文件数 | API 调用数 | 迁移复杂度 |
|--------------|-----------|-----------|-----------|
| Auth (认证) | 3 | 12 | 中 |
| Firestore (数据库) | 17 个 service | ~280 | 高（量大但机械） |
| Storage (存储) | 1 | 9 | 低 |
| Hosting (托管) | 配置文件 | - | 低 |
| Security Rules | 1 (188行) | - | **最高** |

### 3.2 Firestore 集合清单

| 集合 | 操作数 | 复合索引 | 关键查询模式 |
|------|--------|---------|------------|
| users | 9 | 1 | role + accountStatus + createdAt |
| articles | 5 | 3 | category + isPublished + publishedAt, 游标分页 |
| projects | 6 | 3 | category + isPublished + createdAt |
| services | 5 | 2 | isPublished + sortOrder, status + submittedAt |
| qualifications | 4 | 2 | isPublished + sortOrder, status + submittedAt |
| bids | 7 | 0 | status `in` 过滤 |
| bidSubmissions | 7 | 0 | bidId, vendorId |
| evaluations | 6 | 0 | bidId, submissionId |
| notifications | 7 | 2 | toUserId + isRead + createdAt, 批量写入 |
| contacts | 5 | 0 | isRead, createdAt |
| content/* | 6 | 0 | 单文档 get/set |
| settings/* | 4 | 0 | 单文档 get/set |

### 3.3 直接引用 Firebase 的非 service 文件

| 文件 | 引用内容 |
|------|---------|
| 11 个 `src/types/*.ts` | `import type { Timestamp }` |
| `src/utils/format.ts` | `Timestamp` 类型 |
| `src/pages/admin/ArticleEditorPage.tsx` | `serverTimestamp`, `Timestamp` |
| `src/pages/admin/BidManagePage.tsx` | `Timestamp` |
| `src/pages/vendor/BidSubmissionPage.tsx` | `serverTimestamp` |
| `src/pages/public/NewsPage.tsx` | `DocumentSnapshot` (分页游标) |
| `src/components/shared/NotificationBell.tsx` | `Timestamp` |
| `src/pages/admin/ReviewQueuePage.tsx` | `Timestamp` |

---

## 四、API 映射表

### 4.1 初始化

```typescript
// Firebase (旧)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// CloudBase (新)
import cloudbase from '@cloudbase/js-sdk'
const app = cloudbase.init({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: 'ap-guangzhou',
})
const auth = app.auth()
const db = app.database()
const storage = app.storage()
```

### 4.2 认证

| Firebase | CloudBase | 备注 |
|----------|-----------|------|
| `createUserWithEmailAndPassword(auth, email, pwd)` | `auth.signUpWithEmailAndPassword(email, pwd)` | TCB 会发验证邮件 |
| `signInWithEmailAndPassword(auth, email, pwd)` | `auth.signInWithEmailAndPassword(email, pwd)` | |
| `signOut(auth)` | `auth.signOut()` | |
| `sendPasswordResetEmail(auth, email)` | `auth.resetPassword({ email, verificationCode, newPassword })` | TCB 需要验证码流程 |
| `onAuthStateChanged(auth, cb)` | `auth.onLoginStateChanged(cb)` | 回调格式不同 |
| `updateProfile(user, { displayName })` | `user.update({ displayName })` | |
| `deleteUser(user)` | `auth.deleteMe()` | 仅能删除自己 |
| `auth.currentUser.uid` | `auth.currentUser?.uid` 或 `loginState.user.uid` | |

### 4.3 数据库

| Firebase | CloudBase | 备注 |
|----------|-----------|------|
| `collection(db, 'name')` | `db.collection('name')` | |
| `doc(db, 'coll', 'id')` | `db.collection('coll').doc('id')` | |
| `addDoc(collRef, data)` | `db.collection('name').add(data)` | 返回 `{ id }` |
| `getDoc(docRef)` | `.doc('id').get()` | 返回 `{ data }` |
| `getDocs(query)` | `.where({...}).get()` | 返回 `{ data: [...] }` |
| `updateDoc(docRef, data)` | `.doc('id').update(data)` | |
| `deleteDoc(docRef)` | `.doc('id').remove()` | |
| `setDoc(docRef, data)` | `.doc('id').set(data)` | |
| `setDoc(docRef, data, { merge: true })` | `.doc('id').update(data)` | TCB update = merge |
| `where('field', '==', val)` | `.where({ field: val })` | |
| `where('field', 'in', arr)` | `.where({ field: _.in(arr) })` | `_ = db.command` |
| `where('field', '!=', val)` | `.where({ field: _.neq(val) })` | |
| `where('field', '>', val)` | `.where({ field: _.gt(val) })` | |
| `orderBy('field', 'desc')` | `.orderBy('field', 'desc')` | 相同 |
| `limit(n)` | `.limit(n)` | 相同 |
| `startAfter(lastDoc)` | `.skip(offset)` | **重大差异**: 游标→偏移量 |
| `serverTimestamp()` | `db.serverDate()` | |
| `writeBatch()` | `db.runTransaction()` | TCB 用事务替代批量 |
| `Timestamp` 类型 | `Date` | TCB 返回标准 Date |

### 4.4 存储

| Firebase | CloudBase | 备注 |
|----------|-----------|------|
| `ref(storage, path)` | 路径字符串直接传入 | 无 ref 概念 |
| `uploadBytes(ref, file)` | `storage.from().upload(path, file)` | |
| `uploadBytesResumable(ref, file)` | 无直接等价 | 需用 XHR + 预签名 URL |
| `getDownloadURL(ref)` | `storage.from().createSignedUrl(path, expiry)` | 有效期 |
| `deleteObject(ref)` | `storage.from().remove([path])` | 数组参数 |

### 4.5 Timestamp 类型替换

```typescript
// Firebase (旧)
import type { Timestamp } from 'firebase/firestore'
interface Article { createdAt: Timestamp }
// 使用: article.createdAt.toDate()

// CloudBase (新)
interface Article { createdAt: Date }
// 使用: article.createdAt (已经是 Date)
```

---

## 五、安全规则迁移策略

### 5.1 核心问题

Firestore rules 使用了大量高级特性，CloudBase 的 JSON 规则无法完全表达：

| Firestore 特性 | CloudBase 支持 | 替代方案 |
|---------------|---------------|---------|
| `request.resource.data.diff().affectedKeys()` | 不支持 | 云函数校验 |
| `request.time` 比较 | 不支持 | 云函数校验 |
| Helper functions (`isAdmin()`, `isManager()`) | 不支持 | `get()` 内联 |
| `exists()` + `get()` 链式 | 部分支持 `get()` | 简化规则 + 云函数 |
| 字段级更新限制 (hasOnly) | 不支持 | 云函数校验 |

### 5.2 推荐策略: 简化规则 + 云函数

**CloudBase 规则只做基础鉴权**（谁能读/写），**业务校验移到云函数**：

```
客户端 → CloudBase 规则 (基础 auth 校验)
                ↓ 写操作
         云函数 (字段校验 + 业务逻辑)
                ↓
           数据库写入
```

#### 各集合规则示例

```json
// users 集合
{
  "read": "auth.uid != null && (doc._id == auth.uid || get('database.users.' + auth.uid).role == 'admin')",
  "create": "auth.uid != null",
  "update": "auth.uid != null && (doc._id == auth.uid || get('database.users.' + auth.uid).role == 'admin')",
  "delete": "get('database.users.' + auth.uid).role == 'admin' && get('database.users.' + auth.uid).adminLevel == 'manager'"
}

// articles 集合
{
  "read": "doc.isPublished == true || (auth.uid != null && get('database.users.' + auth.uid).role == 'admin')",
  "create": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'",
  "update": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'",
  "delete": "auth.uid != null && get('database.users.' + auth.uid).adminLevel == 'manager'"
}

// contacts 集合 (公开提交)
{
  "read": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'",
  "create": true,
  "update": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'",
  "delete": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'"
}

// notifications 集合
{
  "read": "auth.uid != null && doc.toUserId == auth.uid",
  "create": "auth.uid != null && get('database.users.' + auth.uid).role == 'admin'",
  "update": "auth.uid != null && doc.toUserId == auth.uid",
  "delete": false
}
```

#### 需要云函数处理的场景

| 场景 | 原 Firestore 规则逻辑 | 云函数方案 |
|------|---------------------|-----------|
| 用户注册字段校验 | `affectedKeys().hasOnly(...)` | 注册云函数校验必填字段 |
| 管理员邀请码验证 | `get(settings/security).managerInviteCode` | 注册云函数从 settings 读取验证 |
| 投标截止时间检查 | `request.time < deadline` | 投标提交云函数检查时间 |
| 通知只能改 isRead | `affectedKeys().hasOnly(['isRead'])` | 更新云函数限制可修改字段 |
| 供应商只能改自己的投标 | `resource.data.vendorId == request.auth.uid` | 更新云函数检查归属 |

---

## 六、迁移分阶段计划

### Phase 0: 环境准备（第 1 天）
> 不涉及代码改动

- [ ] 腾讯云账号注册 + 实名认证
- [ ] 创建 CloudBase 环境（ap-guangzhou, 标准版）
- [ ] 开启邮箱密码登录
- [ ] 配置授权域名（localhost:5173）
- [ ] 获取环境 ID 和 Access Key
- [ ] 安装 `@cloudbase/cli`
- [ ] （并行）启动 ICP 备案流程（如需自定义域名）
- [ ] 从 Firebase 导出现有数据

### Phase 1: 基础设施层（第 2 天）
> 替换 SDK 初始化 + 类型定义

**改动文件:**
- `package.json` — 移除 firebase, 添加 `@cloudbase/js-sdk`
- `src/config/firebase.ts` → `src/config/cloudbase.ts` — 重写初始化
- `.env` / `.env.example` — 替换环境变量
- `src/types/*.ts` (11 个) — `Timestamp` → `Date`
- `src/utils/format.ts` — 移除 Timestamp 导入，适配 Date

**验收标准:**
- `npm run build` 编译通过（允许 service 层报错，后续修）
- CloudBase SDK 初始化成功（`app.auth().hasLoginState()` 不报错）

### Phase 2: 认证模块（第 2-3 天）
> 登录/注册/登出/密码重置

**改动文件:**
- `src/services/auth.service.ts` — 全部重写
- `src/contexts/AuthContext.tsx` — 重写 `onAuthStateChanged` → `onLoginStateChanged`

**关键差异处理:**
1. **注册流程**: CloudBase `signUpWithEmailAndPassword` 会发验证邮件
   - 方案 A: 注册后提示用户验证邮件，验证后再创建用户文档
   - 方案 B: 使用云函数在邮箱验证回调中自动创建用户文档
   - **推荐方案 A**（更简单，用户体验变化不大）
2. **密码重置**: Firebase 发链接，CloudBase 发验证码
   - 需要将重置密码 modal 改为两步流程（发验证码 → 输入验证码+新密码）
3. **Auth State**: `onLoginStateChanged` 回调格式不同，需适配 `eventType`

**验收标准:**
- 邮箱注册 → 验证邮件 → 登录成功
- 登出后状态正确清除
- 密码重置流程完整

### Phase 3: 数据库服务层 — 简单集合（第 3-4 天）
> 迁移无复杂查询的 service 文件

**改动文件（8 个）:**
- `src/services/site-settings.service.ts` — 单文档 get/set
- `src/services/security-code.service.ts` — 单文档 get/set
- `src/services/home-content.service.ts` — 单文档 get/set
- `src/services/team-content.service.ts` — 单文档 get/set
- `src/services/about-content.service.ts` — 单文档 get/set
- `src/services/contacts.service.ts` — 简单 CRUD + where
- `src/services/evaluations.service.ts` — 简单 CRUD + where
- `src/services/qualifications.service.ts` — 简单 CRUD + where/orderBy

**模式（每个文件做同样的替换）:**
```typescript
// Firebase 旧
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
         query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { requireDb } from '@/config/firebase'
const db = requireDb()
const snap = await getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')))
const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))

// CloudBase 新
import { requireDb } from '@/config/cloudbase'
const db = requireDb()
const { data: list } = await db.collection('contacts')
  .orderBy('createdAt', 'desc')
  .get()
// list 已包含 _id 字段
```

**验收标准:**
- 所有简单集合的增删改查在开发环境正常工作

### Phase 4: 数据库服务层 — 复杂集合（第 4-5 天）
> 迁移有复合查询、批量操作的 service 文件

**改动文件（6 个）:**
- `src/services/users.service.ts` — 复合查询 (role + accountStatus + createdAt)
- `src/services/articles.service.ts` — **游标分页** → 偏移量分页
- `src/services/projects.service.ts` — 复合查询
- `src/services/services.service.ts` — 复合查询 + sortOrder
- `src/services/bids.service.ts` — `status in [...]` 查询
- `src/services/notifications.service.ts` — `writeBatch` → 事务, 复合查询

**重大改动:**

1. **文章分页重构** (`articles.service.ts`):
```typescript
// Firebase 旧 — 游标分页
interface ArticleFilters { lastDoc?: DocumentSnapshot; limit?: number }
const q = query(collection(db, 'articles'),
  where('isPublished', '==', true),
  orderBy('publishedAt', 'desc'),
  startAfter(filters.lastDoc),
  limit(filters.limit || 10)
)

// CloudBase 新 — 偏移量分页
interface ArticleFilters { offset?: number; limit?: number }
const { data } = await db.collection('articles')
  .where({ isPublished: true })
  .orderBy('publishedAt', 'desc')
  .skip(filters.offset || 0)
  .limit(filters.limit || 10)
  .get()
```

2. **通知批量标记已读** (`notifications.service.ts`):
```typescript
// Firebase 旧 — writeBatch
const batch = writeBatch(db)
unreadSnap.docs.forEach(d => batch.update(d.ref, { isRead: true }))
await batch.commit()

// CloudBase 新 — 条件批量更新
await db.collection('notifications')
  .where({ toUserId: userId, isRead: false })
  .update({ isRead: true })
```

3. **`in` 查询** (`bids.service.ts`):
```typescript
// Firebase: where('status', 'in', ['published', 'bidding'])
// CloudBase:
const _ = db.command
.where({ status: _.in(['published', 'bidding']) })
```

**涉及的页面组件改动:**
- `src/pages/public/NewsPage.tsx` — 移除 `DocumentSnapshot` 导入，改为 offset 分页
- `src/pages/admin/ArticleListPage.tsx` — 适配新分页接口

**验收标准:**
- 文章列表分页正常
- 通知批量标记已读正常
- 招标大厅 status 过滤正常

### Phase 5: 存储模块（第 5 天）
> 文件上传/下载/删除

**改动文件:**
- `src/services/storage.service.ts` — 全部重写

```typescript
// CloudBase 存储
import { requireStorage } from '@/config/cloudbase'

export async function uploadFile(path: string, file: File): Promise<string> {
  const storage = requireStorage()
  await storage.from().upload(path, file)
  const { signedUrl } = await storage.from().createSignedUrl(path, 86400 * 30) // 30天
  return signedUrl
}

export async function deleteFile(path: string): Promise<void> {
  const storage = requireStorage()
  await storage.from().remove([path])
}

// uploadFileWithProgress — 需要用 XHR 替代
export async function uploadFileWithProgress(
  path: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<string> {
  // 方案: 先上传，无精确进度，模拟进度条
  // 或使用 cos-js-sdk-v5 获取真实进度
  onProgress(0)
  const url = await uploadFile(path, file)
  onProgress(100)
  return url
}
```

**注意:** CloudBase 的 `createSignedUrl` 有时效限制。如果需要永久 URL：
- 方案 A: 设置存储桶为公有读，使用 `getPublicUrl()`
- 方案 B: 在文档中存储 cloudID，每次需要时生成新签名 URL
- **推荐方案 A**（公司网站图片没有安全性需求）

**验收标准:**
- 图片上传成功并可正常显示
- 文件删除正常

### Phase 6: 云函数 — 安全校验（第 5-6 天）
> 替代 Firestore rules 中的复杂业务逻辑

**需要创建的云函数:**

| 云函数名 | 替代的规则逻辑 | 触发方式 |
|---------|--------------|---------|
| `validateUserRegistration` | 注册字段校验 + 邀请码验证 | 客户端调用 |
| `validateBidSubmission` | 投标截止时间检查 + 供应商归属 | 客户端调用 |
| `validateNotificationUpdate` | 仅允许改 isRead 字段 | 数据库触发器 |
| `validateUserUpdate` | 字段级权限（普通用户不能改 role） | 客户端调用 |

**开发方式:**
```bash
# 在 CloudBase 控制台或 CLI 创建云函数
tcb fn create validateUserRegistration -e <env-id>
```

```javascript
// functions/validateUserRegistration/index.js
exports.main = async (event, context) => {
  const { userInfo } = context
  const { role, inviteCode, companyName } = event

  // 校验逻辑
  if (role === 'admin') {
    // 验证邀请码
    const db = context.database()
    const { data } = await db.collection('settings').doc('security').get()
    if (data.managerInviteCode !== inviteCode) {
      return { success: false, error: '邀请码错误' }
    }
  }
  // ... 创建用户文档
}
```

**客户端调用:**
```typescript
const result = await app.callFunction({
  name: 'validateUserRegistration',
  data: { role: 'admin', inviteCode: '...' }
})
```

**验收标准:**
- 无邀请码注册管理员被拒绝
- 超过截止时间无法投标
- 普通用户无法修改自己的 role

### Phase 7: 数据库规则部署 + 索引（第 6 天）
> 部署 CloudBase 安全规则 + 创建复合索引

**安全规则部署:**
- 控制台 → 数据库 → 每个集合 → 权限设置 → 粘贴规则 JSON
- 或使用 CLI 批量部署

**复合索引创建（控制台操作）:**

| 集合 | 索引字段 |
|------|---------|
| users | `role` + `accountStatus` + `createdAt` (降序) |
| articles | `isPublished` + `publishedAt` (降序) |
| articles | `category` + `publishedAt` (降序) |
| articles | `status` + `submittedAt` (降序) |
| projects | `isPublished` + `createdAt` (降序) |
| projects | `category` + `createdAt` (降序) |
| projects | `status` + `submittedAt` (降序) |
| services | `isPublished` + `sortOrder` (升序) |
| services | `status` + `submittedAt` (降序) |
| qualifications | `isPublished` + `sortOrder` (升序) |
| qualifications | `status` + `submittedAt` (降序) |
| notifications | `toUserId` + `createdAt` (降序) |
| notifications | `toUserId` + `isRead` + `createdAt` (降序) |

**验收标准:**
- 所有复合查询不报错
- 规则生效（未登录无法访问需认证的集合）

### Phase 8: 数据迁移（第 6-7 天）
> 从 Firebase 迁移现有数据到 CloudBase

**迁移步骤:**

1. **导出 Firebase 数据**
```bash
# Firestore 导出
firebase emulators:export ./firebase-export
# 或在 Console 手动导出 JSON
```

2. **数据转换脚本**
```bash
# 转换 Timestamp 为 Date, 调整 ID 字段
node scripts/migrate-data.js
```

3. **关键转换:**
- Firestore `Timestamp { seconds, nanoseconds }` → `Date` 或 ISO 字符串
- 文档 ID: Firebase 的 `doc.id` → CloudBase 的 `_id`
- 嵌套的 `serverTimestamp()` 标记 → 实际日期值

4. **导入 CloudBase**
```bash
# 使用 CloudBase 控制台导入 JSON
# 或编写脚本批量插入
```

5. **Auth 用户迁移**
- Firebase Auth 用户无法直接迁移密码 hash
- 方案 A: 通知用户重置密码（**推荐**，最安全）
- 方案 B: 使用 CloudBase Custom Auth 桥接
- 方案 C: 导出用户邮箱列表，在 CloudBase 预创建账号

**验收标准:**
- 所有集合数据量与 Firebase 一致
- 随机抽查文档内容正确
- 现有用户可以通过重置密码登录

### Phase 9: 页面组件适配（第 7 天）
> 修复页面中直接引用 Firebase 的代码

**改动文件:**
- `src/pages/admin/ArticleEditorPage.tsx` — `serverTimestamp()` → `db.serverDate()`
- `src/pages/admin/BidManagePage.tsx` — `Timestamp` → `Date`
- `src/pages/vendor/BidSubmissionPage.tsx` — `serverTimestamp()` → `db.serverDate()`
- `src/pages/public/NewsPage.tsx` — 移除 `DocumentSnapshot`，改 offset 分页
- `src/components/shared/NotificationBell.tsx` — `Timestamp` → `Date`
- `src/pages/admin/ReviewQueuePage.tsx` — `Timestamp` → `Date`
- `src/pages/admin/ArticleListPage.tsx` — `Timestamp` → `Date`

**验收标准:**
- `npm run build` 零错误零警告
- 所有页面正常渲染

### Phase 10: Hosting 部署 + 端到端测试（第 7-8 天）

**部署:**
```bash
npm run build
tcb hosting deploy ./dist -e <env-id>
```

**配置 SPA 路由:**
- 控制台 → 静态网站托管 → 基础配置 → 错误页面 → `index.html`

**端到端测试清单:**

| 测试场景 | 验证点 |
|---------|-------|
| 管理员注册（需邀请码） | 注册 → 验证邮箱 → 待审批 → 批准 → 登录 |
| 供应商注册 | 注册 → 验证邮箱 → 登录 → Dashboard |
| 员工注册（需安全码） | 注册 → 验证邮箱 → 登录 |
| 登录/登出 | 状态正确切换 |
| 密码重置 | 发验证码 → 输入新密码 → 登录 |
| 文章 CRUD | 创建 → 提交审核 → 批准 → 公开可见 |
| 项目 CRUD | 同上 |
| 招标发布 | 创建 → 发布 → 供应商可见 |
| 供应商投标 | 提交 → 文件上传 → 管理员可见 |
| 通知 | 铃铛显示未读数 → 标记已读 |
| 联系表单 | 公开提交 → 管理员可见 |
| 图片上传 | 上传 → 预览 → 删除 |
| 首页轮播图 | 数据正常加载 |
| 移动端 | 基本响应式正常 |

**验收标准:**
- 以上所有测试通过
- 国内网络直接访问无超时

### Phase 11: 清理 + 切换（第 8 天）

- [ ] 移除 `firebase` npm 包
- [ ] 删除 `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`
- [ ] 更新 `CLAUDE.md` — 替换所有 Firebase 引用
- [ ] 更新 `.env.example`
- [ ] 更新 README（如有）
- [ ] DNS 切换（如有自定义域名且备案完成）
- [ ] Firebase Console 下线旧项目（确认无流量后）

---

## 七、风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| CloudBase email+password 注册需邮箱验证 | 注册流程变化，用户需多一步 | 修改注册 UI，增加"请验证邮箱"提示页 |
| CloudBase 安全规则表达力不如 Firestore | 复杂校验无法用规则实现 | 使用云函数补充（Phase 6）|
| 上传进度回调无 SDK 支持 | 进度条功能缺失 | 使用 cos-js-sdk-v5 或模拟进度 |
| 游标分页 → 偏移量分页 | 大数据集性能下降 | 当前数据量小，问题不大；后期可加缓存 |
| 用户密码无法迁移 | 所有用户需重置密码 | 提前邮件通知用户 |
| ICP 备案耗时 1-4 周 | 自定义域名延迟上线 | 先用默认域名，备案完成后切换 |

---

## 八、文件改动清单汇总

### 新增文件
| 文件 | 用途 |
|------|------|
| `src/config/cloudbase.ts` | CloudBase SDK 初始化 |
| `functions/validateUserRegistration/index.js` | 注册校验云函数 |
| `functions/validateBidSubmission/index.js` | 投标校验云函数 |
| `functions/validateNotificationUpdate/index.js` | 通知更新校验 |
| `functions/validateUserUpdate/index.js` | 用户更新校验 |
| `scripts/migrate-data.js` | 数据迁移脚本 |
| `cloudbaserc.json` | CloudBase 配置文件 |

### 删除文件
| 文件 |
|------|
| `src/config/firebase.ts` |
| `firebase.json` |
| `.firebaserc` |
| `firestore.rules` |
| `firestore.indexes.json` |

### 修改文件（共 ~35 个）
| 类别 | 文件数 | 文件 |
|------|--------|------|
| 类型定义 | 11 | `src/types/*.ts` — Timestamp → Date |
| 服务层 | 17 | `src/services/*.ts` — 全部重写查询 |
| 认证 | 2 | `auth.service.ts`, `AuthContext.tsx` |
| 工具 | 1 | `src/utils/format.ts` |
| 页面组件 | 7 | ArticleEditor, BidManage, BidSubmission, NewsPage, NotificationBell, ReviewQueue, ArticleList |
| 配置 | 2 | `package.json`, `.env` |

---

## 九、时间估算

| 阶段 | 天数 | 累计 |
|------|------|------|
| Phase 0: 环境准备 | 0.5 天 | 0.5 |
| Phase 1: 基础设施层 | 0.5 天 | 1 |
| Phase 2: 认证模块 | 1 天 | 2 |
| Phase 3: 数据库（简单集合） | 1 天 | 3 |
| Phase 4: 数据库（复杂集合） | 1 天 | 4 |
| Phase 5: 存储模块 | 0.5 天 | 4.5 |
| Phase 6: 云函数 | 1 天 | 5.5 |
| Phase 7: 规则 + 索引 | 0.5 天 | 6 |
| Phase 8: 数据迁移 | 1 天 | 7 |
| Phase 9: 页面适配 | 0.5 天 | 7.5 |
| Phase 10: 部署 + 测试 | 1 天 | 8.5 |
| Phase 11: 清理 + 切换 | 0.5 天 | 9 |

**总计: 约 9 个工作日**

---

## 十、参考资源

- [CloudBase 官方文档](https://docs.cloudbase.net/)
- [CloudBase JS SDK (npm)](https://www.npmjs.com/package/@cloudbase/js-sdk)
- [CloudBase JS SDK (GitHub)](https://github.com/TencentCloudBase/tcb-js-sdk)
- [CloudBase Auth API](https://docs.cloudbase.net/en/api-reference/webv2/authentication)
- [CloudBase Database API](https://docs.cloudbase.net/en/api-reference/webv2/database)
- [CloudBase Storage API](https://docs.cloudbase.net/en/api-reference/webv2/storage)
- [CloudBase Security Rules](https://docs.cloudbase.net/en/rule/learn-rules)
- [CloudBase Hosting CLI](https://docs.cloudbase.net/en/cli-v1/hosting)
- [CloudBase 定价](https://cloud.tencent.com/document/product/876/75213)
