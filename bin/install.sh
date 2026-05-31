#!/bin/bash

# 开启报错时中断
set -e
# 部署路径
project_path=$(cd "$(dirname "$0")" && pwd)
# 引入环境配置函数库
source "$project_path/env-lib.sh"

# git 仓库
git_path="$DEFAULT_GIT_REPO"
git_name="$(get_git_repo_name "$git_path")"

# docker 镜像文件及镜像源
daemon_file="/etc/docker/daemon.json"
mirror1="https://docker.m.daocloud.io"
mirror2="https://dockerproxy.com"
mirror3="https://registry.docker-cn.com"

docker_compose_url="https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)"
docker_compose_path="/usr/local/bin/docker-compose"

echo '[Huasen Log]：脚本仅支持 CentOS 7/8、OpenCloudOS 9.x、Debian 12、Ubuntu 22，并且请确保 80（nginx）、37017（mongodb）、7379（redis）、3000（服务）、8181（websocket） 端口不被占用，如出现问题，请添加微信：huasencc，加入社群寻求帮助...'

# 系统类型变量
OS_TYPE=""
OS_VERSION=""

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

prepare_environment() {
    echo '[Huasen Log]：正在更新软件源并安装基础工具...'
    
    if [ "$FAMILY" = "el" ]; then
        $PM_INSTALL curl git
        # 仅针对 CentOS 7 进行源替换，CentOS 8/OpenCloudOS 保持系统默认或用户自行配置
        if [ "$OS" = "centos" ] && [ "${VERSION:0:1}" = "7" ]; then
            curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
        fi
        
    elif [ "$FAMILY" = "debian" ]; then
        $PM update -y
        $PM_INSTALL curl git gnupg lsb-release ca-certificates
    fi
}

install_git() {
    echo '[Huasen Log]：检查 Git 环境...'
    if command -v git >/dev/null 2>&1; then
        echo '[Huasen Log]：Git 已存在'
    else
        echo '[Huasen Log]：正在安装 Git...'
        $PM_INSTALL git
    fi
    git version
}

install_docker() {
    echo '[Huasen Log]：检查 Docker 环境...'
    if command -v docker >/dev/null 2>&1; then
        echo '[Huasen Log]：Docker 已存在'
        return
    fi
    
    $PM_REMOVE docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine || true

    echo '[Huasen Log]：正在安装 Docker...'
    if [ "$FAMILY" = "el" ]; then
        if [ "$OS" = "opencloudos" ]; then
            echo "[Huasen Log]：OpenCloudOS 9.x 跳过镜像源替换"
            $PM makecache
            $PM_INSTALL docker-ce docker-ce-cli containerd.io
        elif [ "${VERSION:0:1}" = "7" ]; then
            curl -o /etc/yum.repos.d/docker-ce.repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
            $PM makecache
            $PM_INSTALL "device-mapper-persistent-data"
            $PM_INSTALL "lvm2"
            $PM_INSTALL "docker-ce"
        elif [ "${VERSION:0:1}" = "8" ]; then
            echo "[Huasen Log]：请选择腾讯云的 Docker CE 源，不要使用阿里云，因为出现报错：Cannot download Packages/containerd.io-1.6.32-3.1.el8.x86_64.rpm: All mirrors were tried，导致 docker 安装失败！"
            bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
        fi
    elif [ "$FAMILY" = "debian" ]; then
        curl -fsSL "https://get.docker.com" -o get-docker.sh
        chmod u+x get-docker.sh
        sh get-docker.sh --mirror Aliyun
    fi

    sleep 3
    systemctl start docker
    systemctl enable docker
    chmod a+rw /var/run/docker.sock
    docker version
}

configure_docker() {
    if [ ! -f "$daemon_file" ]; then
        mkdir -p /etc/docker
        echo '{"registry-mirrors":["'$mirror1'","'$mirror2'","'$mirror3'"],"ipv6":false}' > $daemon_file
        echo "[Huasen Log]：已创建 $daemon_file 并添加镜像源"
    else
        if grep -q "$mirror1" "$daemon_file" && grep -q "$mirror2" "$daemon_file" && grep -q "$mirror3" "$daemon_file"; then
            echo "[Huasen Log]：镜像源已配置"
        else
            echo "[Huasen Log]：检测到 /etc/docker/daemon.json 存在但未包含默认镜像源，为保证安全不自动修改，如果拉取 docker 镜像失败，请手动检查并更改为可用镜像源。"
        fi
    fi
    systemctl daemon-reload
    systemctl restart docker
}

