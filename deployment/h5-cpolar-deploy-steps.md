# H5网页版 cpolar 部署详细步骤

> **当前cpolar地址**: https://5be590b8.cpolar.io
> **服务器**: 47.239.179.9:43122
> **用户**: xiaoyi-dev1

---

## 第一步：检查并更新数据库Schema（服务器端）

### 1.1 SSH连接到服务器

```bash
ssh xiaoyi-dev1@47.239.179.9 -p 43122
# 密码: n6pCTKmpXDGVSjhfMzbX
```

### 1.2 检查当前项目目录

```bash
# 查看现有目录
ls -la ~/

# 你应该看到:
# - bracelet-fortune (主项目目录)
# - bracelet-api-production (可能是旧的)
```

### 1.3 进入项目目录并检查数据库Schema

```bash
# 进入项目目录
cd ~/bracelet-fortune/apps/api

# 查看当前schema中的User模型
cat prisma/schema.prisma | grep -A 15 "model User"
```

**预期输出应该包含**:

```prisma
model User {
  id            String   @id @default(uuid())
  wechatOpenId  String   @unique
  username      String?  @unique      # ← 需要这个字段
  password      String?                # ← 需要这个字段
  name          String?
  birthday      DateTime?
  ...
}
```

### 1.4 如果没有username和password字段，需要更新代码

**选项A: 使用Git拉取最新代码（推荐）**

```bash
cd ~/bracelet-fortune

# 查看当前分支
git branch

# 切换到H5分支
git checkout feature/h5-web

# 拉取最新代码
git pull origin feature/h5-web
```

**选项B: 如果没有Git仓库，需要从本地上传**

在本地Windows电脑上执行：

```powershell
# 压缩整个项目（排除node_modules）
cd "D:\ai\手链运势"

# 压缩apps/api目录
Compress-Archive -Path apps\api\* -DestinationPath api-h5-update.zip -Force

# 上传到服务器
scp -P 43122 api-h5-update.zip xiaoyi-dev1@47.239.179.9:~/
```

然后在服务器上：

```bash
# 备份旧代码
cd ~
cp -r bracelet-fortune/apps/api bracelet-fortune/apps/api.backup.$(date +%Y%m%d)

# 解压新代码
cd ~/bracelet-fortune/apps/api
unzip -o ~/api-h5-update.zip

# 删除压缩包
rm ~/api-h5-update.zip
```

### 1.5 执行数据库迁移

```bash
cd ~/bracelet-fortune/apps/api

# 安装依赖（如果有新的依赖）
pnpm install

# 生成Prisma客户端
pnpm prisma generate

# 执行数据库迁移（生产环境）
pnpm prisma migrate deploy

# 如果上面命令失败，使用开发模式迁移
pnpm prisma migrate dev --name add-h5-auth-fields
```

**预期输出**:

```
✔ Generated Prisma Client
✔ Applied migration(s)
```

### 1.6 验证数据库更新

```bash
# 使用Prisma Studio查看（会在5555端口启动）
pnpm prisma studio &

# 或者直接查询数据库
pnpm prisma db execute --stdin <<EOF
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';
EOF
```

---

## 第二步：更新并重启后端API（服务器端）

### 2.1 重新构建后端

```bash
cd ~/bracelet-fortune/apps/api

# 构建后端
pnpm build
```

### 2.2 检查环境变量

```bash
# 查看.env文件
cat .env

# 确认以下配置存在:
# - DATABASE_URL
# - JWT_SECRET
# - WECHAT_APP_ID
# - WECHAT_APP_SECRET
# - OPENAI_API_KEY
```

### 2.3 重启后端服务

```bash
# 查看当前PM2进程
pm2 list

# 重启bracelet-api
pm2 restart bracelet-api

# 查看日志确认启动成功
pm2 logs bracelet-api --lines 50
```

**预期日志**:

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [NestApplication] Nest application successfully started
```

### 2.4 测试后端API

```bash
# 测试本地API
curl http://localhost:3000/api/v1

# 测试cpolar公网地址
curl https://5be590b8.cpolar.io/api/v1

