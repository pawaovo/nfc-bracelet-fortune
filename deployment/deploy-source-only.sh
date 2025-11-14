#!/bin/bash

# 仅部署源代码（不包含 node_modules）
# 用途：在服务器上执行，从本地上传的源代码重新构建

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "🚀 源代码部署脚本"
echo "========================================="
echo ""

# ========================================
# 步骤1: 备份并清理
# ========================================
echo -e "${BLUE}步骤 1/8: 备份并清理${NC}"
echo ""

BACKUP_TIME=$(date +%Y%m%d_%H%M%S)

# 备份旧代码
if [ -d "$HOME/bracelet-fortune" ]; then
    echo "📦 备份旧代码..."
    cp -r "$HOME/bracelet-fortune" "$HOME/bracelet-fortune.backup.$BACKUP_TIME"
fi

# 停止服务
echo "🛑 停止服务..."
pm2 stop bracelet-api cpolar 2>/dev/null || true

echo -e "${GREEN}✅ 备份和清理完成${NC}"
echo ""

# ========================================
# 步骤2: 解压源代码
# ========================================
echo -e "${BLUE}步骤 2/8: 解压源代码${NC}"
echo ""

if [ ! -f "$HOME/source-code.zip" ]; then
    echo -e "${RED}❌ 未找到 source-code.zip${NC}"
    echo "请先上传源代码压缩包"
    exit 1
fi

echo "📦 解压源代码..."
cd ~
unzip -o source-code.zip -d bracelet-fortune-new

# 移动到正确位置
rm -rf bracelet-fortune
mv bracelet-fortune-new bracelet-fortune

echo -e "${GREEN}✅ 源代码解压完成${NC}"
echo ""

# ========================================
# 步骤3: 安装依赖
# ========================================
echo -e "${BLUE}步骤 3/8: 安装依赖${NC}"
echo ""

cd ~/bracelet-fortune

echo "📥 安装根目录依赖..."
pnpm install

echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# ========================================
# 步骤4: 构建 shared-types
# ========================================
echo -e "${BLUE}步骤 4/8: 构建 shared-types${NC}"
echo ""

cd ~/bracelet-fortune/packages/shared-types

echo "🔨 构建 shared-types..."
pnpm build

echo "🔍 验证 shared-types..."
if [ -f "dist/user.d.ts" ]; then
    echo "UserPartial 接口定义:"
    cat dist/user.d.ts | grep -A 6 "interface UserPartial"
    echo -e "${GREEN}✅ shared-types 构建成功${NC}"
else
    echo -e "${RED}❌ shared-types 构建失败${NC}"
    exit 1
fi

echo ""

# ========================================
# 步骤5: 配置环境变量
# ========================================
echo -e "${BLUE}步骤 5/8: 配置环境变量${NC}"
echo ""

cd ~/bracelet-fortune/apps/api

# 检查是否有备份的 .env
if [ -f "$HOME/bracelet-fortune.backup.$BACKUP_TIME/apps/api/.env" ]; then
    echo "📋 复制旧的 .env 文件..."
    cp "$HOME/bracelet-fortune.backup.$BACKUP_TIME/apps/api/.env" .env
else
    echo -e "${YELLOW}⚠️  未找到旧的 .env 文件，需要手动配置${NC}"
    echo "请确保 .env 文件存在并配置正确"
fi

# 验证数据库连接
if grep -q "localhost:5432" .env; then
    echo -e "${YELLOW}⚠️  检测到本地数据库配置，正在更新...${NC}"
    sed -i 's|postgresql://postgres:123456@localhost:5432/nfc_bracelet_fortune|postgresql://bracelet-fortune:HvXFmwEwfntnScWZRJyB@47.239.179.9:15432/bracelet-fortune|g' .env
    echo -e "${GREEN}✅ 数据库配置已更新${NC}"
fi

echo ""

# ========================================
# 步骤6: 生成 Prisma Client 和更新数据库
# ========================================
echo -e "${BLUE}步骤 6/8: 生成 Prisma Client 和更新数据库${NC}"
echo ""

echo "🔄 生成 Prisma Client..."
pnpm prisma generate

echo "🔄 更新数据库 Schema..."
pnpm prisma db push --accept-data-loss

echo -e "${GREEN}✅ Prisma 配置完成${NC}"
echo ""

# ========================================
# 步骤7: 构建后端
# ========================================
echo -e "${BLUE}步骤 7/8: 构建后端${NC}"
echo ""

echo "🔨 构建后端..."
pnpm build

if [ -f "dist/main.js" ]; then
    echo -e "${GREEN}✅ 后端构建成功${NC}"
else
    echo -e "${RED}❌ 后端构建失败${NC}"
    exit 1
fi

echo ""

# ========================================
# 步骤8: 启动服务
# ========================================
echo -e "${BLUE}步骤 8/8: 启动服务${NC}"
echo ""

echo "🚀 启动后端..."
pm2 restart bracelet-api || pm2 start npm --name bracelet-api -- run start:prod

sleep 3

echo "🚀 启动 cpolar..."
pm2 restart cpolar || pm2 start cpolar --name cpolar -- start-all

sleep 2

echo "💾 保存 PM2 配置..."
pm2 save

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}📊 服务状态：${NC}"
pm2 list

echo ""
echo -e "${BLUE}📝 查看日志：${NC}"
echo "  后端: pm2 logs bracelet-api"
echo "  cpolar: pm2 logs cpolar"
echo ""

