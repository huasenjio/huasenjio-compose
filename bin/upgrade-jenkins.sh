#!/bin/bash

# 本脚本只能在使用 jenkins 容器实现持续化集成才能执行
# 执行出错后终端
set -e

sh_path=$(cd $(dirname "$0") && pwd)

echo "0.脚本绝对路径：$sh_path"

echo "1.定义地址变量..."
# 根目录的绝对路径
projectPath=$sh_path"/../.."
# 拉取的源码存储路径
upgradePath=$sh_path"/.."

echo "2.正在停止容器..."
# 进入根目录
cd $projectPath
# 停止并删除容器
docker-compose stop nginx server mongo redis
docker-compose rm -f nginx server mongo redis

echo "3.准备移除旧文件..."
set +e
find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-jenkins/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" ! -path "$upgradePath/*" -delete
# 保留bin目录 && 删除bin目录下所有文件
find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
set -e

echo "4.正在替换新文件..."
cd $upgradePath
rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-jenkins" --exclude="huasen-store" --exclude="huasen-server/setting.json" ./ $projectPath

echo "5.合并静态资源..."
set +e
cp -frap $upgradePath/huasen-store/* $projectPath/huasen-store/
set -e

echo "6.设置可执行权限..."
chmod u+x $projectPath/bin/*

echo "7.升级容器..."
# 构建镜像
cd $projectPath
docker-compose build server
# 重启容器
docker-compose up -d
# 清理废弃的数据卷和镜像
docker image prune -f
docker volume prune -f






