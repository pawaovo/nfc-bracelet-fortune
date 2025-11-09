# ⚡ 快速开始 - 5分钟部署指南

## 🎯 目标

5分钟内完成部署，让小程序在真机上运行！

---

## 📋 准备工作（2分钟）

### 1. 获取微信小程序密钥

```
1. 访问：https://mp.weixin.qq.com
2. 登录你的小程序账号
3. 进入：开发 → 开发管理 → 开发设置
4. 找到"开发者ID" → 复制 AppSecret
5. 保存到记事本
```

### 2. 注册cpolar账号

```
1. 访问：https://dashboard.cpolar.com/signup
2. 注册免费账号
3. 登录后，复制首页的 "Your Authtoken"
4. 保存到记事本
```

---

## 🚀 部署步骤（3分钟）

### 步骤1：上传部署脚本（30秒）

**在本地电脑执行（PowerShell）：**

```powershell
# 进入项目目录
cd "D:\ai\手链运势"

# 上传部署脚本到服务器
scp -P 43122 -r deployment xiaoyi-dev1@47.239.179.9:~/
# 输入密码：n6pCTKmpXDGVSjhfMzbX
```

### 步骤2：上传项目代码（1分钟）

**方法A：如果代码在Git仓库**

```bash
# 连接服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 克隆代码
cd ~
git clone https://github.com/your-username/bracelet-fortune.git
```

**方法B：从本地上传**

```powershell
# 在本地电脑执行
cd "D:\ai\手链运势"

# 压缩项目（先删除node_modules）
# 手动删除以下目录：
# - node_modules
# - apps/wx-app/node_modules
# - apps/api/node_modules

# 然后压缩整个项目文件夹为 bracelet-fortune.zip

# 上传到服务器
scp -P 43122 bracelet-fortune.zip xiaoyi-dev1@47.239.179.9:~/
```

```bash
# 在服务器上解压
ssh xiaoyi-dev1@47.239.179.9 -p 43122
unzip bracelet-fortune.zip -d bracelet-fortune
```

### 步骤3：一键部署（2分钟）

**在服务器上执行：**

```bash
# 进入部署目录
cd ~/deployment

# 添加执行权限
chmod +x *.sh

# 运行一键部署脚本
./deploy-all.sh
```

**按照提示操作：**

1. 输入 `y` 继续
2. 等待环境检查完成，输入 `y`
3. 等待依赖安装完成
4. 编辑环境变量：

   ```bash
   # 会自动打开编辑器
   # 找到以下行并修改：

   # 1. 修改JWT密钥（随便改成一个复杂字符串）
   JWT_SECRET="your-random-secret-key-12345678"

   # 2. 填写微信小程序密钥
   WECHAT_APP_SECRET="你刚才复制的AppSecret"

   # 3. 保存并退出：Ctrl+X → Y → Enter
   ```

5. 输入cpolar的authtoken（你刚才复制的）
6. 等待部署完成

**部署完成后会显示：**

```
🌐 你的 API 公网地址：
https://abc123.r1.cpolar.top
```

**⚠️ 记下这个地址！**

---

## 📱 配置小程序（2分钟）

### 步骤1：修改小程序配置

**在本地电脑修改：**

#### 文件1：`apps/wx-app/src/api/config.ts`

找到第13行，修改为：

```typescript
TUNNEL_BASE_URL: 'https://abc123.r1.cpolar.top',  // 替换为你的cpolar地址
```

找到第25行，修改为：

```typescript
const CURRENT_ENV: EnvType = 'tunnel'; // 改为 tunnel
```

#### 文件2：`apps/wx-app/src/config/dev-scenarios.ts`

找到第112行，修改为：

```typescript
enabled: false,  // 改为 false
```

### 步骤2：编译小程序

```bash
cd "D:\ai\手链运势\apps\wx-app"
pnpm build:mp-weixin
```

### 步骤3：配置微信公众平台

```
1. 访问：https://mp.weixin.qq.com
2. 进入：开发 → 开发管理 → 开发设置 → 服务器域名
3. 点击"修改"
4. 在"request合法域名"中添加：
   https://abc123.r1.cpolar.top  （你的cpolar地址）
5. 点击"保存"（需要管理员扫码）
```

### 步骤4：上传体验版

```
1. 打开微信开发者工具
2. 导入项目：D:\ai\手链运势\apps\wx-app\dist\build\mp-weixin
3. 点击右上角"上传"
4. 填写版本号：1.0.0-test
5. 点击"上传"

6. 访问：https://mp.weixin.qq.com
7. 进入：管理 → 版本管理
8. 找到刚上传的版本，点击"设为体验版"
9. 扫码体验！
```

---

## ✅ 测试

### 在手机微信中：

1. 扫码打开体验版小程序
2. 点击"绑定手链"（会自动登录）
3. 填写个人信息
4. 查看运势

**如果一切正常，恭喜你部署成功！** 🎉

---

## ⚠️ 常见问题

### Q: 小程序提示"服务器错误"

**检查：**

```bash
# 在服务器上查看后端日志
pm2 logs bracelet-api

# 查看cpolar状态
cpolar status
```

### Q: cpolar地址访问不了

**解决：**

```bash
# 重启cpolar
sudo systemctl restart cpolar

# 查看新地址
cpolar status

# 更新小程序配置中的地址
```

### Q: 数据库连接失败

**检查环境变量：**

```bash
cat ~/bracelet-fortune/apps/api/.env | grep DATABASE_URL
```

应该是：

```
DATABASE_URL="postgresql://bracelet-fortune:HvXFmwEwfntnScWZRJyB@1Panel-postgresql-0i7g:5432/bracelet-fortune?schema=public"
```

---

## 📞 需要帮助？

查看详细文档：`deployment/README.md`

---

**就这么简单！** 🚀
