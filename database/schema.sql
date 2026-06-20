-- ============================================
-- 印染车间配方变更系统 - 数据库设计
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS dyeing_formula DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dyeing_formula;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 用户与权限模块
-- ============================================

DROP TABLE IF EXISTS sys_role;
CREATE TABLE sys_role (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description VARCHAR(500) DEFAULT NULL COMMENT '角色描述',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    username VARCHAR(50) NOT NULL COMMENT '登录账号',
    password VARCHAR(200) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    phone VARCHAR(20) DEFAULT NULL COMMENT '手机号码',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username),
    KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- ============================================
-- 2. 助剂管理模块
-- ============================================

DROP TABLE IF EXISTS auxiliary;
CREATE TABLE auxiliary (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    aux_code VARCHAR(50) NOT NULL COMMENT '助剂编码',
    aux_name VARCHAR(100) NOT NULL COMMENT '助剂名称',
    aux_type VARCHAR(50) DEFAULT NULL COMMENT '助剂类型：染料/助剂/固色剂/匀染剂等',
    cas_no VARCHAR(50) DEFAULT NULL COMMENT 'CAS号',
    unit VARCHAR(20) NOT NULL DEFAULT 'kg' COMMENT '计量单位',
    forbidden_flag TINYINT NOT NULL DEFAULT 0 COMMENT '是否禁限用：0-否，1-是',
    forbidden_reason VARCHAR(500) DEFAULT NULL COMMENT '禁限用原因',
    cod_per_unit DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '单位COD负荷(g/kg) - 废水排放估算',
    description VARCHAR(500) DEFAULT NULL COMMENT '备注说明',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_aux_code (aux_code),
    KEY idx_forbidden_flag (forbidden_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='助剂基础档案表';

DROP TABLE IF EXISTS auxiliary_stock;
CREATE TABLE auxiliary_stock (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    auxiliary_id BIGINT NOT NULL COMMENT '助剂ID',
    warehouse VARCHAR(50) NOT NULL DEFAULT '主仓库' COMMENT '仓库',
    batch_no VARCHAR(50) DEFAULT NULL COMMENT '批次号',
    quantity DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '库存数量',
    safety_stock DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '安全库存',
    expire_date DATE DEFAULT NULL COMMENT '有效期',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_auxiliary_id (auxiliary_id),
    KEY idx_batch_no (batch_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='助剂库存表';

DROP TABLE IF EXISTS auxiliary_stock_log;
CREATE TABLE auxiliary_stock_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    auxiliary_id BIGINT NOT NULL COMMENT '助剂ID',
    opt_type VARCHAR(20) NOT NULL COMMENT '操作类型：入库/出库/盘点/调拨',
    quantity DECIMAL(12,4) NOT NULL COMMENT '变动数量(正负)',
    before_quantity DECIMAL(12,4) NOT NULL COMMENT '变动前数量',
    after_quantity DECIMAL(12,4) NOT NULL COMMENT '变动后数量',
    ref_bill_no VARCHAR(50) DEFAULT NULL COMMENT '关联单据号',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_auxiliary_id (auxiliary_id),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='助剂库存流水表';

-- ============================================
-- 3. 配方管理模块
-- ============================================

DROP TABLE IF EXISTS dyeing_formula;
CREATE TABLE dyeing_formula (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    formula_no VARCHAR(50) NOT NULL COMMENT '配方编号',
    formula_name VARCHAR(200) NOT NULL COMMENT '配方名称',
    fabric_type VARCHAR(100) DEFAULT NULL COMMENT '面料类型',
    color_no VARCHAR(50) DEFAULT NULL COMMENT '色号',
    color_name VARCHAR(100) DEFAULT NULL COMMENT '颜色名称',
    batch_size DECIMAL(12,2) NOT NULL DEFAULT 100 COMMENT '配方批量(kg)',
    version INT NOT NULL DEFAULT 1 COMMENT '版本号',
    parent_id BIGINT DEFAULT NULL COMMENT '父配方ID（变更来源）',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿/SUBMITTED-已提交/SAMPLE-小样中/APPROVED-已核准/PRODUCTION-已下发/REJECTED-已驳回/OBSOLETE-已作废',
    color_diff_standard DECIMAL(8,4) NOT NULL DEFAULT 1.0 COMMENT '色差标准(ΔE)',
    estimated_cod DECIMAL(12,4) DEFAULT 0 COMMENT '预估COD负荷(g)',
    creator_id BIGINT NOT NULL COMMENT '创建人(工艺员)',
    submit_time DATETIME DEFAULT NULL COMMENT '提交时间',
    approver_id BIGINT DEFAULT NULL COMMENT '核准人',
    approve_time DATETIME DEFAULT NULL COMMENT '核准时间',
    production_time DATETIME DEFAULT NULL COMMENT '下发生产时间',
    reject_reason VARCHAR(500) DEFAULT NULL COMMENT '驳回原因',
    remark VARCHAR(1000) DEFAULT NULL COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_formula_no_version (formula_no, version),
    KEY idx_status (status),
    KEY idx_creator_id (creator_id),
    KEY idx_color_no (color_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='染色配方主表';

DROP TABLE IF EXISTS dyeing_formula_detail;
CREATE TABLE dyeing_formula_detail (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    formula_id BIGINT NOT NULL COMMENT '配方主表ID',
    auxiliary_id BIGINT NOT NULL COMMENT '助剂ID',
    dosage DECIMAL(12,4) NOT NULL COMMENT '用量',
    dosage_unit VARCHAR(20) NOT NULL DEFAULT 'kg' COMMENT '用量单位',
    dosage_percent DECIMAL(8,4) DEFAULT NULL COMMENT '用量百分比(相对于面料重量)',
    process_step INT DEFAULT NULL COMMENT '工艺步骤序号',
    process_stage VARCHAR(50) DEFAULT NULL COMMENT '工艺阶段：前处理/染色/后整理',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_formula_id (formula_id),
    KEY idx_auxiliary_id (auxiliary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='染色配方明细表';

-- ============================================
-- 4. 小样测试模块
-- ============================================

DROP TABLE IF EXISTS sample_test;
CREATE TABLE sample_test (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    test_no VARCHAR(50) NOT NULL COMMENT '小样测试编号',
    formula_id BIGINT NOT NULL COMMENT '关联配方ID',
    sample_batch VARCHAR(50) DEFAULT NULL COMMENT '小样批次',
    test_date DATE NOT NULL COMMENT '测试日期',
    tester_id BIGINT NOT NULL COMMENT '测试人(实验室)',
    lab_color_l DECIMAL(8,4) DEFAULT NULL COMMENT '实验室测量L*值',
    lab_color_a DECIMAL(8,4) DEFAULT NULL COMMENT '实验室测量a*值',
    lab_color_b DECIMAL(8,4) DEFAULT NULL COMMENT '实验室测量b*值',
    std_color_l DECIMAL(8,4) DEFAULT NULL COMMENT '标准样L*值',
    std_color_a DECIMAL(8,4) DEFAULT NULL COMMENT '标准样a*值',
    std_color_b DECIMAL(8,4) DEFAULT NULL COMMENT '标准样b*值',
    color_diff_de DECIMAL(8,4) DEFAULT NULL COMMENT '总色差ΔE',
    color_diff_dl DECIMAL(8,4) DEFAULT NULL COMMENT '明度差ΔL',
    color_diff_da DECIMAL(8,4) DEFAULT NULL COMMENT '红绿差Δa',
    color_diff_db DECIMAL(8,4) DEFAULT NULL COMMENT '黄蓝差Δb',
    color_pass_flag TINYINT DEFAULT NULL COMMENT '色差是否达标：0-否，1-是',
    rubbing_fastness VARCHAR(20) DEFAULT NULL COMMENT '摩擦牢度',
    washing_fastness VARCHAR(20) DEFAULT NULL COMMENT '水洗牢度',
    light_fastness VARCHAR(20) DEFAULT NULL COMMENT '日晒牢度',
    test_conclusion VARCHAR(20) DEFAULT NULL COMMENT '测试结论：PASS/FAIL/RETEST',
    test_report VARCHAR(1000) DEFAULT NULL COMMENT '测试报告/详细说明',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_test_no (test_no),
    KEY idx_formula_id (formula_id),
    KEY idx_test_date (test_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小样测试记录表';

-- ============================================
-- 5. 废水排放模块
-- ============================================

DROP TABLE IF EXISTS wastewater_daily_quota;
CREATE TABLE wastewater_daily_quota (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    quota_date DATE NOT NULL COMMENT '排放日期',
    total_cod_quota DECIMAL(12,2) NOT NULL COMMENT '当日COD总许可量(kg)',
    used_cod_quota DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已使用COD量(kg)',
    remaining_cod_quota DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '剩余COD量(kg)',
    total_water_quota DECIMAL(12,2) DEFAULT NULL COMMENT '当日总水量许可量(吨)',
    used_water_quota DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已使用水量(吨)',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_quota_date (quota_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='废水日排放额度表';

DROP TABLE IF EXISTS wastewater_log;
CREATE TABLE wastewater_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    log_no VARCHAR(50) NOT NULL COMMENT '记录编号',
    formula_id BIGINT DEFAULT NULL COMMENT '关联配方ID',
    production_date DATE NOT NULL COMMENT '实际生产日期',
    estimated_cod DECIMAL(12,4) NOT NULL COMMENT '预估COD排放量(g)',
    actual_cod DECIMAL(12,4) DEFAULT NULL COMMENT '实际COD排放量(g)',
    estimated_water DECIMAL(12,2) DEFAULT NULL COMMENT '预估用水量(吨)',
    actual_water DECIMAL(12,2) DEFAULT NULL COMMENT '实际用水量(吨)',
    checker_id BIGINT DEFAULT NULL COMMENT '环保员核对人',
    check_time DATETIME DEFAULT NULL COMMENT '核对时间',
    check_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '核对状态：PENDING待核对/CHECKED已核对/REJECTED有异议',
    remark VARCHAR(500) DEFAULT NULL COMMENT '备注',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_log_no (log_no),
    KEY idx_production_date (production_date),
    KEY idx_formula_id (formula_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='废水排放记录表';

-- ============================================
-- 6. 生产排产调度模块
-- ============================================

DROP TABLE IF EXISTS production_schedule;
CREATE TABLE production_schedule (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    schedule_no VARCHAR(50) NOT NULL COMMENT '排产单号',
    formula_id BIGINT NOT NULL COMMENT '配方ID',
    plan_date DATE NOT NULL COMMENT '计划生产日期',
    schedule_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '排产状态：PENDING待排产/SCHEDULED已排产/DELAYED已延期/CANCELLED已取消/COMPLETED已完成',
    cod_load DECIMAL(12,4) DEFAULT NULL COMMENT '预计COD负荷(kg)',
    delay_reason VARCHAR(500) DEFAULT NULL COMMENT '延期原因（如废水额度不足）',
    delay_to_date DATE DEFAULT NULL COMMENT '延期至日期',
    actual_start_time DATETIME DEFAULT NULL COMMENT '实际开始时间',
    actual_end_time DATETIME DEFAULT NULL COMMENT '实际结束时间',
    machine_no VARCHAR(50) DEFAULT NULL COMMENT '机台号',
    operator_id BIGINT DEFAULT NULL COMMENT '生产负责人',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_schedule_no (schedule_no),
    KEY idx_plan_date (plan_date),
    KEY idx_formula_id (formula_id),
    KEY idx_schedule_status (schedule_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产排产表';

-- ============================================
-- 7. 审批流程记录
-- ============================================

DROP TABLE IF EXISTS formula_approval_log;
CREATE TABLE formula_approval_log (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    formula_id BIGINT NOT NULL COMMENT '配方ID',
    approval_node VARCHAR(50) NOT NULL COMMENT '审批节点：SUBMIT提交/SAMPLE小样测试/COLOR色差审核/STOCK库存核验/ENV环保核对/APPROVE最终核准',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operation VARCHAR(20) NOT NULL COMMENT '操作：SUBMIT/PASS/REJECT',
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    comment VARCHAR(1000) DEFAULT NULL COMMENT '审批意见',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_formula_id (formula_id),
    KEY idx_approval_node (approval_node)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配方审批流程记录表';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 初始化数据
-- ============================================

INSERT INTO sys_role (role_code, role_name, description) VALUES
('TECHNICIAN', '工艺员', '负责创建、修改染色配方'),
('LAB_TESTER', '实验室测试员', '负责小样测试和色差检测'),
('ENV_OFFICER', '环保员', '负责废水排放额度核对'),
('WAREHOUSE_KEEPER', '仓库管理员', '负责助剂库存管理'),
('PRODUCTION_MANAGER', '生产主管', '负责生产排产和下发'),
('ADMIN', '系统管理员', '系统管理员，拥有所有权限');

INSERT INTO sys_user (username, password, real_name, role_id, phone, status) VALUES
('tech01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '张工艺', 1, '13800000001', 1),
('lab01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '李实验', 2, '13800000002', 1),
('env01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '王环保', 3, '13800000003', 1),
('warehouse01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '赵仓库', 4, '13800000004', 1),
('prod01', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '陈主管', 5, '13800000005', 1),
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '管理员', 6, '13800000000', 1);

INSERT INTO auxiliary (aux_code, aux_name, aux_type, cas_no, unit, forbidden_flag, cod_per_unit, description) VALUES
('DYE-001', '活性红X-3B', '活性染料', '17752-85-1', 'kg', 0, 150.5000, '常用红色活性染料'),
('DYE-002', '活性黄X-R', '活性染料', '50662-98-1', 'kg', 0, 120.3000, '常用黄色活性染料'),
('DYE-003', '活性蓝X-BR', '活性染料', '13324-19-9', 'kg', 0, 180.2000, '常用蓝色活性染料'),
('AUX-001', '匀染剂O', '匀染剂', NULL, 'kg', 0, 80.0000, '非离子型匀染剂'),
('AUX-002', '固色剂Y', '固色剂', NULL, 'kg', 0, 95.5000, '阳离子型固色剂'),
('AUX-003', '渗透剂JFC', '渗透剂', NULL, 'kg', 0, 65.0000, '脂肪醇聚氧乙烯醚'),
('AUX-004', '烧碱NaOH', '碱剂', '1310-73-2', 'kg', 0, 45.0000, '用于固色pH调节'),
('AUX-005', '纯碱Na2CO3', '碱剂', '497-19-8', 'kg', 0, 55.0000, '用于固色pH调节'),
('AUX-006', '元明粉Na2SO4', '促染剂', '7757-82-6', 'kg', 0, 30.0000, '促染用'),
('AUX-099', '禁限用分散染料XX', '分散染料', '12345-67-8', 'kg', 1, 200.0000, 'REACH法规禁限用，含致癌芳香胺');

INSERT INTO auxiliary_stock (auxiliary_id, warehouse, batch_no, quantity, safety_stock, expire_date) VALUES
(1, '主仓库', 'B202401001', 500.0000, 100.0000, '2026-12-31'),
(2, '主仓库', 'B202401002', 450.0000, 100.0000, '2026-12-31'),
(3, '主仓库', 'B202401003', 380.0000, 100.0000, '2026-12-31'),
(4, '主仓库', 'B202401004', 200.0000, 50.0000, '2025-12-31'),
(5, '主仓库', 'B202401005', 180.0000, 50.0000, '2025-12-31'),
(6, '主仓库', 'B202401006', 250.0000, 50.0000, '2025-12-31'),
(7, '主仓库', 'B202401007', 1000.0000, 200.0000, '2027-12-31'),
(8, '主仓库', 'B202401008', 800.0000, 200.0000, '2027-12-31'),
(9, '主仓库', 'B202401009', 1500.0000, 300.0000, '2027-12-31');

INSERT INTO wastewater_daily_quota (quota_date, total_cod_quota, used_cod_quota, remaining_cod_quota, total_water_quota, used_water_quota) VALUES
(CURDATE(), 500.00, 0.00, 500.00, 1000.00, 0.00),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 500.00, 0.00, 500.00, 1000.00, 0.00),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 500.00, 0.00, 500.00, 1000.00, 0.00);
