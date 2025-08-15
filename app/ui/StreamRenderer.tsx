"use client";

import { useEffect, useRef } from "react";
import { useStreamData } from "./hooks/useStreamData";
import ShadowDOMRenderer from "./components/ShadowDOMRenderer";
import DesignStageIndicator from "./components/DesignStageIndicator";
import StreamErrorDisplay from "./components/StreamErrorDisplay";
import DraggableLoadingIndicator from "./DraggableLoadingIndicator";

interface StreamRendererProps {
  path: string;
}

export default function StreamRenderer({ path }: StreamRendererProps) {
  const {
    isLoading,
    error,
    streamData,
    renderStage,
    currentStepIndex,
  } = useStreamData(path);
  
  const hasRecordedRef = useRef(false);
  
  // 当渲染完成时记录搜索数据
  useEffect(() => {
    if (renderStage === "completed" && !hasRecordedRef.current && process.env.NODE_ENV === 'production') {
      hasRecordedRef.current = true;
      
      // 记录搜索到热门搜索
      const recordSearch = async () => {
        try {
          await fetch('/api/trending', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              path: path,
              category: '用户搜索'
            }),
          });
        } catch (error) {
          console.error('记录搜索失败:', error);
        }
      };
      
      recordSearch();
    }
  }, [renderStage, path]);
  
  // 重置记录状态当路径改变时
  useEffect(() => {
    hasRecordedRef.current = false;
  }, [path]);

  if (error) {
    return <StreamErrorDisplay error={error} />;
  }

  return (
    <div className="space-y-4">
      {/* 设计阶段界面 */}
      {renderStage === "designing" && isLoading && (
        <DesignStageIndicator currentStepIndex={currentStepIndex} />
      )}

      {/* Shadow DOM容器 */}
      <ShadowDOMRenderer 
        streamData={streamData} 
        error={error} 
      />

      {/* 可拖动的加载浮标 */}
      <DraggableLoadingIndicator
        isLoading={isLoading}
        streamData={streamData}
        renderStage={renderStage}
      />
    </div>
  );
}
