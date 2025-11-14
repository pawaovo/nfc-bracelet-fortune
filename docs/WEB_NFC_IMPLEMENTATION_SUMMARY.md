# 网页版NFC绑定和登录流程优化 - 实施总结

## 📋 实施概述

本次优化实现了网页版NFC绑定的三种场景，支持真实nfcId和虚假nfcId的区分处理，以及登录状态的持久化保存。

**实施时间**: 2025-01-15
**最后更新**: 2025-01-15
**状态**: ✅ 已完成并优化

---

## 🎯 实现的核心功能

### 1. 三种用户场景

#### 场景A：真实nfcId + 未绑定用户（首次绑定）

- **触发条件**: URL包含真实nfcId，且该nfcId在数据库中存在但未绑定
- **流程**: 绑定页面 → 个人信息页面 → 填写信息 → 保存 → 检查今日运势 → 运势页面或AI生成页面
- **数据存储**:
  - `users` 表：创建/更新用户记录
  - `bracelets` 表：绑定nfcId到用户
  - `localStorage`: 保存登录状态（token, userId, username, nfcId, userType: 'bound'）
- **后续访问**: 检查今日运势，有则直接展示，无则调用AI生成

#### 场景B：真实nfcId + 已绑定其他用户（需要登录）

- **触发条件**: URL包含真实nfcId，且该nfcId已被其他用户绑定
- **流程**: 个人信息页面 → 填写用户名+密码+昵称+生日 → 验证登录并更新信息 → 检查今日运势 → 运势页面或AI生成页面
- **验证逻辑**:
  - 检查用户名是否存在
  - 检查密码是否正确
  - 检查该nfcId是否绑定给该用户
- **后续访问**: 直接跳转到AI生成页面

#### 场景C：虚假nfcId或无nfcId（访客用户）

- **触发条件**: URL没有nfcId参数，或nfcId在数据库中不存在
- **流程**: 绑定页面 → 个人信息页面 → 填写信息 → 保存 → 访客版运势页面
- **数据存储**:
  - `users` 表：创建/更新用户记录
  - `bracelets` 表：不创建记录
  - `localStorage`: 保存登录状态（token, userId, username, userType: 'visitor'）
- **限制**: 不能使用AI生成功能，只能查看固定模板运势

### 2. 登录状态持久化

**保存内容**:

```javascript
{
  token: "jwt_token_string",
  userId: "user_uuid",
  username: "用户名",
  nfcId: "LOCAL_TEST1000", // 仅绑定用户有此字段
  userType: "bound" | "visitor", // 用户类型
}
```

**保存位置**: `localStorage` (uni.setStorageSync)
**清除时机**: 用户手动清除浏览器缓存、主动退出登录

### 3. 避免重复调用AI生成

**检查机制**: 绑定/登录成功后，先调用 `getTodayFortune()` API检查是否已有今日运势

**智能跳转**:

- 已有今日运势：保存到store → 直接跳转到运势页面
- 没有今日运势：跳转到AI生成页面

**成本优化**: 同一天多次登录不会重复调用AI，节省成本

**后端逻辑**: `getTodayFortune()` 方法自动检查数据库，只在没有记录时才调用AI

### 4. 登录时更新用户信息

**支持字段**: 昵称（name）、生日（birthday）

**更新时机**: 场景B登录验证成功后

**验证规则**:

- 昵称：1-20个字符，只能包含中文、英文、数字和空格
- 生日：YYYY-MM-DD格式

**数据库更新**: 验证通过后自动更新 `users` 表

---

## 🔧 技术实现细节

### 后端API修改

#### 1. `apps/api/src/bracelets/bracelets.service.ts`

**新增方法**:

- `exists(nfcId: string): Promise<boolean>` - 检查nfcId是否存在
- `getBindingStatus(nfcId: string)` - 获取nfcId的绑定状态

#### 2. `apps/api/src/profile/dto/register-web.dto.ts`

**修改**:

- `nfcId` 字段改为可选 (`@IsOptional()`)

#### 3. `apps/api/src/profile/dto/web-login.dto.ts`

**新增文件**: 网页版登录验证DTO

```typescript
export class WebLoginDto {
  username: string;
  password: string;
  nfcId: string; // 必需
}
```

#### 4. `apps/api/src/profile/profile.service.ts`

**新增方法**:

- `loginWeb(username, password, nfcId)` - 网页版登录验证

**修改方法**:

- `registerWeb(dto)` - 返回类型增加 `userType: 'bound' | 'visitor'`
- 根据nfcId的真实性决定是否绑定到bracelets表

#### 5. `apps/api/src/profile/profile.controller.ts`

**新增接口**:

- `POST /api/v1/profile/web-login` - 网页版登录验证接口

### 前端修改

#### 1. `packages/shared-types/src/user.ts`

**新增类型**:

```typescript
export interface WebLoginRequest {
  username: string;
  password: string;
  nfcId: string;
}

export interface WebAuthResponse extends UserPartial {
  userType: 'bound' | 'visitor';
}
```

