import { useEffect, useRef, useState } from "react";
import { DESIGN_STEPS } from "../constants/designSteps";

interface StreamRequest {
  path: string;
  userAgent: string;
}

interface UseStreamDataReturn {
  isLoading: boolean;
  error: string | null;
  streamData: string;
  renderStage: "designing" | "coding" | "completed";
  currentStepIndex: number;
}

export function useStreamData(path: string): UseStreamDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamData, setStreamData] = useState<string>("");
  const [renderStage, setRenderStage] = useState<
    "designing" | "coding" | "completed"
  >("designing");
  const abortControllerRef = useRef<AbortController | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 设计阶段的动画效果
  useEffect(() => {
    if (renderStage === "designing" && isLoading) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev + 1) % DESIGN_STEPS.length);
      }, 2000); // 每2秒切换一个步骤

      return () => clearInterval(interval);
    }
  }, [renderStage, isLoading]);

  useEffect(() => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 立即同步重置状态，避免路由过渡期间旧数据残留导致重复浮标
    setIsLoading(true);
    setError(null);
    setStreamData("");
    setRenderStage("designing");
    setCurrentStepIndex(0);

    // 创建新的AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let buffer = "";
    let accumulatedContent = ""; // 累积HTML内容
    let isAborted = false; // 标记是否被中断

    const processStream = async () => {
      try {

        // 发起流式请求
        const requestBody: StreamRequest = {
          path,
          userAgent: navigator.userAgent
        };
        
        const response = await fetch("/api/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // 尝试解析错误信息
          let errorMessage = `API请求失败: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // 如果无法解析JSON，使用原始错误文本
            if (errorText) {
              errorMessage = errorText;
            }
          }

          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error("响应不支持流式读取");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // 解码新的数据块
          buffer += decoder.decode(value, { stream: true });

          // 处理完整的数据行
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 保留不完整的行
          
          console.log(
            "🚀 ~ processStream ~ accumulatedContent:",
            accumulatedContent
          );

          for (const line of lines) {
            if (line.trim() === "") continue;
            console.log("🚀 ~ processStream ~ line:", line)

            // 处理SSE格式：data: {json数据}
            if (line.startsWith("data: ")) {
              const jsonStr = line.substring(6); // 移除 "data: " 前缀

              // 检查是否是结束标记
              if (jsonStr.trim() === "[DONE]") {
                continue;
              }

              try {
                // 尝试解析JSON数据
                const data = JSON.parse(jsonStr);

                // 检查是否是硅基流动API的响应格式
                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;

                  // 只处理content字段
                  if (delta.content) {
                    // 累积HTML内容到字符串
                    accumulatedContent += delta.content;

                    // 检测渲染阶段
                    if (renderStage === "designing") {
                      // 检查是否包含完整的HTML结构
                      const hasHtmlTag = accumulatedContent.includes("<html");
                      const hasHeadTag = accumulatedContent.includes("<head");
                      const hasBodyTag = accumulatedContent.includes("<body");

                      // 如果同时包含html、head、body标签，说明开始进入HTML结构阶段
                      if (hasHtmlTag && hasHeadTag && hasBodyTag) {
                        setRenderStage("coding");
                      }
                    }

                    // 更新状态 - 累积HTML字符串
                    setStreamData((prev) => prev + delta.content);
                  }
                } else {
                  // 如果不是硅基流动API格式，尝试作为普通文本处理
                  accumulatedContent += JSON.stringify(data);
                  setStreamData((prev) => prev + JSON.stringify(data));
                }
              } catch (parseError) {
                console.error(
                  "JSON解析错误:",
                  parseError,
                  "原始数据:",
                  jsonStr
                );
                // 如果JSON解析失败，作为纯文本处理
                accumulatedContent += jsonStr;
                setStreamData((prev) => prev + jsonStr);
              }
            } else {
              // 如果不是SSE格式，作为普通文本处理
              accumulatedContent += line;
              setStreamData((prev) => prev + line);
            }
          }
        }

        // 只有在没有被中断的情况下才设置加载完成
        if (!isAborted) {
          setRenderStage("completed");
          setIsLoading(false);
        }
      } catch (err) {
        // 如果是AbortError，不显示错误，因为这是正常的取消操作
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(err instanceof Error ? err.message : "未知错误");
        setIsLoading(false);
      }
    };

    // 添加一个小延迟来避免快速导航时的重复请求
    const timeoutId = setTimeout(() => {
      processStream();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      isAborted = true;
      controller.abort();
    };
  }, [path]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    isLoading,
    error,
    streamData,
    renderStage,
    currentStepIndex,
  };
} 