# 1Panel部署快速参考卡

> 快速查阅关键配置信息

---

## 🔑 关键信息

### 服务器信息

```
服务器IP: 47.239.179.9
SSH端口: 43122
SSH用户: xiaoyi-dev1
SSH密码: n6pCTKmpXDGVSjhfMzbX
```

### 1Panel访问

```
访问地址: http://47.239.179.9:8090
常用端口: 8090 / 8888 / 9999
```

### H5部署目录

```
服务器路径: /home/xiaoyi-dev1/h5-web
文件数量: 125个
目录大小: 6.3MB
```

### API配置

```
生产环境API: http://47.239.179.9:43122
API版本: v1
完整路径: http://47.239.179.9:43122/api/v1/
```

---

## 📝 创建网站配置

### 基本配置

```
网站类型: 静态网站
主域名: 47.239.179.9
网站目录: /home/xiaoyi-dev1/h5-web
默认文档: index.html
备注: NFC手链运势H5网页版
```

### 高级设置

```
✅ 开启Gzip压缩
✅ 开启访问日志
⏸️ HTTPS（稍后配置）
```

---

## 🔧 伪静态规则

```nginx
# 支持uni-app Hash路由
location / {
    try_files $uri $uri/ /index.html;
}

# 静态资源缓存优化
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Gzip压缩配置
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
```

---

## 🧪 测试URL

### 基本访问

```
http://47.239.179.9/
```

### 带NFC参数

```
http://47.239.179.9/#/pages/bind/index?nfcId=TEST001
```

### API测试

```
http://47.239.179.9:43122/api/v1
```

---

## 🚨 常用命令

### SSH连接

```bash
ssh xiaoyi-dev1@47.239.179.9 -p 43122
```

### 检查H5文件

```bash
ls -lh ~/h5-web/
du -sh ~/h5-web/
```

### 检查后端API

```bash
pm2 list
pm2 logs bracelet-api
curl http://localhost:3000/api/v1
```

### 重启后端

```bash
pm2 restart bracelet-api
```

### 查看1Panel状态

```bash
sudo 1pctl status
```

---

## ✅ 部署检查清单

- [ ] 1Panel面板可以访问
- [ ] 成功创建静态网站
- [ ] 网站目录配置正确
- [ ] 伪静态规则已配置
- [ ] 可以访问首页
- [ ] NFC参数传递正常
- [ ] API请求正常
- [ ] 完整流程测试通过

---

## 📞 故障排查

### 网站404

```bash
# 检查文件
ls -la /home/xiaoyi-dev1/h5-web/index.html

# 检查权限
chmod -R 755 /home/xiaoyi-dev1/h5-web/
```

### API无响应

```bash
# 检查PM2
pm2 list

# 查看日志
pm2 logs bracelet-api --lines 50

# 重启
pm2 restart bracelet-api
```

### 样式错乱

```
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 强制刷新（Ctrl+F5）
3. 检查开发者工具Console
```

---

## 🔒 端口和安全组

### 必须开放的端口

```
80    - HTTP网站访问
443   - HTTPS网站访问
8090  - 1Panel管理面板
43122 - SSH连接 / 后端API
```

### 云服务器安全组

```
登录云服务商控制台
→ 安全组/防火墙设置
→ 添加入站规则
→ 开放端口：80、443、8090、43122
→ 协议：TCP
→ 来源：0.0.0.0/0
```

### 服务器防火墙

```bash
# UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp
sudo ufw allow 43122/tcp
sudo ufw reload

# Firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8090/tcp
sudo firewall-cmd --permanent --add-port=43122/tcp
sudo firewall-cmd --reload
```

---

## 🔄 更新H5文件

### 本地构建

```powershell
cd "D:\ai\手链运势\apps\wx-app"
pnpm build:h5
```

### 上传到服务器

```powershell
cd dist\build
Compress-Archive -Path h5\* -DestinationPath h5-latest.zip -Force
scp -P 43122 h5-latest.zip xiaoyi-dev1@47.239.179.9:~/
```

### 服务器端替换

```bash
cd ~
mv h5-web h5-web-backup-$(date +%Y%m%d-%H%M%S)
mkdir -p h5-web
cd h5-web
unzip -o ~/h5-latest.zip
```

---

**快速参考卡 v1.0** | 更新时间：2025-11-14
