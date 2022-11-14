# 安装 Node 精简版
FROM node:14.20-alpine
# 设置维护者信息 
LABEL maintainer="huasen<huasenjio@163.com>"
# 防止中文打印信息显示乱码
ENV LANG="C.UTF-8"
# 移动业务文件到容器内制定目录
COPY . /app/huasen-server
# 制定终端开启路径
WORKDIR /app/huasen-server
# 使用淘宝镜像源
RUN npm config set registry http://registry.npm.taobao.org
# 安装 pm2 用来做服务器的进程守护
RUN npm install pm2 -g
# 安装项目依赖
RUN npm install
# 暴露3000端口
EXPOSE 3000
# 通过 pm2 启动打包之后的项目, pm2在容器中运行需要用 pm2-runtime 命令
CMD ["npm", "run", "pm2-runtime:pro"]
