#!/bin/bash
# 执行出错退出终端
set -e

# mongo 4.2.2
docker pull dockerproxy.com/library/mongo:4.2.2
# redis:6.0.10-alpine
docker pull dockerproxy.com/library/redis:6.0.10-alpine
# nginx:1.23.1
docker pull dockerproxy.com/library/nginx:1.23.1
# jenkins/jenkins:lts
docker pull dockerproxy.com/jenkins/jenkins:lts
# node:16-alpine3.17
docker pull dockerproxy.com/library/node:16-alpine3.17

set +e
docker tag dockerproxy.com/library/mongo:4.2.2 mongo:4.2.2
docker rmi dockerproxy.com/library/mongo:4.2.2
docker tag dockerproxy.com/library/redis:6.0.10-alpine redis:6.0.10-alpine
docker rmi dockerproxy.com/library/redis:6.0.10-alpine
docker tag dockerproxy.com/library/nginx:1.23.1 nginx:1.23.1
docker rmi dockerproxy.com/library/nginx:1.23.1
docker tag dockerproxy.com/jenkins/jenkins:lts jenkins/jenkins:lts
docker rmi dockerproxy.com/jenkins/jenkins:lts
docker tag dockerproxy.com/library/node:16-alpine3.17 node:16-alpine3.17
docker rmi dockerproxy.com/library/node:16-alpine3.17
set -e