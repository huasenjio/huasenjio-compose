#!/bin/bash
SH_DIR=$(cd $(dirname "$0") && pwd)
BACKUP_DIR="${SH_DIR}/../../huasen-backup"
PROJECT_DIR="${SH_DIR}/.."
CUR_DATE=$(date +%Y%m%d%H%M%S)

echo "[Huasen Log]：停止docker容器..."
cd $PROJECT_DIR
docker-compose stop

echo "[Huasen Log]：清洗huasen-backup目录..."
rm -rf $BACKUP_DIR
mkdir $BACKUP_DIR

backup_service() {
    local service_name=$1
    local backup_file="${BACKUP_DIR}/${service_name}_${CUR_DATE}.tar.gz"
  
    echo "[Huasen Log]：Creating backup for ${service_name}..."
    tar -czvf $backup_file "${PROJECT_DIR}/${service_name}" > /dev/null
    if [ $? -ne 0 ]; then
        echo "[Huasen Log]：Error creating backup for ${service_name}"
    else
        echo "[Huasen Log]：Backup for ${service_name} created: ${backup_file}"
    fi
}

echo "[Huasen Log]：正在压缩备份数据..."
backup_service "huasen-mongo"
backup_service "huasen-redis"
backup_service "huasen-store"
backup_service "huasen-server"

echo "[Huasen Log]：启动docker容器..."
docker-compose start

echo "[Huasen Log]：压缩备份数据成功..."