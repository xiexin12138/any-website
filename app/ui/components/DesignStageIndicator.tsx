"use client";

import { DESIGN_STEPS } from "../constants/designSteps";

interface DesignStageIndicatorProps {
  currentStepIndex: number;
}

export default function DesignStageIndicator({ currentStepIndex }: DesignStageIndicatorProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-400 rounded-full mb-2">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600">正在设计页面布局</p>
        <p className="text-xs text-gray-500 mt-1">
          {DESIGN_STEPS[currentStepIndex]}
        </p>
      </div>
    </div>
  );
} 