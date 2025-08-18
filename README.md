# 🚪 网站任意门

一个基于AI的创意内容生成平台，让探索变得有趣！

## 📖 项目简介

"网站任意门"是一个充满想象力的AI内容生成网站。用户输入任何路径，AI都会实时生成独特的网页内容。无论是魔法世界、科幻冒险，还是美食探索，AI都能为你创造惊喜！

### ✨ 核心特性

- **🎯 无限可能** - 输入任何路径，AI都会为你创建一个独特的网页内容
- **⚡ 实时生成** - 内容实时生成，就像魔法一样，你输入什么，AI就为你创造什么
- **🎮 娱乐探索** - 纯粹为了好玩！探索不同的路径，发现AI为你准备的奇妙内容
- **🎲 随机探索** - 点击随机按钮，跳出信息茧房，发现新的领域
- **📊 热门统计** - 智能记录用户搜索，展示热门内容，支持去重防刷
- **🔍 搜索记录** - 完整的搜索历史和数据分析功能

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
- **Prisma ORM** - 类型安全的数据库操作
- **PostgreSQL** - 可靠的关系型数据库
- **Supabase** - 现代化的数据库服务

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

#### 🤖 AI模型配置（必需）
```env
# 硅基流动API配置
SILICON_FLOW_API_ENDPOINT=https://api.siliconflow.cn/v1/chat/completions
SILICON_FLOW_API_KEY=your_api_key_here
SILICON_FLOW_MODEL=Qwen/Qwen3-Coder-480B-A35B-Instruct
SILICON_FLOW_FREE_MODEL=Qwen/Qwen3-8B
MAX_TOKENS=8192
```

#### 🌐 应用配置（必需）
```env
# 主机地址（部署时请填写实际域名）
NEXT_PUBLIC_HOST_URL=localhost:3000
```

#### 📊 数据库配置（可选）
如果需要热门搜索和数据统计功能，请配置Supabase数据库：
```env
# Supabase Database Configuration
POSTGRES_URL="your_postgres_url_here"
POSTGRES_PRISMA_URL="your_postgres_prisma_url_here"
POSTGRES_URL_NON_POOLING="your_postgres_url_non_pooling_here"
POSTGRES_USER="your_postgres_user_here"
POSTGRES_PASSWORD="your_postgres_password_here"
POSTGRES_DATABASE="your_postgres_database_here"
POSTGRES_HOST="your_postgres_host_here"

# Supabase
SUPABASE_URL="your_supabase_url_here"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url_here"
SUPABASE_JWT_SECRET="your_supabase_jwt_secret_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

#### 📈 分析工具配置（可选）
```env
# 网站访问统计, 使用的是开源 项目 plausible
NEXT_PUBLIC_ANALYTICS_URL=https://your-analytics-url/js/script.js
```

> 💡 **提示**：
> - 必需配置：AI模型和应用配置是运行的基本要求
> - 数据库配置：不配置也能正常使用，但无法使用热门搜索功能
> - 分析工具：用于网站访问统计，可选配置

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

## ✨ 一键部署

点击下方按钮，即可将此项目部署到你自己的 Vercel 账户上！

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/xiexin12138/any-website.git&project-name=any-website&repository-name=any-website&env=SILICON_FLOW_API_ENDPOINT,SILICON_FLOW_API_KEY,MAX_TOKENS,NEXT_PUBLIC_HOST_URL&envDescription=你需要提供硅基流动API的URL地址、API密钥和最大token数、以及部署的域名地址&envLink=https://github.com/xiexin12138/any-website/blob/main/env-setup.md)

---

## 📁 项目结构

```
any-website/
├── app/                    # Next.js App Router
│   ├── [...slug]/         # 动态路由页面
│   ├── api/               # API路由
│   │   ├── light-me/      # 随机词汇生成API
│   │   ├── stream/        # 流式内容生成API
│   │   └── trending/      # 热门搜索API
│   ├── components/        # 共享组件
│   ├── lib/              # 库文件
│   │   └── prisma.ts     # 数据库连接
│   ├── ui/               # UI组件
│   │   ├── StreamRenderer.tsx
│   │   └── DraggableLoadingIndicator.tsx
│   └── utils/            # 工具函数
├── prisma/               # 数据库配置
│   └── schema.prisma     # 数据库模型
├── scripts/              # 脚本文件
│   ├── init-db.js       # 数据库初始化
│   └── cleanup-logs.js  # 数据清理
├── public/               # 静态资源
├── .env.example         # 环境变量示例
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

### 数据库管理
```bash
# 推送数据库架构更新
pnpm db:push

# 生成Prisma客户端
pnpm db:generate

# 初始化数据库（首次运行）
pnpm db:init

# 打开数据库管理界面
pnpm db:studio

# 清理过期数据
pnpm db:cleanup
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

#### 5. 数据统计系统
- 热门搜索统计和排序
- 用户搜索去重（同一用户一天内相同搜索只记录一次）
- 搜索记录和数据分析
- 自动数据清理机制

#### 6. 生产环境优化
- 开发环境不记录搜索数据
- 只在页面成功渲染后记录统计
- 智能的用户标识和隐私保护

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
