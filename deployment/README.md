# 🚀 手链运势小程序 - 部署指南

## 📋 部署概览

本指南将帮助你完成以下部署：

1. ✅ 部署后端API到服务器
2. ✅ 配置数据库连接
3. ✅ 安装并配置cpolar（内网穿透）
4. ✅ 配置小程序使用cpolar地址
5. ✅ 真机测试所有功能

---

## 🎯 部署方式

### 方式1：一键部署（推荐）

```bash
# 1. 上传部署脚本到服务器
scp -P 43122 -r deployment xiaoyi-dev1@47.239.179.9:~/

# 2. 连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 3. 运行一键部署脚本
cd ~/deployment
chmod +x *.sh
./deploy-all.sh
```

### 方式2：分步部署

如果一键部署失败，可以分步执行：

```bash
# 步骤1：检查环境
./check-server-env.sh

# 步骤2：安装依赖
./install-dependencies.sh

# 步骤3：配置环境变量
cp .env.production.template ~/bracelet-fortune/apps/api/.env
nano ~/bracelet-fortune/apps/api/.env

# 步骤4：部署后端
./deploy-backend.sh

# 步骤5：配置cpolar
./setup-cpolar.sh
```

---

## 📝 部署前准备

### 1. 服务器信息（已提供）

```bash
SSH地址：47.239.179.9
SSH端口：43122
用户名：xiaoyi-dev1
密码：n6pCTKmpXDGVSjhfMzbX
```

### 2. 数据库信息（已提供）

```bash
数据库名：bracelet-fortune
用户名：bracelet-fortune
密码：HvXFmwEwfntnScWZRJyB
内部地址：1Panel-postgresql-0i7g:5432
外部地址：47.239.179.9:15432
```

### 3. 需要获取的信息

#### ⚠️ 必须获取：

**微信小程序密钥（WECHAT_APP_SECRET）**

```
获取步骤：
1. 登录微信公众平台：https://mp.weixin.qq.com
2. 进入：开发 → 开发管理 → 开发设置
3. 找到"开发者ID" → 点击"重置"或"查看"
4. 复制 AppSecret
```

#### 🟡 强烈推荐：

**AI服务密钥（OPENAI_API_KEY）**

如果没有AI服务，运势会使用随机生成（体验较差）

推荐服务：

- 火山引擎（豆包）：https://console.volcengine.com/ark
- DeepSeek：https://platform.deepseek.com/
- OpenAI：https://platform.openai.com/

---

## 🔧 详细部署步骤

### 步骤1：上传项目代码到服务器

#### 方法A：使用Git（推荐）

```bash
# 在服务器上执行
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 克隆代码（如果代码在GitHub/Gitee）
cd ~
git clone https://github.com/your-username/bracelet-fortune.git

# 或者从本地上传
```

#### 方法B：使用SCP上传

```bash
# 在本地电脑执行（Windows PowerShell）
cd "D:\ai\手链运势"

# 打包项目（排除node_modules）
# 先删除所有node_modules
Remove-Item -Recurse -Force apps/wx-app/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/api/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 压缩项目
Compress-Archive -Path * -DestinationPath bracelet-fortune.zip

# 上传到服务器
scp -P 43122 bracelet-fortune.zip xiaoyi-dev1@47.239.179.9:~/

# 在服务器上解压
ssh xiaoyi-dev1@47.239.179.9 -p 43122
unzip bracelet-fortune.zip -d bracelet-fortune
```

### 步骤2：配置环境变量

```bash
# 在服务器上执行
cd ~/bracelet-fortune/apps/api

# 复制环境变量模板
cp ~/deployment/.env.production.template .env

# 编辑环境变量
nano .env
```

**必须修改的配置：**

```env
# 1. 生成JWT密钥
# 在本地电脑运行：
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# 复制生成的字符串，替换 JWT_SECRET

# 2. 填写微信小程序密钥
WECHAT_APP_SECRET="你的小程序密钥"

# 3. 填写AI服务密钥（可选）
OPENAI_API_KEY="你的AI密钥"
```

保存并退出：`Ctrl+X` → `Y` → `Enter`

### 步骤3：运行部署脚本

```bash
# 在服务器上执行
cd ~/deployment
chmod +x *.sh

# 运行一键部署
./deploy-all.sh
```

### 步骤4：获取cpolar地址

部署完成后，会显示cpolar生成的公网地址：

```
🌐 你的 API 公网地址：
https://abc123.r1.cpolar.top
```

**保存这个地址！**

如果没有显示，手动查看：

```bash
cpolar status
# 或
cat ~/cpolar-url.txt
```

---

## 📱 配置小程序

### 步骤1：修改小程序配置

在本地电脑修改以下文件：

#### 文件1：`apps/wx-app/src/api/config.ts`

