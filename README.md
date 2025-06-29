# 🚪 网站任意门

一个基于AI的创意内容生成平台，让探索变得有趣！

## 📖 项目简介

"网站任意门"是一个充满想象力的AI内容生成网站。用户输入任何路径，AI都会实时生成独特的网页内容。无论是魔法世界、科幻冒险，还是美食探索，AI都能为你创造惊喜！

### ✨ 核心特性

- **🎯 无限可能** - 输入任何路径，AI都会为你创建一个独特的网页内容
- **⚡ 实时生成** - 内容实时生成，就像魔法一样，你输入什么，AI就为你创造什么
- **🎮 娱乐探索** - 纯粹为了好玩！探索不同的路径，发现AI为你准备的奇妙内容
- **🎲 随机探索** - 点击随机按钮，跳出信息茧房，发现新的领域

## 🛠️ 技术栈

### 前端技术
- **Next.js 15.3.4** - React全栈框架，支持App Router
- **React 19.0.0** - 用户界面库
- **TypeScript 5** - 类型安全的JavaScript
- **Tailwind CSS 4** - 实用优先的CSS框架

### 后端技术
- **Next.js API Routes** - 服务端API接口
- **流式响应** - 支持实时内容流式传输
- **Shadow DOM** - 隔离的内容渲染环境

### AI集成
- **硅基流动API** - 大语言模型接口
- **智能提示词** - 避免重复内容的智能推荐

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- pnpm (推荐) 或 npm

### 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 环境配置
通过 `cp .env.example .env` 创建 `.env` 文件并配置以下环境变量：

```env
# 硅基流动API配置
SILICON_FLOW_API_ENDPOINT=your_api_endpoint
SILICON_FLOW_API_KEY=your_api_key
SILICON_FLOW_MODEL=your_model_name
MAX_TOKENS=8192


<!-- 如果要部署到服务器，这里请填写上你的域名以确保大模型生成的URL是准确的 -->
NEXT_PUBLIC_HOST_URL=localhost:3000
```

### 启动开发服务器
```bash
# 使用 pnpm (推荐)
pnpm dev

# 或使用 npm
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 🎯 使用方法

### 基本使用
1. 在搜索框中输入任意路径，如：`魔法世界/霍格沃茨`
2. 点击"跳转"按钮
3. AI将为你生成独特的页面内容

### 随机探索
1. 点击🎲按钮获取随机领域词汇
2. 系统会避免重复你之前探索过的领域
3. 查看历史记录了解你的探索轨迹

### 示例路径
- `/魔法世界/霍格沃茨` - 魔法学院探索
- `/星际旅行/银河系` - 科幻冒险
- `/美食/意大利/披萨` - 美食文化
- `/时间/古代/唐朝` - 历史穿越
- `/音乐/古典/贝多芬` - 音乐殿堂

## 📁 项目结构

```
any-website/
├── app/                    # Next.js App Router
│   ├── [...slug]/         # 动态路由页面
│   ├── api/               # API路由
│   │   ├── light-me/      # 随机词汇生成API
│   │   └── stream/        # 流式内容生成API
│   ├── components/        # 共享组件
│   ├── ui/               # UI组件
│   │   ├── StreamRenderer.tsx
│   │   └── DraggableLoadingIndicator.tsx
│   └── utils/            # 工具函数
├── public/               # 静态资源
└── package.json         # 项目配置
```

## 🔧 开发指南

### 构建生产版本
```bash
pnpm build
```

### 启动生产服务器
```bash
pnpm start
```

### 代码检查
```bash
pnpm lint
```

### 技术特点

#### 1. 动态路由系统
- 使用Next.js的`[...slug]`捕获所有路由
- 支持无限层级的路径结构
- 自动生成页面元数据

#### 2. 流式内容渲染
- 实时接收AI生成的内容
- 使用Shadow DOM隔离渲染环境
- 支持HTML、CSS、JavaScript的实时注入

#### 3. 智能内容推荐
- 记录用户探索历史
- 避免重复推荐相同领域
- 本地存储支持离线查看

#### 4. 响应式设计
- 移动端优先的设计理念
- 支持各种屏幕尺寸
- 优雅的加载动画

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 优秀的React框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架
- [硅基流动](https://www.siliconflow.com/) - AI模型服务

## 📞 联系方式

- 项目地址：[GitHub](https://github.com/xiexin12138/any-website)
- 问题反馈：[Issues](https://github.com/xiexin12138/any-website/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
