# 印染车间配方变更管理系统

> 完整前后端分离的印染配方变更管理系统，涵盖配方 CRUD、小样色差测试、助剂库存校验、废水 COD 排放调度和多角色审批。

---

## 一、业务规则概述

| 编号 | 规则 | 触发节点 |
|------|------|----------|
| R1 | 禁限用助剂（`forbidden_flag=1`）不允许进入配方，提交时自动拦截 | 工艺员 `submitFormula` |
| R2 | 助剂库存不足（配方用量 > 当前库存）不允许提交 | 工艺员 `submitFormula` |
| R3 | 色差 ΔE 未达标（ΔE > 配方标准值），主管无法核准 | 审核人 `approveFormula` |
| R4 | 下发生产时二次校验色差必须达标 | 生产主管 `issueProduction` |
| R5 | 当日废水 COD 排放额度不足，系统自动寻找未来 7 天内第一个可用日期进行延期排产 | 生产主管 `issueProduction` |
| R6 | 下发生产时自动扣减助剂库存并记录库存流水 | 生产主管 `issueProduction` |

### CIE LAB 色差公式

```
ΔE = √[(ΔL*)² + (Δa*)² + (Δb*)²]
```

### 配方预估 COD 计算

```
预估COD(g) = Σ(助剂用量 kg × 助剂单位COD g/kg)
```

---

## 二、技术栈

### 后端
- Java 17
- Spring Boot 3.2.5
- MyBatis Plus 3.5.5（Spring Boot 3 版本）
- MySQL 8.0
- Spring Security 6 + JWT（jjwt 0.11.5）
- Lombok 1.18.30

### 前端
- Angular 17
- TypeScript 5.x
- NG-ZORRO (ng-zorro-antd 17.x)
- RxJS 7.8
- Zone.js 0.14

---

## 三、目录结构

```
.
├── database/
│   └── schema.sql                      # 建表脚本（含初始化数据）
├── backend/                            # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/dyeing/formula/
│       │   ├── DyeingFormulaApplication.java
│       │   ├── config/                 # 配置（安全、异常、分页）
│       │   ├── entity/                 # 实体类（13个）
│       │   ├── mapper/                 # MyBatis Plus Mapper
│       │   ├── service/                # Service 接口与实现
│       │   ├── controller/             # REST 接口
│       │   ├── dto/ vo/                # 请求/响应
│       │   └── exception/              # 异常
│       └── resources/
│           └── application.yml
└── frontend/                           # Angular 17 前端
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.less
        ├── styles.css
        ├── environments/
        └── app/
            ├── app.module.ts
            ├── app-routing.module.ts
            ├── models/                 # TS 接口定义
            ├── services/               # HTTP 服务封装
            ├── guards/                 # 认证守卫
            └── components/
                ├── login/              # 登录页
                ├── layout/             # 主布局（菜单）
                ├── formula/            # 配方管理（列表+详情/编辑）
                ├── auxiliary/          # 助剂档案
                ├── sample/             # 小样测试记录
                ├── stock/              # 库存管理
                ├── wastewater/         # 废水额度
                └── schedule/           # 生产排产
```

---

## 四、快速开始

### 4.1 初始化数据库

```bash
# 创建数据库
mysql -uroot -p -e "CREATE DATABASE dyeing_formula DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

# 导入建表脚本和初始化数据
mysql -uroot -p dyeing_formula < database/schema.sql
```

> 如需修改数据库用户名/密码，编辑 `backend/src/main/resources/application.yml`。

### 4.2 启动后端

```bash
cd backend

# 编译
mvn clean package -DskipTests

# 运行
java -jar target/dyeing-formula-backend-1.0.0.jar

# 或开发模式
mvn spring-boot:run
```

后端启动后监听 `http://localhost:8080/api`。

### 4.3 启动前端

```bash
cd frontend

# 安装依赖（首次）
npm install

# 启动开发服务器
npm start
```

前端启动后访问 `http://localhost:4200`。

---

## 五、测试账号

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | 123456 | 超级管理员 | 全部功能 |
| technician | 123456 | 工艺员 | 配方新建、编辑、提交 |
| labtester | 123456 | 实验室 | 录入小样测试结果 |
| approver | 123456 | 审核主管 | 核准 / 驳回 |
| env_officer | 123456 | 环保员 | 废水额度查看、排放记录 |
| prod_manager | 123456 | 生产主管 | 下发生产、排产管理 |

---

## 六、核心 API 速查

