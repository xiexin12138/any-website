/**
 * 爬虫/机器人检测工具库
 * 
 * 通过 User-Agent 字符串检测请求是否来自爬虫、扫描器或自动化工具。
 * 分类：搜索引擎爬虫、恶意扫描器、社交媒体预览爬虫、通用爬虫/采集器。
 */

// ============================================================
// 搜索引擎爬虫（允许爬首页，阻止动态路由）
// ============================================================
const SEARCH_ENGINE_BOTS = [
  'Googlebot',
  'Bingbot',
  'Slurp',           // Yahoo
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'Sogou',
  'Exabot',
  'ia_archiver',     // Alexa
  'facebot',         // Facebook crawler (非预览)
  'AdsBot-Google',
  'Mediapartners-Google',
  'APIs-Google',
  'Google-Read-Aloud',
  'Google-Adwords-Instant',
  'Storebot-Google',
  'GoogleOther',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',         // Majestic
  'DotBot',
  'PetalBot',        // Huawei
  'Bytespider',      // ByteDance
  'CCBot',
  'GPTBot',          // OpenAI
  'ChatGPT-User',
  'Claude-Web',      // Anthropic
  'Applebot',
  'Twitterbot',      // X/Twitter search indexing
];

const searchEngineBotRegex = new RegExp(
  SEARCH_ENGINE_BOTS.map(bot => bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// ============================================================
// 恶意扫描器 / 安全探测工具（完全阻止）
// ============================================================
const MALICIOUS_BOTS = [
  'Nmap',
  'Nikto',
  'sqlmap',
  'masscan',
  'ZmEu',
  'Morfeus',
  'DirBuster',
  'Havij',
  'w3af',
  'Acunetix',
  'Nessus',
  'OpenVAS',
  'Wfuzz',
  'Xenu',
  'HTTrack',
  'WebCopier',
  'Teleport',
  'Offline Explorer',
  'BlackWidow',
  'Bolt',
  'JOC Web Spider',
  'Cogentbot',
  'Harvest',
  'Email Extractor',
];

const maliciousBotRegex = new RegExp(
  MALICIOUS_BOTS.map(bot => bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// ============================================================
// 社交媒体预览爬虫（允许，但不记录排行榜）
// ============================================================
const SOCIAL_MEDIA_BOTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Pinterest',
  'Slackbot',
  'TelegramBot',
  'WhatsApp',
  'Discordbot',
  'Embedly',
  'Quora Link Preview',
  'Redditbot',
  'SkypeUriPreview',
  'vkShare',
  'Viber',
  'Line',
];

const socialMediaBotRegex = new RegExp(
  SOCIAL_MEDIA_BOTS.map(bot => bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// ============================================================
// 通用爬虫 / 采集器 / 自动化工具（阻止动态路由）
// ============================================================
const GENERIC_BOTS = [
  'Scrapy',
  'curl/',
  'wget/',
  'python-requests',
  'python-urllib',
  'Go-http-client',
  'Java/',
  'Apache-HttpClient',
  'okhttp',
  'node-fetch',
  'axios/',
  'undici',
  'PHP/',
  'libwww-perl',
  'lwp-trivial',
  'Ruby',
  'Mechanize',
  'Siteimprove',
  'Screaming Frog',
  'Pingdom',
  'UptimeRobot',
  'StatusCake',
  'Site24x7',
  'Riddler',
  'Dataprovider',
  'HeadlessChrome',  // 无头浏览器
];

const genericBotRegex = new RegExp(
  GENERIC_BOTS.map(bot => bot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// ============================================================
// 公开 API
// ============================================================

/**
 * 检测是否为搜索引擎爬虫
 */
export function isSearchEngine(userAgent: string): boolean {
  return searchEngineBotRegex.test(userAgent);
}

/**
 * 检测是否为恶意扫描器/安全探测工具
 */
export function isMaliciousBot(userAgent: string): boolean {
  return maliciousBotRegex.test(userAgent);
}

/**
 * 检测是否为社交媒体预览爬虫
 */
export function isSocialMediaBot(userAgent: string): boolean {
  return socialMediaBotRegex.test(userAgent);
}

/**
 * 检测是否为通用爬虫/采集器
 */
export function isGenericBot(userAgent: string): boolean {
  return genericBotRegex.test(userAgent);
}

/**
 * 综合检测是否为任何类型的爬虫/机器人
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.trim() === '') return true;
  return (
    isSearchEngine(userAgent) ||
    isMaliciousBot(userAgent) ||
    isSocialMediaBot(userAgent) ||
    isGenericBot(userAgent)
  );
}

/**
 * 检测是否为需要完全阻止的爬虫（恶意 + 通用）
 */
export function shouldBlockCompletely(userAgent: string): boolean {
  if (!userAgent || userAgent.trim() === '') return true;
  return isMaliciousBot(userAgent) || isGenericBot(userAgent);
}
