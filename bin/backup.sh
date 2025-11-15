#!/bin/bash
SH_DIR=$(cd $(dirname "$0") && pwd)
BACKUP_DIR="${SH_DIR}/../../huasen-backup"
PROJECT_DIR="${SH_DIR}/.."
CUR_DATE=$(date +%Y%m%d%H%M%S)
DATE_FOLDER="${BACKUP_DIR}/${CUR_DATE}"

echo "[Huasen Log]：创建备份存储目录..."
if [ ! -d $BACKUP_DIR ]; then mkdir $BACKUP_DIR; fi
mkdir -p $DATE_FOLDER

echo "[Huasen Log]：停止docker容器..."
cd $PROJECT_DIR
docker-compose stop

# cp "${PROJECT_DIR}"/huasen-mongo/init-mongo* "$BACKUP_DIR"
# cp "${PROJECT_DIR}"/huasen-redis/conf/redis* "$BACKUP_DIR"
# cp "${PROJECT_DIR}"/huasen-nginx/conf/nginx* "$BACKUP_DIR"
# cp "${PROJECT_DIR}"/huasen-server/config* "$BACKUP_DIR"

# echo "[Huasen Log]：清洗huasen-backup目录..."
# rm -f "$BACKUP_DIR"/huasen-mongo_*.tar.gz
# rm -f "$BACKUP_DIR"/huasen-redis_*.tar.gz
# rm -f "$BACKUP_DIR"/huasen-store_*.tar.gz
# rm -f "$BACKUP_DIR"/huasen-server_*.tar.gz

echo "[Huasen Log]：正在备份网站关键配置文件至${DATE_FOLDER} 中，如需恢复，请手动恢复到项目对应目录下！"

cp "${PROJECT_DIR}"/docker-compose.yml "$DATE_FOLDER"

backup_service() {
    local service_name=$1
    local backup_file="${DATE_FOLDER}/${service_name}_${CUR_DATE}.tar.gz"
  
    echo "[Huasen Log]：Creating backup for ${service_name}..."
    tar -czvf $backup_file "${PROJECT_DIR}/${service_name}" > /dev/null
    if [ $? -ne 0 ]; then
        echo "[Huasen Log]：Error creating backup for ${service_name}"
    else
        echo "[Huasen Log]：Backup for ${service_name} created: ${backup_file}"
    fi
}
backup_service "bin"
backup_service "huasen-mongo"
backup_service "huasen-redis"
backup_service "huasen-nginx"
backup_service "huasen-store"
backup_service "huasen-lib"
backup_service "huasen-server"

echo "[Huasen Log]：重新启动docker容器..."
docker-compose start

echo "[Huasen Log]：压缩备份数据成功..."