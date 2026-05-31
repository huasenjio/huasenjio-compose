#!/bin/bash

# 开启报错时中断
set -e
sh_path=$(cd $(dirname "$0") && pwd)
# 根目录的绝对路径
projectPath=$sh_path"/.."
# 引入环境配置函数库
source "$sh_path/env-lib.sh"
# 远程仓库地址
gitStoragePath="$DEFAULT_GIT_REPO"
# 远程仓库名称
gitStorageName="$(get_git_repo_name "$gitStoragePath")"
# 缓存目录
tempPath=$sh_path"/../../huasen-temp"

# 系统类型变量
OS_TYPE=""
OS_VERSION=""
# 是否拉取最新代码
PULL_CODE=true

# 解析命令行参数
for arg in "$@"; do
    case "$arg" in
        --no-pull|-n)
            PULL_CODE=false
            ;;
        *)
            echo "[Huasen Log]：未知参数: $arg"
            echo "[Huasen Log]：用法: $0 [--no-pull|-n]"
            echo "[Huasen Log]：--no-pull、-n 跳过拉取，直接使用 $tempPath/$gitStorageName 下的现有代码工程"
            exit 1
            ;;
    esac
done

if [ "$(id -u)" != "0" ]; then
    echo "[Huasen Log]：请以root用户运行脚本，避免权限不足产生异常问题！"
    exit 1
fi

echo '[Huasen Log]：正在检测操作系统环境...'
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "[Huasen Log]：无法检测操作系统类型，已停止脚本执行！"
    exit 1
fi

# 定义包管理器行为
case "$OS" in
    centos|rhel|almalinux|rocky|opencloudos)
        PM="yum"
        PM_INSTALL="yum install -y"
        PM_REMOVE="yum remove -y"
        FAMILY="el"
        ;;
    ubuntu|debian)
        PM="apt-get"
        PM_INSTALL="apt-get install -y"
        PM_REMOVE="apt-get remove -y"
        FAMILY="debian"
        ;;
    *)
        echo "[Huasen Log]：不支持的操作系统: $OS"
        exit 1
        ;;
esac
echo "[Huasen Log]：检测到系统: $OS $VERSION (Family: $FAMILY)"

install_dependencies() {
    echo "[Huasen Log]：正在检查并安装依赖工具..."

    if ! command -v rsync &> /dev/null; then
        echo "[Huasen Log]：正在安装 Rsync..."
        $PM_INSTALL rsync
    fi
}

configure_git_repo() {
    select_git_repo "$projectPath/.env" "gitStoragePath" 30
    gitStorageName="$(get_git_repo_name "$gitStoragePath")"
    log_info "源码缓存目录名: $gitStorageName"
}

prepare_env_config() {
    log_title "准备环境配置"

    local env_file="$projectPath/.env"

    # 如果 .env 存在，直接加载
    if [ -f "$env_file" ]; then
        load_env "$env_file"
        show_env_summary
    else
        # .env 不存在，创建默认配置
        log_warn "未找到 .env 文件，正在创建默认配置..."
        init_env_file "$env_file"
        load_env "$env_file"

        log_separator
        log_warn "已创建默认 .env 配置文件，升级完成后，请根据实际情况修改 .env 文件中的配置，然后手动重启容器：$DOCKER_COMPOSE restart"
        show_env_summary
    fi
}

ask_update_env() {
    log_title "环境配置更新"

    echo -e "${COLOR_CYAN}是否需要更新环境配置（nginx端口、Redis、数据库等）？${COLOR_RESET}"
    echo ""
    echo -e "  ${COLOR_BOLD}[1]${COLOR_RESET} 是，保持当前配置"
    echo -e "  ${COLOR_BOLD}[2]${COLOR_RESET} 否，重置环境变量"
    echo ""
    echo -e "${COLOR_YELLOW}  提示: 30秒无输入将默认选择 [1]${COLOR_RESET}"
    echo ""

    local choice=""
    if read -t 30 -p "$(echo -e ${COLOR_CYAN}▸${COLOR_RESET}) [Huasen Log]：请选择: " choice; then
        echo ""
    else
        choice="1"
        echo ""
        log_warn "输入超时，默认选择 [1] 保持当前配置"
    fi

    case "$choice" in
        2)
            log_separator
            log_info "开始配置环境变量..."
            echo ""

            # Nginx 端口
            local new_port=""
            prompt_with_timeout "是否修改 Nginx 端口？" "new_port" "$NGINX_PORT" 30
            NGINX_PORT="$new_port"
            save_env "NGINX_PORT" "$NGINX_PORT" "$projectPath/.env"

            echo ""
            log_separator

            # Redis 和 Mongo 密码提示
            log_warn "为保障应用正常运行，如需重新配置Redis或Mongo数据库，请手动编辑 .env 文件，注意：修改数据库密码需要重建容器和数据卷。"
            log_warn ""

            echo ""
            log_separator
            log_success "环境配置更新完成"
            ;;
        *)
            log_info "保持当前环境配置不变"
            ;;
    esac
}

