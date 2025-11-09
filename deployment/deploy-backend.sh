#!/bin/bash

# 后端部署脚本
# 用途：部署NestJS后端API到服务器

echo "========================================="
echo "🚀 开始部署后端API..."
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置变量
PROJECT_DIR="$HOME/bracelet-fortune"
API_DIR="$PROJECT_DIR/apps/api"

# 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在: $PROJECT_DIR${NC}"
    echo "请先上传项目代码到服务器"
    exit 1
fi

echo "1️⃣ 进入项目目录..."
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ 当前目录: $(pwd)${NC}"
echo ""

echo "2️⃣ 安装依赖..."
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

echo "3️⃣ 生成 Prisma 客户端..."
cd "$API_DIR"
pnpm prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Prisma 客户端生成失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma 客户端生成完成${NC}"
echo ""

echo "4️⃣ 运行数据库迁移..."
pnpm prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  数据库迁移失败，可能需要手动处理${NC}"
    echo "继续部署..."
fi
echo ""

echo "5️⃣ 编译后端代码..."
cd "$API_DIR"
pnpm build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 代码编译失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 代码编译完成${NC}"
echo ""

echo "6️⃣ 停止旧的服务（如果存在）..."
pm2 stop bracelet-api 2>/dev/null || true
pm2 delete bracelet-api 2>/dev/null || true
echo ""

echo "7️⃣ 启动新服务..."
cd "$API_DIR"
pm2 start dist/main.js --name bracelet-api --env production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服务启动成功${NC}"
else
    echo -e "${RED}❌ 服务启动失败${NC}"
    exit 1
fi
echo ""

echo "9️⃣ 设置 PM2 开机自启..."
pm2 save
pm2 startup | tail -n 1 | bash
echo ""

echo "🔟 查看服务状态..."
pm2 status
echo ""

echo "========================================="
echo "🎉 后端部署完成！"
echo "========================================="
echo ""
echo "📝 服务信息："
echo "- 服务名称: bracelet-api"
echo "- 运行端口: 3000"
echo "- 运行目录: $API_DIR"
echo ""
echo "📋 常用命令："
echo "- 查看日志: pm2 logs bracelet-api"
echo "- 重启服务: pm2 restart bracelet-api"
echo "- 停止服务: pm2 stop bracelet-api"
echo "- 查看状态: pm2 status"
echo ""
echo "🔍 测试API："
echo "curl http://localhost:3000"
echo ""

