#!/bin/bash

# 工程根目录
projectPath="/root/huasenjio-compose"

# 进入工程根目录
cd $projectPath
# 输出当前目录
pwd

# 停止容器
docker-compose stop nginx server
# 删除容器
docker-compose rm -f nginx server
# 重新构建后端服务镜像
docker-compose build server

# 重新启动容器
docker-compose up -d