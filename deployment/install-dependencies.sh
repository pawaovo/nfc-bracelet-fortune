#!/bin/bash

# 安装服务器依赖脚本
# 用途：自动安装所有必要的软件

echo "========================================="
echo "📦 开始安装服务器依赖..."
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 更新系统包
echo "1️⃣ 更新系统包..."
sudo apt update
echo ""

# 安装 Node.js 20.x
echo "2️⃣ 安装 Node.js 20.x..."
if ! command -v node &> /dev/null; then
    echo "正在安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
else
    echo -e "${GREEN}✅ Node.js 已安装${NC}"
fi
node --version
echo ""

# 安装 pnpm
echo "3️⃣ 安装 pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "正在安装 pnpm..."
    npm install -g pnpm
    echo -e "${GREEN}✅ pnpm 安装完成${NC}"
else
    echo -e "${GREEN}✅ pnpm 已安装${NC}"
fi
pnpm --version
echo ""

# 安装 PM2
echo "4️⃣ 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "正在安装 PM2..."
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装${NC}"
fi
pm2 --version
echo ""

# 安装 PostgreSQL 客户端（可选）
echo "5️⃣ 安装 PostgreSQL 客户端（可选）..."
if ! command -v psql &> /dev/null; then
    read -p "是否安装 PostgreSQL 客户端？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt install -y postgresql-client
        echo -e "${GREEN}✅ PostgreSQL 客户端安装完成${NC}"
    fi
else
    echo -e "${GREEN}✅ PostgreSQL 客户端已安装${NC}"
fi
echo ""

# 安装 Nginx（可选）
echo "6️⃣ 安装 Nginx（可选）..."
if ! command -v nginx &> /dev/null; then
    read -p "是否安装 Nginx？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt install -y nginx
        echo -e "${GREEN}✅ Nginx 安装完成${NC}"
    fi
else
    echo -e "${GREEN}✅ Nginx 已安装${NC}"
fi
echo ""

echo "========================================="
echo "🎉 依赖安装完成！"
echo "========================================="
echo ""
echo "📝 已安装的软件："
echo "- Node.js: $(node --version)"
echo "- npm: $(npm --version)"
echo "- pnpm: $(pnpm --version)"
echo "- PM2: $(pm2 --version)"
echo ""

