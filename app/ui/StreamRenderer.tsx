"use client";

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