| 模块 | 方法 | URL | 说明 |
|------|------|-----|------|
| 配方 | GET | `/formula/page` | 配方分页列表 |
| 配方 | GET | `/formula/{id}` | 配方详情（含明细+小样+审批日志） |
| 配方 | POST | `/formula` | 保存配方（草稿） |
| 配方 | POST | `/formula/submit` | 提交配方（校验 R1/R2） |
| 配方 | POST | `/formula/approve/{id}` | 核准（校验 R3） |
| 配方 | POST | `/formula/reject/{id}` | 驳回 |
| 配方 | POST | `/formula/issue/{id}` | 下发生产（校验 R4/R5/R6） |
| 小样 | POST | `/sample` | 录入小样测试记录，自动计算 ΔE |
| 小样 | GET | `/sample/color-diff` | 计算 CIE LAB 色差 |
| 助剂 | GET | `/auxiliary/page` | 助剂档案分页 |
| 助剂 | GET | `/auxiliary/available` | 可用助剂列表（不含禁限用） |
| 库存 | GET | `/stock/page` | 库存分页 |
| 废水 | GET | `/wastewater/quota/today` | 当日额度 |
| 废水 | GET | `/wastewater/quota/page` | 额度分页 |
| 废水 | GET | `/wastewater/schedule/page` | 排产分页 |
| 认证 | POST | `/auth/login` | 登录 |
| 认证 | GET | `/auth/users` | 用户列表 |

---

## 七、数据模型总览

| 表名 | 中文名 | 核心字段 |
|------|--------|----------|
| `sys_user` | 用户 | user_id, username, password, real_name |
| `sys_role` | 角色 | role_code, role_name（TECHNICIAN / LAB_TESTER / APPROVER / ENV_OFFICER / PRODUCTION_MANAGER / ADMIN） |
| `auxiliary` | 助剂档案 | aux_code, aux_name, aux_type, forbidden_flag, cod_per_unit（单位COD） |
| `auxiliary_stock` | 助剂库存 | auxiliary_id, quantity, safety_stock, warehouse, expire_date |
| `auxiliary_stock_log` | 库存流水 | change_quantity, change_type, op_type |
| `dyeing_formula` | 配方主表 | formula_no, version, status, fabric_type, color_no, batch_size, color_diff_standard, estimated_cod |
| `dyeing_formula_detail` | 配方明细 | auxiliary_id, dosage, dosage_percent, process_stage |
| `sample_test` | 小样测试 | lab_color_l/a/b, std_color_l/a/b, color_diff_de, color_pass_flag |
| `wastewater_daily_quota` | 每日废水额度 | quota_date, total_cod_quota, used_cod_quota, remaining_cod_quota |
| `wastewater_log` | 废水排放流水 | cod_load, water_volume |
| `production_schedule` | 生产排产 | schedule_no, formula_id, schedule_date, delayed_flag, delay_reason |
| `formula_approval_log` | 审批日志 | approval_node, operation, operator_id, comment |

---

## 八、配方状态流转

```
DRAFT (草稿)
   │ submitFormula
   ▼
SUBMITTED (已提交)
   │ 实验室录入小样
   ▼
SAMPLE (小样测试中)
   │ 实验室完成
   ├─────────► APPROVED (已核准) — issueProduction ► PRODUCTION (已下发生产)
   │ 主管驳回                     │
   └─────────► REJECTED (驳回)    └──► 库存扣减 + 额度预占 + 排产单（可延期）

任何状态可作废：► OBSOLETE
```

---

## 九、默认初始化数据

schema.sql 已内置：
- 6 个用户 + 6 种角色
- 10 种助剂（其中 1 种为禁限用：活性红 X-3B，带禁用标记）
- 9 条库存记录（含部分低于安全库存数据用于演示）
- 3 天废水排放额度（当天、次日、后日）用于演示延期排产逻辑

---

## 十、常见问题

**Q：前后端联调跨域？**
A：后端已在 `SecurityConfig` 中配置全局 CORS（`allowedOrigins("*")`），可直接联调。

**Q：想查看 ΔE 色差的具体实现？**
A：后端位于 `service/impl/SampleTestServiceImpl.java`，前端公式已在 `formula-detail.component.ts::calcColorDiff()` 中复用后端接口。

**Q：废水额度延期的调度逻辑在哪？**
A：`WastewaterServiceImpl.getAvailableQuotas()` 扫描未来 7 天，`ProductionScheduleServiceImpl.issueProduction()` 执行延期策略。
