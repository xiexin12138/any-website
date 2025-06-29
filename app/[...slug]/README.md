# 流式路由系统说明

## 概述

这个系统实现了一个基于Next.js 13+ App Router的流式路由，包含：
- 服务端组件：处理路由参数并请求API
- 客户端组件：渲染流式响应数据
- 模拟API：用于测试流式功能

## 文件结构

```
app/
├── [...slug]/
│   ├── page.tsx           # 服务端组件 - 处理路由和API请求
│   ├── StreamRenderer.tsx # 客户端组件 - 渲染流式数据
│   └── README.md          # 说明文档
└── api/
    └── stream/
        └── route.ts       # 模拟API路由 - 提供流式响应
```

## 功能特性

### 1. 服务端组件 (page.tsx)
- 获取路由参数 (`params.slug`)
- 请求API获取流式数据
- 错误处理和页面布局
- 动态元数据生成

### 2. 客户端组件 (StreamRenderer.tsx)
- 使用 `'use client'` 指令
- 处理流式响应数据
- 支持多种内容类型：文本、列表、表格、图片
- 实时渲染和错误处理

### 3. 模拟API (route.ts)
- 创建可读流 (`ReadableStream`)
- 模拟不同类型的流式数据
- 支持延迟发送数据

## 数据格式

流式数据使用JSON格式，每行一个对象：

```json
{"type": "text", "content": "消息内容", "id": "1", "timestamp": 1234567890}
{"type": "list", "content": ["项目1", "项目2"], "id": "2", "timestamp": 1234567890}
{"type": "table", "content": [{"name": "A", "value": 100}], "id": "3", "timestamp": 1234567890}
```

## 支持的内容类型

### 1. 文本 (text)
```json
{"type": "text", "content": "这是文本内容"}
```

### 2. 列表 (list)
```json
{"type": "list", "content": ["项目1", "项目2", "项目3"]}
```

### 3. 表格 (table)
```json
{"type": "table", "content": [
  {"name": "项目A", "value": 100, "status": "完成"},
  {"name": "项目B", "value": 200, "status": "进行中"}
]}
```

### 4. 图片 (image)
```json
{"type": "image", "content": "https://example.com/image.jpg"}
```

## 使用方法

### 1. 访问路由
访问任何非根路径，例如：
- `/test` → 处理路径 "test"
- `/blog/2024/01` → 处理路径 "blog/2024/01"
- `/products/electronics` → 处理路径 "products/electronics"

### 2. 自定义API
修改 `page.tsx` 中的 `fetchStreamData` 函数，连接到你的实际API：

```typescript
async function fetchStreamData(path: string) {
  const response = await fetch('https://your-api.com/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token',
    },
    body: JSON.stringify({
      path: path,
      // 其他参数
    }),
  });
  
  return response;
}
```

### 3. 扩展内容类型
在 `StreamRenderer.tsx` 中添加新的内容类型处理：

```typescript
case 'custom':
  return (
    <div key={data.id} className="mb-4">
      {/* 自定义渲染逻辑 */}
    </div>
  );
```

## 技术要点

### 1. 流式处理
- 使用 `ReadableStream` 创建流
- 使用 `TextDecoder` 解码数据
- 逐行处理JSON数据

### 2. 错误处理
- API请求错误处理
- 流式处理错误处理
- 用户友好的错误显示

### 3. 性能优化
- 客户端组件仅在需要时渲染
- 流式数据实时更新
- 内存管理（清理定时器等）

## 相关文档

- [Next.js 动态路由](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js 流式渲染](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) 