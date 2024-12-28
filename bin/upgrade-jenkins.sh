#!/bin/bash

# 本脚本只能在使用 jenkins 容器实现持续化集成才能执行，如果您不了解，请勿执行！
set -e

sh_path=$(cd $(dirname "$0") && pwd)
echo "[Huasen Log]：快捷脚本路径地址：$sh_path"

echo "[Huasen Log]：初始化变量..."
# 根目录的绝对路径
projectPath=$sh_path"/../.."
# 拉取的源码存储路径
upgradePath=$sh_path"/.."

echo "[Huasen Log]：正在停止并删除 nginx、server、mongo、redis 容器..."
# 进入根目录
cd $projectPath
# 停止并删除容器
docker-compose stop nginx server mongo redis
docker-compose rm -f nginx server mongo redis

echo '[Huasen Log]：正在备份数据及文件...'
set +e
find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-jenkins/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" ! -path "$upgradePath/*" -delete
# 保留bin目录，但是删除bin下所有脚本文件
find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
set -e

echo '[Huasen Log]：升级程序及恢复数据...'
cd $upgradePath
rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-jenkins" --exclude="huasen-store" --exclude="huasen-server/setting.json" ./ $projectPath
set +e
cp -frap $upgradePath/huasen-store/* $projectPath/huasen-store/
set -e

echo '[Huasen Log]：正在为bin目录下快捷脚本设置可执行权限...'
chmod u+x $projectPath/bin/*

echo '[Huasen Log]：正在重启程序...'
# 构建镜像
cd $projectPath
docker-compose build server
# 重启容器
docker-compose up -d
# 清理废弃的数据卷和镜像
docker image prune -f
docker volume prune -f
echo "[Huasen Log]：升级程序成功..."






