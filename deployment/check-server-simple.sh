#!/bin/bash

# ========================================
# 服务器端状态检查脚本（无需sudo）
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
title() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

title "📋 服务器端状态检查（普通用户版）"

# ========================================
# 1. 基本信息
# ========================================
title "1️⃣ 服务器基本信息"

info "主机名: $(hostname)"
info "系统: $(uname -s) $(uname -r)"
info "当前用户: $(whoami)"
info "当前目录: $(pwd)"

# ========================================
# 2. 检查Docker容器（PostgreSQL）
# ========================================
title "2️⃣ 检查PostgreSQL数据库"

if command -v docker &> /dev/null; then
    success "Docker命令可用"
    
    # 检查PostgreSQL容器
    if docker ps 2>/dev/null | grep -q "postgresql"; then
        CONTAINER_NAME=$(docker ps 2>/dev/null | grep "postgresql" | awk '{print $NF}')
        success "PostgreSQL容器运行中: $CONTAINER_NAME"
        
        # 尝试连接数据库检查表结构
        info "检查users表结构..."
        HAS_USERNAME=$(docker exec $CONTAINER_NAME psql -U bracelet-fortune -d bracelet-fortune -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='username';" 2>/dev/null | xargs)
        HAS_PASSWORD=$(docker exec $CONTAINER_NAME psql -U bracelet-fortune -d bracelet-fortune -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='password';" 2>/dev/null | xargs)
        
        if [ "$HAS_USERNAME" = "username" ]; then
            success "users表包含username字段"
        else
            error "users表缺少username字段 - 需要执行数据库迁移"
        fi
        
        if [ "$HAS_PASSWORD" = "password" ]; then
            success "users表包含password字段"
        else
            error "users表缺少password字段 - 需要执行数据库迁移"
        fi
    else
        warning "无法查看PostgreSQL容器（可能需要权限）"
        info "请管理员确认PostgreSQL容器状态"
    fi
else
    warning "Docker命令不可用"
fi

# ========================================
# 3. 检查后端项目
# ========================================
title "3️⃣ 检查后端项目"

if [ -d "$HOME/bracelet-fortune/apps/api" ]; then
    success "后端项目目录存在: $HOME/bracelet-fortune/apps/api"
    
    # 检查关键文件
    if [ -f "$HOME/bracelet-fortune/apps/api/package.json" ]; then
        success "package.json存在"
    fi
    
    if [ -f "$HOME/bracelet-fortune/apps/api/.env" ]; then
        success ".env配置文件存在"
        
        # 检查DATABASE_URL配置
        if grep -q "DATABASE_URL" "$HOME/bracelet-fortune/apps/api/.env"; then
            info "DATABASE_URL已配置"
        else
            warning "DATABASE_URL未配置"
        fi
    else
        error ".env配置文件不存在"
    fi
    
    # 检查node_modules
    if [ -d "$HOME/bracelet-fortune/apps/api/node_modules" ]; then
        success "依赖已安装"
    else
        warning "依赖未安装，需要运行: pnpm install"
    fi
else
    error "后端项目目录不存在: $HOME/bracelet-fortune/apps/api"
fi

# ========================================
# 4. 检查PM2进程
# ========================================
title "4️⃣ 检查后端API进程"

if command -v pm2 &> /dev/null; then
    success "PM2已安装"
    
    # 检查后端进程
    if pm2 list 2>/dev/null | grep -q "bracelet-api"; then
        PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"pm2_env":{"status":"[^"]*"' | grep -o 'status":"[^"]*"' | cut -d'"' -f3)
        if [ "$PM2_STATUS" = "online" ]; then
            success "后端API运行中 (状态: online)"
        else
            warning "后端API状态: $PM2_STATUS"
        fi
        
        # 显示PM2列表
        echo ""
        pm2 list
    else
        warning "未找到bracelet-api进程"
        info "可用的PM2进程:"
        pm2 list
    fi
else
    warning "PM2未安装"
fi

# ========================================
# 5. 测试API响应
# ========================================
title "5️⃣ 测试API响应"

info "测试本地API..."
API_RESPONSE=$(curl -s http://localhost:3000/api/v1 2>/dev/null)
if [ -n "$API_RESPONSE" ]; then
    success "API响应正常: $API_RESPONSE"
else
    error "API无响应 (http://localhost:3000/api/v1)"
fi

# ========================================
# 6. 检查H5部署目录
# ========================================
title "6️⃣ 检查H5部署目录"

H5_DIR="$HOME/h5-web"
if [ -d "$H5_DIR" ]; then
    if [ -f "$H5_DIR/index.html" ]; then
        success "H5部署目录存在且包含index.html"
        
        FILE_COUNT=$(find "$H5_DIR" -type f | wc -l)
        info "文件数量: $FILE_COUNT"
        
        DIR_SIZE=$(du -sh "$H5_DIR" 2>/dev/null | awk '{print $1}')
        info "目录大小: $DIR_SIZE"
        
        LAST_MODIFIED=$(stat -c %y "$H5_DIR/index.html" 2>/dev/null)
        info "最后更新: $LAST_MODIFIED"
    else
        warning "H5部署目录存在但缺少index.html"
    fi
else
    warning "H5部署目录不存在: $H5_DIR"
    info "需要创建目录并上传H5文件"
fi

# ========================================
# 7. 生成待办事项
# ========================================
title "📊 检查报告汇总"

echo ""
TODOS=()

if [ "$HAS_USERNAME" != "username" ] || [ "$HAS_PASSWORD" != "password" ]; then
    TODOS+=("执行数据库迁移: cd ~/bracelet-fortune/apps/api && pnpm prisma migrate deploy")
fi

if [ "$PM2_STATUS" != "online" ]; then
    TODOS+=("启动/重启后端API: pm2 restart bracelet-api")
fi

if [ ! -d "$H5_DIR" ] || [ ! -f "$H5_DIR/index.html" ]; then
    TODOS+=("上传H5文件到: $H5_DIR")
fi

if [ ${#TODOS[@]} -eq 0 ]; then
    success "✨ 所有服务器端准备工作已完成！"
    info ""
    info "下一步: 在1Panel中部署静态网站"
    info "1. 访问 http://47.239.179.9:8090"
    info "2. 创建静态网站，指向目录: $H5_DIR"
else
    warning "还有 ${#TODOS[@]} 项待办事项:"
    for i in "${!TODOS[@]}"; do
        echo "  $((i+1)). ${TODOS[$i]}"
    done
fi

echo ""

