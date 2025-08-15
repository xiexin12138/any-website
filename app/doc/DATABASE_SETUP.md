# 数据库配置指南

本项目已集成 Prisma ORM 来管理热门搜索数据，支持连接 Supabase PostgreSQL 数据库。

## 🚀 快速开始

### 1. 配置环境变量

将 `.env.example` 复制为 `.env`，并填入您的 Supabase 数据库连接信息：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，将以下占位符替换为您的实际 Supabase 连接信息：

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

### 2. 推送数据库架构

```bash
npm run db:push
```

这将在您的 Supabase 数据库中创建必要的表结构。

### 3. 生成 Prisma 客户端

```bash
npm run db:generate
```

### 4. 初始化默认数据

```bash
npm run db:init
```

这将在数据库中插入一些默认的热门搜索数据。

## 📊 数据库架构

### TrendingSearch 表
存储热门搜索数据：
- `id`: 唯一标识符
- `path`: 搜索路径
- `category`: 分类
- `count`: 搜索次数
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### SearchRecord 表
存储所有搜索记录：
- `id`: 唯一标识符
- `path`: 搜索路径
- `category`: 分类（可选）
- `userAgent`: 用户代理（可选）
- `ip`: IP地址（可选）
- `createdAt`: 创建时间

## 🛠️ 可用命令

- `npm run db:push` - 推送架构到数据库
- `npm run db:generate` - 生成 Prisma 客户端
- `npm run db:init` - 初始化默认数据
- `npm run db:studio` - 打开 Prisma Studio 数据库管理界面

## 🔧 API 端点

### GET /api/trending
获取热门搜索数据

参数：
- `limit`: 返回数量限制（默认10，最大20）
- `category`: 按分类过滤（可选）

### POST /api/trending
记录新的搜索

请求体：
```json
{
  "path": "搜索路径",
  "category": "分类（可选）"
}
```

## 🚨 注意事项

1. 确保您的 Supabase 项目已启用并配置正确
2. 数据库连接字符串必须是有效的 PostgreSQL 连接字符串
3. 首次运行时需要先执行 `npm run db:push` 创建表结构
4. 如果遇到连接问题，请检查防火墙和网络设置

## 🔍 故障排除

### 连接错误
如果遇到数据库连接错误：
1. 检查 `.env` 文件中的连接字符串是否正确
2. 确认 Supabase 项目状态正常
3. 检查网络连接

### 权限错误
确保使用的数据库用户具有创建表和插入数据的权限。

### 架构同步
如果修改了 `prisma/schema.prisma`，记得运行：
```bash
npm run db:push
npm run db:generate
```