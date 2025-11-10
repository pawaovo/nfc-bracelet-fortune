# 🚨 临时NFC绕过方案使用指南

## 📋 背景说明

由于NFC硬件功能暂时不可用，但需要让真实用户正常使用小程序的完整功能（非访客模式），我们实施了一个**临时绕过方案**。

### 核心思路

- 为每个用户自动生成一个**虚拟NFC ID**
- 用户体验完全等同于"已绑定NFC用户"
- 可以正常调用AI生成运势
- 可以查看完整版运势页面
- **NFC功能恢复后，只需改一个配置即可恢复正常**

---

## 🎯 使用方法

### 启用临时方案（发布前）

**文件：** `apps/wx-app/src/config/dev-scenarios.ts`

找到第 120 行左右，修改：

```typescript
export const TEMP_NFC_BYPASS = {
  enabled: true, // 🔴 改为 true，启用虚拟NFC
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

### 关闭开发场景（生产环境必须）

**同一文件**，找到第 111 行左右，修改：

```typescript
export const DEV_CONFIG = {
  enabled: false, // ✅ 改为 false，关闭开发场景
  currentScenario: 'VISITOR_FRESH_NFC',
};
```

### 编译并发布

```bash
cd apps/wx-app
pnpm build:mp-weixin
```

然后上传到微信公众平台。

---

## ✅ 用户体验

启用临时方案后，用户的使用流程：

1. **打开小程序** → 自动生成虚拟NFC ID
2. **微信登录** → 自动绑定虚拟手链
3. **填写个人信息** → 姓名、生日
4. **查看运势** → 调用AI生成完整运势
5. **所有功能正常** → 历史记录、运势分析等

**与真实NFC用户完全一致！**

---

## 🔄 恢复正常NFC功能

当NFC硬件功能恢复后，只需要：

### 步骤1：关闭临时方案

**文件：** `apps/wx-app/src/config/dev-scenarios.ts`

```typescript
export const TEMP_NFC_BYPASS = {
  enabled: false, // 🔴 改回 false
  description: '临时绕过NFC验证，为所有用户提供完整功能',
};
```

### 步骤2：重新编译发布

```bash
cd apps/wx-app
pnpm build:mp-weixin
```

### 步骤3：发布新版本

上传到微信公众平台，发布新版本。

**就这么简单！** 🎉

---

## 📊 技术细节

### 虚拟NFC ID生成规则

```typescript
格式: VIRTUAL_NFC_{timestamp}_{random}
示例: VIRTUAL_NFC_1704067200000_A3F9K2
```

- **唯一性**：基于时间戳和随机字符串
- **持久性**：存储在本地，同一用户始终使用相同ID
- **可识别**：以 `VIRTUAL_NFC_` 开头，便于后续数据清理

### 代码改动位置

1. **配置文件**：`apps/wx-app/src/config/dev-scenarios.ts`
   - 添加 `TEMP_NFC_BYPASS` 配置

2. **启动逻辑**：`apps/wx-app/src/App.vue`
   - 导入 `TEMP_NFC_BYPASS`
   - 在 `handleAppLaunch` 中添加虚拟NFC生成逻辑
   - 添加 `generateVirtualNfcId()` 函数

### 后端兼容性

✅ **无需修改后端代码**

后端会将虚拟NFC ID当作普通NFC ID处理：

- 自动创建手链记录
- 绑定到用户
- 生成运势数据

---

## ⚠️ 注意事项

### 1. 数据清理

如果需要清理虚拟NFC数据（NFC恢复后）：

```sql
-- 删除所有虚拟NFC手链记录
DELETE FROM "Bracelet" WHERE "nfcId" LIKE 'VIRTUAL_NFC_%';
```

### 2. 用户迁移

如果需要将虚拟NFC用户迁移到真实NFC：

```sql
-- 更新用户的手链绑定
UPDATE "Bracelet"
SET "nfcId" = '真实NFC_ID'
WHERE "nfcId" = 'VIRTUAL_NFC_xxx' AND "userId" = '用户ID';
```

### 3. 开发测试

在开发环境测试时：

- 关闭 `DEV_CONFIG.enabled`
- 启用 `TEMP_NFC_BYPASS.enabled`
- 使用真机预览测试

---

## 🔍 验证清单

发布前请确认：

- [ ] `DEV_CONFIG.enabled = false`（关闭开发场景）
- [ ] `TEMP_NFC_BYPASS.enabled = true`（启用虚拟NFC）
- [ ] 编译成功，无报错
- [ ] 真机测试：能正常登录
- [ ] 真机测试：能填写个人信息
- [ ] 真机测试：能查看完整运势
- [ ] 真机测试：能调用AI生成运势

恢复NFC后请确认：

- [ ] `TEMP_NFC_BYPASS.enabled = false`（关闭虚拟NFC）
- [ ] 编译成功，无报错
- [ ] 真机测试：扫描NFC能正常启动
- [ ] 真机测试：NFC绑定流程正常

---

## 📞 问题排查

### 问题1：用户还是进入访客模式

**原因**：可能是 `TEMP_NFC_BYPASS.enabled` 没有设置为 `true`

**解决**：检查配置文件，确保启用

### 问题2：每次打开都是新用户

**原因**：虚拟NFC ID没有正确存储

**解决**：检查 `generateVirtualNfcId()` 函数，确保使用 `uni.setStorageSync`

### 问题3：AI生成失败

**原因**：与NFC无关，可能是后端AI服务问题

**解决**：检查后端日志，确认AI服务配置

---

## 📝 总结

这个临时方案的优点：

✅ **改动最小**：只修改前端配置和启动逻辑  
✅ **易于恢复**：改一个配置即可恢复  
✅ **用户体验好**：完全等同于真实NFC用户  
✅ **无需后端改动**：后端无感知  
✅ **数据可追溯**：虚拟NFC ID有明确标识

**适合短期（1-2周）的临时方案！**