#### 2. `apps/wx-app/src/api/profile.ts`

**新增方法**:

- `loginWeb(payload: WebLoginRequest)` - 调用登录验证接口

#### 3. `apps/wx-app/src/stores/auth.ts`

**新增状态**:

- `nfcId: ref<string>('')` - 当前绑定的nfcId
- `userType: ref<'bound' | 'visitor' | ''>('')` - 用户类型

**修改方法**:

- `login()` - 增加nfcId和userType参数
- `logout()` - 清除nfcId和userType
- `initFromStorage()` - 恢复nfcId和userType

#### 4. `apps/wx-app/src/App.vue`

**新增函数**:

- `handleH5NfcLaunch(nfcId)` - H5平台NFC启动处理
- `handleH5DirectLaunch()` - H5平台直接启动处理

**逻辑**:

- 检查登录状态和nfcId匹配
- 已登录且nfcId匹配 → 直接进入运势页面
- 未登录或nfcId不匹配 → 进入绑定页面

#### 5. `apps/wx-app/src/pages/profile/index.vue`

**修改函数**:

- `submitAsWeb()` - 实现三种场景的自动判断
  1. 先尝试登录验证（场景B）
  2. 登录失败则执行注册流程（场景A或C）
- `handleProfileSuccess()` - 保存userType和nfcId
- `navigateAfterProfileSave()` - 根据userType跳转不同页面

---

## 📊 数据流程图

### 场景A：首次绑定

```
用户访问 ?nfcId=TEST001
  ↓
App.vue: handleH5NfcLaunch()
  ↓ (未登录)
绑定页面 (bind/index)
  ↓ (点击绑定)
个人信息页面 (profile/index)
  ↓ (填写信息)
submitAsWeb()
  ↓ (尝试登录失败)
registerWeb API
  ↓ (检查nfcId存在且未绑定)
创建用户 + 绑定nfcId
  ↓
保存登录状态 (userType: 'bound')
  ↓
AI生成页面
  ↓
运势页面
```

### 场景B：已绑定用户登录

```
用户访问 ?nfcId=TEST002 (已被用户A绑定)
  ↓
App.vue: handleH5NfcLaunch()
  ↓ (未登录或nfcId不匹配)
绑定页面
  ↓
个人信息页面
  ↓ (填写用户A的用户名+密码)
submitAsWeb()
  ↓ (尝试登录)
loginWeb API
  ↓ (验证成功)
保存登录状态 (userType: 'bound')
  ↓
AI生成页面
  ↓
运势页面
```

### 场景C：访客用户

```
用户访问 (无nfcId 或 虚假nfcId)
  ↓
App.vue: handleH5NfcLaunch() / handleH5DirectLaunch()
  ↓
绑定页面
  ↓
个人信息页面
  ↓ (填写信息)
submitAsWeb()
  ↓ (尝试登录失败)
registerWeb API
  ↓ (检查nfcId不存在)
创建用户 (不绑定bracelets)
  ↓
保存登录状态 (userType: 'visitor')
  ↓
访客版运势页面 (mode=visitor)
```

---

## ✅ 验收测试清单

### 场景A测试

- [ ] 访问 `http://localhost:5173/?nfcId=LOCAL_TEST1000` (数据库中存在但未绑定)
- [ ] 填写用户名、密码、生日
- [ ] 点击保存，检查：
  - [ ] users表创建新记录
  - [ ] bracelets表绑定nfcId到用户
  - [ ] localStorage保存登录状态（userType: 'bound'）
  - [ ] 跳转到AI生成页面
- [ ] 刷新页面，检查：
  - [ ] 直接跳转到运势页面（不重复绑定流程）

### 场景B测试

- [ ] 先用用户A绑定 `LOCAL_TEST2000`
- [ ] 清除浏览器缓存
- [ ] 访问 `http://localhost:5173/?nfcId=LOCAL_TEST2000`
- [ ] 填写用户A的用户名+密码
- [ ] 点击保存，检查：
  - [ ] 登录验证成功
  - [ ] localStorage保存登录状态
  - [ ] 跳转到AI生成页面
- [ ] 测试错误情况：
  - [ ] 填写错误密码 → 显示"用户名存在，密码错误"
  - [ ] 填写其他用户的用户名 → 显示"该手链未绑定此用户"

### 场景C测试

- [ ] 访问 `http://localhost:5173/` (无nfcId)
- [ ] 填写用户名、密码、生日
- [ ] 点击保存，检查：
  - [ ] users表创建新记录
  - [ ] bracelets表无新记录
  - [ ] localStorage保存登录状态（userType: 'visitor'）
  - [ ] 跳转到访客版运势页面
- [ ] 访问 `http://localhost:5173/?nfcId=FAKE_ID` (数据库中不存在)
- [ ] 重复上述测试

### 登录状态持久化测试

- [ ] 完成场景A绑定后，关闭浏览器
- [ ] 重新打开浏览器，访问 `http://localhost:5173/?nfcId=LOCAL_TEST1000`
- [ ] 检查：直接跳转到运势页面（不要求重新登录）