apply_env_config() {
    log_title "应用环境配置"

    # 恢复备份的 .env
    if [ -f "$tempPath/.env.backup" ]; then
        cp "$tempPath/.env.backup" "$projectPath/.env"
        log_success "已恢复 .env 配置文件"
        rm -f "$tempPath/.env.backup"
    else
        # 如果没有备份，使用内存中的配置重新生成
        log_warn "未找到 .env 备份，使用内存配置重新生成..."
        save_env "NGINX_PORT" "$NGINX_PORT" "$projectPath/.env"
        save_env "REDIS_PASSWORD" "$REDIS_PASSWORD" "$projectPath/.env"
        save_env "MONGO_ROOT_USERNAME" "$MONGO_ROOT_USERNAME" "$projectPath/.env"
        save_env "MONGO_ROOT_PASSWORD" "$MONGO_ROOT_PASSWORD" "$projectPath/.env"
        save_env "MONGO_APP_USERNAME" "$MONGO_APP_USERNAME" "$projectPath/.env"
        save_env "MONGO_APP_PASSWORD" "$MONGO_APP_PASSWORD" "$projectPath/.env"
    fi

    # 重新加载 .env（可能在 upgrade_and_restore 后被覆盖）
    load_env "$projectPath/.env"

    # 同步所有配置文件
    sync_config_files "$projectPath"
}

run_backup_script() {
    echo '[Huasen Log]：正在备份数据...'
    $sh_path/backup.sh
}

init_cache_dir() {
    echo "[Huasen Log]：正在初始化缓存目录 $tempPath"
    if [ ! -d $tempPath ]; then mkdir $tempPath; fi
    if [ "$PULL_CODE" = true ]; then
        if [ ! -d $tempPath/$gitStorageName ]; then
            echo '[Huasen Log]：未发现本地缓存源码'
        else
            echo '[Huasen Log]：正在删除本地缓存源码...'
            rm -rf $tempPath/$gitStorageName
        fi
    else
        if [ ! -d $tempPath/$gitStorageName ]; then
            echo "[Huasen Log]：未找到 $tempPath/$gitStorageName，--no-pull 模式下必须存在本地缓存源码，已停止执行！"
            exit 1
        fi
        echo "[Huasen Log]：跳过拉取，使用现有缓存源码 $tempPath/$gitStorageName"
    fi
}

pull_latest_code() {
    if [ "$PULL_CODE" = true ]; then
        echo '[Huasen Log]：正在拉取最新源码...'
        cd $tempPath
        git clone "$gitStoragePath" "$gitStorageName"
    else
        echo '[Huasen Log]：已跳过拉取源码'
    fi
}

cleanup_docker_containers() {
    echo '[Huasen Log]：正在清理 docker 容器...'
    cd $projectPath
    $DOCKER_COMPOSE down
}

backup_data_files() {
    echo '[Huasen Log]：正在备份数据及文件...'

    # 临时备份 .env 到安全位置
    if [ -f "$projectPath/.env" ]; then
        cp "$projectPath/.env" "$tempPath/.env.backup"
        echo '[Huasen Log]：已临时备份 .env 到缓存目录'
    fi

    # 关闭报错时中断
    set +e
    find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" -delete
    # 保留bin目录，但是删除bin下所有脚本文件
    find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
    # 开启报错时中断
    set -e
}

upgrade_and_restore() {
    echo '[Huasen Log]：升级程序及恢复数据...'
    cd $tempPath/$gitStorageName
    rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-store" --exclude="huasen-server/setting.json" --exclude=".env" ./ $projectPath
    # 合并静态资源
    set +e
    cp -frap $tempPath/$gitStorageName/huasen-store/* $projectPath/huasen-store/
    set -e
}

set_execute_permissions() {
    echo '[Huasen Log]：正在为bin目录下快捷脚本设置可执行权限...'
    chmod u+x $projectPath/bin/*
}

restart_program() {
    echo '[Huasen Log]：正在重启程序...'
    cd $projectPath
    # 构建镜像
    $DOCKER_COMPOSE build server
    # 重启容器
    $DOCKER_COMPOSE up -d
    # 清理废弃的数据卷和镜像
    docker image prune -f
    docker volume prune -f
    echo "[Huasen Log]：升级程序成功..."
}

main() {
    install_dependencies
    configure_git_repo
    run_backup_script
    init_cache_dir
    prepare_env_config
    ask_update_env
    pull_latest_code
    cleanup_docker_containers
    backup_data_files
    upgrade_and_restore
    set_execute_permissions
    apply_env_config
    restart_program
}

# 执行主函数
main
