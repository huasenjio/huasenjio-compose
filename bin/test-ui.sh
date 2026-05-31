#!/bin/bash

# 测试脚本 - 演示终端美化效果

# 引入环境配置函数库
source "$(dirname "$0")/env-lib.sh"

echo ""
log_title "花森起始页 - 环境配置演示"

log_info "这是一条普通信息"
log_success "这是一条成功信息"
log_warn "这是一条警告信息"
log_error "这是一条错误信息"

log_separator

log_title "环境配置摘要"
NGINX_PORT=8081
REDIS_PASSWORD="guaiRedis233*"
MONGO_ROOT_USERNAME="root"
MONGO_APP_USERNAME="huasenjio"
show_env_summary

log_title "用户输入演示"
log_info "以下演示 30 秒超时输入功能，请在 10 秒内输入测试值，等待超时自动使用默认值"

test_value=""
prompt_with_timeout "测试提示信息" "test_value" "admin" 10

echo ""
log_success "您输入的值为: $test_value"

log_separator
log_info "演示完成！"
echo ""
