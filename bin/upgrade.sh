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

save_current_nginx_port() {
    local compose_file="$projectPath/docker-compose.yml"
    if [ -f "$compose_file" ]; then
        # 提取 nginx 宿主机端口
        current_port=$(grep -A 10 'nginx:' "$compose_file" | grep -E '^\s*-\s*[0-9]+:80\s*$' | head -1 | sed -E 's/^\s*-\s*([0-9]+):80\s*$/\1/')
        if [ -n "$current_port" ]; then
            echo "$current_port" > "$tempPath/current_nginx_port"
            echo "[Huasen Log]：当前 nginx 端口: $current_port"
        else
            # 默认端口 80
            echo "80" > "$tempPath/current_nginx_port"
            echo "[Huasen Log]：使用默认 nginx 端口: 80"
        fi
    else
        echo "80" > "$tempPath/current_nginx_port"
        echo "[Huasen Log]：未找到配置文件"
    fi
}

ask_nginx_port() {
    # 从临时文件中读取原始端口
    if [ -f "$tempPath/current_nginx_port" ]; then
        current_nginx_port=$(cat "$tempPath/current_nginx_port")
    else
        current_nginx_port="80"
    fi
    
    echo "[Huasen Log]：当前花森起始页网关配置端口为 $current_nginx_port，如需修改为其他端口？建议输入 1024-65535，例如：8282，并且避免与其他服务冲突。若直接回车，则保持不变。请输入内容（端口或直接回车）："
    read -r nginx_port

    if [ -n "$nginx_port" ]; then
        echo "[Huasen Log]：正在修改 nginx 端口为 $nginx_port:80 ..."
        sed -i "s/- [0-9]*:80/- $nginx_port:80/" "$projectPath/docker-compose.yml"
        echo "[Huasen Log]：nginx 端口已修改为 $nginx_port:80"
    else
        if [ "$current_nginx_port" != "80" ]; then
            echo "[Huasen Log]：正在保持 nginx 端口为 $current_nginx_port:80 ..."
            sed -i "s/- [0-9]*:80/- $current_nginx_port:80/" "$projectPath/docker-compose.yml"
        fi
        echo "[Huasen Log]：未修改配置，nginx 继续使用 $current_nginx_port 端口"
    fi
}

run_backup_script() {
    echo '[Huasen Log]：正在备份数据...'
    $sh_path/backup.sh
}

init_cache_dir() {
    echo "[Huasen Log]：正在初始化缓存目录 $tempPath"
    if [ ! -d $tempPath ]; then mkdir $tempPath; fi
    if [ ! -d $tempPath/$gitStorageName ]; then 
        echo '[Huasen Log]：未发现本地缓存源码'
    else 
        echo '[Huasen Log]：正在删除本地缓存源码...'
        rm -rf $tempPath/$gitStorageName
    fi
}

pull_latest_code() {
    echo '[Huasen Log]：正在拉取最新源码...'
    cd $tempPath
    git clone $gitStoragePath
}

cleanup_docker_containers() {
    echo '[Huasen Log]：正在清理 docker 容器...'
    cd $projectPath
    docker-compose down
}

backup_data_files() {
    echo '[Huasen Log]：正在备份数据及文件...'
    # 关闭报错时中断
    set +e
    find "$projectPath" -mindepth 1 -depth ! -path "$projectPath/huasen-mongo/volume/*" ! -path "$projectPath/huasen-redis/data/*" ! -path "$projectPath/huasen-store/*" ! -path "$projectPath/huasen-server/setting.json" ! -path "$projectPath/bin/*" -delete
    # 保留bin目录，但是删除bin下所有脚本文件
    find "$projectPath/bin" -mindepth 1 -maxdepth 1 -delete
    # 开启报错时中断
    set -e
}

upgrade_and_restore() {
    echo '[Huasen Log]：升级程序及恢复数据...'
    cd $tempPath/$gitStorageName
    rsync -av --exclude="huasen-mongo/volume" --exclude="huasen-redis/data" --exclude="huasen-store" --exclude="huasen-server/setting.json" ./ $projectPath
    # 合并静态资源
    set +e
    cp -frap $tempPath/$gitStorageName/huasen-store/* $projectPath/huasen-store/
    set -e
}

set_execute_permissions() {
    echo '[Huasen Log]：正在为bin目录下快捷脚本设置可执行权限...'
    chmod u+x $projectPath/bin/*
}

restart_program() {
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
}

main() {
    run_backup_script
    init_cache_dir
    save_current_nginx_port
    pull_latest_code
    cleanup_docker_containers
    backup_data_files
    upgrade_and_restore
    set_execute_permissions
    ask_nginx_port
    restart_program
}

# 执行主函数
main