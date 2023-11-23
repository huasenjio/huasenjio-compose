#!/bin/bash
project_path=$(cd $(dirname "$0") && pwd)
cd $project_path"/../"
docker-compose stop