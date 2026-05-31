#!/bin/bash

# ============================================================================
# 花森起始页 - 环境配置函数库
# 提供统一的配置管理、终端美化和用户交互功能
# ============================================================================

# ────────────────────────────────────────────────────────────────────────────
# Docker Compose 版本兼容性检测
# ────────────────────────────────────────────────────────────────────────────

# 检测并设置 Docker Compose 命令
# 优先使用 docker compose (v2)，回退到 docker-compose (v1)
detect_docker_compose() {
    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    elif docker-compose --version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "[Huasen Log]：错误：未找到 docker compose 或 docker-compose 命令"
        exit 1
    fi
}

# 初始化 Docker Compose 命令（如果未设置）
if [ -z "$DOCKER_COMPOSE" ]; then
    detect_docker_compose
fi

# ────────────────────────────────────────────────────────────────────────────
# 终端颜色定义
# ────────────────────────────────────────────────────────────────────────────
COLOR_RESET="\033[0m"
COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_BLUE="\033[34m"
COLOR_CYAN="\033[36m"
COLOR_BOLD="\033[1m"

# ────────────────────────────────────────────────────────────────────────────
# 格式化输出函数
# ────────────────────────────────────────────────────────────────────────────

# 打印成功信息
log_success() {
    echo -e "${COLOR_GREEN}✓${COLOR_RESET} [Huasen Log]：$1"
}

# 打印信息
log_info() {
    echo -e "${COLOR_CYAN}▸${COLOR_RESET} [Huasen Log]：$1"
}

# 打印警告
log_warn() {
    echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} [Huasen Log]：$1"
}

# 打印错误
log_error() {
    echo -e "${COLOR_RED}✗${COLOR_RESET} [Huasen Log]：$1"
}

# 打印标题
log_title() {
    echo ""
    echo -e "${COLOR_BOLD}${COLOR_BLUE}═══════════════════════════════════════════════════════════════${COLOR_RESET}"
    echo -e "${COLOR_BOLD}${COLOR_BLUE}  $1${COLOR_RESET}"
    echo -e "${COLOR_BOLD}${COLOR_BLUE}═══════════════════════════════════════════════════════════════${COLOR_RESET}"
    echo ""
}

# 打印分隔线
log_separator() {
    echo -e "${COLOR_BLUE}───────────────────────────────────────────────────────────────${COLOR_RESET}"
}

# ────────────────────────────────────────────────────────────────────────────
# 环境配置管理函数
# ────────────────────────────────────────────────────────────────────────────

DEFAULT_GIT_REPO="https://github.com/huasenjio/huasenjio-compose.git"
DEFAULT_GITEE_REPO="https://gitee.com/huasenjio/huasenjio-compose.git"

# 加载 .env 文件
# 参数: $1 - .env 文件路径（默认为当前目录的 .env）
# 返回: 0-成功, 1-文件不存在
load_env() {
    local env_file="${1:-.env}"

    if [ -f "$env_file" ]; then
        set -a
        source "$env_file"
        set +a
        log_success "已加载环境配置文件"
        return 0
    else
        log_warn "环境配置文件不存在: $env_file"
        return 1
    fi
}

# 选择源码仓库地址
# 参数: $1 - .env 文件路径, $2 - 接收仓库地址的变量名, $3 - 超时秒数（默认30）
select_git_repo() {
    local env_file="$1"
    local target_var="$2"
    local timeout="${3:-30}"
    local git_repo="$DEFAULT_GIT_REPO"
    local gitee_repo="$DEFAULT_GITEE_REPO"
    local env_git_repo=""
    local env_gitee_repo=""
    local choice=""
    local selected_name="git"
    local selected_repo=""

    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        env_git_repo="$(sed -n 's/^GIT_REPO=//p' "$env_file" | head -n 1)"
        env_gitee_repo="$(sed -n 's/^GITEE_REPO=//p' "$env_file" | head -n 1)"

        if [ -n "$env_git_repo" ]; then
            git_repo="$env_git_repo"
        fi

        if [ -n "$env_gitee_repo" ]; then
            gitee_repo="$env_gitee_repo"
        fi

        log_success "已读取 .env 仓库配置"
    else
        log_warn "未读取到 .env 仓库配置，使用 env-lib 默认仓库地址"
    fi

    log_title "选择源码仓库"
    echo -e "  ${COLOR_BOLD}[1]${COLOR_RESET} git   ${git_repo}"
    echo -e "  ${COLOR_BOLD}[2]${COLOR_RESET} gitee ${gitee_repo}"
    echo ""
    echo -e "${COLOR_YELLOW}  提示: 30秒无输入将默认选择 [1] git${COLOR_RESET}"
    echo ""

    if read -t "$timeout" -p "$(echo -e ${COLOR_CYAN}▸${COLOR_RESET}) [Huasen Log]：请选择 git 或 gitee: " choice; then
        echo ""
    else
        choice="1"
        echo ""
        log_warn "输入超时，默认选择 [1] git"
    fi

    case "$choice" in
        2|gitee|Gitee|GITEE)
            selected_name="gitee"
            selected_repo="$gitee_repo"
            ;;
        1|git|Git|GIT|"")
            selected_name="git"
            selected_repo="$git_repo"
            ;;
        *)
            log_warn "未知选项: $choice，默认使用 git 仓库"
            selected_name="git"
            selected_repo="$git_repo"
            ;;
    esac

    printf -v "$target_var" '%s' "$selected_repo"
    log_success "已选择 ${selected_name} 仓库: ${selected_repo}"
}

