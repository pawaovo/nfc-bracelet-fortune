#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  停止 cpolar 测试环境"
echo "========================================"
echo ""

# 停止数据库
echo -e "${BLUE}[1/3]${NC} 停止数据库..."
docker-compose down
if [ $? -eq 0 ]; then
    echo -e "${GREEN}[成功]${NC} 数据库已停止"
else
    echo -e "${YELLOW}[警告]${NC} 数据库停止失败或未运行"
fi
echo ""

# 停止后端服务
echo -e "${BLUE}[2/3]${NC} 停止后端服务..."
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo -e "${GREEN}[成功]${NC} 后端服务已停止 (PID: $BACKEND_PID)"
    else
        echo -e "${YELLOW}[警告]${NC} 后端服务未运行"
    fi
    rm .backend.pid
else
    echo -e "${YELLOW}[警告]${NC} 未找到后端服务 PID 文件"
fi
echo ""

# 停止 cpolar
echo -e "${BLUE}[3/3]${NC} 停止 cpolar..."
if [ -f .cpolar.pid ]; then
    CPOLAR_PID=$(cat .cpolar.pid)
    if kill -0 $CPOLAR_PID 2>/dev/null; then
        kill $CPOLAR_PID
        echo -e "${GREEN}[成功]${NC} cpolar 已停止 (PID: $CPOLAR_PID)"
    else
        echo -e "${YELLOW}[警告]${NC} cpolar 未运行"
    fi
    rm .cpolar.pid
else
    echo -e "${YELLOW}[警告]${NC} 未找到 cpolar PID 文件"
fi
echo ""

echo "========================================"
echo -e "${GREEN}  所有服务已停止！${NC}"
echo "========================================"
echo ""

