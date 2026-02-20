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
    let accumulatedContent = "";
    let isAborted = false;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let lastFlushTime = 0;
    // 节流间隔：控制 iframe doc.write() 频率，避免 Tailwind CDN 脚本反复重新执行阻塞渲染
    const FLUSH_INTERVAL_MS = 300;

    const flushStreamData = () => {
      flushTimer = null;
      lastFlushTime = Date.now();
      setStreamData(accumulatedContent);
    };

    const scheduleFlush = () => {
      if (flushTimer) return;
      const elapsed = Date.now() - lastFlushTime;
      if (elapsed >= FLUSH_INTERVAL_MS) {
        flushStreamData();
      } else {
        flushTimer = setTimeout(flushStreamData, FLUSH_INTERVAL_MS - elapsed);
      }
    };

    const processStream = async () => {
      try {
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
          
          let errorMessage = `API请求失败: ${response.status}`;
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
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

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "") continue;

            if (line.startsWith("data: ")) {
              const jsonStr = line.substring(6);

              if (jsonStr.trim() === "[DONE]") {
                continue;
              }

              try {
                const data = JSON.parse(jsonStr);

                if (data.choices && data.choices[0] && data.choices[0].delta) {
                  const delta = data.choices[0].delta;

                  if (delta.content) {
                    accumulatedContent += delta.content;

                    if (renderStage === "designing") {
                      const hasHtmlTag = accumulatedContent.includes("<html");
                      const hasHeadTag = accumulatedContent.includes("<head");
                      const hasBodyTag = accumulatedContent.includes("<body");

                      if (hasHtmlTag && hasHeadTag && hasBodyTag) {
                        setRenderStage("coding");
                      }
                    }

                    scheduleFlush();
                  }
                } else {
                  accumulatedContent += JSON.stringify(data);
                  scheduleFlush();
                }
              } catch (parseError) {
                console.error(
                  "JSON解析错误:",
                  parseError,
                  "原始数据:",
                  jsonStr
                );
                accumulatedContent += jsonStr;
                scheduleFlush();
              }
            } else {
              accumulatedContent += line;
              scheduleFlush();
            }
          }
        }

        if (!isAborted) {
          // 流结束时立即刷新最终内容
          if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
          }
          setStreamData(accumulatedContent);
          setRenderStage("completed");
          setIsLoading(false);
        }
      } catch (err) {
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
      if (flushTimer) clearTimeout(flushTimer);
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