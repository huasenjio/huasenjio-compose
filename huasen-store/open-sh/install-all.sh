#!/bin/bash
# 开启出错中断
set -e

# 获取当前脚本所在路径
project_path=$(cd "$(dirname "$0")" && pwd)
# Git 仓库地址及名称
git_path="https://gitee.com/HuaSenJioJio/huasenjio-compose.git"
git_name="huasenjio-compose"
# docker 镜像配置文件及镜像源
daemon_file="/etc/docker/daemon.json"
mirror1="https://docker.m.daocloud.io"
mirror2="https://dockerproxy.com"
mirror3="https://registry.docker-cn.com"

# docker-compose 下载地址（依赖于 OS 类型和 CPU 架构）
OS_TYPE=$(uname -s)
ARCH=$(uname -m)
docker_compose_url="https://github.com/docker/compose/releases/download/1.29.2/docker-compose-${OS_TYPE}-${ARCH}"
docker_compose_path="/usr/local/bin/docker-compose"

echo "[Huasen Log]: 脚本已初始化完成，请确保端口 80、37017、7379、8080、3000、8181 未被占用。"

# 检查是否为 root 用户（Windows 下请以管理员身份运行 Git Bash/Cygwin）
if [ "$(id -u)" != "0" ]; then
    echo "[Huasen Log]: 请以 root 用户运行脚本，避免权限不足问题！"
    exit 1
fi

# 检测支持的包管理器（apt-get、yum、dnf）
detect_package_manager() {
    if command -v apt-get >/dev/null 2>&1; then
        PM="apt-get"
    elif command -v yum >/dev/null 2>&1; then
        PM="yum"
    elif command -v dnf >/dev/null 2>&1; then
        PM="dnf"
    else
        echo "[Huasen Log]: 未找到支持的包管理器！"
        exit 1
    fi
}

# 更新软件包仓库
update_package_repos() {
    if [ "$PM" = "apt-get" ]; then
        apt-get update
    elif [ "$PM" = "yum" ] || [ "$PM" = "dnf" ]; then
        # 如果是 CentOS，则更新为阿里云源。
        if grep -qi "CentOS" /etc/os-release; then
            echo "[Huasen Log]: 更新 CentOS 仓库..."
            curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
        fi
        $PM makecache fast || true
    fi
}

# 安装指定软件包（注意：不同发行版中软件包名称可能略有差异）
install_package() {
    local package="$1"
    if [ "$PM" = "apt-get" ]; then
        dpkg -s "$package" &>/dev/null && echo "[Huasen Log]: $package 已安装" || apt-get install -y "$package"
    elif [ "$PM" = "yum" ] || [ "$PM" = "dnf" ]; then
        if $PM list installed "$package" &>/dev/null; then
            echo "[Huasen Log]: $package 已安装"
        else
            $PM install -y "$package"
        fi
    fi
}

# 安装 Git
install_git() {
    if command -v git &>/dev/null; then
        echo "[Huasen Log]: Git 已安装，跳过安装..."
    else
        echo "[Huasen Log]: 正在安装 Git..."
        install_package git
    fi
    git version
}

# 安装 Docker
install_docker() {
    echo "[Huasen Log]: 正在安装 Docker..."
    if ! command -v docker &>/dev/null; then
        if [ "$PM" = "apt-get" ]; then
            apt-get update
            apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
            curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | apt-key add -
            add-apt-repository "deb [arch=$(dpkg --print-architecture)] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable"
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io
        elif [ "$PM" = "yum" ] || [ "$PM" = "dnf" ]; then
            $PM remove -y docker* || true
            install_package device-mapper-persistent-data
            install_package lvm2
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            $PM install -y docker-ce docker-ce-cli containerd.io
        fi
        systemctl start docker
        systemctl enable docker
        chmod a+rw /var/run/docker.sock
        docker version
    else
        echo "[Huasen Log]: Docker 已存在，不再重复安装！"
    fi
}

