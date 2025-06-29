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
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const indicatorRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 防止文字选中
  const preventTextSelection = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  // 优化位置更新函数
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
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    });
  }, []);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // 防止文字选中
    if (!indicatorRef.current) return;
    
    const rect = indicatorRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // 防止默认行为
    if (!indicatorRef.current) return;
    
    const touch = e.touches[0];
    const rect = indicatorRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // 防止页面滚动
    
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      // 添加事件监听器
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      // 防止文字选中
      document.addEventListener('selectstart', preventTextSelection);
      document.addEventListener('dragstart', preventTextSelection);
      
      return () => {
        // 清理事件监听器
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
    <div
      ref={indicatorRef}
      className={`fixed z-50 transition-all duration-200 select-none touch-none draggable-optimized ${
        isDragging ? 'scale-105 shadow-2xl dragging-optimized' : 'shadow-lg'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        touchAction: 'none',
        willChange: isDragging ? 'transform' : 'auto',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        MozTransform: 'translateZ(0)',
        msTransform: 'translateZ(0)'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
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
  );
} 