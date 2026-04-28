-- 校园快递代取系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS parcel_pickup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE parcel_pickup;

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    real_name VARCHAR(50),
    student_id VARCHAR(50),
    avatar VARCHAR(255),
    status INT DEFAULT 1 COMMENT '1: 正常, 0: 禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_role (user_id, role_id)
);

-- 快递点表
CREATE TABLE IF NOT EXISTS express_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_person VARCHAR(50),
    phone VARCHAR(20),
    open_time VARCHAR(100),
    status INT DEFAULT 1 COMMENT '1: 正常, 0: 关闭',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 快递单表
CREATE TABLE IF NOT EXISTS parcels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
    publisher_id BIGINT NOT NULL COMMENT '发布者ID',
    acceptor_id BIGINT COMMENT '接单者ID',
    express_point_id BIGINT NOT NULL COMMENT '快递点ID',
    pickup_code VARCHAR(50) NOT NULL COMMENT '取件码',
    delivery_address VARCHAR(255) NOT NULL COMMENT '送达地点',
    contact_person VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    reward DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '酬劳',
    parcel_type VARCHAR(50) COMMENT '包裹类型',
    weight DECIMAL(10,2) DEFAULT 0.00 COMMENT '重量(kg)',
    remark TEXT COMMENT '备注',
    status INT DEFAULT 0 COMMENT '0:待审核,1:待接单,2:已接单,3:配送中,4:已完成,5:已取消,6:已下架',
    admin_remark TEXT COMMENT '管理员备注',
    reviewed_by BIGINT COMMENT '审核人ID',
    reviewed_at TIMESTAMP NULL COMMENT '审核时间',
    accepted_at TIMESTAMP NULL COMMENT '接单时间',
    delivered_at TIMESTAMP NULL COMMENT '送达时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (publisher_id) REFERENCES users(id),
    FOREIGN KEY (acceptor_id) REFERENCES users(id),
    FOREIGN KEY (express_point_id) REFERENCES express_points(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_acceptor_id (acceptor_id),
    INDEX idx_created_at (created_at)
);

-- 订单操作日志表
CREATE TABLE IF NOT EXISTS parcel_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parcel_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    old_status INT COMMENT '原状态',
    new_status INT COMMENT '新状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parcel_id) REFERENCES parcels(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 初始化角色数据
INSERT INTO roles (name, description) VALUES 
('ROLE_ADMIN', '系统管理员'),
('ROLE_USER', '普通用户');

-- 初始化快递点数据
INSERT INTO express_points (name, address, contact_person, phone, open_time) VALUES 
('菜鸟驿站(东校区)', '东校区1号宿舍楼旁', '张师傅', '13800138001', '8:00 - 22:00'),
('顺丰快递点(西校区)', '西校区服务中心', '李师傅', '13800138002', '9:00 - 21:00'),
('中通快递(南校区)', '南校区食堂旁', '王师傅', '13800138003', '8:30 - 21:30'),
('圆通快递(北校区)', '北校区2号门', '赵师傅', '13800138004', '8:00 - 22:00');

-- 创建管理员用户 (密码: admin123，使用BCrypt加密)
-- 注意: 实际部署时请使用Spring Security BCryptPasswordEncoder生成密码
INSERT INTO users (username, password, email, phone, real_name, student_id, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5E', 'admin@parcelpickup.com', '13900139000', '管理员', 'ADMIN001', 1);

-- 为管理员分配角色
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), (1, 2);
