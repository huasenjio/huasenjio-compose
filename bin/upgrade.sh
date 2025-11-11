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
        # 提取当前 nginx 宿主机端口（第一个数字部分）
        current_port=$(grep -A 10 'nginx:' "$compose_file" | grep -E '^\s*-\s*[0-9]+:80\s*$' | head -1 | sed -E 's/^\s*-\s*([0-9]+):80\s*$/\1/')
        if [ -n "$current_port" ]; then
            echo "$current_port" > "$tempPath/current_nginx_port"
            echo "[Huasen Log]：已保存当前 nginx 端口: $current_port"
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

# 询问 nginx 端口
ask_nginx_port() {
    # 从临时文件中读取原始端口
    if [ -f "$tempPath/current_nginx_port" ]; then
        current_nginx_port=$(cat "$tempPath/current_nginx_port")
    else
        current_nginx_port="80"
    fi
    
    echo "[Huasen Log]：花森起始页的网关当前配置为 $current_nginx_port，您是否需要修改为其他端口？建议1024-65535，避免与其他服务冲突。例如：8282，如您直接回车或不输入，视为无需修改，保持当前配置，请输入："
    read -r nginx_port

    if [ -n "$nginx_port" ]; then
        echo "[Huasen Log]：正在修改nginx宿主机端口为 $nginx_port:80 ..."
        sed -i "s/- [0-9]*:80/- $nginx_port:80/" "$projectPath/docker-compose.yml"
        echo "[Huasen Log]：nginx宿主机端口已修改为 $nginx_port:80"
    else
        if [ "$current_nginx_port" != "80" ]; then
            echo "[Huasen Log]：正在保持 nginx 宿主机端口为 $current_nginx_port:80 ..."
            sed -i "s/- [0-9]*:80/- $current_nginx_port:80/" "$projectPath/docker-compose.yml"
        fi
        echo "[Huasen Log]：未修改nginx端口配置，继续使用端口 $current_nginx_port"
    fi
}

# 执行备份文件脚本
echo '[Huasen Log]：正在备份数据...'
$sh_path/backup.sh

echo '[Huasen Log]：正在初始化缓存目录...'
# 若没有缓存目录，则创建缓存目录
if [ ! -d $tempPath ]; then mkdir $tempPath; fi
# 删除已下载的源码
if [ ! -d $tempPath/$gitStorageName ]; then echo '[Huasen Log]：未发现缓存源码'; else rm -rf $tempPath/$gitStorageName; fi

echo '[Huasen Log]：正在保存当前 nginx 端口配置...'
save_current_nginx_port

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

ask_nginx_port

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