# 配置 Docker 镜像源（修改 sed 分隔符避免与 URL 中的斜杠冲突）
configure_docker() {
    if [ ! -f "$daemon_file" ]; then
        echo '{"registry-mirrors":["'"$mirror1"'","'"$mirror2"'","'"$mirror3"'"],"ipv6":false}' > "$daemon_file"
        echo "[Huasen Log]: 已创建 $daemon_file 并添加镜像源"
    else
        if grep -q "$mirror1" "$daemon_file" && grep -q "$mirror2" "$daemon_file" && grep -q "$mirror3" "$daemon_file"; then
            echo "[Huasen Log]: 镜像源已存在于 $daemon_file"
        else
            # 使用 # 作为分隔符，避免 URL 中的 / 冲突
            sed -i '/registry-mirrors/ s#\[#\["'"$mirror1"'","'"$mirror2"'","'"$mirror3"'",#' "$daemon_file"
            echo "[Huasen Log]: 已追加镜像源到 $daemon_file"
        fi
    fi
    systemctl daemon-reload
    systemctl restart docker
}

# 安装 docker-compose（适用于 Linux）
install_docker_compose() {
    echo "[Huasen Log]: 正在安装 docker-compose..."
    if [ ! -f "$docker_compose_path" ]; then
        echo "[Huasen Log]: 正在下载 docker-compose..."
        if curl -L "$docker_compose_url" -o "$docker_compose_path"; then
            chmod +x "$docker_compose_path"
            echo "[Huasen Log]: docker-compose 下载成功"
        else
            echo "[Huasen Log]: docker-compose 下载失败"
            exit 1
        fi
    else
        echo "[Huasen Log]: docker-compose 已存在"
    fi
    if [ ! -L "/usr/bin/docker-compose" ]; then
        ln -s "$docker_compose_path" /usr/bin/docker-compose
        echo "[Huasen Log]: 已创建符号链接 /usr/bin/docker-compose"
    else
        echo "[Huasen Log]: 符号链接 /usr/bin/docker-compose 已存在"
    fi
    docker-compose --version
}

# 拉取代码仓库
pull_code() {
    echo "[Huasen Log]: 正在拉取代码..."
    cd "$project_path"
    rm -rf "$git_name"
    git clone "$git_path"
    cd "$git_name"
}

# 启动容器
start_containers() {
    echo "[Huasen Log]: 正在启动容器..."
    docker-compose down
    docker-compose build server
    docker-compose up -d
    echo "[Huasen Log]: 启动容器成功"
}

# 设置快捷脚本执行权限
setup_shortcut_scripts() {
    echo "[Huasen Log]: 为快捷脚本设置执行权限..."
    chmod u+x ./bin/*
    echo "[Huasen Log]: 花森网站已安装成功，请使用浏览器访问：http://服务器IP/portal/"
}

# Linux 系统主流程
main_linux() {
    detect_package_manager
    update_package_repos
    install_git
    install_docker
    configure_docker
    install_docker_compose
    pull_code
    start_containers
    setup_shortcut_scripts
}

# Windows 下的处理（适用于 Git Bash/Cygwin 环境）
main_windows() {
    echo "[Huasen Log]: 检测到 Windows 系统，请确保已安装 Docker Desktop、Git 及 docker-compose。"
    # 检查 Git
    if ! command -v git &>/dev/null; then
        echo "[Huasen Log]: 请安装 Git for Windows（https://gitforwindows.org/）"
        exit 1
    fi
    # 检查 Docker
    if ! command -v docker &>/dev/null; then
        echo "[Huasen Log]: 请安装 Docker Desktop for Windows（https://www.docker.com/products/docker-desktop/）"
        exit 1
    fi
    # 检查 docker-compose
    if ! command -v docker-compose &>/dev/null; then
        echo "[Huasen Log]: 请确保 Docker Desktop 已包含 docker-compose 或手动安装它"
        exit 1
    fi
    pull_code
    start_containers
    setup_shortcut_scripts
}

# 根据系统类型调用不同主流程
case "$OSTYPE" in
    linux-gnu*)
        main_linux
        ;;
    msys*|cygwin*)
        main_windows
        ;;
    *)
        echo "[Huasen Log]: 未识别的操作系统！"
        exit 1
        ;;
esac
