# 校园快递代取系统

一款简洁高效且充满青春感的校园快递代取系统，使用 Angular + Java + MySQL 技术栈开发。

## 功能特性

### 用户功能
- 🔐 用户注册、登录、权限管理（JWT认证）
- 📦 发布快递代取需求（快递点、取件码、送达地点、酬劳等）
- 👀 浏览快递大厅，在线接单
- 📱 我的订单管理（我发布的、我接的）
- 🔄 订单状态跟踪（待审核、待接单、已接单、配送中、已完成、已取消）

### 管理员功能
- ✅ 订单审核（审核通过/拒绝）
- 📋 订单管理（下架无效订单）
- 📊 数据统计（订单量统计、完成率统计）
- 👥 用户管理（启用/禁用用户）
- 📥 数据导出（支持CSV/JSON格式导出）
- 📄 分页展示所有列表

## 技术栈

### 后端
- **框架**: Spring Boot 2.7.18
- **ORM**: Spring Data JPA
- **安全**: Spring Security + JWT
- **数据库**: MySQL 8.0+
- **工具**: Lombok, FastJSON

### 前端
- **框架**: Angular 16+
- **样式**: 自定义CSS（青春活力风格）
- **HTTP**: Angular HttpClient
- **路由**: Angular Router

## 环境要求

- **JDK**: 1.8 或更高
- **Node.js**: 16.x 或更高
- **npm**: 8.x 或更高
- **Angular CLI**: 16.x
- **MySQL**: 8.0 或更高
- **Maven**: 3.6.x 或更高

## 快速启动

### 第一步：配置数据库

1. 创建MySQL数据库：
```sql
CREATE DATABASE parcel_pickup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行初始化脚本：
   - 脚本位置：`backend/src/main/resources/db/init.sql`
   - 该脚本会创建所有表并初始化测试数据

3. 修改数据库连接配置（如需）：
   - 配置文件位置：`backend/src/main/resources/application.yml`
   - 默认配置：
     ```yaml
     spring:
       datasource:
         url: jdbc:mysql://localhost:3306/parcel_pickup?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
         username: root
         password: root
     ```

### 第二步：启动后端服务

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖并编译：
```bash
mvn clean install
```

3. 启动应用：
```bash
mvn spring-boot:run
```

或者直接运行编译后的jar包：
```bash
java -jar target/parcel-pickup-server-1.0.0.jar
```

后端服务启动后，访问地址：`http://localhost:8080`

### 第三步：启动前端服务

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

或者使用Angular CLI：
```bash
ng serve
```

前端服务启动后，访问地址：`http://localhost:4200`

## 默认测试账号

### 管理员账号
- 用户名：`admin`
- 密码：`admin123`
- 角色：系统管理员 + 普通用户

### 普通用户
- 需要自行注册

## API文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 快递点接口
- `GET /api/express-points/active` - 获取所有启用的快递点
- `GET /api/express-points` - 分页获取所有快递点（管理员）
- `POST /api/express-points` - 创建快递点（管理员）

### 快递单接口
- `GET /api/parcels/available` - 获取可接单的快递单列表
- `POST /api/parcels` - 发布快递单
- `GET /api/parcels/my-published` - 获取我发布的订单
- `GET /api/parcels/my-accepted` - 获取我接的订单
- `GET /api/parcels/{id}` - 获取订单详情
- `POST /api/parcels/{id}/accept` - 接单
- `POST /api/parcels/{id}/start-delivery` - 开始配送
- `POST /api/parcels/{id}/complete` - 完成订单
- `POST /api/parcels/{id}/cancel` - 取消订单

### 管理员接口
- `GET /api/admin/parcels` - 分页获取所有订单
- `POST /api/admin/parcels/{id}/review` - 审核订单
- `POST /api/admin/parcels/{id}/remove` - 下架订单
- `GET /api/admin/statistics` - 获取统计数据
- `GET /api/admin/daily-statistics` - 获取每日统计
- `GET /api/admin/users` - 分页获取所有用户
- `PUT /api/admin/users/{id}/status` - 更新用户状态
- `GET /api/admin/export/parcels` - 导出订单数据
- `GET /api/admin/export/statistics` - 导出统计数据

