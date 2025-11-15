#!/bin/bash

# 开启报错时中断
set -e
# 部署路径
project_path=$(cd "$(dirname "$0")" && pwd)
# git 仓库
git_path="https://gitee.com/HuaSenJioJio/huasenjio-compose.git"
# git 仓库名称
git_name="huasenjio-compose"
# docker 镜像文件
daemon_file="/etc/docker/daemon.json"
# docker 镜像源
mirror1="https://docker.m.daocloud.io"
mirror2="https://dockerproxy.com"
mirror3="https://registry.docker-cn.com"

docker_compose_url="https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)"
docker_compose_path="/usr/local/bin/docker-compose"

echo '[Huasen Log]：脚本已初始化完成，请确保 80（nginx）、37017（mongodb）、7379（redis）、3000（服务）、8181（websocket） 端口不被占用，如出现问题，请添加微信：huasencc，加入社群寻求帮助...'

# 检查是否为root用户运行
if [ "$(id -u)" != "0" ]; then
    echo "[Huasen Log]：请以root用户运行脚本，避免权限不足产生异常问题！"
    exit 1
fi

ask_nginx_port() {
    echo "[Huasen Log]：花森起始页网关默认端口为 80，如需修改为其他端口？建议输入 1024-65535，例如：8282，并且避免与其他服务冲突。若直接回车，则保持不变。请输入内容（端口号或直接回车）："

    if [ -n "$nginx_port" ]; then
        echo "[Huasen Log]：正在修改 nginx 端口为 $nginx_port:80 ..."
        sed -i "s/- [0-9]*:80/- $nginx_port:80/" "$project_path/$git_name/docker-compose.yml"
        echo "[Huasen Log]：nginx 端口已修改为 $nginx_port:80"
    else
        echo "[Huasen Log]：未修改 nginx 端口，保持默认端口 80"
    fi
}


# 更新yum源为阿里云源
update_yum_repo() {
    echo '[Huasen Log]：正在安装基础工具...'
    curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
    yum -y install vim* yum-utils
}

# 安装指定的软件包
install_package() {
    local package="$1"
    if yum list installed "$package" &>/dev/null; then
        echo "[Huasen Log]：$package is already installed"
    else
        yum install -y "$package"
    fi
}

# 安装 git
install_git() {
    # 检查是否已经安装了git
    if which git > /dev/null 2>&1; then
        echo '[Huasen Log]：git 已经安装，跳过安装步骤...'
    else
        echo '[Huasen Log]：正在安装 git 程序...'
        # 不安装wandisco的git源
        install_package "http://opensource.wandisco.com/centos/7/git/x86_64/wandisco-git-release-7-2.noarch.rpm"
        install_package "git"
    fi
    # 检查git版本
    git version
}

# 安装 docker
install_docker() {
    echo '[Huasen Log]：正在安装 docker 程序...'
    if ! command -v docker &>/dev/null; then
        yum remove -y docker* # 移除既有Docker相关包
        install_package "device-mapper-persistent-data"
        install_package "lvm2"
        yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
        yum makecache fast
        install_package "docker-ce"
        systemctl start docker.service
        systemctl enable docker.service
        chmod a+rw /var/run/docker.sock
        docker version
    else
        echo '[Huasen Log]：docker 已存在，不再重复安装！'
    fi
}

# 配置 docker 镜像源
configure_docker() {
    if [ ! -f "$daemon_file" ]; then
        echo '{"registry-mirrors":["'$mirror1'","'$mirror2'","'$mirror3'"],"ipv6":false}' > $daemon_file
        echo "[Huasen Log]：Created $daemon_file and added mirrors"
    else
        # 判断配置文件中是否已经存在镜像源
        if grep -q "$mirror1" "$daemon_file" && grep -q "$mirror2" "$daemon_file" && grep -q "$mirror3" "$daemon_file"; then
            echo "The mirrors already exist in $daemon_file"
        else
            # 追加镜像源
            sed -i '/registry-mirrors/ s/\[/\[\"'$mirror1'\",\"'$mirror2'\",\"'$mirror3'\",/' $daemon_file
            echo "[Huasen Log]：Added mirrors to $daemon_file"
        fi
    fi

    systemctl daemon-reload
    systemctl restart docker
}

# 安装 docker-compose
install_docker_compose() {
    echo '[Huasen Log]：安装 docker-compose 程序...'
    if [ ! -f "$docker_compose_path" ]; then
        echo "[Huasen Log]：Downloading docker-compose..."
        if curl -L "$docker_compose_url" -o "$docker_compose_path"; then
            chmod +x "$docker_compose_path"
            echo "[Huasen Log]：docker-compose downloaded successfully"
        else
            echo "[Huasen Log]：Failed to download docker-compose"
            exit 1
        fi
    else
        echo "[Huasen Log]：docker-compose is already downloaded"
    fi

    if [ ! -L "/usr/bin/docker-compose" ]; then
        ln -s "$docker_compose_path" /usr/bin/docker-compose
        echo "[Huasen Log]：Symbolic link /usr/bin/docker-compose has been created"
    else
        echo "[Huasen Log]：Symbolic link /usr/bin/docker-compose already exists"
    fi
    docker-compose --version
}

# 拉取代码
pull_code() {
    echo '[Huasen Log]：正在拉取代码...'
    cd "$project_path" && {
        rm -rf "$git_name"
        git clone "$git_path"
        cd "$git_name"
    }
}

# 启动容器
start_containers() {
    echo '[Huasen Log]：正在启动容器...'
    docker-compose down
    docker-compose build server
    docker-compose up -d
    echo '[Huasen log]：启动容器成功...'
}

# 设置快捷脚本
setup_shortcut_scripts() {
    echo '[Huasen Log]：为快捷脚本设置执行权限...'
    chmod u+x ./bin/*
    echo '[Huasen Log]：花森网站已安装成功，请用浏览器访问站点：http://服务器IP/portal/，即可访问导航站点，详细信息可查阅：https://github.com/huasenjio/huasenjio-compose，期待您的关注！'
}

# 主执行函数
main() {
    update_yum_repo
    install_git
    install_docker
    configure_docker
    install_docker_compose
    pull_code
    ask_nginx_port
    start_containers
    setup_shortcut_scripts
}

if grep -qE "CentOS Linux release 7." /etc/*release; then
    main
else
    echo "[Huasen Log]：当前操作系统不是CentOS 7.x，已停止安装..."
    exit 1
fi
