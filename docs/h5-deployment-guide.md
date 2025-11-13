# H5 部署 & NFC 联调指南

> 适用分支：`feature/h5-web`  
> 目标：在保持后端 47.239.179.9:43122 与 PostgreSQL 的前提下，将 `apps/wx-app/dist/build/h5` 静态站点上线，并保证 NFC 标签可以跳转到 H5 绑定流程。

---

## 1. 前置条件

- **后端**：`apps/api` 已可运行，`.env` 配置了数据库、微信、小程序参数，HTTP 入口 `http://47.239.179.9:43122/api/v1/...`。
- **数据库**：PostgreSQL 中已应用最新 schema（`users` 含 `username`/`password`）。若未应用需执行 `prisma migrate dev`（开发）或 `prisma migrate deploy`（部署）。
- **NFC**：手环/贴纸可重写 URL，测试手机需支持浏览器 NFC 调用（较好支持度：安卓 Chrome、华为浏览器）。
- **运维工具**：Xshell（SSH）、XFTP/scp/rsync（上传）、pm2/systemd（管理后端服务）。

### 1.1 本地调试流程

| 项目      | 说明                                                                                      |
| --------- | ----------------------------------------------------------------------------------------- |
| Node/pnpm | Node ≥ 18、pnpm ≥ 8，执行 `pnpm install` 安装依赖                                         |
| 数据库    | 可复用远程 PostgreSQL，也可在本地 Docker/Postgres 启动并调节 `.env` 的 `DATABASE_URL`     |
| 启动命令  | `pnpm --filter api start:dev`（后端） + `pnpm --filter wx-app dev:h5`（H5）               |
| NFC 模拟  | 浏览器地址栏附加 `?nfcId=LOCAL_TEST`；若需真机调试，可让手机访问 `http://<局域网IP>:5173` |

常用并行脚本：

```bash
pnpm concurrently "pnpm --filter api start:dev" "pnpm --filter wx-app dev:h5"
```

本地验证完毕（表单提交、数据库写入、同账号多 NFC）后，再执行后续的远程部署步骤。

- H5 绑定流程说明：NFC URL 进入绑定页 → 点击“绑定按钮”会跳转到“个人信息” → 输入用户名/密码/生日后保存，即会调用 `profile/web-register` 接口落库，同时允许同一账号绑定多个 NFC。

---

## 2. H5 构建

1. `git checkout feature/h5-web`
2. `pnpm --filter wx-app build:h5`
3. 打包产物位于 `apps/wx-app/dist/build/h5`，可用 `npx serve apps/wx-app/dist/build/h5` 做一次静态预览。

---

## 3. 静态站点部署（Nginx 示例）

1. **上传**
   - 将 `dist/build/h5` 下的全部文件上传至服务器（例如 `/var/www/bracelet-h5/`），可用 XFTP 或 `scp -P 43122 -r dist/build/h5/* xiaoyi-dev1@47.239.179.9:/var/www/bracelet-h5/`。
2. **Nginx 配置**

   ```nginx
   server {
     listen 80;
     server_name h5.example.com;

     root /var/www/bracelet-h5;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

   - 如需 HTTPS，额外配置证书/301 跳转。
   - `sudo nginx -s reload` 使配置生效。

3. **验证**
   - 浏览器访问 `https://h5.example.com/#/pages/bind/index?nfcId=TEST`，确认页面加载与 API 请求正常（Network 中应指向 47.239.179.9:43122）。

---

## 4. 后端与数据库

1. 通过 Xshell 登录服务器：
   ```bash
   ssh xiaoyi-dev1@47.239.179.9 -p 43122
   ```
2. 进入后端目录（如 `/home/xiaoyi-dev1/bracelet-fortune/apps/api`），在交互式终端执行：
   ```bash
   pnpm prisma:migrate dev -n add-username-password
   # 部署阶段可改用 pnpm prisma:migrate deploy
   pnpm install
   pnpm build
   pm2 restart bracelet-api   # 视实际进程名而定
   ```
3. 若 `.env` 需要更新，可先修改 `/home/xiaoyi-dev1/bracelet-fortune/apps/api/.env`，再重启。

---

## 5. 复用 deployment 目录脚本（可选）

`deployment/` 目录内保存了早期的一键部署方案，可按需复用：

1. **一键执行**
   ```bash
   scp -P 43122 -r deployment xiaoyi-dev1@47.239.179.9:~/
   ssh xiaoyi-dev1@47.239.179.9 -p 43122
   cd ~/deployment && chmod +x *.sh
   ./deploy-all.sh
   ```
2. **分步**
   ```bash
   ./check-server-env.sh
   ./install-dependencies.sh
   cp .env.production.template ~/bracelet-fortune/apps/api/.env
   nano ~/bracelet-fortune/apps/api/.env
   ./deploy-backend.sh
   ./setup-cpolar.sh   # 若需要临时内网穿透
   ```
3. **上传脚本**
   - Windows 用户可运行 `deployment/upload-to-server.bat` 或 `upload-project.ps1` 以排除 node_modules 并上传项目。

> 这些脚本最初为小程序部署而写，执行前请核对 pm2 进程名、静态资源路径等是否需要调整。

---

## 6. NFC 标签写入

1. URL 模板：`https://h5.example.com/#/pages/bind/index?nfcId=<真实 NFC 编号>`
2. 使用手机或写卡器写入链接，并记录 `nfcId` 与标签一一对应关系。
3. 真机贴卡 → H5 自动加载 → 完成个人信息填报并绑定。

---

## 7. 常见问题

| 现象           | 处理建议                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------- |
| 页面白屏 / 404 | 确认 Nginx `root`、`try_files` 配置；确保静态文件上传完整。                               |
| API 403/跨域   | Network 中检查请求域名，若跨域受限需在后端 `enableCors` 中允许 H5 域名。                  |
| NFC 无响应     | 检查标签内 URL、浏览器 NFC 权限；仅 HTTPS URL 才能被部分浏览器接受。                      |
| 表单提交失败   | 浏览器 Console 日志 + 服务器日志；确认 `username/password/nfcId` 已传到 `/profile` 接口。 |
| 数据库迁移失败 | `users` 表若已有重复用户名需要手动处理；并在交互式终端运行 `prisma migrate dev`。         |

---

## 8. 部署检查表

- [ ] `pnpm --filter wx-app build:h5` 成功，产物已上传。
- [ ] 47.239.179.9:43122 已执行最新 Prisma 迁移，并重启后端。
- [ ] H5 域名可通过浏览器访问，API 正常响应。
- [ ] 通过 H5 提交（用户名/密码/生日/nfcId）可成功落库。
- [ ] 至少完成一次 NFC 真机贴卡验证。
- [ ] 文档记录部署路径、域名、NFC 对应表。

---

## 9. 后续规划

- 办理 H5 域名 ICP 备案并启用正式 HTTPS 证书。
- 将静态站点托管到 CDN 或 uniCloud 前端托管，提升访问速度。
- 后端完善密码加密、Web 登录接口、验证码流程等安全机制。
- 引入 CI/CD，将构建、scp、pm2 重启等步骤自动化。

如需扩展该指南（例如补充 Docker、uniCloud、CI/CD 操作），可继续在本文件追加章节。\*\*\*
