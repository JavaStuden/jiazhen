# 太禾行到家

三端项目：`backend`（Spring Boot）、`admin-web`（Vue 3 + Vite）、`miniprogram`（微信原生小程序）。

## 运行

后端：在 `backend` 目录用 IDE 运行 `TaihexingApplication`，默认 `http://localhost:8080`。安装 Maven 后也可执行 `mvn spring-boot:run`。项目已配置 MySQL 和 JPA。

管理端：

```bash
cd admin-web
npm install
npm run dev
```

默认 `http://localhost:5173`，Vite 会把 `/api` 代理到后端。

小程序：用微信开发者工具打开 `miniprogram`。服务列表可在线读取；微信登录、发布订单、订单查询和服务人员接单会在身份与角色权限接入后开放。

服务器部署地址：管理端 `https://voice.yourunshi.online/taihexing/`；小程序 API 根地址 `https://voice.yourunshi.online/taihexing/api/public`。微信公众平台中需将 `voice.yourunshi.online` 加入小程序 HTTPS request 合法域名，之后用开发者工具预览并提交小程序版本。

管理接口（需管理员会话）：`POST /api/auth/login`、`GET /api/auth/me`、`GET /api/admin/dashboard`、`GET /api/admin/services`、`GET /api/admin/providers`、`GET /api/admin/orders`、`PATCH /api/admin/orders/{id}/status`、`POST /api/admin/orders/{id}/accept`。小程序当前只公开 `GET /api/public/services`；发布订单、查询订单和服务人员接单要在微信登录与身份权限接入后开放。

可用 `compose.yaml` 部署 MySQL 与后端；数据库卷独立持久化。`deploy/` 下的 systemd timer 每日压缩备份数据库并保留 14 天。首次启动时会写入服务项目和服务人员演示数据。生产环境还需配置微信登录、支付、地图和对象存储。
