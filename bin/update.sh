#!/bin/bash

# 工程根目录
sh_path=$(cd $(dirname "$0") && pwd)
# 引入环境配置函数库
source "$sh_path/env-lib.sh"
cd $sh_path"/../"
pwd

echo "[Huasen Log]：正在停止删除 nginx、server 容器..."
# 停止删除容器
$DOCKER_COMPOSE stop nginx server
$DOCKER_COMPOSE rm -f nginx server

echo "[Huasen Log]：正在重新构建 server 镜像..."
$DOCKER_COMPOSE build server

echo "[Huasen Log]：正在重启程序..."
# 重新启动容器
$DOCKER_COMPOSE up -d nginx server
echo "[Huasen Log]：更新程序成功..."