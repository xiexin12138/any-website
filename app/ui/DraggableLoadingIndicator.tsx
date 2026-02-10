"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface DraggableLoadingIndicatorProps {
  isLoading: boolean;
  streamData: string;
  renderStage: 'designing' | 'coding' | 'completed';
}

export default function DraggableLoadingIndicator({ 
  isLoading, 
  streamData,
  renderStage
}: DraggableLoadingIndicatorProps) {
  // isDragging 仅用于视觉反馈（cursor、scale、hint），每次拖动仅触发 2 次渲染（开始/结束）
  const [isDragging, setIsDragging] = useState(false);
  // 使用 ref 镜像 isDragging，供事件处理器读取，避免回调依赖 state 导致重建
  const isDraggingRef = useRef(false);
  // 位置完全由 ref 管理，通过直接 DOM 操作更新，不触发 React 重渲染
  const positionRef = useRef({ x: 20, y: 20 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const indicatorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 初始化位置（组件挂载时设置 transform）
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = 
        `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
    }
  }, []);

  // 防止文字选中
  const preventTextSelection = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  // 直接 DOM 操作更新位置，完全绕过 React 重渲染管线
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const newX = clientX - dragOffsetRef.current.x;
      const newY = clientY - dragOffsetRef.current.y;
      
      // 确保浮标不会拖出屏幕
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      
      positionRef.current = {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      };
      
      // 直接操作 DOM — 不触发 React 渲染
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = 
          `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
      }
    });
  }, []);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!indicatorRef.current) return;
    
    const rect = indicatorRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    isDraggingRef.current = true;
    setIsDragging(true);
  }, []);

  // 使用 ref 检查拖动状态，避免依赖 isDragging state → 回调引用稳定
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!indicatorRef.current) return;
    
    const touch = e.touches[0];
    const rect = indicatorRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    isDraggingRef.current = true;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // 管理拖动时的 document 事件监听和 transition 控制
  useEffect(() => {
    if (isDragging) {
      // 捕获当前 ref，确保 cleanup 时引用一致
      const el = indicatorRef.current;

      // 拖动开始：移除 transition，确保位置更新零延迟
      if (el) {
        el.style.transition = 'none';
      }

      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('selectstart', preventTextSelection);
      document.addEventListener('dragstart', preventTextSelection);
      
      return () => {
        // 拖动结束：恢复 transition
        if (el) {
          el.style.transition = '';
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('selectstart', preventTextSelection);
        document.removeEventListener('dragstart', preventTextSelection);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, preventTextSelection]);

  // 清理动画帧
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 如果不在加载状态且没有数据，则不显示
  if (!isLoading && streamData.length === 0) return null;

  // 根据渲染阶段获取不同的样式和内容
  const getStageStyles = () => {
    switch (renderStage) {
      case 'designing':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-700',
          icon: (
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-300 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ),
          title: '🎨 设计阶段 (1/2)',
          subtitle: '构思页面布局',
          progressColor: 'from-blue-500 to-blue-600'
        };
      case 'coding':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          icon: (
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-green-300 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 border-transparent border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ),
          title: '💻 编码阶段 (2/2)',
          subtitle: '编写HTML代码',
          progressColor: 'from-green-500 to-green-600'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-700',
          icon: (
            <div className="relative">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 border-transparent border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          ),
          title: '处理中...',
          subtitle: '请稍候',
          progressColor: 'from-gray-500 to-gray-600'
        };
    }
  };

  const stageStyles = getStageStyles();

  return (
    // 外层定位容器：使用 transform: translate3d() 定位，由 JS 直接操作
    <div
      ref={indicatorRef}
      className="fixed z-50 select-none touch-none"
      style={{
        left: 0,
        top: 0,
        // 初始位置，后续由 updatePosition 通过 DOM 直接更新
        transform: `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* 内层视觉容器：处理 scale/shadow 过渡动画，与定位 transform 隔离 */}
      <div className={`transition-all duration-200 ${
        isDragging ? 'scale-105 shadow-2xl' : 'shadow-lg'
      }`}>
        <div className={`${stageStyles.bgColor} border ${stageStyles.borderColor} rounded-xl p-3 sm:p-4 min-w-[160px] sm:min-w-[180px] overflow-hidden shadow-md backdrop-blur-sm`}>
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <>
                <div className="relative flex-shrink-0">
                  {stageStyles.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${stageStyles.textColor} truncate`}>
                    {stageStyles.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {stageStyles.subtitle}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-700 truncate">生成完成</div>
                  <div className="text-xs text-gray-600 mt-1">共 {streamData.length} 个字符</div>
                </div>
              </>
            )}
          </div>
          
          {/* 拖动提示 */}
          <div className="text-xs text-gray-500 mt-2 text-center">
            {isDragging ? '释放完成拖动' : '拖拽移动位置'}
          </div>
        </div>
      </div>
    </div>
  );
}