install_docker_compose() {
    if docker-compose --version >/dev/null 2>&1; then
        echo "[Huasen Log]：docker-compose 已存在"
        docker-compose --version
    else
        echo "[Huasen Log]：删除 docker-compose 程序文件..."
        rm -f "$docker_compose_path"
    fi

    echo '[Huasen Log]：安装 docker-compose 程序...'
    if [ ! -f "$docker_compose_path" ]; then
        echo "[Huasen Log]：正在下载 docker-compose..."
        if curl -L "$docker_compose_url" -o "$docker_compose_path"; then
            chmod +x "$docker_compose_path"
            echo "[Huasen Log]：docker-compose 下载完成"
        else
            echo "[Huasen Log]：下载 docker-compose 失败"
            exit 1
        fi
    else
        echo "[Huasen Log]：docker-compose 已存在"
    fi

    if [ ! -L "/usr/bin/docker-compose" ]; then
        ln -s "$docker_compose_path" /usr/bin/docker-compose
        echo "[Huasen Log]：Symbolic link /usr/bin/docker-compose has been created"
    else
        echo "[Huasen Log]：Symbolic link /usr/bin/docker-compose already exists"
    fi
    docker-compose --version
}

configure_environment() {
    log_title "配置环境变量"

    # 切换到项目根目录
    cd "$project_path/$git_name"

    # 初始化 .env 文件（如果不存在）
    init_env_file "$project_path/$git_name/.env"

    # 加载默认值
    load_env "$project_path/$git_name/.env"

    # 显示当前配置
    show_env_summary

    log_separator
    log_info "接下来将配置各项环境变量，直接回车使用默认值，30秒无输入将自动使用默认值"
    log_separator

    # 1. 配置 Nginx 端口
    log_info "花森起始页网关（nginx 服务）默认端口为 $NGINX_PORT"
    log_info "建议输入 1024-65535 范围内的端口，例如：8082，请确保端口未被占用，避免与其他服务冲突"

    local new_port=""
    if prompt_with_timeout "是否需要修改 Nginx 端口？" "new_port" "$NGINX_PORT" 30; then
        NGINX_PORT="$new_port"
        save_env "NGINX_PORT" "$NGINX_PORT" "$project_path/$git_name/.env"
        log_success "Nginx 端口已设置为: $NGINX_PORT"
    else
        log_info "保持默认端口: $NGINX_PORT"
    fi

    log_separator

    # 2. 配置 Redis 密码
    log_info "Redis 服务默认密码为 $REDIS_PASSWORD，建议使用包含大小写字母、数字、特殊字符的强密码"

    local new_redis_pwd=""
    if prompt_with_timeout "是否需要修改 Redis 密码？" "new_redis_pwd" "$REDIS_PASSWORD" 30; then
        REDIS_PASSWORD="$new_redis_pwd"
        save_env "REDIS_PASSWORD" "$REDIS_PASSWORD" "$project_path/$git_name/.env"
        log_success "Redis 密码已设置"
    else
        log_info "保持默认密码"
    fi

    log_separator

    # 3. 配置 MongoDB Root 密码
    log_info "MongoDB Root 管理员密码默认为 ${MONGO_ROOT_PASSWORD:0:5}***，建议使用包含大小写字母、数字、特殊字符的强密码"

    local new_mongo_root_pwd=""
    if prompt_with_timeout "是否需要修改 MongoDB Root 密码？" "new_mongo_root_pwd" "$MONGO_ROOT_PASSWORD" 30; then
        MONGO_ROOT_PASSWORD="$new_mongo_root_pwd"
        save_env "MONGO_ROOT_PASSWORD" "$MONGO_ROOT_PASSWORD" "$project_path/$git_name/.env"
        log_success "MongoDB Root 密码已设置"
    else
        log_info "保持默认密码"
    fi

    log_separator

    # 4. 配置 MongoDB 数据库用户名
    log_info "MongoDB 数据库用户名默认为 $MONGO_APP_USERNAME，此账号用于后端服务连接数据库"

    local new_mongo_app_user=""
    if prompt_with_timeout "是否需要修改 MongoDB 数据库用户名？" "new_mongo_app_user" "$MONGO_APP_USERNAME" 30; then    
        MONGO_APP_USERNAME="$new_mongo_app_user"
        save_env "MONGO_APP_USERNAME" "$MONGO_APP_USERNAME" "$project_path/$git_name/.env"
        log_success "MongoDB 数据库用户名已设置为: $MONGO_APP_USERNAME"
    else
        log_info "保持默认用户名: $MONGO_APP_USERNAME"
    fi

    log_separator

    # 5. 配置 MongoDB 应用密码
    log_info "MongoDB 应用密码默认为 ${MONGO_APP_PASSWORD:0:5}***，此密码用于后端服务连接数据库，建议使用包含大小写字母、数字、特殊字符的强密码"

    local new_mongo_app_pwd=""
    if prompt_with_timeout "是否需要修改 MongoDB 应用密码？" "new_mongo_app_pwd" "$MONGO_APP_PASSWORD" 30; then
        MONGO_APP_PASSWORD="$new_mongo_app_pwd"
        save_env "MONGO_APP_PASSWORD" "$MONGO_APP_PASSWORD" "$project_path/$git_name/.env"
        log_success "MongoDB 应用密码已设置"
    else
        log_info "保持默认密码"
    fi

    log_separator

    # 6. 配置 AES 对称密钥
    log_info "AES 对称密钥用于数据库加密存储，当前使用默认：密钥: ${AES_SECRET_KEY:0:4}***，向量: ${AES_SECRET_IV:0:4}***，建议自动生成随机密钥以提高安全性"

    local generate_aes=""
    if prompt_with_timeout "是否自动生成新的 AES 对称密钥？后续不可修改" "generate_aes" "y" 30; then
        if [[ "$generate_aes" =~ ^[Yy]$ ]] || [ -z "$generate_aes" ]; then
            log_info "正在生成随机 AES 密钥..."
            AES_SECRET_KEY=$(generate_aes_key)
            AES_SECRET_IV=$(generate_aes_key)
            save_env "AES_SECRET_KEY" "$AES_SECRET_KEY" "$project_path/$git_name/.env"
            save_env "AES_SECRET_IV" "$AES_SECRET_IV" "$project_path/$git_name/.env"
            log_success "AES 密钥已自动生成并保存"
        else
            log_info "保持使用默认 AES 密钥"
        fi
    else
        log_info "保持使用默认 AES 密钥"
    fi

    log_separator

    # 显示最终配置摘要
    log_title "配置完成"
    show_env_summary

    # 同步所有配置文件
    sync_config_files "$project_path/$git_name"
}

