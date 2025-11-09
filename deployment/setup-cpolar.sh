#!/bin/bash

# cpolar 安装和配置脚本
# 用途：安装cpolar并配置内网穿透

echo "========================================="
echo "🌐 开始安装和配置 cpolar..."
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查是否已安装
if command -v cpolar &> /dev/null; then
    echo -e "${GREEN}✅ cpolar 已安装${NC}"
    cpolar version
else
    echo "1️⃣ 下载并安装 cpolar..."
    curl -L https://www.cpolar.com/static/downloads/install-release-cpolar.sh | sudo bash
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ cpolar 安装完成${NC}"
    else
        echo -e "${RED}❌ cpolar 安装失败${NC}"
        exit 1
    fi
fi
echo ""

echo "2️⃣ 配置 cpolar authtoken..."

# 预设的 authtoken（如果已知）
DEFAULT_TOKEN="MjU0NTFiYmItM2Y0Ni00NzU0LTlmNGEtZTg5ZjkyMDA3ZDM4"

echo -e "${GREEN}✅ 使用预设的 authtoken${NC}"
CPOLAR_TOKEN="$DEFAULT_TOKEN"

# 如果需要手动输入，取消下面的注释
# echo -e "${YELLOW}⚠️  请先注册 cpolar 账号${NC}"
# echo ""
# echo "📝 注册步骤："
# echo "1. 访问：https://dashboard.cpolar.com/signup"
# echo "2. 注册账号（免费）"
# echo "3. 登录后，在首页找到 'Your Authtoken'"
# echo "4. 复制 authtoken"
# echo ""
# read -p "请输入你的 cpolar authtoken (直接回车使用默认): " INPUT_TOKEN
# if [ ! -z "$INPUT_TOKEN" ]; then
#     CPOLAR_TOKEN="$INPUT_TOKEN"
# fi

if [ -z "$CPOLAR_TOKEN" ]; then
    echo -e "${RED}❌ authtoken 不能为空${NC}"
    exit 1
fi

cpolar authtoken "$CPOLAR_TOKEN"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ authtoken 配置成功${NC}"
else
    echo -e "${RED}❌ authtoken 配置失败${NC}"
    exit 1
fi
echo ""

echo "3️⃣ 创建 cpolar 配置文件..."
mkdir -p ~/.cpolar

cat > ~/.cpolar/cpolar.yml << 'EOF'
# cpolar 配置文件
version: "2"
authtoken: YOUR_TOKEN_HERE
region: cn
tunnels:
  bracelet-api:
    proto: http
    addr: 3000
    inspect: false
EOF

# 替换 authtoken
sed -i "s/YOUR_TOKEN_HERE/$CPOLAR_TOKEN/g" ~/.cpolar/cpolar.yml

echo -e "${GREEN}✅ 配置文件创建完成${NC}"
echo ""

echo "4️⃣ 创建 systemd 服务（开机自启）..."
sudo tee /etc/systemd/system/cpolar.service > /dev/null << EOF
[Unit]
Description=Cpolar Tunnel Service
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/cpolar start bracelet-api
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ systemd 服务创建完成${NC}"
echo ""

echo "5️⃣ 启动 cpolar 服务..."
sudo systemctl daemon-reload
sudo systemctl enable cpolar
sudo systemctl start cpolar

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ cpolar 服务启动成功${NC}"
else
    echo -e "${RED}❌ cpolar 服务启动失败${NC}"
    exit 1
fi
echo ""

echo "6️⃣ 等待 cpolar 启动（5秒）..."
sleep 5
echo ""

echo "7️⃣ 获取公网地址..."
echo -e "${BLUE}正在获取 cpolar 生成的公网地址...${NC}"
echo ""

# 尝试从 cpolar status 获取地址
CPOLAR_URL=$(cpolar status 2>/dev/null | grep -oP 'https://[a-z0-9]+\.r\d+\.cpolar\.(top|cn)' | head -n 1)

if [ -z "$CPOLAR_URL" ]; then
    echo -e "${YELLOW}⚠️  无法自动获取地址，请手动查看${NC}"
    echo ""
    echo "运行以下命令查看地址："
    echo "  cpolar status"
    echo ""
    echo "或访问 cpolar 控制台："
    echo "  https://dashboard.cpolar.com/status"
else
    echo -e "${GREEN}✅ 获取到公网地址：${NC}"
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🌐 你的 API 公网地址：${NC}"
    echo -e "${YELLOW}   $CPOLAR_URL${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 保存地址到文件
    echo "$CPOLAR_URL" > ~/cpolar-url.txt
    echo -e "${GREEN}✅ 地址已保存到: ~/cpolar-url.txt${NC}"
fi
echo ""

echo "========================================="
echo "🎉 cpolar 配置完成！"
echo "========================================="
echo ""
echo "📝 重要信息："
echo "1. cpolar 已设置为开机自启"
echo "2. 服务名称: cpolar"
echo ""
echo "📋 常用命令："
echo "- 查看状态: sudo systemctl status cpolar"
echo "- 查看地址: cpolar status"
echo "- 查看日志: sudo journalctl -u cpolar -f"
echo "- 重启服务: sudo systemctl restart cpolar"
echo "- 停止服务: sudo systemctl stop cpolar"
echo ""
echo "🌐 在线控制台："
echo "https://dashboard.cpolar.com/status"
echo ""
echo "⚠️  免费版注意事项："
echo "- 地址每天会变化"
echo "- 需要每天更新小程序配置"
echo "- 升级付费版可获得固定地址（9元/月）"
echo ""

