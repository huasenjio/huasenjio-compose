#!/bin/bash

# 本脚本只能在使用 jenkins 容器实现持续化集成才能执行，如果您不了解，请勿执行！
# 执行出错后退出终端
set -e
echo "[Huasen Log]：初始化变量..."
# 升级源码路径
jenkinsCache="/huasen-jenkins-cache"

echo "[Huasen Log]：安装 rsync 工具..."
if ! command -v rsync &> /dev/null; then
    echo "[Huasen Log]：rsync not found, installing..."
    apt-get update
    apt-get install -y rsync
else
    echo "[Huasen Log]：rsync is already installed."
fi

echo "[Huasen Log]：清空缓存文件夹..."
if [ ! -d $jenkinsCache ]; then echo '[Huasen Log]：缓存文件夹不存在'; else rm -rf $jenkinsCache/*; fi

echo "[Huasen Log]：开始迁移升级程序..."
rsync -av --exclude=".git" ./ $jenkinsCache