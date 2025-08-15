import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始初始化数据库...');
  
  try {
    // 检查数据库连接
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 检查是否已有数据
    const existingCount = await prisma.trendingSearch.count();
    
    if (existingCount > 0) {
      console.log(`📊 数据库中已有 ${existingCount} 条热门搜索记录`);
      return;
    }
    
    // 初始化默认数据
    const defaultData = [
      { path: '人工智能/ChatGPT', category: '科技', count: 156 },
      { path: '美食/日本料理/寿司', category: '美食', count: 142 },
      { path: '旅行/日本/东京', category: '旅行', count: 138 },
      { path: '电影/科幻/星际穿越', category: '娱乐', count: 125 },
      { path: '音乐/流行/周杰伦', category: '音乐', count: 118 },
      { path: '游戏/RPG/原神', category: '游戏', count: 112 },
      { path: '学习/编程/Python', category: '学习', count: 108 },
      { path: '健康/运动/瑜伽', category: '健康', count: 95 },
      { path: '艺术/绘画/梵高', category: '艺术', count: 89 },
      { path: '动物/猫咪/布偶猫', category: '动物', count: 87 },
      { path: '科学/天文/黑洞', category: '科学', count: 82 },
      { path: '历史/古代/唐朝', category: '历史', count: 78 },
      { path: '时尚/穿搭/韩系', category: '时尚', count: 75 },
      { path: '心理/情感/冥想', category: '心理', count: 71 },
      { path: '自然/风景/极光', category: '自然', count: 68 }
    ];
    
    console.log('📝 正在插入默认数据...');
    
    const result = await prisma.trendingSearch.createMany({
      data: defaultData,
      skipDuplicates: true
    });
    
    console.log(`✅ 成功插入 ${result.count} 条默认热门搜索记录`);
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    
    if (error.code === 'P1001') {
      console.log('💡 提示: 请检查数据库连接配置是否正确');
      console.log('💡 确保 .env 文件中的 POSTGRES_PRISMA_URL 和 POSTGRES_URL_NON_POOLING 配置正确');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });