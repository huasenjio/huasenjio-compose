#!/bin/bash

# 进入工程根目录
sh_path=$(cd $(dirname "$0") && pwd)
cd $sh_path"/../"
pwd

echo "正在停止容器..."
# 停止容器
docker-compose stop nginx server
echo "正在删除容器..."
# 删除容器
docker-compose rm -f nginx server

echo "正在重新构建服务镜像..."
# 重新构建后端服务镜像
docker-compose build server

echo "正在重启容器..."
# 重新启动容器
docker-compose up -d nginx server