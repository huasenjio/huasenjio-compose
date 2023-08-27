#!/bin/bash

# 执行出错后终端
set -e

# 部署路径
project_name="/root"
# git 仓库定制
git_path="https://gitee.com/HuaSenJioJio/huasenjio-compose.git"
# git 仓库名称
git_name="huasenjio-compose"
# docker 镜像文件
daemon_file="/etc/docker/daemon.json"
# docker 镜像源
mirror1="http://hub-mirror.c.163.com"
mirror2="https://docker.mirrors.ustc.edu.cn"
mirror3="https://registry.docker-cn.com"

echo '0.正在初始化...'
# 安装 vim 工具
yum -y install vim*
# 拓展 yum 功能
yum install -y yum-utils

echo '1.正在安装 git 程序...'
# 将 Wandisco Git 仓库的 rpm 包安装到系统
if yum list installed "wandisco-git-release"; then
    echo "wandisco-git-release is already installed."
else
    sudo yum install -y http://opensource.wandisco.com/centos/7/git/x86_64/wandisco-git-release-7-2.noarch.rpm
    echo "wandisco-git-release has been installed."
fi
# 安装 Git 程序
yum -y install git
# 查看 Git 版本
git version

echo '3.正在 docker 程序...'
# 卸载 docker 程序
yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-selinux docker-engine-selinux docker-engine
# 安装 docker 依赖项 lvm2 逻辑卷管理器
yum install -y device-mapper-persistent-data lvm2
# 将阿里云的 Docker CE 仓库源添加到 yum 仓库列表
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
# 刷新 yum 缓存
yum makecache fast
# 安装 docker 核心程序
yum install -y docker-ce
# 启动 docker
systemctl start docker.service
# 设置开机自启动
systemctl enable docker.service
# 设置权限
chmod a+rw /var/run/docker.sock
# 查看 docker 版本
docker version

echo '4.正在 docker 镜像源...'
# 配置 docker 镜像源
if [ ! -f "$daemon_file" ]; then
    echo '{"registry-mirrors":["'$mirror1'","'$mirror2'","'$mirror3'"],"ipv6":false}' > $daemon_file
    echo "Created $daemon_file and added mirrors"
else
    # 判断配置文件中是否已经存在镜像源
    if grep -q "$mirror1" "$daemon_file" && grep -q "$mirror2" "$daemon_file" && grep -q "$mirror3" "$daemon_file"; then
        echo "The mirrors already exist in $daemon_file"
    else
        # 追加镜像源
        sed -i '/registry-mirrors/ s/\[/\[\"'$mirror1'\",\"'$mirror2'\",\"'$mirror3'\",/' $daemon_file
        echo "Added mirrors to $daemon_file"
    fi
fi
systemctl daemon-reload
systemctl restart docker

echo '5.正在 docker-compose 程序...'
# 安装 docker-compose 程序
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
if [ -L "/usr/bin/docker-compose" ]; then
    echo "Symbolic link /usr/bin/docker-compose already exists."
else
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    echo "Symbolic link /usr/bin/docker-compose has been created."
fi
docker-compose --version

echo '6.正在拉取代码...'
cd $project_name
rm -rf $git_name
git clone $git_path
cd $git_name

echo '7.正在启动容器...'
docker-compose down
docker-compose build server
docker-compose up -d

echo '8.启动容器成功...'