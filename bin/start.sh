#!/bin/bash
set -e
sh_path=$(cd $(dirname "$0") && pwd)
cd $sh_path"/../"
docker-compose up -d
echo "[Huasen Log]：启动程序成功..."