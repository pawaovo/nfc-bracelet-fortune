#!/bin/bash

# Prisma 修复和构建脚本
# 用途：修复 Prisma Client 生成问题并构建后端

set -e  # 遇到错误立即退出

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "🔧 Prisma 修复和构建脚本"
echo "========================================="
echo ""

# ========================================
# 步骤1: 清理 Prisma Client
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 1/6: 清理 Prisma Client${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd ~/bracelet-fortune/apps/api

echo "🗑️  删除旧的 Prisma Client..."
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

echo "🗑️  清理 Prisma 缓存..."
rm -rf ~/.cache/prisma

echo -e "${GREEN}✅ Prisma Client 已清理${NC}"
echo ""

# ========================================
# 步骤2: 重新生成 Prisma Client
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 2/6: 重新生成 Prisma Client${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔄 生成 Prisma Client..."
pnpm prisma generate

echo ""
echo "🔍 验证 Prisma Client..."
if [ -f "node_modules/@prisma/client/index.d.ts" ]; then
    echo -e "${GREEN}✅ Prisma Client 生成成功${NC}"
else
    echo -e "${RED}❌ Prisma Client 生成失败${NC}"
    exit 1
fi

echo ""

# ========================================
# 步骤3: 更新数据库 Schema
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 3/6: 更新数据库 Schema${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🔄 推送 Schema 到数据库..."
pnpm prisma db push --accept-data-loss

echo -e "${GREEN}✅ 数据库 Schema 已更新${NC}"
echo ""

# ========================================
# 步骤4: 重新构建 shared-types
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 4/6: 重新构建 shared-types${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd ~/bracelet-fortune/packages/shared-types

echo "🔨 构建 shared-types..."
pnpm build

echo -e "${GREEN}✅ shared-types 构建成功${NC}"
echo ""

# ========================================
# 步骤5: 重新安装 API 依赖
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 5/6: 重新安装 API 依赖${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd ~/bracelet-fortune/apps/api

echo "📥 重新安装依赖..."
pnpm install

echo -e "${GREEN}✅ 依赖安装成功${NC}"
echo ""

# ========================================
# 步骤6: 构建后端
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 6/6: 构建后端${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 所有步骤完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}📝 下一步：${NC}"
echo "1. 启动后端服务："
echo "   pm2 restart bracelet-api || pm2 start npm --name bracelet-api -- run start:prod"
echo ""
echo "2. 查看日志："
echo "   pm2 logs bracelet-api --lines 30"
echo ""
echo "3. 测试 API："
echo "   curl http://localhost:3000/api/v1"
echo ""

