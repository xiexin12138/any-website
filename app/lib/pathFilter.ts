/**
 * 路径过滤工具库
 * 
 * 检测请求路径是否为爬虫/扫描器常见的探测目标，
 * 过滤掉文件扩展名、系统路径等非合法用户搜索的路径。
 */

// ============================================================
// 精确匹配黑名单路径（不区分大小写，去掉前导斜杠后比较）
// ============================================================
const BLACKLISTED_PATHS = new Set([
  // 配置/环境文件
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  '.env.bak',
  '.env.example',
  '.git',
  '.git/config',
  '.git/HEAD',
  '.gitignore',
  '.svn',
  '.hg',
  '.DS_Store',
  '.htaccess',
  '.htpasswd',

  // WordPress 相关
  'wp-admin',
  'wp-login.php',
  'wp-config.php',
  'wp-includes',
  'wp-content',
  'wp-cron.php',
  'xmlrpc.php',
  'wp-json',
  'wordpress',

  // PHP 管理工具
  'phpmyadmin',
  'pma',
  'myadmin',
  'mysql',
  'adminer.php',
  'phpinfo.php',

  // 通用管理路径
  'admin',
  'administrator',
  'admin.php',
  'login',
  'signin',
  'config.php',
  'configuration.php',
  'config.json',
  'config.yml',
  'config.yaml',

  // 常见扫描目标
  'server-status',
  'server-info',
  '.well-known',
  'actuator',
  'actuator/health',
  'console',
  'debug',
  'trace',
  'manager',
  'manager/html',
  'solr',
  'jenkins',
  'cgi-bin',

  // 备份文件
  'backup',
  'db.sql',
  'database.sql',
  'dump.sql',

  // 其他
  'favicon.ico',
  'apple-touch-icon.png',
  'apple-touch-icon-precomposed.png',
]);

// 将黑名单转为小写用于不区分大小写匹配
const BLACKLISTED_PATHS_LOWER = new Set(
  Array.from(BLACKLISTED_PATHS).map(p => p.toLowerCase())
);

// ============================================================
// 被阻止的文件扩展名
// ============================================================
const BLOCKED_EXTENSIONS = new Set([
  // 服务端脚本
  '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py',

  // 配置文件
  '.ini', '.conf', '.cfg', '.config',
  '.xml', '.yaml', '.yml', '.toml',
  '.json', '.env',

  // 数据库
  '.sql', '.db', '.sqlite', '.mdb',

  // 备份/压缩
  '.bak', '.backup', '.old', '.orig', '.save',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.tgz',

  // 日志
  '.log', '.logs',

  // 文档（非网页浏览目的）
  '.txt', '.csv', '.tsv',

  // 可执行文件
  '.exe', '.dll', '.so', '.sh', '.bat', '.cmd',

  // 证书/密钥
  '.pem', '.key', '.crt', '.cer', '.p12',

  // 源码映射
  '.map',

  // 其他
  '.swp', '.swo', '.tmp',
]);

// ============================================================
// 路径长度限制
// ============================================================
const MAX_PATH_LENGTH = 200;

// ============================================================
// 公开 API
// ============================================================

/**
 * 检查路径是否在黑名单中（精确匹配，不区分大小写）
 */
export function isBlacklistedPath(path: string): boolean {
  // 移除前导和尾部斜杠，转小写
  const normalizedPath = path.replace(/^\/+|\/+$/g, '').toLowerCase();

  // 精确匹配
  if (BLACKLISTED_PATHS_LOWER.has(normalizedPath)) return true;

  // 检查路径的第一段是否匹配（如 /wp-admin/xxx 也应该被拦截）
  const firstSegment = normalizedPath.split('/')[0];
  if (BLACKLISTED_PATHS_LOWER.has(firstSegment)) return true;

  return false;
}

/**
 * 检查路径是否包含被阻止的文件扩展名
 */
export function hasBlockedExtension(path: string): boolean {
  const normalizedPath = path.toLowerCase();

  // 提取最后一段路径的扩展名
  const lastSegment = normalizedPath.split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');

  if (dotIndex === -1) return false; // 无扩展名，允许通过

  const extension = lastSegment.substring(dotIndex);
  return BLOCKED_EXTENSIONS.has(extension);
}

/**
 * 综合校验路径是否为合法的用户搜索路径
 * 
 * 合法路径条件：
 * 1. 不在黑名单中
 * 2. 不包含被阻止的文件扩展名
 * 3. 路径长度不超过限制
 * 4. 路径不为空
 */
export function isValidSearchPath(path: string): boolean {
  if (!path || path.trim() === '') return false;

  // 解码路径用于长度检测
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(path);
  } catch {
    decodedPath = path;
  }

  // 路径长度限制
  if (decodedPath.length > MAX_PATH_LENGTH) return false;

  // 黑名单检测
  if (isBlacklistedPath(path)) return false;

  // 扩展名检测
  if (hasBlockedExtension(path)) return false;

  return true;
}