# 从 Git 仓库地址中提取默认目录名
# 支持 https://host/org/repo.git、ssh://host/org/repo.git、git@host:org/repo.git
get_git_repo_name() {
    local repo_url="$1"
    local repo_name="$repo_url"

    repo_name="${repo_name%%\?*}"
    repo_name="${repo_name%%#*}"
    repo_name="${repo_name%/}"
    repo_name="${repo_name##*/}"
    repo_name="${repo_name##*:}"
    repo_name="${repo_name%.git}"

    if [ -z "$repo_name" ]; then
        log_error "无法从仓库地址解析目录名: $repo_url"
        exit 1
    fi

    printf '%s\n' "$repo_name"
}

# 保存或更新 .env 文件中的配置项
# 参数: $1 - 键名, $2 - 值, $3 - .env 文件路径（可选）
save_env() {
    local key="$1"
    local value="$2"
    local env_file="${3:-.env}"

    if [ -f "$env_file" ]; then
        if grep -q "^${key}=" "$env_file"; then
            # 更新现有条目（使用 | 作为分隔符避免与值中的 / 冲突）
            sed -i.bak "s|^${key}=.*|${key}=${value}|" "$env_file" && rm -f "${env_file}.bak"
            log_info "已更新配置项: ${key}"
        else
            # 追加新条目
            echo "${key}=${value}" >> "$env_file"
            log_info "已添加配置项: ${key}"
        fi
    else
        # 创建新文件
        echo "${key}=${value}" > "$env_file"
        log_success "已创建配置文件并添加: ${key}"
    fi
}

# 生成随机的16位AES密钥返回: 16位字母数字组合的密钥
generate_aes_key() {
    # 使用 /dev/urandom 生成随机字符串，只包含字母和数字
    cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1
}

# 初始化 .env 文件（使用默认值）
# 参数: $1 - .env 文件路径（可选）
init_env_file() {
    local env_file="${1:-.env}"

    if [ -f "$env_file" ]; then
        log_info "环境配置文件已存在，跳过初始化"
        return 0
    fi

    log_info "正在创建默认环境配置文件..."

    cat > "$env_file" <<'EOF'
# ============================================================================
# 花森起始页 - 环境配置文件示例
# 复制此文件为 .env 并根据实际情况修改
# ============================================================================

# Nginx 网关端口（宿主机端口）
# 建议范围: 1024-65535，避免与其他服务冲突
NGINX_PORT=8081

# Redis 密码，用于 Redis 服务认证
REDIS_PASSWORD=Redis12345*

# MongoDB Root 管理员账号
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=Mongo12345*

# MongoDB 应用账号，用于后端服务连接数据库
MONGO_APP_USERNAME=huasenjio
MONGO_APP_PASSWORD=Mongo12345*

# 邮箱服务配置
SMTP_QQ_USER=your@qq.com
SMTP_QQ_MTP=your_qq_mtp
SMTP_WY_USER=your@163.com
SMTP_WY_MTP=your_wy_mtp

# 对称密钥（AES加密），密钥格式：16位字母/数字组合，用于加密存储，后续不可修改
AES_SECRET_KEY=dj38Ca8F8hag23nD
AES_SECRET_IV=k4h9HdcXmEr83nsF

LICENSE_SIGN_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzH0FRO+VGZ+HWEk2lvY9\nkia0iuZjpE3BRMD4kSZHq28fxJaltHyQDqf2q5iew1hs8bQs7tmhAfax0nl5P26o\nzWyUdmdDWdVD/de3p63NBil1Mo4B0OFeoqqQ5iPcfoJfxUZ4yvozO0Uj3sbHu1Xj\nYjPPt3wA8BW8rj/4ExuHP2noLQTvQtHOyJCCJHszO82wkwjyYKdXm09WsYPkoBQN\nVIlhga5yFa5Kzvu2d3beOxIENH4BqY5UC4N5Y2da4SE0CdCKuhB/cT4BbYNlzCBy\nDF0cbQkfYCWiwDkDGvAEJn65mt1f2rGILe4xoI7ppm44ejYecoz5AMasPVaA8V6H\nqwIDAQAB\n-----END PUBLIC KEY-----\n

# 源码仓库地址
EOF

    {
        echo "GIT_REPO=${DEFAULT_GIT_REPO}"
        echo "GITEE_REPO=${DEFAULT_GITEE_REPO}"
    } >> "$env_file"

    cat >> "$env_file" <<'EOF'

# ============================================================================
# 注意事项:
# 1. 修改端口后需要重启容器: docker-compose restart
# 2. 修改数据库密码需要重建容器和数据卷，请谨慎操作
# 3. 修改对称密钥后，已加密的数据将无法解密，请谨慎操作
# 4. 此文件包含敏感信息，请勿提交到版本控制系统
# ============================================================================
EOF

    log_success "环境配置文件创建成功: $env_file"
}

# 带超时的用户输入提示
# 参数: $1 - 提示信息, $2 - 变量名, $3 - 默认值, $4 - 超时秒数（默认30）
# 返回: 0-用户输入了值, 1-用户直接回车使用默认值, 2-超时使用默认值
prompt_with_timeout() {
    local prompt_msg="$1"
    local var_name="$2"
    local default_value="$3"
    local timeout="${4:-30}"
    local user_input=""

    echo ""
    log_info "$prompt_msg"
    echo -e "${COLOR_CYAN} 当前默认值: ${COLOR_BOLD}$default_value${COLOR_RESET}，直接回车使用默认值，${timeout}秒无输入将自动使用默认值${COLOR_RESET}"
    echo ""

    if read -t "$timeout" -p "$(echo -e ${COLOR_CYAN}▸${COLOR_RESET}) [Huasen Log]：请输入新值: " user_input; then
        if [ -n "$user_input" ]; then
            eval "$var_name='$user_input'"
            log_success "已设置为: $user_input"
            return 0
        else
            eval "$var_name='$default_value'"
            log_info "使用默认值: $default_value"
            return 1
        fi
    else
        eval "$var_name='$default_value'"
        echo ""
        log_warn "输入超时，自动使用默认值: $default_value"
        return 2
    fi
}

# 同步环境变量到所有配置文件
# 参数: $1 - 项目根目录路径
sync_config_files() {
    local project_root="$1"

    log_title "同步配置文件"

    # 所有配置都通过 docker-compose.yml 和 .env 文件自动读取
    log_info "  ● Nginx 端口: $NGINX_PORT"
    log_info "  ● Redis 密码: ${REDIS_PASSWORD:0:3}***"
    log_info "  ● Mongo Root: $MONGO_ROOT_USERNAME"
    log_info "  ● Mongo User: $MONGO_APP_USERNAME"
    log_info "  ● AES 密钥: ${AES_SECRET_KEY:0:4}***"
    log_info "  ● AES 向量: ${AES_SECRET_IV:0:4}***"

    log_separator
    log_success "所有配置文件同步完成（无需手动同步）"
}

# 显示当前环境配置摘要
show_env_summary() {
    log_title "当前环境配置"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} Nginx 端口:        ${COLOR_BOLD}$NGINX_PORT${COLOR_RESET}"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} Redis 密码:        ${COLOR_BOLD}${REDIS_PASSWORD:0:3}***${COLOR_RESET}"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} Mongo Root 用户:   ${COLOR_BOLD}$MONGO_ROOT_USERNAME${COLOR_RESET}"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} Mongo User 用户:   ${COLOR_BOLD}$MONGO_APP_USERNAME${COLOR_RESET}"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} AES 密钥:          ${COLOR_BOLD}${AES_SECRET_KEY:0:4}***${COLOR_RESET}"
    echo -e "  ${COLOR_CYAN}●${COLOR_RESET} AES 向量:          ${COLOR_BOLD}${AES_SECRET_IV:0:4}***${COLOR_RESET}"
    log_separator
}
