import { notFound } from "next/navigation";
import StreamRenderer from "../ui/StreamRenderer";

interface CatchAllPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  // 获取所有路由段
  const { slug } = await params;

  // 如果slug为空数组，说明访问的是根路径，应该重定向到首页
  if (!slug || slug.length === 0) {
    notFound();
  }

  // 将路由段组合成完整路径
  const fullPath = slug.join("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto py-8 px-4">

        {/* 客户端组件用于渲染流式数据 */}
        <StreamRenderer path={fullPath} />
        {/* </div>*/}
      </div>
    </div>
  );
}

// 生成静态元数据
export async function generateMetadata({ params }: CatchAllPageProps) {
  const { slug } = await params;
  const fullPath = slug.join("/");

  return {
    title: `${decodeURIComponent(fullPath)}`,
    description: `这是动态生成的页面，路径为: ${decodeURIComponent(fullPath)}`,
  };
}
