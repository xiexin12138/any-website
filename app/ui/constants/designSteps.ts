export const DESIGN_STEPS = [
  "设计页面布局",
  "选择配色方案",
  "规划交互元素",
  "确定响应式设计",
] as const;

export type DesignStep = typeof DESIGN_STEPS[number]; 