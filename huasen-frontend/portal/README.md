# huasen-portal

> 镜像整合版本

🎉 huasen 系列网站增添新成员，（huasen-portal）官方仓库，基于 Vue.js（2.6.11）、ElementUI（2.15.5）、Tailwindcss（2.2.17）、Mockjs2 等技术构建的前后分离门户系统。

## 平台简介

本仓库剥离自定义简洁主页、技术文章阅读模块组成的前后分离的镜像整合版本。借助 localStorage 本地存储，几乎可以体验线上版本的所有功能。提供插拔式数据模拟的网络模块，实现无感地对接后端服务的效果。

![auI9Jft12esiQAn](https://s2.loli.net/2022/09/25/auI9Jft12esiQAn.png)

## 内置功能

1. 完美适配所有移动端设备，采用 web 端响应式布局 + 移动端缩放可视窗口的黑科技；
2. 高度集成 Mockjs2，实现接口数据模拟，极速无感接入后端服务；
3. 支持菜单权限管理，支持 404、403 情况跳转；
4. 支持添加、编辑、删除自定义网站，支持数据的拷贝保存、恢复；
5. 定制化修改 Tailwindcss；
6. 支持百度热词推荐、站内链接搜索高亮显示功能；
7. 支持极简模式、任意区域右键换肤改色、更换预设墙纸、修改模糊度、调节明暗、上传壁纸的功能；
8. 调教 ElementUI，二次封装 Dialog、Drawer 等组件，适应兼容任意尺寸屏幕；
9. 支持 Markdown 文章展示，三级目录定位；
10. 水印功能；
11. 多图标合成雪碧图，减少对图片的请求次数；

## 安装教程

安装依赖

`npm install`

运行项目

`npm run serve`

打包项目

`npm run build`

## 在线体验

1. 线上运营网站：[花森主页](http://n.huasen.cc/)（可能迭代版本不同）
2. 仓库源码示例：[Github 托管版本](https://huasenjio.github.io/huasen-portal/dist/index.html)（部分外链图片无法显示）
