# ✅ 临时NFC方案 - 快速检查清单

## 🚀 启用临时方案（发布前）

### 步骤1：修改配置文件

**文件：** `apps/wx-app/src/config/dev-scenarios.ts`

```typescript
// 第 111 行左右
export const DEV_CONFIG = {
  enabled: false, // ✅ 必须是 false
  currentScenario: 'VISITOR_FRESH_NFC',
};

// 第 120 行左右
export const TEMP_NFC_BYPASS = {
  enabled: true, // ✅ 改为 true
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

### 步骤2：编译小程序

```bash
cd apps/wx-app
pnpm build:mp-weixin
```

### 步骤3：真机测试

- [ ] 打开小程序，能正常登录
- [ ] 能填写个人信息（姓名、生日）
- [ ] 能查看完整运势页面（非访客模式）
- [ ] 能调用AI生成运势
- [ ] 能查看历史记录

### 步骤4：上传发布

- [ ] 微信开发者工具上传
- [ ] 微信公众平台设为体验版
- [ ] 真机扫码测试
- [ ] 确认所有功能正常
- [ ] 提交审核/发布

---

## 🔄 恢复正常NFC（NFC可用后）

### 步骤1：修改配置文件

**文件：** `apps/wx-app/src/config/dev-scenarios.ts`

```typescript
// 第 120 行左右
export const TEMP_NFC_BYPASS = {
  enabled: false, // ✅ 改回 false
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

### 步骤2：编译小程序

```bash
cd apps/wx-app
pnpm build:mp-weixin
```

### 步骤3：NFC测试

- [ ] 扫描真实NFC标签，能正常启动小程序
- [ ] 能正常绑定手链
- [ ] 能查看完整运势
- [ ] 访客模式正常（扫描他人手链）

### 步骤4：上传发布

- [ ] 微信开发者工具上传
- [ ] 微信公众平台设为体验版
- [ ] 真机NFC测试
- [ ] 确认所有功能正常
- [ ] 提交审核/发布

---

## 📊 配置对照表

| 场景                  | DEV_CONFIG.enabled | TEMP_NFC_BYPASS.enabled | 说明             |
| --------------------- | ------------------ | ----------------------- | ---------------- |
| **开发测试**          | true               | false                   | 使用开发场景系统 |
| **临时方案（无NFC）** | false              | true                    | ✅ 当前使用      |
| **正式版本（有NFC）** | false              | false                   | NFC恢复后使用    |

---

## ⚠️ 重要提醒

### 发布前必须检查

```typescript
// ❌ 错误配置（会导致所有用户变成测试账号）
export const DEV_CONFIG = {
  enabled: true, // ❌ 生产环境必须是 false
  currentScenario: 'VISITOR_FRESH_NFC',
};

// ✅ 正确配置（临时方案）
export const DEV_CONFIG = {
  enabled: false, // ✅ 关闭开发场景
  currentScenario: 'VISITOR_FRESH_NFC',
};

export const TEMP_NFC_BYPASS = {
  enabled: true, // ✅ 启用虚拟NFC
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

### 恢复NFC前必须检查

```typescript
// ✅ 正确配置（NFC恢复）
export const DEV_CONFIG = {
  enabled: false, // ✅ 保持关闭
  currentScenario: 'VISITOR_FRESH_NFC',
};

export const TEMP_NFC_BYPASS = {
  enabled: false, // ✅ 关闭虚拟NFC
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

---

## 🎯 一键切换命令（可选）

如果你想更方便地切换，可以创建脚本：

### 启用临时方案

```bash
# Windows PowerShell
(Get-Content apps/wx-app/src/config/dev-scenarios.ts) -replace 'enabled: false, // 🔴 临时开关', 'enabled: true, // 🔴 临时开关' | Set-Content apps/wx-app/src/config/dev-scenarios.ts
```

### 恢复正常NFC

```bash
# Windows PowerShell
(Get-Content apps/wx-app/src/config/dev-scenarios.ts) -replace 'enabled: true, // 🔴 临时开关', 'enabled: false, // 🔴 临时开关' | Set-Content apps/wx-app/src/config/dev-scenarios.ts
```

---

## 📞 快速参考

**详细文档：** `docs/TEMP_NFC_BYPASS_GUIDE.md`

**配置文件：** `apps/wx-app/src/config/dev-scenarios.ts`

**核心代码：** `apps/wx-app/src/App.vue` (第 117-124 行)

**虚拟NFC格式：** `VIRTUAL_NFC_{timestamp}_{random}`
