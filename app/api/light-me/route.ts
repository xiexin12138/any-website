import { NextRequest, NextResponse } from 'next/server';

// 从环境变量获取配置
const apiEndpoint = process.env.SILICON_FLOW_API_ENDPOINT;
const apiKey = process.env.SILICON_FLOW_API_KEY;
const model = process.env.SILICON_FLOW_FREE_MODEL;

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

    const { history = [] } = body;

    // 验证历史记录格式
    if (!Array.isArray(history)) {
      return new NextResponse('历史记录格式不正确', { status: 400 });
    }

    console.log("🚀 ~ light-me ~ history:", history);

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

    // 构建提示词
    const historyText = history.length > 0
      ? `用户之前已经探索过的领域词汇：${history.slice(0, 20).join('、')}${history.length > 20 ? '等' : ''}。`
      : '用户是第一次使用此功能。';

    const prompt = `我想随机了解一个词汇以跳出信息茧房，可以是学习、娱乐、艺术、热点事件等词汇不限，请给我一个词，直接回复给我，不要做任何说明。` +
      `${historyText}请避免重复用户已经探索过的领域。_nothink`;

    console.log("🚀 ~ light-me ~ prompt:", prompt);

    // 请求硅基流动API
    const response = await fetch(apiEndpoint, {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('硅基流动API错误:', response.status, errorText);
      return new NextResponse(`API请求失败: ${response.status}`, { status: response.status });
    }

    const responseData = await response.json();
    const randomWord = responseData.choices?.[0]?.message?.content?.trim();

    if (!randomWord) {
      return new NextResponse(
        JSON.stringify({
          error: '获取随机词汇失败',
          message: '无法从API响应中提取词汇'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log("🚀 ~ light-me ~ randomWord:", randomWord);

    // 返回随机词汇
    return new NextResponse(
      JSON.stringify({
        word: randomWord
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('light-me API错误:', error);
    return new NextResponse(
      JSON.stringify({
        error: '服务器内部错误',
        message: '获取随机词汇过程中发生错误'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}