```typescript
export const API_CONFIG = {
  DEV_BASE_URL: 'http://localhost:3000',
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',

  // ✅ 修改这里：使用cpolar地址
  TUNNEL_BASE_URL: 'https://abc123.r1.cpolar.top', // 替换为实际地址

  PROD_BASE_URL: 'https://your-api-domain.com',
  TIMEOUT: 30000,
  VERSION: 'v1',
};

// ✅ 修改这里：使用tunnel模式
const CURRENT_ENV: EnvType = 'tunnel';
```

#### 文件2：`apps/wx-app/src/config/dev-scenarios.ts`

```typescript
export const DEV_CONFIG = {
  enabled: false, // ✅ 改为 false
  currentScenario: 'VISITOR_FRESH_NFC',
};
```

### 步骤2：编译小程序

```bash
# 在本地电脑执行
cd "D:\ai\手链运势\apps\wx-app"

# 编译小程序
pnpm build:mp-weixin
```

### 步骤3：配置微信公众平台

```
1. 登录微信公众平台：https://mp.weixin.qq.com
2. 进入：开发 → 开发管理 → 开发设置 → 服务器域名
3. 点击"修改"
4. 添加request合法域名：
   https://abc123.r1.cpolar.top  （你的cpolar地址）
   https://ark.cn-beijing.volces.com  （如果使用火山引擎AI）
5. 保存（需要管理员扫码确认）
```

### 步骤4：上传体验版

```
1. 打开微信开发者工具
2. 导入项目：apps/wx-app/dist/build/mp-weixin
3. 点击"上传"
4. 填写版本号：1.0.0-test
5. 填写描述：测试版本（使用cpolar）
6. 上传成功

7. 登录微信公众平台
8. 进入：管理 → 版本管理
9. 找到刚上传的版本
10. 点击"设为体验版"
11. 添加体验成员（扫码即可体验）
```

---

## 🧪 测试

### 1. 测试后端API

```bash
# 在服务器上测试
curl http://localhost:3000

# 测试cpolar公网访问
curl https://abc123.r1.cpolar.top
```

### 2. 测试小程序

```
1. 在微信中扫码打开体验版
2. 测试登录功能
3. 测试NFC绑定（使用开发场景模拟）
4. 测试运势生成
5. 测试历史记录
```

---

## 📋 常用命令

### 服务器管理

```bash
# 查看后端服务状态
pm2 status

# 查看后端日志
pm2 logs bracelet-api

# 重启后端服务
pm2 restart bracelet-api

# 停止后端服务
pm2 stop bracelet-api
```

### cpolar管理

```bash
# 查看cpolar状态
sudo systemctl status cpolar

# 查看cpolar地址
cpolar status

# 查看cpolar日志
sudo journalctl -u cpolar -f

# 重启cpolar
sudo systemctl restart cpolar
```

### 数据库管理

```bash
# 连接数据库
PGPASSWORD="HvXFmwEwfntnScWZRJyB" psql -h 1Panel-postgresql-0i7g -p 5432 -U bracelet-fortune -d bracelet-fortune

# 查看表
\dt

# 查看用户
SELECT * FROM users;

# 退出
\q
```

---

## ⚠️ 常见问题

### Q1: cpolar地址每天变化怎么办？

**免费版限制：**

- 地址每天会变化
- 需要每天更新小程序配置

**解决方案：**

1. 升级cpolar付费版（9元/月，固定地址）
2. 或每天手动更新配置

### Q2: 数据库连接失败

**检查步骤：**

```bash
# 测试内部连接
PGPASSWORD="HvXFmwEwfntnScWZRJyB" psql -h 1Panel-postgresql-0i7g -p 5432 -U bracelet-fortune -d bracelet-fortune -c "SELECT 1;"

# 如果失败，尝试外部连接
PGPASSWORD="HvXFmwEwfntnScWZRJyB" psql -h 47.239.179.9 -p 15432 -U bracelet-fortune -d bracelet-fortune -c "SELECT 1;"
```

如果外部连接成功，修改 `.env` 中的 `DATABASE_URL`

### Q3: 后端服务启动失败

**查看日志：**

```bash
pm2 logs bracelet-api --lines 100
```

**常见原因：**

1. 环境变量配置错误
2. 数据库连接失败
3. 端口被占用

---

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`pm2 logs bracelet-api`
2. 查看cpolar日志：`sudo journalctl -u cpolar -f`
3. 检查环境变量：`cat ~/bracelet-fortune/apps/api/.env`

---

## 🎉 部署成功标志

✅ 后端服务运行正常（`pm2 status` 显示 online）
✅ cpolar服务运行正常（`sudo systemctl status cpolar` 显示 active）
✅ 可以通过cpolar地址访问API
✅ 小程序体验版可以正常使用
✅ 可以完成登录、绑定、查看运势等功能

---

**祝部署顺利！** 🚀
