#!/bin/bash

sh_path=$(cd $(dirname "$0") && pwd)
cd $sh_path"/../"
docker-compose up -d