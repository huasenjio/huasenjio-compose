# 花森门户

🎉 huasenjio 系列网站增添新作品，（huasenjio-compose）官方仓库，基于 vue.js（2.6.11）、node.js、docker-compose、redis、mongodb、jenkins组合构建的容器应用。



## 平台简介

目前门户平台由可自定义简洁主页、技术文章、后台管理组成，后期陆续推出拖拽低代码编辑器、日历待办、协同流程图模块。主页模块收录资源网站，涵盖了日常生活、娱乐、学习、影视、考研、工作、科技、实用工具等领域。技术文章模块，定期分享实用教程和资源，致力于提供高效上网冲浪环境的公益性平台！



## 界面预览

### 自定义主页

浏览器主页收录实用的资源网站，支持用户自定义收录、右键换色、更换壁纸、极简模式、多引擎搜索、站内链接检索、多设备适配显示等功能，生活与工作必备神器！

![bwT5saFxQz2RYon](https://s2.loli.net/2022/11/12/bwT5saFxQz2RYon.png)

### 技术分享

文章分享模块，定时更新学习路线、实用教程、资源书籍等，采用 markdown 形式展现。

![Q8PORDnV6lTaBUm](https://s2.loli.net/2022/11/12/Q8PORDnV6lTaBUm.png)

### 后台管理

门户后台管理系统，支持数据统计、宿主机状态实时监听、markdown 文章发布、订阅网链栏目管理、账户管理、黑名单管理、日志管理、文件管理、权限管理等功能，达到现有功能几乎全面覆盖管理。

![MTwVWSyreNcfnOu](https://s2.loli.net/2022/11/12/MTwVWSyreNcfnOu.png)

## 技术架构

客户端基于 Vue.js（2.6.x）、ElementUI、Tailwindcss、Axios等技术开发的 Web 应用，服务端基于Node.js、Mongodb、Redis、Express 开发的服务框架，使用 Nginx 作为代理服务器转发请求，选择 jenkins 实现 CI/CD，借助 docker 进行一键容器化部署。

![PuyTDEVxoYajkOn](https://s2.loli.net/2022/11/12/PuyTDEVxoYajkOn.png)

## 安装依赖

### 测试环境

1. Centos 7.4；
2. 服务器1核2G；

### 步骤流程

#### git

1）安装 WANDisco 仓库包

`yum install http://opensource.wandisco.com/centos/7/git/x86_64/wandisco-git-release-7-2.noarch.rpm`

2）安装git

`yum -y install git`

3）版本验证

`git version`

#### docker

1）卸载旧版本

```javascript
yum remove -y docker \
  docker-client \
  docker-client-latest \
  docker-common \
  docker-latest \
  docker-latest-logrotate \
  docker-logrotate \
  docker-selinux \
  docker-engine-selinux \
  docker-engine
```

2）安装软件包

```javascript
yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
```

3）设置 yum 源

```javascript
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
sudo yum makecache fast
```

4）安装 docker

```javascript
yum install -y docker-ce
```

5）启动 docker

```javascript
systemctl start docker.service
```

6）设置开机自启动

```javascript
systemctl enable docker.service
```

7）设置权限

```javascript
sudo chmod a+rw /var/run/docker.sock 
```

8）查看版本

命令行执行如下命令，输出有 Client 和 Server 服务，则说明 docker 运行正常。

```javascript
docker version
```

![1PzjM5mTcHDUByW](https://s2.loli.net/2022/11/13/1PzjM5mTcHDUByW.png)

9）安装 vim 工具

```javascript
yum -y install vim*
```

10）添加镜像源配置文件

默认通过官方镜像源拉取，速度特别慢，并且容易卡死，所以需要替换镜像源，如果目录下不存在 daemon.json 配置文件，则新建配置文件命令如下：

```javascript
// 新建文件夹
touch /etc/docker/daemon.json

// 修改配置文件
vim /etc/docker/daemon.json

// 写入配置
{
	"registry-mirrors": [ 
    "https://registry.docker-cn.com",
   	"http://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ],
	"ipv6":false
}

// 重载配置
sudo systemctl daemon-reload
// 重启 docker
sudo systemctl restart docker

```

#### docker-compose

1）下载资源

```javascript
curl -L https://get.daocloud.io/docker/compose/releases/download/v2.12.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```

2）设置权限

```javascript
sudo chmod +x /usr/local/bin/docker-compose
```

3）查看版本

```javascript
docker-compose --version
```



## 软件部署

1）通过 git 拉取源码

```javascript
git clone https://github.com/huasenjio/huasenjio-compose.git
```

2）进入 huasenjio-compose 目录

```javascript
cd huasenjio-compose
```

4）运行容器

```javascript
docker-compose up -d
```

5）访问站点

```javascript
前台站点：http://ip/portal

// 默认账户/密码：admin@qq.com/12345
后台管理：http://ip/admin
```

6）注意事项

如果服务正常启动，但是无法访问站点，可以排查如下几点：

- 检查服务器防火墙状态，是否已经放行 80 端口；

- 检查服务器厂商的安全组配置状态，是否已经放行 80 端口；

## 常见 QA

1）为什么注册时，邮箱验证码无法发送？

由于邮箱验证码功能依赖 nodemailer 库实现，需要部署之前修改`/huasenjio-compose/huasen-server/config.js`中的`QQ_MAIL`配置项，更改成自己的邮箱地址和 mtp 通行码。

2）数据库文件存储位置？

工程采取容器化部署，已经配置好目录映射，根目录下`huasen-mongo/volume`文件夹，就是数据库数据目录。

3）后台管理界面的默认账户怎么修改？

工程默认设定，每次项目启动，如果数据库表为控，则插入一条默认数据。可以访问根目录下`huasen-server/mongodb/init`文件夹，查看数据表对应的默认数据，部署之前修改`initManage.js`文件，实现默认账户密码的修改。


## 其他命令

### 容器

> huasenjio-compose 目录终端执行

1）停止容器并且删除镜像

```javascript
docker-compose down
```

2）重新构建镜像（不使用缓存）

```javascript
docker-compose build --no-cache
```

3）重启某个容器

```javascript
docker-compose restart 容器名（nginx|mongo|redis|server|jenkins）
```

4）停止容器并且删除镜像

```javascript
docker-compose down
```

### linux

1）防火墙操作

```javascript
开启防火墙：systemctl start firewalld
关闭防火墙：systemctl stop firewalld
查看防火墙：systemctl status firewalld
查看指定端口：firewall-cmd --query-port=8080/tcp
打开指定端口：firewall-cmd --add-port=8080/tcp --permanent
重载端口数据：firewall-cmd --reload
关闭指定端口：firewall-cmd --permanent --remove-port=8080/tcp
```

2）查看端口运行服务

```javascript
netstat -anp | grep 端口号
```



## 开发指南

由于涉及知识面较广，文字讲解篇幅过大，可以关注 Bilibili 账号，后续更新视频更新教程，感兴趣的小伙伴可以添加站长微信 ，进入前端技术交流群！

### 目录结构

```javascript
├── huasen-mongo       // mongodb 数据库配置和数据
├── huasen-nginx       // nginx 配置
├── huasen-redis       // redis 配置和数据
└── huasen-server      // 后端服务
  ├── app.js     // 服务入口文件
  └──config.js   // 服务配置文件
├── huasen-store       // 静态文件仓库
├── huasen-jenkins     // jenkins 配置
├── docker-compose.yml // docker-compose 编排配置文件
└── huasen-frontend    // 前端界面源码
  ├── admin  // 后台管理界面源码
  ├── portal // 前台站点源码
  └── guide  // 个人引导页源码
```

### 本地调试

#### 前台

> /huasenjio-compose/huasen-frontend/portal 目录下终端执行

（1）安装依赖

`npm install`

（2）运行程序

`npm run server`

（3）打包构建

`npm run build`

#### 后台管理

> /huasenjio-compose/huasen-frontend/admin 目录下终端执行

（1）安装依赖

`npm install`

（2）运行程序

`npm run server`

（3）打包构建

`npm run build`

#### 容器启动

> /huasenjio-compose 目录下终端执行

（1）构建容器

`docker-compose up -d`

#### 后台服务

> /huasenjio-compose/huasen-server 目录下终端执行

（1）安装依赖

`npm install`

（2）运行程序

`npm run dev`



## 联系我们

企鹅🐧：184820911

微信😸：huasencc（站长邀请进入前端交流群）

邮箱📮：[184820911@qq.com](184820911@qq.com)

哔哩哔哩：[花森酱JioJio](https://space.bilibili.com/241546158)

