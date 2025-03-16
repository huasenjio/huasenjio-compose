# 安装 Node V16 精简版，不要升级版本，避免出现不兼容问题，例如：非对称加密算法异常。
FROM node:16-alpine
# 设置维护者信息 
LABEL maintainer="huasen<184820911@qq.com>"
# 防止中文打印信息显示乱码
ENV LANG="C.UTF-8"
# 移动业务文件到容器内制定目录
COPY /huasen-lib /app/huasen-lib
COPY /huasen-server /app/huasen-server
# 使用最新淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com
# 安装 pm2 用来做服务器的进程守护
RUN npm install pm2 -g
# 切换huasen-lib目录并安装依赖
WORKDIR /app/huasen-lib
# 安装工具集依赖
RUN npm install
# 切换huasen-server目录并安装依赖
WORKDIR /app/huasen-server
# 主项目依赖
RUN npm install
# 暴露3000端口
EXPOSE 3000
# 通过 pm2 启动打包之后的项目, pm2在容器中运行需要用 pm2-runtime 命令
CMD ["npm", "run", "pm2-in-docker"]