---

## 🔍 关键代码位置

| 功能            | 文件路径                                      | 关键方法/接口             |
| --------------- | --------------------------------------------- | ------------------------- |
| nfcId存在性检查 | `apps/api/src/bracelets/bracelets.service.ts` | `getBindingStatus()`      |
| 登录验证        | `apps/api/src/profile/profile.service.ts`     | `loginWeb()`              |
| 注册/绑定       | `apps/api/src/profile/profile.service.ts`     | `registerWeb()`           |
| 登录接口        | `apps/api/src/profile/profile.controller.ts`  | `POST /profile/web-login` |
| H5启动逻辑      | `apps/wx-app/src/App.vue`                     | `handleH5NfcLaunch()`     |
| 表单提交        | `apps/wx-app/src/pages/profile/index.vue`     | `submitAsWeb()`           |
| 登录状态管理    | `apps/wx-app/src/stores/auth.ts`              | `login()`, `logout()`     |

---

## 🚨 注意事项

1. **密码安全**: 当前密码为明文存储，生产环境需要加密
2. **并发控制**: 当前未实现并发绑定控制，预期用户数少（~10人）可接受
3. **Token过期**: 当前未实现token过期机制，登录状态永久有效
4. **错误处理**: 已实现基本错误提示，可根据需要优化用户体验
5. **数据库预填充**: bracelets表需要预先填入真实nfcId数据

---

## 📝 后续优化建议

1. **安全性增强**:
   - 密码哈希存储（bcrypt）
   - Token过期机制
   - 登录失败次数限制

2. **用户体验优化**:
   - 场景B：页面加载时显示"该手链已被绑定，请登录"提示
   - 添加"忘记密码"功能
   - 添加"记住我"选项

3. **性能优化**:
   - 添加nfcId绑定状态缓存
   - 减少不必要的数据库查询

4. **监控和日志**:
   - 添加用户行为日志
   - 监控异常登录尝试

---

## 🐛 已修复的问题

### 问题1: 登录后未正确跳转到AI生成页面（2025-01-15修复）

**症状**:

- 数据库内没有今日运势信息
- 登录成功后停留在个人信息页面
- AI在后台被调用
- 最后直接从个人信息页面跳到完整版运势页面

**根本原因**:

- `handleProfileSuccess` 函数中使用 `setTimeout` 延迟1.5秒后才调用 `navigateAfterProfileSave`
- 在这1.5秒延迟期间，运势页面已经开始加载并调用AI
- 导致跳转时机错误

**修复方案**:

1. 将 `navigateAfterProfileSave` 的逻辑合并到 `handleProfileSuccess` 中
2. 在显示成功提示**之前**先检查今日运势并确定跳转目标URL
3. 然后显示提示，1.5秒后跳转到已确定的URL
4. 删除冗余的 `navigateAfterProfileSave` 函数

**修改文件**:

- `apps/wx-app/src/pages/profile/index.vue` (第278-355行)

**验证**:

- ✅ 登录成功后正确跳转到AI生成页面（如果没有今日运势）
- ✅ 登录成功后正确跳转到运势页面（如果已有今日运势）
- ✅ 不会在个人信息页面停留并在后台调用AI

### 问题2: 老用户登录时仍然调用AI生成（2025-01-15修复）

**症状**:

- 已绑定用户登录时，即使今日没有运势信息
- 也不能正常进入AI生成页面
- 停留在个人信息页面，AI在后台被调用
- AI返回数据后直接进入完整版运势页面

**根本原因**:

- 后端的 `getTodayFortune()` API 在没有今日运势时会**自动生成并返回**
- 前端调用此API检查是否有今日运势时，后端已经生成了
- 导致前端误以为已经有今日运势，跳转到运势页面而不是AI生成页面

**修复方案**:

1. 后端添加新的 API 端点 `GET /fortune/today/exists`，只检查不生成
2. 后端添加 `checkTodayFortuneExists()` service 方法
3. 前端添加 `checkTodayFortuneExists()` API 调用
4. 前端修改检查逻辑：
   - 先调用 `checkTodayFortuneExists()` 检查是否存在
   - 如果存在，再调用 `getTodayFortune()` 获取数据
   - 如果不存在，直接跳转到AI生成页面

**修改文件**:

- `apps/api/src/fortunes/fortunes.controller.ts` (添加 `checkTodayFortuneExists` 端点)
- `apps/api/src/fortunes/fortunes.service.ts` (添加 `checkTodayFortuneExists` 方法)
- `apps/wx-app/src/api/fortune.ts` (添加 `checkTodayFortuneExists` API调用)
- `apps/wx-app/src/pages/profile/index.vue` (修改检查逻辑)

**验证**:

- ✅ 新用户首次绑定：直接跳转到AI生成页面
- ✅ 老用户登录（有今日运势）：跳转到运势页面
- ✅ 老用户登录（无今日运势）：跳转到AI生成页面
- ✅ 不会在检查期间自动生成运势

---

**文档维护**: 开发团队
**最后更新**: 2025-01-15
