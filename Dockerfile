# 使用官方 Node.js 镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 并安装依赖
COPY package.json package-lock.json ./
RUN npm install

# 复制 src 文件夹和其他文件到容器中
COPY src/ ./src/
COPY choose.html ./choose.html
COPY login.html ./login.html

# 复制 SQL 文件到 Docker 镜像中的指定目录
COPY hospital.sql /docker-entrypoint-initdb.d/hospital.sql
COPY create_user.sql /docker-entrypoint-initdb.d/create_user.sql

# 暴露 3000 端口
EXPOSE 3000

# 启动应用
CMD ["node", "src/index.js"]
