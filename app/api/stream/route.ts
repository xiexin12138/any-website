import { NextRequest, NextResponse } from 'next/server';


// 从环境变量获取配置
const apiEndpoint = process.env.SILICON_FLOW_API_ENDPOINT;
const apiKey = process.env.SILICON_FLOW_API_KEY;
const model = process.env.SILICON_FLOW_MODEL;
const hostUrl = `http://${process.env.NEXT_PUBLIC_HOST_URL}`;
const maxTokens = parseInt(process.env.MAX_TOKENS || '4096', 10);

export async function POST(request: NextRequest) {
  try {

    // 检查请求体是否为空
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new NextResponse('请求必须包含JSON内容', { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      return new NextResponse('无效的JSON格式', { status: 400 });
    }

    const { path, userAgent } = body;

    // 验证path参数
    if (!path || typeof path !== 'string') {
      return new NextResponse('缺少path参数或格式不正确', { status: 400 });
    }

    console.log("🚀 ~ stream ~ path:", path);
    console.log("🚀 ~ stream ~ userAgent:", userAgent);

    // 验证必要的环境变量
    if (!apiEndpoint) {
      console.error('缺少环境变量: SILICON_FLOW_API_ENDPOINT');
      return new NextResponse(
        JSON.stringify({
          error: '配置错误',
          message: '缺少API端点配置，请检查环境变量 SILICON_FLOW_API_ENDPOINT'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if (!apiKey) {
      console.error('缺少环境变量: SILICON_FLOW_API_KEY');
      return new NextResponse(
        JSON.stringify({
          error: '配置错误',
          message: '缺少API密钥配置，请检查环境变量 SILICON_FLOW_API_KEY'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if (!model) {
      console.error('缺少环境变量: SILICON_FLOW_MODEL');
      return new NextResponse(
        JSON.stringify({
          error: '配置错误',
          message: '缺少模型配置，请检查环境变量 SILICON_FLOW_MODEL'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    if (!hostUrl) {
      console.error('缺少环境变量: NEXT_PUBLIC_HOST_URL');
      return new NextResponse(
        JSON.stringify({
          error: '配置错误',
          message: '缺少主机URL配置，请检查环境变量 NEXT_PUBLIC_HOST_URL'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 构建提示词
    const prompt = buildPromptFromPath(path, userAgent);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        max_tokens: maxTokens,
      }),
    }

    // 请求硅基流动API
    const response = await fetch(apiEndpoint, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('硅基流动API错误:', response.status, errorText);
      return new NextResponse(`API请求失败: ${response.status}`, { status: response.status });
    }

    // 流式转发响应
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Route错误:', error);
    return new NextResponse('服务器内部错误', { status: 500 });
  }
}

// 根据路径构建提示词
function buildPromptFromPath(path: string, userAgent: string): string {
  const pathSegments = path.split('/').filter(segment => segment.trim() !== '');

  // 分析 User-Agent 获取设备信息
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);

  const deviceType = isMobile ? '手机' : isTablet ? '平板' : '桌面设备';
  const browserInfo = userAgent.includes('Chrome') ? 'Chrome浏览器' :
    userAgent.includes('Firefox') ? 'Firefox浏览器' :
      userAgent.includes('Safari') ? 'Safari浏览器' :
        userAgent.includes('Edge') ? 'Edge浏览器' : '其他浏览器';

  if (pathSegments.length === 0) {
    return '请生成一个欢迎页面的内容';
  }

  // 根据路径段构建有意义的提示词
  return `你是一个 HTTP server ，用户当前在使用 GET 方法，请求路径是 '${decodeURIComponent(path)}' ，` +
    `用户设备信息：${deviceType}，使用${browserInfo}，` +
    `请你对此请求和路径写出对应的 html 文档，HTML 文档的 head 标签中必须包含一个 charset=utf-8 标签，` +
    `搭配 Bootstrap CSS，采用 Material Design 原则进行 UI/UX 设计，外层背景色为#f9fafb，注意你实现的文字和背景颜色对比度，以便能够清晰阅读，` +
    `Bootstrap 的 css 链接为：https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css` +
    `Bootstrap 的 js 链接为：https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js` +
    `除了 html 内容外不要返回其他内容！最少要有5个超链接，路径必须是本站 ${hostUrl} 的绝对路径，不要使用相对路径。` +
    `直接输出html的内容，不要在开头或结尾加上md。` +
    `至少需要包含1张图片，支持你使用适量图片优化页面阅读效果，` +
    `图片使用img标签，注意设置好图片的尺寸，并使用'https://cloud-image.ullrai.com/q/{图片名称}'，其中图片名称是你认为应该展示的图片名称，中英文均可` +
    `如果需要进行代码示例，可以用<code>标签包裹！` +
    `特别注意适配${deviceType}，确保在${deviceType}上有良好的显示效果和交互体验。` +
    `确保网站内容丰富，字数至少1000字。_nothink`;
}
