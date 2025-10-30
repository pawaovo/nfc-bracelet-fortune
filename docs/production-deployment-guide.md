# 生产环境部署指南

## 📋 目录

- [一、部署前准备](#一部署前准备)
- [二、服务器环境配置](#二服务器环境配置)
- [三、数据库部署](#三数据库部署)
- [四、后端服务部署](#四后端服务部署)
- [五、Nginx配置](#五nginx配置)
- [六、HTTPS配置](#六https配置)
- [七、小程序配置](#七小程序配置)
- [八、上线检查](#八上线检查)

---

## 一、部署前准备

### 1. 服务器信息

**假设你已经购买了服务器，记录以下信息：**

```
服务器公网IP：123.456.789.100
服务器用户名：root
服务器密码：your-password
操作系统：Ubuntu 22.04 LTS
域名：nfc-fortune.com
```

---

### 2. 需要安装的软件

- **Node.js** 20.x LTS
- **PostgreSQL** 15.x
- **Nginx** 1.24.x
- **PM2**（Node.js进程管理器）
- **Certbot**（SSL证书工具）

---

### 3. 连接服务器

#### Windows用户

使用PowerShell或CMD：

```bash
ssh root@123.456.789.100
```

输入密码后登录。

#### Mac/Linux用户

使用终端：

```bash
ssh root@123.456.789.100
```

---

## 二、服务器环境配置

### 1. 更新系统

```bash
# 更新软件包列表
sudo apt update

# 升级已安装的软件包
sudo apt upgrade -y
```

---

### 2. 安装Node.js

```bash
# 安装Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应该显示 v20.x.x
npm -v   # 应该显示 10.x.x
```

---

### 3. 安装pnpm

```bash
# 安装pnpm
npm install -g pnpm

# 验证安装
pnpm -v  # 应该显示 8.x.x
```

---

### 4. 安装PM2

```bash
# 安装PM2（Node.js进程管理器）
npm install -g pm2

# 验证安装
pm2 -v  # 应该显示版本号
```

---

### 5. 安装Git

```bash
# 安装Git
sudo apt install -y git

# 验证安装
git --version  # 应该显示版本号
```

---

## 三、数据库部署

### 1. 安装PostgreSQL

```bash
# 安装PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# 启动PostgreSQL服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证安装
sudo -u postgres psql --version  # 应该显示 15.x
```

---

### 2. 创建数据库和用户

```bash
# 切换到postgres用户
sudo -u postgres psql

# 在PostgreSQL命令行中执行以下命令：
```

```sql
-- 创建数据库
CREATE DATABASE nfc_bracelet_fortune;

-- 创建用户
CREATE USER nfc_user WITH PASSWORD 'your-strong-password-here';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE nfc_bracelet_fortune TO nfc_user;

-- 退出
\q
```

---

### 3. 配置PostgreSQL远程访问（可选）

如果需要从本地连接数据库进行调试：

```bash
# 编辑配置文件
sudo nano /etc/postgresql/15/main/postgresql.conf

# 找到 listen_addresses，修改为：
listen_addresses = '*'

# 编辑访问控制文件
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 添加以下行（允许所有IP访问，生产环境建议限制IP）：
host    all             all             0.0.0.0/0               md5

# 重启PostgreSQL
sudo systemctl restart postgresql
```

---

### 4. 记录数据库连接信息

```
数据库地址：localhost（或服务器IP）
数据库端口：5432
数据库名称：nfc_bracelet_fortune
数据库用户：nfc_user
数据库密码：your-strong-password-here

连接字符串：
postgresql://nfc_user:your-strong-password-here@localhost:5432/nfc_bracelet_fortune?schema=public
```

---

## 四、后端服务部署

### 1. 上传代码到服务器

#### 方法1：使用Git（推荐）

```bash
# 在服务器上创建项目目录
mkdir -p /var/www
cd /var/www

# 克隆代码（如果你的代码在GitHub/Gitee上）
git clone https://github.com/your-username/nfc-bracelet-fortune.git
cd nfc-bracelet-fortune

# 或者从本地上传（在本地电脑执行）
# scp -r D:\ai\手链运势 root@123.456.789.100:/var/www/
```

#### 方法2：使用FTP工具

使用FileZilla等FTP工具上传整个项目文件夹。

---

### 2. 安装依赖

```bash
# 进入项目目录
cd /var/www/nfc-bracelet-fortune

# 安装依赖
pnpm install
```

---

### 3. 配置环境变量

```bash
# 创建生产环境配置文件
nano apps/api/.env.production
```

**填写以下内容：**

```env
# 数据库配置
DATABASE_URL="postgresql://nfc_user:your-strong-password-here@localhost:5432/nfc_bracelet_fortune?schema=public"

# JWT配置
JWT_SECRET="your-production-jwt-secret-key-change-this-to-random-string"
JWT_EXPIRES_IN="7d"

# 微信小程序配置
WECHAT_APP_ID="wx7ba4129d919fdf01"
WECHAT_APP_SECRET="your-wechat-app-secret-from-mp-weixin"
WECHAT_DEV_MODE="false"

# AI服务配置
OPENAI_API_KEY="your-doubao-api-key"
OPENAI_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
OPENAI_MODEL="doubao-seed-1-6-flash-250828"

# 服务器配置
PORT=3000
NODE_ENV="production"

# 日志配置
LOG_LEVEL="info"
```

**保存并退出**（Ctrl+X，然后Y，然后Enter）

---

### 4. 初始化数据库

```bash
# 进入API目录
cd apps/api

# 运行数据库迁移
pnpm prisma migrate deploy

# 生成Prisma客户端
pnpm prisma generate
```

---

### 5. 编译后端代码

```bash
# 回到项目根目录
cd /var/www/nfc-bracelet-fortune

# 编译后端
pnpm --filter api build
```

---

### 6. 使用PM2启动服务

```bash
# 启动后端服务
pm2 start apps/api/dist/main.js --name nfc-api

# 查看服务状态
pm2 status

# 查看日志
pm2 logs nfc-api

# 设置开机自启
pm2 startup
pm2 save
```

---

### 7. 测试后端服务

```bash
# 测试API是否正常
curl http://localhost:3000/api/v1

# 应该返回：
# {"message":"NFC Bracelet Fortune API","version":"1.0.0"}
```

---

## 五、Nginx配置

### 1. 安装Nginx

```bash
# 安装Nginx
sudo apt install -y nginx

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v  # 应该显示版本号
```

---

### 2. 配置Nginx反向代理

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/nfc-fortune
```

**填写以下内容：**

```nginx
server {
    listen 80;
    server_name nfc-fortune.com www.nfc-fortune.com;

    # 日志
    access_log /var/log/nginx/nfc-fortune-access.log;
    error_log /var/log/nginx/nfc-fortune-error.log;

    # 反向代理到后端API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置（AI生成需要较长时间）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**保存并退出**

---

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/nfc-fortune /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

### 4. 配置防火墙

```bash
# 允许HTTP和HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## 六、HTTPS配置

### 1. 安装Certbot

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx
```

---

### 2. 获取SSL证书

```bash
# 自动获取并配置SSL证书
sudo certbot --nginx -d nfc-fortune.com -d www.nfc-fortune.com

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款（输入 Y）
# 3. 选择是否重定向HTTP到HTTPS（推荐选择 2）
```

---

### 3. 测试SSL证书

访问：https://nfc-fortune.com/api/v1

应该能看到：

```json
{
  "message": "NFC Bracelet Fortune API",
  "version": "1.0.0"
}
```

---

### 4. 设置自动续期

```bash
# Certbot会自动设置续期任务
# 测试续期
sudo certbot renew --dry-run

# 如果成功，证书会在到期前自动续期
```

---

## 七、小程序配置

### 1. 修改API配置

**文件：** `apps/wx-app/src/api/config.ts`

```typescript
export const API_CONFIG = {
  // 开发环境API地址（开发者工具）
  DEV_BASE_URL: 'http://localhost:3000',
  // 真机调试API地址（电脑局域网IP）
  REAL_DEVICE_BASE_URL: 'http://192.168.31.217:3000',
  // 生产环境API地址
  PROD_BASE_URL: 'https://nfc-fortune.com', // ⚠️ 修改为你的实际域名
  TIMEOUT: 30000,
  VERSION: 'v1',
};
```

---

### 2. 编译小程序

```bash
# 在本地电脑执行
cd D:\ai\手链运势\apps\wx-app

# 编译生产版本
pnpm build:mp-weixin
```

---

### 3. 配置微信公众平台

1. **登录微信公众平台**：https://mp.weixin.qq.com
2. **进入：开发 → 开发管理 → 开发设置**
3. **配置服务器域名**：

```
request合法域名：
- https://nfc-fortune.com
- https://ark.cn-beijing.volces.com

uploadFile合法域名：
（如果需要上传文件功能）

downloadFile合法域名：
（如果需要下载文件功能）
```

4. **保存配置**

---

### 4. 上传小程序代码

1. **打开微信开发者工具**
2. **导入项目**：选择 `D:\ai\手链运势\apps\wx-app\dist\build\mp-weixin`
3. **点击"上传"按钮**
4. **填写版本号**：例如 `1.0.0`
5. **填写版本描述**：例如 `初版上线`
6. **上传成功**

---

### 5. 提交审核

1. **登录微信公众平台**
2. **进入：管理 → 版本管理**
3. **选择开发版本，点击"提交审核"**
4. **填写审核信息**：
   - 版本描述：初版上线，提供个性化运势娱乐服务
   - 测试账号：（如果需要）
   - 隐私保护指引确认：勾选
5. **提交审核**

---

## 八、上线检查

### 1. 功能测试

- [ ] 微信登录功能正常
- [ ] 个人信息填写功能正常
- [ ] 运势生成功能正常
- [ ] 历史记录功能正常
- [ ] 隐私授权弹窗正常显示
- [ ] 设置页面功能正常

---

### 2. 性能测试

```bash
# 测试API响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://nfc-fortune.com/api/v1

# 查看服务器资源使用
htop

# 查看数据库连接
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

### 3. 日志监控

```bash
# 查看后端日志
pm2 logs nfc-api

# 查看Nginx日志
sudo tail -f /var/log/nginx/nfc-fortune-access.log
sudo tail -f /var/log/nginx/nfc-fortune-error.log
```

---

### 4. 备份设置

```bash
# 创建数据库备份脚本
nano /root/backup-db.sh
```

```bash
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nfc_bracelet_fortune_$DATE.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
sudo -u postgres pg_dump nfc_bracelet_fortune > $BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
# 设置执行权限
chmod +x /root/backup-db.sh

# 设置定时任务（每天凌晨2点备份）
crontab -e

# 添加以下行：
0 2 * * * /root/backup-db.sh
```

---

## 📞 故障排查

### 问题1：后端服务无法启动

```bash
# 查看PM2日志
pm2 logs nfc-api

# 常见原因：
# 1. 数据库连接失败 → 检查DATABASE_URL
# 2. 端口被占用 → 修改PORT配置
# 3. 环境变量未设置 → 检查.env.production
```

---

### 问题2：Nginx 502错误

```bash
# 检查后端服务是否运行
pm2 status

# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/nfc-fortune-error.log
```

---

### 问题3：SSL证书获取失败

```bash
# 检查域名解析
ping nfc-fortune.com

# 检查80端口是否开放
sudo netstat -tlnp | grep :80

# 重新获取证书
sudo certbot --nginx -d nfc-fortune.com
```

---

## ✅ 部署完成检查清单

- [ ] 服务器环境配置完成
- [ ] PostgreSQL数据库运行正常
- [ ] 后端服务运行正常（PM2）
- [ ] Nginx反向代理配置完成
- [ ] HTTPS证书配置完成
- [ ] 小程序代码已上传
- [ ] 微信公众平台域名已配置
- [ ] 功能测试通过
- [ ] 数据库备份脚本已设置

---

**恭喜！部署完成！** 🎉
