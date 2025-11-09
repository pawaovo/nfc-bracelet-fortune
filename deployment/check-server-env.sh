#!/bin/bash

# 服务器环境检查脚本
# 用途：检查服务器是否满足部署要求

echo "========================================="
echo "🔍 开始检查服务器环境..."
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安装${NC}"
        $1 --version 2>&1 | head -n 1
        return 0
    else
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    fi
}

# 检查版本
check_version() {
    local cmd=$1
    local required=$2
    local current=$($cmd --version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -n 1)
    
    if [ -z "$current" ]; then
        echo -e "${RED}❌ 无法获取 $cmd 版本${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ $cmd 版本: $current${NC}"
    return 0
}

echo "1️⃣ 检查 Node.js..."
if check_command node; then
    check_version node "18.0.0"
else
    echo -e "${YELLOW}⚠️  需要安装 Node.js >= 18.0.0${NC}"
fi
echo ""

echo "2️⃣ 检查 npm..."
check_command npm
echo ""

echo "3️⃣ 检查 pnpm..."
if ! check_command pnpm; then
    echo -e "${YELLOW}⚠️  需要安装 pnpm${NC}"
fi
echo ""

echo "4️⃣ 检查 PM2..."
if ! check_command pm2; then
    echo -e "${YELLOW}⚠️  需要安装 PM2（用于进程管理）${NC}"
fi
echo ""

echo "5️⃣ 检查 Nginx..."
if ! check_command nginx; then
    echo -e "${YELLOW}⚠️  需要安装 Nginx（可选，用于反向代理）${NC}"
fi
echo ""

echo "6️⃣ 检查数据库连接..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL 客户端已安装${NC}"
    
    # 测试数据库连接
    echo "测试数据库连接..."
    PGPASSWORD="HvXFmwEwfntnScWZRJyB" psql -h 1Panel-postgresql-0i7g -p 5432 -U bracelet-fortune -d bracelet-fortune -c "SELECT version();" &> /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库连接成功${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        echo "尝试使用外部地址连接..."
        PGPASSWORD="HvXFmwEwfntnScWZRJyB" psql -h 47.239.179.9 -p 15432 -U bracelet-fortune -d bracelet-fortune -c "SELECT version();" &> /dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 外部数据库连接成功${NC}"
        else
            echo -e "${RED}❌ 外部数据库连接也失败${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL 客户端未安装（可选）${NC}"
fi
echo ""

echo "7️⃣ 检查磁盘空间..."
df -h / | tail -n 1
echo ""

echo "8️⃣ 检查内存..."
free -h
echo ""

echo "9️⃣ 检查端口占用..."
echo "检查 3000 端口（后端API）..."
if lsof -i:3000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  端口 3000 已被占用${NC}"
    lsof -i:3000
else
    echo -e "${GREEN}✅ 端口 3000 可用${NC}"
fi
echo ""

echo "========================================="
echo "🎉 环境检查完成！"
echo "========================================="
echo ""
echo "📝 下一步："
echo "1. 如果有缺失的软件，请先安装"
echo "2. 运行部署脚本"
echo ""

