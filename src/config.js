// 启动配置

module.exports = {
    port: 3000, // express 服务启动端口
    /* 数据库相关配置 */
    db: {
      host: process.env.DB_HOST, // 主机名
      port: 3306,        // MySQL 默认端口为 3306
      user: process.env.DB_USER,          // 使用 root 用户登入 MySQL
      password: process.env.DB_PASSWORD, // MySQL 密码，用你自己的
      database: process.env.DB_NAME, // 使用数据库
      timezone: "08:00",
    }
  }
  
  