# 预期返回:
# {"message":"NFC Bracelet Fortune API","version":"1.0.0"}
```

---

## 第三步：本地构建H5版本（本地Windows电脑）

### 3.1 更新API配置

打开文件: `apps/wx-app/src/api/config.ts`

修改第16行的 `TUNNEL_BASE_URL`:

```typescript
export const API_CONFIG = {
  // 开发者工具 / 浏览器本地 API 地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 真机调试时使用的局域网地址（请按需修改）
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',
  // 内网穿透地址（cpolar / ngrok 等）
  TUNNEL_BASE_URL: 'https://5be590b8.cpolar.io', // ← 修改这里
  // 生产环境 API 地址
  PROD_BASE_URL: 'https://your-api-domain.com',
  // 请求超时时间（120s，兼容 AI 渲染）
  TIMEOUT: 120000,
  // API 版本
  VERSION: 'v1',
};
```

**或者使用快速更新脚本**:

```powershell
# 在项目根目录
cd "D:\ai\手链运势"

# 使用脚本更新（如果存在）
node scripts/update-cpolar-url.js https://5be590b8.cpolar.io
```

### 3.2 构建H5版本

```powershell
# 确保在正确的分支
git status
# 应该显示: On branch feature/h5-web

# 进入wx-app目录
cd apps\wx-app

# 安装依赖（如果还没安装）
pnpm install

# 构建H5版本
pnpm build:h5
```

**构建完成后，产物位于**: `apps\wx-app\dist\build\h5\`

### 3.3 本地预览测试（可选但推荐）

```powershell
# 使用serve预览
npx serve dist\build\h5

# 在浏览器访问: http://localhost:3000
# 测试URL: http://localhost:3000/#/pages/bind/index?nfcId=TEST001
```

**检查项**:

- [ ] 页面正常显示
- [ ] 样式加载正常
- [ ] 可以填写表单
- [ ] 打开开发者工具（F12），Network标签中可以看到API请求发送到cpolar地址

---

## 第四步：上传H5文件到服务器

### 4.1 压缩H5文件

```powershell
# 在本地Windows电脑上
cd "D:\ai\手链运势\apps\wx-app\dist\build"

# 压缩h5目录
Compress-Archive -Path h5\* -DestinationPath h5-web.zip -Force

# 查看压缩包大小
Get-Item h5-web.zip | Select-Object Name, Length
```

### 4.2 上传到服务器

```powershell
# 使用SCP上传
scp -P 43122 h5-web.zip xiaoyi-dev1@47.239.179.9:~/
```

**或者使用XFTP/WinSCP**:

1. 连接到服务器: 47.239.179.9:43122
2. 上传 `h5-web.zip` 到 `/home/xiaoyi-dev1/`

### 4.3 在服务器上解压

```bash
# SSH连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 创建H5目录
mkdir -p ~/h5-web

# 解压文件
cd ~/h5-web
unzip -o ~/h5-web.zip

# 检查文件
ls -la

# 应该看到:
# - index.html
# - static/
# - assets/
# - manifest.json
# 等文件

# 设置文件权限
chmod -R 755 ~/h5-web
```

---

## 第五步：配置Nginx部署H5静态网站（服务器端）

### 5.1 检查Nginx是否已安装

```bash
# 检查Nginx
nginx -v

# 如果未安装
sudo apt update
sudo apt install nginx -y
```

### 5.2 创建Nginx配置文件

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/h5-bracelet
```

**粘贴以下配置**:

```nginx
server {
    listen 8080;
    server_name _;

    # H5静态文件目录
    root /home/xiaoyi-dev1/h5-web;
    index index.html;

    # 日志
    access_log /var/log/nginx/h5-bracelet-access.log;
    error_log /var/log/nginx/h5-bracelet-error.log;

    # 支持uni-app Hash路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

**保存**: 按 `Ctrl+X`，然后按 `Y`，再按 `Enter`

### 5.3 启用配置并重启Nginx

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/h5-bracelet /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 预期输出:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重启Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

### 5.4 配置防火墙

```bash
# 开放8080端口
sudo ufw allow 8080/tcp

# 查看防火墙状态
sudo ufw status
```

---

## 第六步：配置cpolar隧道（服务器端）

### 6.1 停止当前的cpolar进程

```bash
# 停止PM2管理的cpolar
pm2 stop cpolar

# 或者直接杀死cpolar进程
pkill cpolar
```

### 6.2 配置cpolar多隧道

```bash
# 编辑cpolar配置文件
nano ~/.cpolar/cpolar.yml
```

**修改为以下内容**:

```yaml
version: '2'
authtoken: MjU0NTFiYmItM2Y0Ni00NzU0LTlmNGEtZTg5ZjkyMDA3ZDM4
region: cn
tunnels:
  api:
    proto: http
    addr: 3000
    inspect: false
  h5:
    proto: http
    addr: 8080
    inspect: false