## 项目结构

```
ParcelPickup/
├── backend/                          # 后端项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/parcelpickup/
│   │   │   │   ├── common/           # 公共类
│   │   │   │   ├── controller/       # 控制器层
│   │   │   │   ├── dto/              # 数据传输对象
│   │   │   │   ├── entity/           # 实体类
│   │   │   │   ├── exception/        # 异常处理
│   │   │   │   ├── repository/       # 数据访问层
│   │   │   │   ├── security/         # 安全配置
│   │   │   │   ├── service/          # 业务逻辑层
│   │   │   │   └── ParcelPickupApplication.java
│   │   │   └── resources/
│   │   │       ├── db/
│   │   │       │   └── init.sql      # 数据库初始化脚本
│   │   │       └── application.yml   # 应用配置
│   └── pom.xml
│
├── frontend/                          # 前端项目
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/           # 组件
│   │   │   │   ├── admin/            # 管理员组件
│   │   │   │   ├── auth/             # 认证组件
│   │   │   │   ├── home/             # 首页组件
│   │   │   │   ├── navbar/           # 导航栏组件
│   │   │   │   ├── parcel/           # 快递单组件
│   │   │   │   └── shared/           # 公共组件
│   │   │   ├── guards/               # 路由守卫
│   │   │   ├── interceptors/         # HTTP拦截器
│   │   │   ├── models/               # 数据模型
│   │   │   ├── services/             # 服务
│   │   │   ├── app-routing.module.ts # 路由配置
│   │   │   ├── app.component.ts/html/css
│   │   │   └── app.module.ts         # 主模块
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css                # 全局样式
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 数据库设计

### 主要数据表
- `users` - 用户表
- `roles` - 角色表
- `user_roles` - 用户角色关联表
- `express_points` - 快递点表
- `parcels` - 快递单表
- `parcel_logs` - 订单操作日志表

### 订单状态枚举
- `0` - 待审核
- `1` - 待接单
- `2` - 已接单
- `3` - 配送中
- `4` - 已完成
- `5` - 已取消
- `6` - 已下架

## 验证指南

### 验证用户功能
1. 访问 `http://localhost:4200`
2. 点击"注册"按钮，创建新用户
3. 使用新用户登录
4. 点击"发布需求"，填写快递信息并发布
5. 用另一个浏览器/隐私窗口登录另一个账号
6. 在"快递大厅"查看并接取订单
7. 在"我的订单"中查看订单状态变化

### 验证管理员功能
1. 使用管理员账号登录（admin/admin123）
2. 点击导航栏的"管理后台"
3. 在仪表盘查看统计数据
4. 进入"订单管理"，审核待审核的订单
5. 进入"用户管理"，测试启用/禁用用户功能
6. 测试数据导出功能

### 验证分页功能
1. 发布多个订单（至少11个）
2. 在快递大厅查看分页效果
3. 在"我的订单"查看分页效果
4. 在管理员后台查看分页效果

## 常见问题

### 后端启动失败
- 检查MySQL是否启动
- 检查数据库连接配置
- 检查数据库是否已创建
- 检查JDK版本是否为1.8+

### 前端启动失败
- 检查Node.js版本是否为16+
- 检查npm依赖是否安装成功
- 检查Angular CLI版本

### 跨域问题
- 后端已配置CORS允许 `http://localhost:4200`
- 如需修改，请修改 `SecurityConfig.java` 中的CORS配置

### JWT Token问题
- Token有效期为24小时
- Token存储在localStorage中
- 退出登录时会清除Token

## 开发建议

### 修改后端配置
- 配置文件：`backend/src/main/resources/application.yml`
- 可修改端口、数据库连接、JWT密钥等

### 修改前端配置
- API地址配置在各个服务文件中
- 默认API地址：`http://localhost:8080`

### 生产环境部署
1. 后端：使用 `mvn clean package` 打包，部署到服务器
2. 前端：使用 `ng build --prod` 编译，部署到Web服务器
3. 配置Nginx反向代理，解决跨域问题

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或Pull Request。
