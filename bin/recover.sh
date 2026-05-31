#!/bin/bash

# 开启报错时中断
set -e
# 获取脚本所在目录的绝对路径
sh_path=$(cd $(dirname "$0") && pwd)
# 项目根目录的绝对路径
project_path=$sh_path"/.." 
# docker 镜像配置文件及镜像源
daemon_file="/etc/docker/daemon.json"
mirror1="https://docker.m.daocloud.io"
mirror2="https://dockerproxy.com"
mirror3="https://registry.docker-cn.com"

# docker-compose 下载地址（依赖于 OS 类型和 CPU 架构）
docker_compose_url="https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)"
docker_compose_path="/usr/local/bin/docker-compose"

echo '[Huasen Log]：脚本仅支持 CentOS 7/8、OpenCloudOS 9.x、Debian 12、Ubuntu 22，并且请确保 80（nginx）、37017（mongodb）、7379（redis）、3000（服务）、8181（websocket） 端口不被占用，如出现问题，请添加微信：huasencc，加入社群寻求帮助...'

# 系统类型变量
OS_TYPE=""
OS_VERSION=""

# 检查是否为root用户运行
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

# 启动容器
start_containers() {
    echo '[Huasen Log]：正在启动容器...'
    cd "$project_path"

    # 引入环境配置函数库
    source "$sh_path/env-lib.sh"
    DOCKER_COMPOSE=$(get_docker_compose_cmd)

    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE up -d
    echo '[Huasen log]：启动容器成功...'
}

# 设置快捷脚本
setup_shortcut_scripts() {
    echo '[Huasen Log]：为快捷脚本设置执行权限...'
    chmod u+x ./bin/*
    echo '[Huasen Log]：花森网站已恢复成功，详细信息可查阅：https://github.com/huasenjio/huasenjio-compose ，期待您的关注！'
}

# 主执行函数
main() {
    prepare_environment
    install_git
    install_docker
    configure_docker
    install_docker_compose
    start_containers
    setup_shortcut_scripts
}

main
