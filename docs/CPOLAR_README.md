# 🌐 cpolar 内网穿透测试方案

## 📖 文档导航

### 🚀 快速开始

- **[5分钟快速开始](CPOLAR_QUICK_START.md)** - 最快上手指南
- **[完整使用教程](cpolar-testing-guide.md)** - 详细步骤说明
- **[测试检查清单](cpolar-testing-checklist.md)** - 完整测试流程

### 🛠️ 工具和脚本

- **启动脚本**
  - Windows: `start-cpolar-test.bat`
  - Mac/Linux: `start-cpolar-test.sh`
- **配置脚本**
  - `scripts/update-cpolar-url.js` - 快速更新 cpolar 地址

### 📝 配置文件

- **API 配置**: `apps/wx-app/src/api/config.ts`
- **开发模式**: `apps/wx-app/src/config/dev-scenarios.ts`

---

## 🎯 为什么选择 cpolar？

### 核心优势

| 优势              | 说明                            |
| ----------------- | ------------------------------- |
| 💰 **完全免费**   | 免费版足够测试使用              |
| ⚡ **快速上手**   | 10分钟即可开始测试              |
| 🔒 **自动HTTPS**  | 微信小程序要求的 HTTPS 自动提供 |
| 🚫 **无需备案**   | 测试阶段无需域名备案            |
| 💻 **无需服务器** | 在自己电脑上测试                |
| 🔄 **即时生效**   | 修改代码立即生效，无需重新部署  |

### 与其他方案对比

| 方案       | 成本         | 时间   | 备案 | 适用场景   |
| ---------- | ------------ | ------ | ---- | ---------- |
| **cpolar** | 0元          | 10分钟 | ❌   | 开发测试   |
| 微信云托管 | 100-300元/月 | 1-2天  | ❌   | 小规模生产 |
| 传统服务器 | 100-200元/月 | 1-20天 | ✅   | 大规模生产 |

---

## 📋 使用流程

### 1. 准备阶段（5分钟）

```bash
# 安装 cpolar
# Windows: 下载并解压
# Mac: brew install cpolar/tap/cpolar

# 配置 authtoken
cpolar authtoken <你的token>
```

### 2. 启动服务（1分钟）

```bash
# 方式一：使用脚本（推荐）
# Windows: 双击 start-cpolar-test.bat
# Mac/Linux: ./start-cpolar-test.sh

# 方式二：手动启动
docker-compose up -d
cd apps/api && pnpm start:dev
cpolar http 3000
```

### 3. 配置小程序（2分钟）

```bash
# 快速配置
node scripts/update-cpolar-url.js https://abc123.cpolar.cn

# 关闭开发模式
# 编辑 apps/wx-app/src/config/dev-scenarios.ts
# 第112行: enabled: false
```

### 4. 编译上传（2分钟）

```bash
cd apps/wx-app
pnpm build:mp-weixin

# 用微信开发者工具打开 dist/build/mp-weixin
# 上传 → 设为体验版 → 扫码测试
```

---

## 🔧 配置说明

### API 配置文件

**文件**: `apps/wx-app/src/api/config.ts`

```typescript
export const API_CONFIG = {
  // 开发环境（开发者工具）
  DEV_BASE_URL: 'http://localhost:3000',

  // 真机调试（局域网IP）
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',

  // 内网穿透（cpolar 地址）⚠️ 修改这里
  TUNNEL_BASE_URL: 'https://abc123.cpolar.cn',

  // 生产环境（正式域名）
  PROD_BASE_URL: 'https://your-api-domain.com',
};

// 当前环境 ⚠️ 使用 cpolar 时改为 'tunnel'
const CURRENT_ENV: EnvType = 'tunnel';
```

### 开发模式配置

**文件**: `apps/wx-app/src/config/dev-scenarios.ts`

```typescript
export const DEV_CONFIG = {
  // ⚠️ 上传体验版前改为 false
  enabled: false,
  currentScenario: 'VISITOR_FRESH_NFC',
};
```

---

## 📱 测试流程

### 功能测试

- ✅ 微信登录
- ✅ NFC 绑定
- ✅ 个人信息填写
- ✅ AI 运势生成
- ✅ 历史记录查看
- ✅ 隐私授权弹窗

### 性能测试