```

**保存**: 按 `Ctrl+X`，然后按 `Y`，再按 `Enter`

### 6.3 启动cpolar多隧道

```bash
# 启动所有隧道
cpolar start-all

# 你会看到类似输出:
# Tunnel Status                 online
# Forwarding (api)              https://5be590b8.cpolar.io -> http://localhost:3000
# Forwarding (h5)               https://abc123.cpolar.io -> http://localhost:8080
#                               ^^^^^^^^^^^^^^^^^^^^^^^^
#                               这是H5的公网地址！
```

**⚠️ 重要**: 复制H5的cpolar地址，例如: `https://abc123.cpolar.io`

### 6.4 使用PM2管理cpolar（可选）

```bash
# 停止当前cpolar
pkill cpolar

# 使用PM2启动
pm2 start cpolar --name cpolar -- start-all

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

---

## 第七步：测试H5网页访问

### 7.1 测试本地访问

```bash
# 在服务器上测试
curl http://localhost:8080

# 应该返回HTML内容
```

### 7.2 测试cpolar公网访问

```bash
# 替换为你的H5 cpolar地址
curl https://abc123.cpolar.io

# 应该返回HTML内容
```

### 7.3 浏览器测试

在本地Windows电脑的浏览器中访问:

```
https://abc123.cpolar.io
```

**应该看到**: H5绑定页面

**测试完整URL**:

```
https://abc123.cpolar.io/#/pages/bind/index?nfcId=TEST001
```

### 7.4 功能测试

1. **打开开发者工具**（F12）
2. **切换到Network标签**
3. **填写表单**:
   - 用户名: testuser
   - 密码: 123456
   - 生日: 1990-01-01
4. **点击"绑定我的手链"**
5. **检查Network中的API请求**:
   - 应该发送到: `https://5be590b8.cpolar.io/api/v1/...`
   - 状态码应该是: 200 或 201
6. **检查Console**:
   - 不应该有错误信息
   - 应该有API日志输出

---

## 第八步：验证数据库

### 8.1 使用Prisma Studio查看

```bash
# 在服务器上
cd ~/bracelet-fortune/apps/api

# 启动Prisma Studio
pnpm prisma studio
```

### 8.2 在浏览器中访问

```
http://47.239.179.9:5555
```

### 8.3 检查数据

1. 点击 **User** 表
2. 查看是否有新增的用户记录
3. 确认 `username` 和 `password` 字段有值
4. 确认 `wechatOpenId` 字段（H5用户会有特殊的openid）

---

## 🎉 部署完成！

现在你可以：

1. ✅ 通过cpolar地址访问H5网页
2. ✅ 测试完整的绑定流程
3. ✅ 验证数据保存到数据库
4. ✅ 测试运势生成功能

---

## 📝 重要信息记录

**API cpolar地址**: https://5be590b8.cpolar.io
**H5 cpolar地址**: https://abc123.cpolar.io （替换为实际地址）

**测试URL**:

```
https://abc123.cpolar.io/#/pages/bind/index?nfcId=TEST001
```

---

## ⚠️ 注意事项

1. **cpolar地址会变化**: 免费版每次重启后地址会变，需要重新配置
2. **建议购买付费版**: 10元/月，固定域名，更稳定
3. **后续切换**: 测试完成后，按照《H5网页版完整部署指南.md》切换到1Panel正式域名

---

## 🐛 常见问题

### Q1: cpolar启动后没有显示H5隧道？

检查配置文件:

```bash
cat ~/.cpolar/cpolar.yml
```

确认有 `h5` 隧道配置。

### Q2: Nginx启动失败？

```bash
# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo netstat -tlnp | grep :8080
```

### Q3: H5页面显示但API请求失败？

1. 检查API cpolar地址是否正确
2. 检查后端CORS配置
3. 查看后端日志: `pm2 logs bracelet-api`

### Q4: 数据库连接失败？

```bash
# 检查数据库容器
docker ps | grep postgres

# 查看数据库日志
docker logs <容器ID>
```

---

**下一步**: 充分测试所有功能，确认无误后，可以切换到1Panel正式域名部署。
