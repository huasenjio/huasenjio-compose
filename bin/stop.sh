#!/bin/bash
set -e
sh_path=$(cd $(dirname "$0") && pwd)
cd $sh_path"/../"
docker-compose stop
echo "[Huasen Log]：停止程序成功..."