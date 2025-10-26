# AI运势生成测试场景指南

## 🎯 测试目标

验证AI运势生成功能在不同用户场景下的正确行为，确保：

- AI生成场景正确触发
- 重试机制正常工作
- 降级方案优雅执行
- 用户体验流畅

## 🗄️ 数据库配置说明

### 种子数据设计

为了测试AI功能，种子数据已特意配置：

**✅ 会触发AI生成的场景**（用户1无今日运势记录）：

- 场景2：新访客触碰未绑定手链 → 绑定后进入完整版
- 场景5：已认证用户触碰未绑定手链 → 绑定后进入完整版
- 场景6：已认证用户触碰自己手链 → 直接进入完整版
- 场景7：已认证用户直接进入 → 直接进入完整版

**❌ 不会触发AI生成的场景**（使用预览模式或现有数据）：

- 场景1：新访客触碰已绑定手链 → 预览模式
- 场景3：新访客直接进入 → 预览模式
- 场景4：已认证用户触碰他人手链 → 预览模式
- 特殊场景：信息不完整用户 → 预览模式

## 🧪 测试步骤

### 准备工作

1. **重置数据库**

```bash
cd apps/api
npm run db:reset
npm run db:seed
```

2. **配置AI服务**

```bash
# 在 apps/api/.env 中配置
OPENAI_API_KEY=your-deepseek-api-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
AI_ENABLED=true
```

3. **启动服务**

```bash
# 后端
cd apps/api
npm run start:dev

# 前端
cd apps/wx-app
npm run dev:mp-weixin
```

### 场景测试

#### 🤖 场景6：已认证用户触碰自己手链（AI生成）

**配置**：

```typescript
// apps/wx-app/src/config/dev-scenarios.ts
export const DEV_CONFIG = {
  enabled: true,
  currentScenario: 'AUTH_USER_OWN_NFC',
};
```

**测试流程**：

1. 打开小程序开发者工具
2. 进入运势页面
3. **预期行为**：
   - 显示加载动画："正在分析您的星象运势..."
   - 如果AI成功：显示AI生成的个性化运势
   - 如果AI失败：显示重试界面

**验证点**：

- [ ] 加载文案动态切换
- [ ] AI生成成功时显示个性化内容
- [ ] AI失败时显示重试界面（显示重试次数）
- [ ] 重试按钮功能正常
- [ ] 3次重试后自动降级

#### 🤖 场景2：新访客触碰未绑定手链（AI生成）

**配置**：

```typescript
export const DEV_CONFIG = {
  enabled: true,
  currentScenario: 'VISITOR_FRESH_NFC',
};
```

**测试流程**：

1. 清除小程序缓存
2. 进入小程序（模拟微信登录）
3. 自动跳转到信息补全页面
4. 填写姓名和生日
5. 进入运势页面
6. **预期行为**：触发AI生成（同场景6）

#### 🤖 场景5：已认证用户触碰未绑定手链（AI生成）

**配置**：

```typescript
export const DEV_CONFIG = {
  enabled: true,
  currentScenario: 'AUTH_USER_FRESH_NFC',
};
```

**测试流程**：

1. 进入小程序
2. 自动绑定新手链
3. 进入运势页面
4. **预期行为**：触发AI生成

#### 📋 场景1：新访客触碰已绑定手链（预览模式）

**配置**：

```typescript
export const DEV_CONFIG = {
  enabled: true,
  currentScenario: 'VISITOR_BOUND_NFC',
};
```

**测试流程**：

1. 清除小程序缓存
2. 进入小程序
3. **预期行为**：
   - 直接显示预览运势（固定模板）
   - 不触发AI生成
   - 显示"解锁完整运势"按钮

## 🔧 AI服务测试

### 测试AI服务状态

```bash
cd apps/api
node scripts/test-ai-integration.js
```

### 手动测试API

```bash
# 获取今日运势（可能触发AI生成）
curl -X GET "http://localhost:3000/fortune/today" \
  -H "Authorization: Bearer DEV.eyJhbGciOiJERVYiLCJ0eXAiOiJKV1QifQ==.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJvcGVuaWQiOiJkZXZfdXNlcl8xMjMiLCJpYXQiOjE3Mzc5NjQ4MDAsImV4cCI6MTczODU2OTYwMH0="

# 重新生成运势（强制AI生成）
curl -X POST "http://localhost:3000/fortune/today/regenerate" \
  -H "Authorization: Bearer DEV.eyJhbGciOiJERVYiLCJ0eXAiOiJKV1QifQ==.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJvcGVuaWQiOiJkZXZfdXNlcl8xMjMiLCJpYXQiOjE3Mzc5NjQ4MDAsImV4cCI6MTczODU2OTYwMH0="
```

## 🐛 故障模拟测试

### 模拟AI服务不可用

1. 临时修改 `.env` 文件：

```env
OPENAI_API_KEY=invalid-key
```

2. 重启后端服务
3. 测试场景6，验证重试机制

### 模拟网络超时

1. 修改AI超时时间：

```env
AI_TIMEOUT_MS=1000  # 设置为1秒
```

2. 测试AI生成是否正确超时

### 模拟AI返回格式错误

1. 临时修改AI Prompt，让其返回无效JSON
2. 验证解析错误处理

## 📊 验收标准

### 功能验收

- [ ] AI生成场景正确识别（4个场景）
- [ ] 预览场景正确识别（4个场景）
- [ ] AI生成成功时显示个性化内容
- [ ] AI失败时显示重试界面
- [ ] 重试机制工作正常（最多3次）
- [ ] 降级方案优雅执行
- [ ] 数据库缓存机制正常

### 用户体验验收

- [ ] 加载状态友好（动态文案）
- [ ] 重试界面清晰（显示次数）
- [ ] 错误提示友好
- [ ] 降级过程无感知
- [ ] 响应时间合理（< 7秒）

### 技术验收

- [ ] 无JavaScript错误
- [ ] API响应格式正确
- [ ] 日志记录完整
- [ ] 错误处理健壮

## 🎯 测试检查清单

### 每个AI生成场景都要验证：

- [ ] 首次进入触发AI生成
- [ ] 生成成功后保存到数据库
- [ ] 再次进入使用缓存数据
- [ ] AI失败时显示重试界面
- [ ] 重试功能正常工作
- [ ] 达到重试上限后自动降级
- [ ] 降级内容质量可接受

### 每个预览场景都要验证：

- [ ] 不触发AI生成
- [ ] 显示固定模板内容
- [ ] 显示"解锁完整运势"提示
- [ ] 内容质量可接受

---

**注意**：测试过程中如发现问题，请记录具体的场景、操作步骤和错误信息，便于快速定位和修复。
