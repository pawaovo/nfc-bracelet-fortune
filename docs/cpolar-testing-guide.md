# 🌐 使用 cpolar 内网穿透测试小程序完整指南

## 📋 目录

1. [什么是 cpolar](#什么是-cpolar)
2. [为什么选择 cpolar](#为什么选择-cpolar)
3. [安装和配置](#安装和配置)
4. [启动测试环境](#启动测试环境)
5. [配置小程序](#配置小程序)
6. [上传体验版](#上传体验版)
7. [测试验证](#测试验证)
8. [常见问题](#常见问题)

---

## 什么是 cpolar

cpolar 是一款**内网穿透工具**，可以将您本地电脑上的服务（如 localhost:3000）映射到公网，生成一个 HTTPS 地址。

### 工作原理

```
微信小程序 → cpolar公网地址(https://xxx.cpolar.cn) → 您的电脑(localhost:3000)
```

### 核心优势

- ✅ **完全免费**（免费版足够测试使用）
- ✅ **自动提供 HTTPS**（微信小程序要求）
- ✅ **无需购买服务器**
- ✅ **无需域名备案**
- ✅ **10分钟即可开始测试**
- ✅ **修改代码立即生效**（无需重新部署）

---

## 为什么选择 cpolar

### 与其他方案对比

| 方案                | 成本         | 时间   | 备案      | 推荐度     |
| ------------------- | ------------ | ------ | --------- | ---------- |
| **cpolar 内网穿透** | 0元          | 10分钟 | ❌ 不需要 | ⭐⭐⭐⭐⭐ |
| 微信云托管          | 100-300元/月 | 1-2天  | ❌ 不需要 | ⭐⭐⭐⭐   |
| 传统服务器          | 100-200元/月 | 1-20天 | ✅ 需要   | ⭐⭐⭐     |

### 适用场景

✅ **适合：**

- 开发阶段功能测试
- 体验版内测
- 快速验证想法
- 收集用户反馈

❌ **不适合：**

- 正式生产环境（建议用云托管或服务器）
- 大量用户访问（免费版带宽限制）

---

## 安装和配置

### Step 1: 注册 cpolar 账号

1. 访问官网：https://www.cpolar.com/
2. 点击右上角"注册"
3. 填写邮箱和密码
4. 验证邮箱
5. 登录账号

### Step 2: 下载客户端

#### Windows 用户

1. 登录后，点击"下载"
2. 选择 Windows 版本
3. 下载 `cpolar-stable-windows-amd64.zip`
4. 解压到任意目录（如 `C:\cpolar`）

#### Mac 用户

```bash
# 使用 Homebrew 安装
brew install cpolar/tap/cpolar

# 或者手动下载
# 访问 https://www.cpolar.com/download
# 下载 Mac 版本并安装
```

#### Linux 用户

```bash
# 一键安装脚本
curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash

# 或者手动下载
wget https://www.cpolar.com/static/downloads/cpolar-stable-linux-amd64.zip
unzip cpolar-stable-linux-amd64.zip
sudo mv cpolar /usr/local/bin/
```

### Step 3: 获取 authtoken

1. 登录 cpolar 官网
2. 进入"验证" → "authtoken"
3. 复制您的 authtoken（类似：`xxx_xxxxxxxxxxxxxxxxxx`）

### Step 4: 配置 authtoken

#### Windows

```bash
# 打开命令提示符（CMD）或 PowerShell
cd C:\cpolar
cpolar.exe authtoken <你的authtoken>
```

#### Mac/Linux

```bash
cpolar authtoken <你的authtoken>
```

配置成功后会显示：

```
Authtoken saved to configuration file: /Users/xxx/.cpolar/cpolar.yml
```

---

## 启动测试环境

### 方式一：手动启动（推荐新手）

#### 1. 启动数据库

```bash
# 在项目根目录
docker-compose up -d

# 等待数据库启动（约10秒）
docker-compose logs -f postgres
# 看到 "database system is ready to accept connections" 即可
```

#### 2. 启动后端服务

```bash
# 新开一个终端窗口
cd apps/api
pnpm start:dev

# 看到以下输出表示成功：
# Application is running on: http://localhost:3000
```

#### 3. 启动 cpolar 内网穿透

```bash
# 新开一个终端窗口
cpolar http 3000

# 会显示类似输出：
# Forwarding: https://abc123.cpolar.cn -> http://localhost:3000
#             ^^^^^^^^^^^^^^^^^^^^^^^^
#             这就是您的公网地址！
```

**重要：复制这个 HTTPS 地址，后面会用到！**

### 方式二：使用启动脚本（推荐熟练用户）

我们已经为您准备好了启动脚本，见下一节。

---

## 配置小程序

### Step 1: 修改 API 配置

打开文件：`apps/wx-app/src/api/config.ts`

找到第 10 行，修改为您的 cpolar 地址：

```typescript
export const API_CONFIG = {
  DEV_BASE_URL: 'http://localhost:3000',
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',
  // ⚠️ 修改这里：改成 cpolar 生成的地址
  PROD_BASE_URL: 'https://abc123.cpolar.cn', // 👈 改成你的地址
  TIMEOUT: 30000,
  VERSION: 'v1',
};
```

### Step 2: 关闭开发模式

打开文件：`apps/wx-app/src/config/dev-scenarios.ts`

找到第 112 行，修改为：

```typescript
export const DEV_CONFIG = {
  enabled: false, // 👈 改为 false
  currentScenario: 'VISITOR_FRESH_NFC',
};
```

### Step 3: 编译小程序

```bash
cd apps/wx-app
pnpm build:mp-weixin
```

编译成功后，会在 `dist/build/mp-weixin` 目录生成小程序代码。

---

## 上传体验版

### Step 1: 打开微信开发者工具

1. 启动微信开发者工具
2. 点击"导入项目"
3. 选择目录：`D:\ai\手链运势\apps\wx-app\dist\build\mp-weixin`
4. AppID：`wx7ba4129d919fdf01`
5. 项目名称：手链运势
6. 点击"导入"

### Step 2: 测试功能

在开发者工具中测试：

- ✅ 页面能否正常显示
- ✅ API 能否正常调用
- ✅ 查看控制台是否有错误

### Step 3: 上传代码

1. 点击工具栏的"上传"按钮
2. 填写版本号：`1.0.0-test`
3. 填写项目备注：`cpolar 内网穿透测试版本`
4. 点击"上传"

### Step 4: 设置体验版

1. 登录微信公众平台：https://mp.weixin.qq.com
2. 进入：管理 → 版本管理
3. 在"开发版本"区域，找到刚上传的版本
4. 点击"设为体验版"

### Step 5: 生成体验码

1. 在"体验版"区域，点击"体验二维码"
2. 下载或截图保存二维码
3. 用微信扫码即可体验

---

## 测试验证

### 功能测试清单

- [ ] **微信登录**
  - [ ] 扫码进入小程序
  - [ ] 点击授权登录
  - [ ] 检查是否获取到用户信息

- [ ] **NFC 绑定**
  - [ ] 模拟 NFC 扫描（开发场景）
  - [ ] 绑定手链
  - [ ] 查看绑定状态

- [ ] **个人信息**
  - [ ] 填写姓名
  - [ ] 选择生日
  - [ ] 保存信息

- [ ] **运势生成**
  - [ ] 点击生成运势
  - [ ] 等待 AI 生成（约 10-30 秒）
  - [ ] 查看运势内容

- [ ] **历史记录**
  - [ ] 查看历史运势
  - [ ] 删除历史记录

- [ ] **隐私保护**
  - [ ] 首次进入显示隐私授权弹窗
  - [ ] 查看隐私政策
  - [ ] 查看用户协议

### 性能测试

- [ ] 页面加载速度（可能比真实服务器慢）
- [ ] API 响应时间
- [ ] AI 生成速度
- [ ] 网络稳定性

### 邀请用户测试

1. 将体验码分享给 5-10 个朋友
2. 收集他们的反馈：
   - 功能是否正常
   - 是否有 bug
   - 用户体验如何
   - 改进建议

---

## 常见问题

### Q1: cpolar 地址每次重启都会变怎么办？

**A: 有三种解决方案：**

**方案1：购买付费版（推荐）**

- 约 10 元/月
- 固定域名
- 更高带宽
- 适合长期测试

**方案2：使用免费版，每次重启后重新配置**

1. 重启 cpolar 后，复制新地址
2. 修改 `apps/wx-app/src/api/config.ts`
3. 重新编译：`pnpm build:mp-weixin`
4. 重新上传体验版

**方案3：使用配置文件（见下方脚本）**

### Q2: 速度慢怎么办？

**A: 免费版带宽限制为 1Mbps，可能会慢。解决方案：**

- 升级到付费版（2Mbps 或更高）
- 优化 API 响应（减少数据传输）
- 使用图片压缩
- 仅用于测试，正式环境用服务器

### Q3: 连接不稳定怎么办？

**A: 检查以下几点：**

- 确保电脑不休眠
- 确保网络稳定
- 确保后端服务一直运行
- 确保 cpolar 客户端一直运行

### Q4: 能否多人同时测试？

**A: 可以！**

- 免费版支持多人同时访问
- 但受带宽限制，建议不超过 10 人同时测试
- 如需更多人测试，建议升级付费版

### Q5: 测试完成后如何正式上线？

**A: 两种选择：**

**选择1：使用微信云托管（推荐）**

- 无需备案
- 自动扩容
- 参考：`docs/deployment-checklist.md`

**选择2：使用传统服务器**

- 需要备案（1-20天）
- 更多控制权
- 参考：`docs/production-deployment-guide.md`

---

## 📝 快速参考

### 常用命令

```bash
# 启动数据库
docker-compose up -d

# 启动后端
cd apps/api && pnpm start:dev

# 启动 cpolar
cpolar http 3000

# 编译小程序
cd apps/wx-app && pnpm build:mp-weixin
```

### 重要文件

- API 配置：`apps/wx-app/src/api/config.ts`
- 开发模式：`apps/wx-app/src/config/dev-scenarios.ts`
- 编译输出：`apps/wx-app/dist/build/mp-weixin`

### 重要链接

- cpolar 官网：https://www.cpolar.com/
- 微信公众平台：https://mp.weixin.qq.com/
- 项目文档：`docs/`

---

## 🎯 下一步

测试完成后，您可以：

1. **继续优化功能**
   - 根据用户反馈改进
   - 修复发现的 bug
   - 添加新功能

2. **准备正式上线**
   - 选择部署方案（云托管 or 服务器）
   - 完成备案（如需要）
   - 提交审核

3. **学习更多**
   - 阅读 `docs/deployment-checklist.md`
   - 阅读 `docs/production-deployment-guide.md`
   - 加入微信开放社区

---

**祝您测试顺利！** 🎉
