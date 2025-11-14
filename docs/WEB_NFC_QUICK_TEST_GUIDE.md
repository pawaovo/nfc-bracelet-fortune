# 网页版NFC绑定 - 快速测试指南

## 🚀 快速开始

### 1. 重置数据库并填充测试数据

```bash
cd apps/api
pnpm db:seed
```

执行后会看到详细的测试场景说明输出。

### 2. 启动服务

```bash
# 在项目根目录
pnpm dev
```

确保以下服务正常运行：

- 后端API: `http://localhost:3000`
- 前端H5: `http://localhost:5173`

---

## 📋 测试场景

### 场景A：首次绑定（真实nfcId + 未绑定）

**测试URL**: `http://localhost:5173/?nfcId=LOCAL_TEST1000`

**操作步骤**:

1. 打开浏览器，访问上述URL
2. 填写表单：
   - 用户名：`wangwu`（任意新用户名）
   - 密码：`123456`
   - 生日：`2000-01-01`
3. 点击"保存"按钮

**预期结果**:

- ✅ 显示"绑定成功"提示
- ✅ 跳转到AI生成页面
- ✅ 数据库 `users` 表新增记录
- ✅ 数据库 `bracelets` 表中 `LOCAL_TEST1000` 的 `userId` 被更新
- ✅ localStorage 保存登录状态（userType: 'bound'）

**验证登录状态持久化**:

1. 关闭浏览器
2. 重新打开浏览器，访问 `http://localhost:5173/?nfcId=LOCAL_TEST1000`
3. **预期**: 直接跳转到运势页面，不要求重新登录

**可用的未绑定nfcId**:

- `LOCAL_TEST1000`
- `LOCAL_TEST1001`
- `LOCAL_TEST1002`

---

### 场景B：已绑定用户登录（真实nfcId + 已绑定）

**测试URL**: `http://localhost:5173/?nfcId=LOCAL_TEST2000`

**测试账号**:
| 用户名 | 密码 | 生日 | 绑定的nfcId |
|--------|------|------|-------------|
| zhangsan | 123456 | 1990-01-01 | LOCAL_TEST2000 |
| lisi | 654321 | 1995-05-05 | LOCAL_TEST2001 |

**操作步骤**:

1. 清除浏览器缓存（重要！）
   ```javascript
   // 在浏览器控制台执行
   localStorage.clear();
   location.reload();
   ```
2. 访问 `http://localhost:5173/?nfcId=LOCAL_TEST2000`
3. 填写表单：
   - 用户名：`zhangsan`
   - 密码：`123456`
   - 生日：`1990-01-01`
4. 点击"保存"按钮

**预期结果**:

- ✅ 显示"登录成功"提示
- ✅ 跳转到AI生成页面
- ✅ localStorage 保存登录状态（userType: 'bound'）

**错误场景测试**:

1. **密码错误**:
   - 用户名：`zhangsan`
   - 密码：`wrong_password`
   - **预期**: 显示"用户名存在，密码错误"

2. **nfcId不匹配**:
   - URL: `http://localhost:5173/?nfcId=LOCAL_TEST2000`
   - 用户名：`lisi`（李四的账号）
   - 密码：`654321`
   - **预期**: 显示"该手链未绑定此用户"

3. **用户名不存在**:
   - 用户名：`nonexistent_user`
   - 密码：`123456`
   - **预期**: 显示"用户名或密码错误"

**登录时更新信息测试**:

1. **更新生日**:
   - URL: `http://localhost:5173/?nfcId=LOCAL_TEST2000`
   - 用户名：`zhangsan`
   - 密码：`123456`
   - 生日：`1995-12-25`（修改为新日期）
   - **预期**: 登录成功，数据库中生日已更新

2. **更新昵称**:
   - URL: `http://localhost:5173/?nfcId=LOCAL_TEST2000`
   - 用户名：`zhangsan`
   - 密码：`123456`
   - 昵称：`张小三`（修改昵称）
   - **预期**: 登录成功，数据库中昵称已更新

---

### 场景C：访客用户（虚假nfcId或无nfcId）

**测试URL 1**: `http://localhost:5173/?nfcId=FAKE_ID_999`  
**测试URL 2**: `http://localhost:5173/`

**操作步骤**:

1. 访问上述任一URL
2. 填写表单：
   - 用户名：`visitor01`（任意用户名）
   - 密码：`123456`
   - 生日：`2000-01-01`
3. 点击"保存"按钮

**预期结果**:

