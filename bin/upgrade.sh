#!/bin/bash

# 执行出错后终端
set -e

# 配置 host 映射
# if ! grep -q "151.101.1.194 github.global.ssl.fastly.net" /etc/hosts || ! grep -q "140.82.112.4 github.com" /etc/hosts ; then
#     echo "151.101.1.194 github.global.ssl.fastly.net" >> /etc/hosts
#     echo "140.82.112.4 github.com" >> /etc/hosts
# fi

# CentOS 7 重新加载网络配置
# systemctl restart NetworkManager.service

sh_path=$(cd $(dirname "$0") && pwd)

# 项目根目录的路径
projectPath=$sh_path"/.."

# 远程仓库名称
gitStorageName="huasenjio-compose"
# 远程仓库地址
gitStoragePath="https://gitee.com/HuaSenJioJio/huasenjio-compose.git"

# 缓存目录
tempPath=$sh_path"/../../huasen-temp"

echo '1.正在重置缓存...'
# 若没有缓存目录，则创建缓存目录
if [ ! -d $tempPath ]; then mkdir $tempPath; fi
# 删除已下载的源码
if [ ! -d $tempPath/$gitStorageName ]; then echo '未发现源码文件'; else rm -rf $tempPath/$gitStorageName; fi

echo '2.正在拉取源码...'
# 拉取最新源代码到缓存区
cd $tempPath
git clone $gitStoragePath

echo '3.正在清空容器...'
# 进入根目录
cd $projectPath
# 停止并删除容器
docker-compose down

echo '4.正在备份数据文件...'
# 开启报错继续执行
set +e
find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-jenkins/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" -delete
# 保留bin目录 && 删除bin目录下所有文件
find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
# 开启报错中断执行
set -e

echo '5.正在升级数据...'
cd $tempPath/$gitStorageName
rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-jenkins" --exclude="huasen-store" --exclude="huasen-server/setting.json" ./ $projectPath

# 合并静态资源
set +e
cp -frap $tempPath/$gitStorageName/huasen-store/* $projectPath/huasen-store/
set -e

# 设置可执行权限
chmod u+x $projectPath/bin/*

echo '6.正在重启容器...'
cd $projectPath
# 构建镜像
docker-compose build server
# 重启容器
docker-compose up -d
# 清理废弃的数据卷和镜像
docker image prune -f
docker volume prune -f