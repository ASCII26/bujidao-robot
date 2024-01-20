#!/bin/bash

# 设置你的Docker镜像名称
IMAGE_NAME="bujidao-robot:v2.4"

# 检查基于该镜像运行的容器
RUNNING_CONTAINER=$(docker ps -q --filter "ancestor=${IMAGE_NAME}")

# 如果没有容器基于该镜像运行，则启动一个新容器
if [ -z "$RUNNING_CONTAINER" ]; then
  echo "没有基于镜像 '${IMAGE_NAME}' 运行的容器，正在启动新容器..."

  # 启动Docker容器，这里需要根据你的镜像添加适当的运行参数
  docker run -d "${IMAGE_NAME}"

  # 检查容器是否成功启动
  if [ $? -eq 0 ]; then
    echo "基于镜像 '${IMAGE_NAME}' 的容器已成功启动。"
  else
    echo "启动基于镜像 '${IMAGE_NAME}' 的容器失败。"
  fi
else
  echo "基于镜像 '${IMAGE_NAME}' 的容器已在运行。"
fi