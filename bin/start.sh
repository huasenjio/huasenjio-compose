#!/bin/bash
set -e
sh_path=$(cd $(dirname "$0") && pwd)
# 引入环境配置函数库
source "$sh_path/env-lib.sh"
cd $sh_path"/../"
$DOCKER_COMPOSE up -d
echo "[Huasen Log]：启动程序成功..."