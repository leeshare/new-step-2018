
# jdk 是一个已有的包含 jdk 的镜像
# FROM jdk
 FROM java:8

#  作者签名
 MAINTAINER lxl6818

#  简化 jar 的名字路径 （#：表示注释掉）
 COPY jar/train-0.0.1-SNAPSHOT.jar /app.jar

#  执行 java -jar 命令 （CMD：在启动容器时才执行此行。RUN：构建镜像时就执行此行）
 CMD java -jar /app.jar

#  设置对外端口为 8084
 EXPOSE 8084

