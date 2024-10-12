# LessURL - 短链接生成服务

LessURL 是一个简单而强大的短接服务，使用 Vue 3 和 Vite 构建。

## 功能特点

- 创建短链接
- 自定义别名
- 设置链接过期时间
- 查看链接点击统计
- 响应式设计，支持移动端和桌面端
- 深色模式支持

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia (状态管理)
- Vue Router
- Naive UI (UI 组件库)
- Axios (HTTP 客户端)
- Day.js (日期处理)

## 项目结构

```plain
less-url-front/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── plugins/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── views/
│   ├── App.vue
│   └── main.ts
├── mocks/
├── .eslintrc.cjs
├── .prettierrc.json
├── index.html
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 安装和运行

1. 克隆仓库

2. 安装依赖：

   ```bash
   npm install
   ```

3. 运行开发服务器：

   ```bash
   npm run dev
   ```

4. 构建生产版本：

   ```bash
   npm run build
   ```

## 贡献

欢迎提交 Pull Requests 来改进这个项目。在提交之前，请确保遵循现有的代码风格并通过所有的测试。

## 许可证

[MIT](LICENSE)
