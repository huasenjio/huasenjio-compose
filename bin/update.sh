#!/bin/bash

# 工程根目录
sh_path=$(cd $(dirname "$0") && pwd)
cd $sh_path"/../"
pwd

echo "[Huasen Log]：正在停止删除 nginx、server 容器..."
# 停止删除容器
docker-compose stop nginx server
docker-compose rm -f nginx server

echo "[Huasen Log]：正在重新构建 server 镜像..."
docker-compose build server

echo "[Huasen Log]：正在重启程序..."
# 重新启动容器
docker-compose up -d nginx server
echo "[Huasen Log]：更新程序成功..."