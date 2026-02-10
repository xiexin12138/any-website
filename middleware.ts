import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 中间件：爬虫/机器人流量过滤
//
// 作用范围：仅匹配动态路由（catch-all），不影响 API、静态资源、首页
// 三项检查：1. 路径黑名单  2. 文件扩展名过滤  3. User-Agent 爬虫检测
// ============================================================

// --- 路径黑名单（精确匹配第一段路径，不区分大小写） ---
const BLACKLISTED_FIRST_SEGMENTS = new Set([
  // 配置/环境文件
  '.env', '.env.local', '.env.production', '.env.development', '.env.bak',
  '.git', '.gitignore', '.svn', '.hg', '.ds_store', '.htaccess', '.htpasswd',

  // WordPress
  'wp-admin', 'wp-login.php', 'wp-config.php', 'wp-includes', 'wp-content',
  'wp-cron.php', 'xmlrpc.php', 'wp-json', 'wordpress',

  // PHP 管理工具
  'phpmyadmin', 'pma', 'myadmin', 'mysql', 'adminer.php', 'phpinfo.php',

  // 通用管理路径
  'admin', 'administrator', 'admin.php', 'login', 'signin',
  'config.php', 'configuration.php', 'config.json', 'config.yml',

  // 常见扫描目标
  'server-status', 'server-info', '.well-known', 'actuator', 'console',
  'debug', 'trace', 'manager', 'solr', 'jenkins', 'cgi-bin',

  // 备份
  'backup', 'db.sql', 'database.sql', 'dump.sql',

  // 图标（避免触发 AI 生成）
  'favicon.ico', 'apple-touch-icon.png', 'apple-touch-icon-precomposed.png',
]);

// --- 被阻止的文件扩展名 ---
const BLOCKED_EXTENSIONS = new Set([
  '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py',
  '.ini', '.conf', '.cfg', '.config', '.xml', '.yaml', '.yml', '.toml',
  '.json', '.env', '.sql', '.db', '.sqlite', '.mdb',
  '.bak', '.backup', '.old', '.orig', '.save',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.tgz',
  '.log', '.logs', '.txt', '.csv', '.tsv',
  '.exe', '.dll', '.so', '.sh', '.bat', '.cmd',
  '.pem', '.key', '.crt', '.cer', '.p12',
  '.map', '.swp', '.swo', '.tmp',
]);

// --- 恶意扫描器 User-Agent 关键词（完全阻止） ---
const MALICIOUS_BOT_PATTERN = /Nmap|Nikto|sqlmap|masscan|ZmEu|Morfeus|DirBuster|Havij|w3af|Acunetix|Nessus|OpenVAS|Wfuzz|Xenu|HTTrack|WebCopier|Teleport|Offline Explorer|BlackWidow|Bolt|JOC Web Spider|Cogentbot|Harvest|Email Extractor/i;

// --- 通用爬虫/采集器 User-Agent 关键词（阻止动态路由） ---
const GENERIC_BOT_PATTERN = /Scrapy|curl\/|wget\/|python-requests|python-urllib|Go-http-client|Java\/|Apache-HttpClient|okhttp|node-fetch|axios\/|undici|PHP\/|libwww-perl|lwp-trivial|Mechanize|Siteimprove|Screaming Frog|Riddler|Dataprovider|HeadlessChrome/i;

// --- 搜索引擎爬虫 User-Agent（返回介绍页，不完全阻止） ---
const SEARCH_ENGINE_PATTERN = /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|ia_archiver|AdsBot-Google|Mediapartners-Google|APIs-Google|Google-Read-Aloud|GoogleOther|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|Bytespider|CCBot|GPTBot|ChatGPT-User|Claude-Web|Applebot/i;

// --- 社交媒体预览爬虫（返回介绍页，不记录排行榜） ---
const SOCIAL_MEDIA_BOT_PATTERN = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|WhatsApp|Discordbot|Embedly|Quora Link Preview|Redditbot|SkypeUriPreview|vkShare|Viber|Line/i;

// ============================================================
// 路径检查函数
// ============================================================

function isBlacklistedPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!normalized) return false;

  // 精确匹配整个路径
  if (BLACKLISTED_FIRST_SEGMENTS.has(normalized)) return true;

  // 匹配第一段路径
  const firstSegment = normalized.split('/')[0];
  if (BLACKLISTED_FIRST_SEGMENTS.has(firstSegment)) return true;

  return false;
}

function hasBlockedExtension(pathname: string): boolean {
  const lastSegment = pathname.toLowerCase().split('/').pop() || '';
  const dotIndex = lastSegment.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const ext = lastSegment.substring(dotIndex);
  return BLOCKED_EXTENSIONS.has(ext);
}

// ============================================================
// 生成搜索引擎/社交媒体爬虫看到的简洁介绍页
// ============================================================

function buildBotLandingPage(pathname: string): string {
  const host = process.env.NEXT_PUBLIC_HOST_URL || 'any.xiexin.me';
  const decodedPath = decodeURIComponent(pathname);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${decodedPath} - 网站任意门</title>
  <meta name="description" content="网站任意门 - AI 驱动的动态网页生成平台。输入任意路径，AI 实时生成独特的网页内容。">
  <meta property="og:title" content="${decodedPath} - 网站任意门">
  <meta property="og:description" content="AI 驱动的动态网页生成平台。输入任意路径，AI 实时为你生成独特的网页内容。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${host}${pathname}">
</head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #333;">
  <h1>🚪 网站任意门</h1>
  <p>这是一个 AI 驱动的动态网页生成平台。用户输入任意 URL 路径，AI 会实时流式生成一个独特的 HTML 网页。</p>
  <p>当前路径：<strong>${decodedPath}</strong></p>
  <p>请在浏览器中访问以体验 AI 实时生成的页面内容。</p>
  <p><a href="https://${host}">访问网站任意门首页 →</a></p>
</body>
</html>`;
}

// ============================================================
// 中间件主函数
// ============================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // --- 检查 1：路径黑名单 ---
  if (isBlacklistedPath(pathname)) {
    console.warn(`[bot-filter] 黑名单路径被拦截: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  // --- 检查 2：文件扩展名过滤 ---
  if (hasBlockedExtension(pathname)) {
    console.warn(`[bot-filter] 非法扩展名被拦截: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse('Not Found', { status: 404 });
  }

  // --- 检查 3：User-Agent 检测 ---

  // 3a. 无 User-Agent 请求 → 403
  if (!userAgent || userAgent.trim() === '') {
    console.warn(`[bot-filter] 无 User-Agent 请求被拦截: ${pathname}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3b. 恶意扫描器 → 403
  if (MALICIOUS_BOT_PATTERN.test(userAgent)) {
    console.warn(`[bot-filter] 恶意扫描器被拦截: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3c. 通用爬虫/采集器 → 403
  if (GENERIC_BOT_PATTERN.test(userAgent)) {
    console.warn(`[bot-filter] 通用爬虫被拦截: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3d. 搜索引擎爬虫 → 返回介绍页
  if (SEARCH_ENGINE_PATTERN.test(userAgent)) {
    console.warn(`[bot-filter] 搜索引擎爬虫，返回介绍页: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse(buildBotLandingPage(pathname), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 缓存 1 小时
      },
    });
  }

  // 3e. 社交媒体预览爬虫 → 返回带 OG 标签的介绍页
  if (SOCIAL_MEDIA_BOT_PATTERN.test(userAgent)) {
    console.warn(`[bot-filter] 社交媒体爬虫，返回介绍页: ${pathname} | UA: ${userAgent.substring(0, 100)}`);
    return new NextResponse(buildBotLandingPage(pathname), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // --- 正常用户请求 → 放行 ---
  return NextResponse.next();
}

// ============================================================
// 中间件匹配规则：仅匹配动态路由
// 排除：首页 /、API 路由 /api/*、Next.js 内部 /_next/*、静态文件
// ============================================================
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - / (首页)
     * - /api (API 路由)
     * - /_next (Next.js 内部)
     * - /favicon.ico, /robots.txt, /sitemap.xml 等静态文件
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)',
  ],
};
