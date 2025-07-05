# 前端 API 地址与环境变量配置说明

本项目前端所有接口请求均通过 `API_BASE` 变量统一配置，支持本地开发、内网和服务器部署灵活切换。

## 1. API_BASE 配置

`client/src/config.ts` 内容如下：

```ts
export const API_BASE = process.env.REACT_APP_API_HOST || "http://localhost:3001";
```

- 默认指向本地开发后端（http://localhost:3001）。
- 支持通过环境变量 `REACT_APP_API_HOST` 覆盖。

## 2. 本地开发

直接运行 `npm start`，前端会请求本地 3001 端口的后端服务。

## 3. 部署/内网/服务器环境

可通过设置环境变量切换 API 地址：

- **Windows（PowerShell）**：
  ```powershell
  $env:REACT_APP_API_HOST = "http://your-server-ip:3001"
  npm run build
  ```
- **Linux/macOS**：
  ```bash
  export REACT_APP_API_HOST="http://your-server-ip:3001"
  npm run build
  ```
- 或在 `.env` 文件中添加：
  ```env
  REACT_APP_API_HOST=http://your-server-ip:3001
  ```

## 4. 生产环境构建

构建时读取环境变量，打包后前端会自动请求指定 API 地址。

## 5. 其他说明

- 所有 fetch 请求均已统一为 `${API_BASE}`，无需手动修改代码。
- 如需运行时动态切换 API 地址，可扩展 config.ts 或增加设置页。

---
如有更多部署需求或定制化需求，请联系开发者。