# 拉取代码
pull_code() {
    echo '[Huasen Log]：正在拉取代码...'
    select_git_repo "$project_path/.env" "git_path" 30
    git_name="$(get_git_repo_name "$git_path")"
    log_info "源码目录名: $git_name"
    cd "$project_path"
    rm -rf "$git_name"
    git clone "$git_path" "$git_name"
    cd "$git_name"
}

# 启动容器
start_containers() {
    echo '[Huasen Log]：正在启动容器...'

    # 引入环境配置函数库
    source "$sh_path/env-lib.sh"
    DOCKER_COMPOSE=$(get_docker_compose_cmd)

    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE build server
    $DOCKER_COMPOSE up -d
    echo '[Huasen log]：启动容器成功...'
}

# 设置快捷脚本
setup_shortcut_scripts() {
    echo '[Huasen Log]：为快捷脚本设置执行权限...'
    chmod u+x ./bin/*
    echo '[Huasen Log]：花森网站已安装成功，请用浏览器访问站点：http://服务器IP:端口号/portal/ ，即可访问导航站点，详细信息可查阅：https://github.com/huasenjio/huasenjio-compose ，期待您的关注！'
}

# 主执行函数
main() {
    prepare_environment
    install_git
    install_docker
    configure_docker
    install_docker_compose
    pull_code
    configure_environment
    start_containers
    setup_shortcut_scripts
}

# 执行主函数
main
