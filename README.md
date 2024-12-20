# 用DOCKER封装的三层Web应用

### 快速启动：

1. 确保你安装了docker

2. 登录docker hub

   ```docker
   docker login
   ```

3. 拉取远程仓库的镜像

   ```docker
   docker pull xyx138/node-mysql
   ```

4. 下载`docker-compose.yml`到本地

5. 确保3306端口未被占用（mysql服务的默认端口号）

6. 启动在`docker-compose.yml`文件所在目录执行下面的命令行

   ````yml
   docker-compose up --build
   ````

7. 点击访问本地3000端口

   ````
   账号: xyx
   密码: 666666
   ````





