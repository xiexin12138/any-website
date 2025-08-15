import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOldLogs() {
  console.log('🧹 开始清理过期的用户搜索日志...');
  
  try {
    // 计算30天前的日期
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`📅 删除 ${cutoffDate} 之前的记录...`);
    
    // 删除30天前的用户搜索日志
    const deleteResult = await prisma.userSearchLog.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        }
      }
    });
    
    console.log(`✅ 成功删除 ${deleteResult.count} 条过期记录`);
    
    // 可选：清理过期的搜索记录（保留更长时间，比如90天）
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldSearchRecords = await prisma.searchRecord.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });
    
    console.log(`✅ 成功删除 ${oldSearchRecords.count} 条过期搜索记录`);
    console.log('🎉 清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldLogs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });