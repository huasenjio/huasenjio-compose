# 花森网站快捷脚本

花森网站推出快捷操作脚本，仅需执行预设脚本，即可升级、更新、停止、重启网站，免去繁琐的执行命令！🎉🎉🎉

## 🚧 注意事项

> 建议版本：centos 7.x

脚本仅适用于 CentOS 系统，并且需要在已成功部署网站后使用。

## 🔒 设置权限

一般情况下，bin 目录是没有执行权限，我们可以进入项目根目录，通过`chmod u+x /bin/*`，为 bin 目录下所有的可执行文件设置权限。

## 🎈 脚本说明

脚本基于花森网站架构编写，不存在恶意行为，仅用于提高使用体验。

### start.sh

重新读取配置，启动 docker 容器。

### stop.sh

停止 docker 容器

### update.sh

不拉取代码，重新构建 nginx、server 镜像，然后更新启动 docker 服务。

### upgrade.sh

拉取仓库代码，重新构建全部镜像，排除 mongodb 数据、redis 数据、jenkins 程序文件，更新全部文件，合并静态文件夹，升级网站。

### install.sh

网站部署脚本，请确保80、3000、37017、8080、7379、8181端口无占用服务，执行期间，如果git、docker、docker-compose不存在，就会安装，执行时发生报错或阻塞，大概率是因为网络问题，使用 `ctrl + c` 中断程序，然后重新执行脚本。

### upgrade-jenkins-init.sh

脚本用于我们提供jenkins在线升级方案，仅提供容器内部使用，非专业，请勿修改！

### upgrade-jenkins.sh

配合`upgrade-jenkins-init.sh`脚本，仅在jenkins在线持续集成方案中使用，非专业，请勿修改！

