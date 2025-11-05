#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  NFC 手链运势小程序 - cpolar 测试环境"
echo "========================================"
echo ""

# 检查是否安装了必要的工具
echo -e "${BLUE}[检查]${NC} 检查必要工具..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[错误]${NC} 未找到 Docker，请先安装 Docker"
    echo "下载地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v cpolar &> /dev/null; then
    echo -e "${RED}[错误]${NC} 未找到 cpolar，请先安装 cpolar"
    echo "Mac 用户: brew install cpolar/tap/cpolar"
    echo "或访问: https://www.cpolar.com/"
    exit 1
fi

echo -e "${GREEN}[成功]${NC} 所有必要工具已安装"
echo ""

# 启动数据库
echo "========================================"
echo -e "${BLUE}[1/3]${NC} 启动数据库..."
echo "========================================"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}[错误]${NC} 数据库启动失败"
    exit 1
fi
echo -e "${GREEN}[成功]${NC} 数据库已启动"
sleep 3
echo ""

# 启动后端服务
echo "========================================"
echo -e "${BLUE}[2/3]${NC} 启动后端服务..."
echo "========================================"
echo -e "${YELLOW}[提示]${NC} 后端服务将在后台启动"

cd apps/api
pnpm start:dev &
BACKEND_PID=$!
cd ../..

sleep 5
echo -e "${GREEN}[成功]${NC} 后端服务已启动 (PID: $BACKEND_PID)"
echo ""

# 启动 cpolar 内网穿透
echo "========================================"
echo -e "${BLUE}[3/3]${NC} 启动 cpolar 内网穿透..."
echo "========================================"
echo -e "${YELLOW}[重要]${NC} 请从下方输出复制 HTTPS 地址！"
echo ""

cpolar http 3000 &
CPOLAR_PID=$!

sleep 3
echo ""

# 显示下一步操作
echo "========================================"
echo -e "${GREEN}  所有服务已启动！${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}[下一步操作]${NC}"
echo ""
echo "1. 从上方输出复制 HTTPS 地址"
echo "   例如: https://abc123.cpolar.cn"
echo ""
echo "2. 修改小程序配置文件:"
echo "   文件: apps/wx-app/src/api/config.ts"
echo "   第10行: PROD_BASE_URL: 'https://abc123.cpolar.cn'"
echo ""
echo "3. 关闭开发模式:"
echo "   文件: apps/wx-app/src/config/dev-scenarios.ts"
echo "   第112行: enabled: false"
echo ""
echo "4. 编译小程序:"
echo "   cd apps/wx-app"
echo "   pnpm build:mp-weixin"
echo ""
echo "5. 用微信开发者工具打开:"
echo "   目录: apps/wx-app/dist/build/mp-weixin"
echo ""
echo "6. 上传并设为体验版"
echo ""
echo "========================================"
echo -e "${BLUE}  详细教程请查看: docs/cpolar-testing-guide.md${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}[提示]${NC} 按 Ctrl+C 停止所有服务"
echo ""

# 保存 PID 到文件
echo $BACKEND_PID > .backend.pid
echo $CPOLAR_PID > .cpolar.pid

# 等待用户中断
wait

