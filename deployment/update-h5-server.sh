#!/bin/bash

# H5网页版服务器端更新部署脚本
# 用途：在服务器上执行，自动更新后端、数据库、部署H5前端

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "🚀 H5网页版 - 服务器端更新部署"
echo "========================================="
echo ""

# ========================================
# 步骤1: 备份旧数据
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 1/7: 备份旧数据${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BACKUP_TIME=$(date +%Y%m%d_%H%M%S)

# 备份后端代码
if [ -d "$HOME/bracelet-fortune/apps/api" ]; then
    echo "📦 备份后端代码..."
    cp -r "$HOME/bracelet-fortune/apps/api" "$HOME/bracelet-fortune/apps/api.backup.$BACKUP_TIME"
    echo -e "${GREEN}✅ 后端代码已备份${NC}"
fi

# 备份H5代码
if [ -d "$HOME/h5-web" ]; then
    echo "📦 备份H5代码..."
    cp -r "$HOME/h5-web" "$HOME/h5-web.backup.$BACKUP_TIME"
    echo -e "${GREEN}✅ H5代码已备份${NC}"
fi

echo ""

# ========================================
# 步骤2: 停止服务
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 2/7: 停止服务${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🛑 停止后端API..."
pm2 stop bracelet-api || echo "后端未运行"

echo "🛑 停止cpolar..."
pm2 stop cpolar || pkill cpolar || echo "cpolar未运行"

echo -e "${GREEN}✅ 服务已停止${NC}"
echo ""

# ========================================
# 步骤3: 更新后端代码
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 3/7: 更新后端代码${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -f "$HOME/backend-latest.zip" ]; then
    echo -e "${RED}❌ 未找到 backend-latest.zip${NC}"
    echo "请先从本地上传文件到服务器"
    exit 1
fi

cd "$HOME/bracelet-fortune/apps/api"

echo "🗑️  清理旧文件..."
rm -rf node_modules dist

echo "📦 解压新代码..."
unzip -o "$HOME/backend-latest.zip"

echo "📥 安装依赖..."
pnpm install

echo -e "${GREEN}✅ 后端代码已更新${NC}"
echo ""

# ========================================
# 步骤4: 更新数据库
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 4/7: 更新数据库Schema${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔄 生成Prisma客户端..."
pnpm prisma generate

echo "🔄 执行数据库迁移..."
pnpm prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  migrate deploy失败，尝试开发模式迁移${NC}"
    pnpm prisma migrate dev --name update-to-h5-version
}

echo -e "${GREEN}✅ 数据库已更新${NC}"
echo ""

# ========================================
# 步骤5: 构建并启动后端
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 5/7: 构建并启动后端${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔨 构建后端..."
pnpm build

echo "🚀 启动后端..."
pm2 restart bracelet-api || pm2 start npm --name bracelet-api -- run start:prod

sleep 3

echo "🧪 测试后端API..."
if curl -s http://localhost:3000/api/v1 > /dev/null; then
    echo -e "${GREEN}✅ 后端API运行正常${NC}"
else
    echo -e "${RED}❌ 后端API无响应${NC}"
    pm2 logs bracelet-api --lines 20
    exit 1
fi

echo ""

# ========================================
# 步骤6: 部署H5前端
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 6/7: 部署H5前端${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -f "$HOME/h5-latest.zip" ]; then
    echo -e "${RED}❌ 未找到 h5-latest.zip${NC}"
    echo "请先从本地上传文件到服务器"
    exit 1
fi

echo "🗑️  清理旧H5文件..."
rm -rf "$HOME/h5-web"
mkdir -p "$HOME/h5-web"

echo "📦 解压H5文件..."
cd "$HOME/h5-web"
unzip -o "$HOME/h5-latest.zip"

echo "🔐 设置文件权限..."
chmod -R 755 "$HOME/h5-web"

echo "🧪 检查H5文件..."
if [ -f "$HOME/h5-web/index.html" ]; then
    echo -e "${GREEN}✅ H5文件部署成功${NC}"
else
    echo -e "${RED}❌ H5文件部署失败${NC}"
    exit 1
fi

echo ""

# ========================================
# 步骤7: 配置并启动cpolar
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 7/7: 配置并启动cpolar${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔄 启动cpolar..."
pm2 delete cpolar 2>/dev/null || true
pm2 start cpolar --name cpolar -- start-all

sleep 3

echo "💾 保存PM2配置..."
pm2 save

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ========================================
# 显示服务状态
# ========================================
echo -e "${BLUE}📊 服务状态：${NC}"
echo ""
pm2 list

echo ""
echo -e "${BLUE}📝 cpolar地址：${NC}"
echo ""
pm2 logs cpolar --lines 15 --nostream | grep -E "(Forwarding|https://)" || echo "请稍后查看: pm2 logs cpolar"

echo ""
echo -e "${YELLOW}⚠️  重要提示：${NC}"
echo "1. 记录上面的cpolar地址（api和h5）"
echo "2. 在浏览器访问H5地址测试"
echo "3. 测试URL: https://你的H5地址/#/pages/bind/index?nfcId=TEST001"
echo ""

echo -e "${BLUE}📚 查看日志：${NC}"
echo "  后端API: pm2 logs bracelet-api"
echo "  cpolar:  pm2 logs cpolar"
echo ""

echo -e "${BLUE}🧪 测试命令：${NC}"
echo "  curl http://localhost:3000/api/v1"
echo "  curl http://localhost:8080"
echo ""

