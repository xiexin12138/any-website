"use client";

import { useEffect, useRef } from "react";

interface ShadowDOMRendererProps {
  streamData: string;
  error: string | null;
}

export default function ShadowDOMRenderer({ 
  streamData, 
  error 
}: ShadowDOMRendererProps) {
  const shadowHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupShadowDOM = () => {
      if (!shadowHostRef.current) return null;

      // 检查是否已经有Shadow DOM
      if (shadowHostRef.current.shadowRoot) {
        // 如果已存在，清空内容
        const shadowRoot = shadowHostRef.current.shadowRoot;
        shadowRoot.innerHTML = "";
        return shadowRoot;
      } else {
        // 如果不存在，创建新的Shadow DOM
        return shadowHostRef.current.attachShadow({ mode: "open" });
      }
    };

    const shadowRoot = setupShadowDOM();
    if (!shadowRoot) return;

    // 添加Shadow DOM样式
    const style = document.createElement("style");
    style.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 16px;
        line-height: 1.6;
        color: #333;
      }
      .text-content {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        margin: 8px 0;
        border-left: 4px solid #007bff;
      }
      .text-content a {
        color: #007bff;
        text-decoration: none;
      }
      .text-content a:hover {
        text-decoration: underline;
      }
      .text-content h1, .text-content h2, .text-content h3, .text-content h4, .text-content h5, .text-content h6 {
        margin: 16px 0 8px 0;
        color: #333;
      }
      .text-content p {
        margin: 8px 0;
      }
      .text-content ul, .text-content ol {
        margin: 8px 0;
        padding-left: 20px;
      }
      .text-content li {
        margin: 4px 0;
      }
      .list-content {
        margin: 8px 0;
      }
      .list-content ul {
        margin: 0;
        padding-left: 20px;
      }
      .list-content li {
        margin: 4px 0;
      }
      .table-content {
        margin: 8px 0;
        overflow-x: auto;
      }
      .table-content table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #ddd;
      }
      .table-content th,
      .table-content td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }
      .table-content th {
        background: #f8f9fa;
        font-weight: 600;
      }
      .table-content tr:hover {
        background: #f5f5f5;
      }
      .image-content {
        margin: 8px 0;
      }
      .image-content img {
        max-width: 100%;
        height: auto;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: #666;
      }
      .spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .error {
        background: #fee;
        border: 1px solid #fcc;
        padding: 12px;
        border-radius: 6px;
        color: #c33;
      }
    `;
    shadowRoot.appendChild(style);

    // 处理内容渲染
    if (error) {
      shadowRoot.innerHTML = `
        <style>
          body { font-family: sans-serif; padding: 16px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 6px; color: #c33; }
        </style>
        <div class="error">
          <h3>错误</h3>
          <p>${error}</p>
        </div>
      `;
    } else if (streamData) {
      // 创建内容容器
      const contentContainer = document.createElement("div");
      shadowRoot.appendChild(contentContainer);

      // 移除开头的Markdown代码块标记
      let cleanContent = streamData.trim();
      if (cleanContent.startsWith("```html")) {
        cleanContent = cleanContent.substring(7); // 移除 ```html
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.substring(3); // 移除 ```
      }

      // 移除结尾的Markdown代码块标记
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.substring(
          0,
          cleanContent.length - 3
        );
      }

      // 设置完整的HTML内容
      contentContainer.innerHTML = cleanContent;
    }

    // 清理函数
    return () => {
      if (shadowHostRef.current && shadowHostRef.current.shadowRoot) {
        shadowHostRef.current.shadowRoot.innerHTML = "";
      }
    };
  }, [streamData, error]);

  return (
    <div
      ref={shadowHostRef}
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    />
  );
} 