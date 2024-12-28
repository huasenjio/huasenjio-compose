#!/bin/bash

# 开启报错时中断
set -e
sh_path=$(cd $(dirname "$0") && pwd)
# 根目录的绝对路径
projectPath=$sh_path"/.." 
# 远程仓库名称
gitStorageName="huasenjio-compose"
# 远程仓库地址
gitStoragePath="https://gitee.com/HuaSenJioJio/huasenjio-compose.git"
# 缓存目录
tempPath=$sh_path"/../../huasen-temp"

echo '[Huasen Log]：正在初始化缓存目录...'
# 若没有缓存目录，则创建缓存目录
if [ ! -d $tempPath ]; then mkdir $tempPath; fi
# 删除已下载的源码
if [ ! -d $tempPath/$gitStorageName ]; then echo '[Huasen Log]：未发现缓存源码'; else rm -rf $tempPath/$gitStorageName; fi

echo '[Huasen Log]：正在拉取最新源码...'
cd $tempPath
git clone $gitStoragePath

echo '[Huasen Log]：正在清理 docker 容器...'
# 进入根目录
cd $projectPath
# 停止并删除容器
docker-compose down

echo '[Huasen Log]：正在备份数据及文件...'
# 关闭报错时中断
set +e
find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-jenkins/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" -delete
# 保留bin目录，但是删除bin下所有脚本文件
find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
# 开启报错时中断
set -e

echo '[Huasen Log]：升级程序及恢复数据...'
cd $tempPath/$gitStorageName
rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-jenkins" --exclude="huasen-store" --exclude="huasen-server/setting.json" ./ $projectPath
# 合并静态资源
set +e
cp -frap $tempPath/$gitStorageName/huasen-store/* $projectPath/huasen-store/
set -e

# 设置可执行权限
echo '[Huasen Log]：正在为bin目录下快捷脚本设置可执行权限...'
chmod u+x $projectPath/bin/*

echo '[Huasen Log]：正在重启程序...'
cd $projectPath
# 构建镜像
docker-compose build server
# 重启容器
docker-compose up -d
# 清理废弃的数据卷和镜像
docker image prune -f
docker volume prune -f
echo "[Huasen Log]：升级程序成功..."