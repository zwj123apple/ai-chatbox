# AI 聊天盒子 (AI ChatBox)

<div align="center">

一个功能强大、界面美观的 AI 聊天应用，支持多种 AI 服务提供商，提供流畅的对话体验。

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646cff?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js->=16.0.0-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## ✨ 功能特性

- 🎨 **现代化 UI 设计**
  - 支持深色/浅色主题切换
  - 响应式布局，适配多种设备
  - 流畅的动画效果

- 💬 **强大的聊天功能**
  - 实时流式消息输出
  - Markdown 格式支持
  - 代码高亮显示
  - LaTeX 数学公式渲染
  - 消息复制功能

- 🔐 **用户认证系统**
  - 注册/登录功能
  - 快速登录选项
  - 本地数据持久化

- 📝 **会话管理**
  - 创建多个聊天会话
  - 会话列表管理
  - 会话历史记录

- 🤖 **多 AI 服务支持**
  - 支持多种 AI 模型配置
  - 灵活的 API 配置
  - 代理服务器支持

- ⚙️ **个性化设置**
  - AI 模型选择
  - 参数自定义（温度、最大令牌等）
  - 系统提示词配置

## 🛠️ 技术栈

### 前端

- **框架**: React 19.1.1
- **构建工具**: Vite 7.1.2
- **样式**: Tailwind CSS 4.1.13
- **UI 组件**: Lucide React (图标库)
- **Markdown 渲染**:
  - react-markdown
  - remark-gfm (GitHub Flavored Markdown)
  - remark-math (数学公式)
  - rehype-katex (LaTeX 渲染)
  - rehype-raw (HTML 支持)
- **代码高亮**: react-syntax-highlighter

### 后端

- **运行时**: Node.js >= 16.0.0
- **框架**: Express 4.21.2
- **HTTP 客户端**: Axios 1.12.2
- **代理中间件**: http-proxy-middleware 2.0.9
- **环境变量**: dotenv 16.6.1
- **跨域支持**: cors 2.8.5

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/zwj123apple/ai-chatbox.git
cd ai-chatbox
```

2. **安装前端依赖**

```bash
npm install
```

3. **安装后端依赖**

```bash
cd server
npm install
cd ..
```

4. **配置环境变量**

在项目根目录创建 `.env` 文件：

```env
# 前端环境变量（如需要）
VITE_API_BASE_URL=http://localhost:3001
```

在 `server` 目录创建 `.env` 文件：

```env
# 后端环境变量
PORT=3001

# AI API 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 代理配置（可选）
HTTP_PROXY=
HTTPS_PROXY=

# 其他 AI 服务配置（可选）
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

5. **启动开发服务器**

```bash
# 终端 1 - 启动前端开发服务器
npm run dev

# 终端 2 - 启动后端服务器
cd server
npm run dev
```

6. **访问应用**

打开浏览器访问: `http://localhost:5173`

## 📁 项目结构

```
ai-chatbox/
├── public/                      # 静态资源
├── server/                      # 后端服务
│   ├── app.js                  # 后端主文件
│   ├── .env                    # 后端环境变量
│   └── package.json            # 后端依赖配置
├── src/
│   ├── assets/                 # 前端静态资源
│   ├── components/             # React 组件
│   │   ├── auth/              # 认证相关组件
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── QuickLoginButton.jsx
│   │   ├── chat/              # 聊天相关组件
│   │   │   ├── ChatArea.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageRender.jsx
│   │   │   ├── StreamingMessageBubble.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── EnhancedMessageRenderer.jsx
│   │   └── sidebar/           # 侧边栏组件
│   │       ├── Sidebar.jsx
│   │       └── ConversationItem.jsx
│   ├── config/                # 配置文件
│   │   └── ai.config.js       # AI 配置
│   ├── context/               # React Context
│   │   └── AppContext.jsx     # 全局状态管理
│   ├── services/              # 服务层
│   │   ├── ai.service.js      # AI 服务
│   │   └── storage.service.js # 存储服务
│   ├── settings/              # 设置组件
│   │   └── AISettings.jsx     # AI 设置
│   ├── utils/                 # 工具函数
│   │   └── helpers.js
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx               # 应用入口
│   └── index.css              # 全局样式
├── .env                        # 前端环境变量
├── .gitignore                 # Git 忽略文件
├── eslint.config.js           # ESLint 配置
├── index.html                 # HTML 模板
├── package.json               # 前端依赖配置
├── README.md                  # 项目说明文档
└── vite.config.js             # Vite 配置
```

## 🔧 配置说明

### AI 服务配置

在 `src/config/ai.config.js` 中配置 AI 服务：

```javascript
export const AI_CONFIG = {
  defaultProvider: "openai",
  providers: {
    openai: {
      apiKey: "your-api-key",
      baseUrl: "https://api.openai.com/v1",
      models: ["gpt-4", "gpt-3.5-turbo"],
    },
    // 添加其他提供商...
  },
};
```

### 后端代理配置

后端服务器提供 API 代理功能，确保在 `server/.env` 中正确配置：

```env
PORT=3001
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📝 开发指南

### 可用脚本

**前端**

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 运行 ESLint 检查
```

**后端**

```bash
cd server
npm start        # 启动生产服务器
npm run dev      # 启动开发服务器（nodemon）
```

### 代码规范

项目使用 ESLint 进行代码规范检查，配置文件：

- 前端: `eslint.config.js`
- 后端: `server/eslint.config.mjs`

### 开发建议

1. **组件开发**: 遵循 React 最佳实践，使用函数组件和 Hooks
2. **状态管理**: 使用 Context API 进行全局状态管理
3. **样式编写**: 使用 Tailwind CSS 工具类
4. **代码格式**: 保持代码风格一致

## 🎯 核心功能实现

### 流式消息渲染

使用 `StreamingMessageBubble` 组件实现实时流式输出：

- 支持逐字显示效果
- Markdown 实时解析
- 代码块语法高亮

### 消息渲染增强

`EnhancedMessageRenderer` 提供：

- GitHub Flavored Markdown 支持
- LaTeX 数学公式渲染
- 代码块复制功能
- 自定义样式

### 本地存储

使用 `storage.service.js` 实现数据持久化：

- 用户信息存储
- 会话历史记录
- 设置保存

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- [Express](https://expressjs.com/) - Node.js Web 框架

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [https://github.com/zwj123apple/ai-chatbox/issues](https://github.com/zwj123apple/ai-chatbox/issues)
- Email: your.email@example.com

---

<div align="center">
  Made with ❤️ by AI ChatBox Team
</div>
