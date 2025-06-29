"use client";

import Link from "next/link";

interface StreamErrorDisplayProps {
  error: string;
}

export default function StreamErrorDisplay({ error }: StreamErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-red-800 font-semibold mb-2">流式处理错误</h3>
      <p className="text-red-600">{error}</p>
      <Link
        href="/"
        className="inline-block mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
} 