- ✅ 显示"绑定成功"提示
- ✅ 跳转到**访客版运势页面**（URL包含 `?mode=visitor`）
- ✅ 数据库 `users` 表新增记录
- ❌ 数据库 `bracelets` 表**无新记录**
- ✅ localStorage 保存登录状态（userType: 'visitor'）
- ❌ **不能使用AI生成功能**，只能查看固定模板运势

---

### 扩展测试：同一用户绑定多个手链

**目标**: 验证一个用户可以绑定多个不同的nfcId

**操作步骤**:

1. 先完成场景A，用新用户绑定 `LOCAL_TEST1000`
2. 清除浏览器缓存
3. 访问 `http://localhost:5173/?nfcId=LOCAL_TEST3000`
4. 填写**相同的用户名和密码**
5. 点击保存

**预期结果**:

- ✅ 登录成功
- ✅ `LOCAL_TEST3000` 绑定到该用户
- ✅ 该用户现在拥有两个手链：`LOCAL_TEST1000` 和 `LOCAL_TEST3000`

**数据库验证**:

```sql
-- 查询该用户绑定的所有手链
SELECT b.nfc_id, b.bound_at, u.username
FROM bracelets b
JOIN users u ON b.user_id = u.id
WHERE u.username = '你的用户名';
```

---

## 🔍 调试技巧

### 查看控制台日志

打开浏览器开发者工具（F12），查看Console输出：

```
[H5] NFC启动，nfcId: LOCAL_TEST1000
[Profile] H5平台，nfcId: LOCAL_TEST1000
[submitAsWeb] nfcId: LOCAL_TEST1000
[submitAsWeb] 登录验证失败，尝试注册
[submitAsWeb] 注册成功，用户类型: bound
[Profile] 绑定用户，跳转到AI生成页面
```

### 查看localStorage

```javascript
// 在浏览器控制台执行
console.log({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  nfcId: localStorage.getItem('nfcId'),
  userType: localStorage.getItem('userType'),
});
```

### 清除登录状态

```javascript
// 在浏览器控制台执行
localStorage.clear();
location.reload();
```

### 查看数据库数据

```sql
-- 查看所有用户
SELECT id, username, name, birthday FROM users;

-- 查看所有手链绑定情况
SELECT nfc_id, user_id, bound_at FROM bracelets ORDER BY nfc_id;

-- 查看特定nfcId的绑定状态
SELECT b.nfc_id, b.user_id, u.username, u.name, b.bound_at
FROM bracelets b
LEFT JOIN users u ON b.user_id = u.id
WHERE b.nfc_id = 'LOCAL_TEST1000';
```

---

## ✅ 验收清单

- [ ] 场景A：首次绑定成功，检查今日运势后跳转（有则跳运势页，无则跳AI生成页）
- [ ] 场景A：刷新页面后直接进入运势页面（不重复绑定）
- [ ] 场景B：正确的用户名+密码登录成功
- [ ] 场景B：登录时可以更新昵称和生日
- [ ] 场景B：错误密码显示"用户名存在，密码错误"
- [ ] 场景B：nfcId不匹配显示"该手链未绑定此用户"
- [ ] 场景B：同一天多次登录不重复调用AI（直接跳转到运势页面）
- [ ] 场景C：虚假nfcId跳转到访客版运势页面
- [ ] 场景C：无nfcId跳转到访客版运势页面
- [ ] 扩展：同一用户可以绑定多个手链
- [ ] 登录状态持久化：关闭浏览器后重新打开仍保持登录
- [ ] 避免重复AI调用：已有今日运势时直接展示，不调用AI

---

## 🚨 常见问题

### Q1: 点击保存后显示400错误

**可能原因**:

- 后端服务未启动
- 表单验证失败（用户名、密码、生日格式不正确）

**解决方案**:

1. 检查后端服务是否运行：`http://localhost:3000/api/health`
2. 查看浏览器控制台的错误信息
3. 查看后端日志

### Q2: 场景B登录失败

**可能原因**:

- 浏览器缓存未清除
- 用户名或密码输入错误
- nfcId与用户不匹配

**解决方案**:

1. 清除浏览器缓存：`localStorage.clear()`
2. 确认使用正确的测试账号
3. 查看控制台日志

### Q3: 数据库数据不正确

**解决方案**:

```bash
cd apps/api
pnpm db:seed
```

重新运行seed脚本会清空并重新填充所有测试数据。

---

**文档维护**: 开发团队  
**最后更新**: 2025-01-15