- ✅ 页面加载速度
- ✅ API 响应时间
- ✅ AI 生成速度
- ✅ 网络稳定性

### 用户测试

- ✅ 邀请 5-10 个朋友
- ✅ 收集使用反馈
- ✅ 记录发现的问题
- ✅ 优化用户体验

---

## ⚠️ 注意事项

### 免费版限制

| 限制项 | 说明         | 解决方案              |
| ------ | ------------ | --------------------- |
| 带宽   | 1Mbps        | 升级付费版（10元/月） |
| 地址   | 每次重启会变 | 购买固定域名          |
| 稳定性 | 可能偶尔断线 | 保持电脑和网络稳定    |

### 使用建议

✅ **适合：**

- 开发阶段测试
- 体验版内测
- 功能验证
- 用户反馈收集

❌ **不适合：**

- 正式生产环境
- 大量用户访问
- 长期稳定运行

---

## 🐛 常见问题

### Q1: cpolar 地址每次都变怎么办？

**A: 三种解决方案**

1. **购买付费版**（推荐）
   - 约 10 元/月
   - 固定域名
   - 更高带宽

2. **使用配置脚本**

   ```bash
   node scripts/update-cpolar-url.js https://新地址.cpolar.cn
   ```

3. **手动修改配置**
   - 修改 `apps/wx-app/src/api/config.ts`
   - 重新编译上传

### Q2: 速度慢怎么办？

**A: 优化方案**

- 升级到付费版（2Mbps+）
- 压缩图片资源
- 优化 API 响应
- 减少数据传输

### Q3: 连接不稳定怎么办？

**A: 检查清单**

- [ ] 电脑是否休眠
- [ ] 网络是否稳定
- [ ] 后端服务是否运行
- [ ] cpolar 是否运行

### Q4: 测试完成后如何正式上线？

**A: 两种选择**

**选择1: 微信云托管**（推荐）

- 无需备案
- 自动扩容
- 100-300元/月

**选择2: 传统服务器**

- 需要备案（1-20天）
- 更多控制权
- 100-200元/月

---

## 📊 成本对比

### 测试阶段（使用 cpolar）

| 项目          | 成本          |
| ------------- | ------------- |
| cpolar 免费版 | 0元           |
| cpolar 付费版 | 10元/月       |
| **总计**      | **0-10元/月** |

### 正式上线（两种方案）

| 方案       | 月成本    | 备案 | 推荐度     |
| ---------- | --------- | ---- | ---------- |
| 微信云托管 | 100-300元 | ❌   | ⭐⭐⭐⭐⭐ |
| 传统服务器 | 100-200元 | ✅   | ⭐⭐⭐⭐   |

---

## 🎓 学习资源

### 官方文档

- cpolar 官网: https://www.cpolar.com/
- cpolar 文档: https://www.cpolar.com/docs
- 微信小程序文档: https://developers.weixin.qq.com/miniprogram/dev/

### 项目文档

- [完整使用教程](cpolar-testing-guide.md)
- [测试检查清单](cpolar-testing-checklist.md)
- [部署检查清单](deployment-checklist.md)
- [生产部署指南](production-deployment-guide.md)

---

## 🚀 下一步

### 测试阶段

1. ✅ 使用 cpolar 完成功能测试
2. ✅ 邀请用户内测
3. ✅ 收集反馈并优化
4. ✅ 修复发现的问题

### 准备上线

1. 📋 选择部署方案
   - 微信云托管（推荐）
   - 传统服务器

2. 📋 完成必要准备
   - 域名备案（如需要）
   - 服务器配置
   - 环境部署

3. 📋 提交审核
   - 配置生产环境
   - 上传正式版本
   - 提交微信审核

4. 📋 正式上线
   - 发布上线
   - 监控运行
   - 持续优化

---

## 📞 获取帮助

### 技术支持

- cpolar 客服: https://www.cpolar.com/
- 微信开放社区: https://developers.weixin.qq.com/community/
- 项目 Issues: [GitHub Issues]

### 相关文档

- [快速开始](CPOLAR_QUICK_START.md)
- [完整教程](cpolar-testing-guide.md)
- [测试清单](cpolar-testing-checklist.md)

---

**祝您测试顺利，早日上线！** 🎉
