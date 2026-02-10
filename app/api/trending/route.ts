import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';
import { isValidSearchPath } from '@/app/lib/pathFilter';

// 生成用户标识哈希
const generateUserHash = (ip: string | null, userAgent: string | null): string => {
  const identifier = `${ip || 'unknown'}-${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(identifier).digest('hex');
};

// 获取今天的日期字符串
const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};



// 获取热门搜索数据
const getTrendingSearches = async (limit: number, category?: string) => {
  const where = {
    isDeleted: false, // 过滤被软删除的内容
    count: {
      gt: 1
    },
    ...(category && category !== 'all' ? { category } : {})
  };

  return await prisma.trendingSearch.findMany({
    where,
    orderBy: [
      { count: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: limit,
    select: {
      path: true,
      category: true,
      count: true,
      updatedAt: true
    }
  });
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;

    const trendingSearches = await getTrendingSearches(Math.min(limit, 20), category);

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: trendingSearches,
        total: trendingSearches.length,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 缓存5分钟
        }
      }
    );

  } catch (error) {
    console.error('获取热门搜索数据错误:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: '获取热门搜索数据失败'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 添加POST方法来记录新的搜索
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, category } = body;

    if (!path) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '参数错误',
          message: '缺少必要的路径参数'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 路径合法性校验：过滤爬虫产生的无效路径
    if (!isValidSearchPath(path)) {
      console.warn(`[bot-filter][trending] 非法路径被跳过: path=${path}`);
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: '路径不符合记录条件（已跳过）'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const userHash = generateUserHash(ip, userAgent);
    const today = getTodayString();

    // 检查用户今天是否已经搜索过这个路径
    const existingLog = await prisma.userSearchLog.findUnique({
      where: {
        path_userHash_date: {
          path,
          userHash,
          date: today
        }
      }
    });

    // 如果用户今天已经搜索过这个路径，则不重复记录
    if (existingLog) {
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: '搜索记录已存在（今日已记录）'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 记录用户搜索日志（用于去重）
    await prisma.userSearchLog.create({
      data: {
        path,
        userHash,
        date: today
      }
    });

    // 记录搜索到数据库
    await prisma.searchRecord.create({
      data: {
        path,
        category: category || '未分类',
        userAgent,
        ip
      }
    });

    // 更新或创建热门搜索记录
    await prisma.trendingSearch.upsert({
      where: { path },
      update: {
        count: { increment: 1 },
        category: category || '用户搜索'
      },
      create: {
        path,
        category: category || '用户搜索',
        count: 1
      }
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: '搜索记录已保存'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('记录搜索数据错误:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: '记录搜索数据失败'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}