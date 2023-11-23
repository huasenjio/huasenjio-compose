#!/bin/bash

# 本脚本仅提供 jenkins 容器内部使用，请勿修改！
# 执行出错后终端
set -e
echo "1.定义地址变量..."
# 升级源码路径
jenkinsCache="/huasen-jenkins-cache"

echo "2.安装 rsync 工具..."
if ! command -v rsync &> /dev/null; then
    echo "rsync not found, installing..."
    apt-get update
    apt-get install -y rsync
else
    echo "rsync is already installed."
fi

echo "3.清空缓存文件夹..."
if [ ! -d $jenkinsCache ]; then echo '目录路径不存在'; else rm -rf $jenkinsCache/*; fi

echo "4.开始拷贝..."
rsync -av --exclude=".git" ./ $jenkinsCache