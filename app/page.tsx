"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

// 本地存储键名
const RANDOM_WORDS_KEY = "random_words_history";
const MAX_WORDS = 100;

// 热门搜索项类型定义
interface TrendingSearchItem {
  path: string;
  count: number;
  category: string;
}

export default function Home() {
  const [searchPath, setSearchPath] = useState("");
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const [randomWordsHistory, setRandomWordsHistory] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearchItem[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);

  // 从本地存储加载历史记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RANDOM_WORDS_KEY);
      if (saved) {
        const words = JSON.parse(saved);
        setRandomWordsHistory(Array.isArray(words) ? words : []);
      }
    } catch (error) {
      console.error("加载随机词汇历史失败:", error);
    }
  }, []);

  // 获取热门搜索数据的函数
  const fetchTrendingSearches = async () => {
    try {
      setIsLoadingTrending(true);
      const response = await fetch('/api/trending?limit=12');
      if (response.ok) {
        const data = await response.json();
        setTrendingSearches(data.data || []);
      }
    } catch (error) {
      console.error('获取热门搜索失败:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  // 加载热门搜索数据
  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  // 保存词汇到本地存储
  const saveWordToHistory = (word: string) => {
    try {
      const newHistory = [word, ...randomWordsHistory.filter(w => w !== word)].slice(0, MAX_WORDS);
      setRandomWordsHistory(newHistory);
      localStorage.setItem(RANDOM_WORDS_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("保存随机词汇历史失败:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPath.trim()) {
      const targetPath = searchPath.trim();
      
      // 处理路径，确保正确的URL格式
      const cleanPath = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;
      const fullUrl = `/${cleanPath}`;
      
      // 打开新页面（搜索记录将在渲染页面完成时自动记录）
      window.open(fullUrl, '_blank');
    }
  };

  const handleGetRandomWord = async () => {
    try {
      setIsLoadingRandom(true);
      
      const response = await fetch("/api/light-me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: randomWordsHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.word) {
        setSearchPath(data.word);
        saveWordToHistory(data.word);
      } else {
        throw new Error("未获取到随机词汇");
      }
    } catch (error) {
      console.error("获取随机词汇失败:", error);
      alert("获取随机词汇失败，请重试");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">🚪</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">网站任意门</span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <a 
                href="https://github.com/xiexin12138/any-website" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm sm:text-base transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                    clipRule="evenodd" 
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            欢迎来到
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              网站任意门
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            这是一个神奇的网站任意门！输入任何路径，AI都会为你实时生成一个独特的网页。
            想去哪里？输入路径，点击跳转，开启你的探索之旅！
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-md mx-auto mb-6 sm:mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchPath}
                  onChange={(e) => setSearchPath(e.target.value)}
                  placeholder="输入你想去的路径，比如：魔法世界/霍格沃茨"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base pr-12"
                />
                <button
                  type="button"
                  onClick={handleGetRandomWord}
                  disabled={isLoadingRandom}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  title="获取随机词汇"
                >
                  {isLoadingRandom ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                跳转
              </button>
              <button
                type="button"
                onClick={handleGetRandomWord}
                disabled={isLoadingRandom}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                title="获取随机领域词汇"
              >
                {isLoadingRandom ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>🎲</span>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">点击🎲按钮获取随机领域词汇，跳出信息茧房</p>
            {randomWordsHistory.length > 0 && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const historyText = randomWordsHistory.join('、');
                    alert(`最近探索的领域：${historyText}`);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  查看历史记录 ({randomWordsHistory.length})
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              🚀 立即体验
            </Link>
            <Link
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
            >
              📖 了解更多
            </Link>
          </div>
        </div>


        {/* 大家都在搜 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">
               🔥 大家都在搜
             </h2>
             <button
               onClick={fetchTrendingSearches}
               disabled={isLoadingTrending}
               className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-gray-50"
               title="刷新热门搜索"
             >
               <svg 
                 className={`w-4 h-4 ${isLoadingTrending ? 'animate-spin' : ''}`} 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
               <span>刷新数据</span>
             </button>
           </div>
          
          {isLoadingTrending ? (
             <div className="flex justify-center items-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               <span className="ml-2 text-gray-600">加载中...</span>
             </div>
           ) : trendingSearches.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
               {trendingSearches.map((item, index) => (
                 <div key={index} className="group">
                   <Link
                     href={`/${item.path}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-lg p-3 sm:p-4 transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-blue-200"
                   >
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                         {item.category}
                       </span>
                       <span className="text-xs text-gray-400 flex items-center">
                         <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         {item.count}
                       </span>
                     </div>
                     <p className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                       {item.path.split('/').pop()}
                     </p>
                     <p className="text-xs text-gray-500 mt-1 font-mono">
                       /{item.path}
                     </p>
                   </Link>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12">
               <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                 <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">暂无热门搜索</h3>
               <p className="text-gray-500 mb-4">成为第一个探索者，开始你的搜索之旅吧！</p>
               <p className="text-sm text-gray-400">💡 试试在上方搜索框输入任何感兴趣的内容</p>
             </div>
           )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              💡 这些是最近大家搜索最多的内容，点击即可探索
            </p>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🎯</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">无限可能</h3>
            <p className="text-sm sm:text-base text-gray-600">
              输入任何路径，AI都会为你创建一个独特的网页内容，每次都是新的惊喜。
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">⚡</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">实时生成</h3>
            <p className="text-sm sm:text-base text-gray-600">
              内容实时生成，就像魔法一样，你输入什么，AI就为你创造什么。
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-xl sm:text-2xl">🎮</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">娱乐探索</h3>
            <p className="text-sm sm:text-base text-gray-600">
              纯粹为了好玩！探索不同的路径，发现AI为你准备的奇妙内容。
            </p>
          </div>
        </div>


        {/* 使用示例 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            探索示例
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 左侧：有趣示例 */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">有趣路径</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">魔法世界</p>
                  <Link href="/魔法世界/霍格沃茨" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /魔法世界/霍格沃茨
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">科幻冒险</p>
                  <Link href="/星际旅行/银河系" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /星际旅行/银河系
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">美食探索</p>
                  <Link href="/美食/意大利/披萨" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /美食/意大利/披萨
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">动物世界</p>
                  <Link href="/动物/海洋/海豚" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /动物/海洋/海豚
                  </Link>
                </div>
              </div>
            </div>

            {/* 右侧：创意示例 */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">创意路径</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">时间旅行</p>
                  <Link href="/时间/古代/唐朝" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /时间/古代/唐朝
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">梦境探索</p>
                  <Link href="/梦境/奇幻/彩虹城堡" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /梦境/奇幻/彩虹城堡
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">音乐世界</p>
                  <Link href="/音乐/古典/贝多芬" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /音乐/古典/贝多芬
                  </Link>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">艺术殿堂</p>
                  <Link href="/艺术/绘画/梵高" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-mono text-sm sm:text-base">
                    /艺术/绘画/梵高
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 开始探索 */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">开始你的探索之旅</h2>
          <p className="text-lg sm:text-xl mb-6 opacity-90">
            输入任何你想象的路径，让AI为你创造惊喜
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/欢迎/新朋友"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base"
            >
              🎉 欢迎页面
            </Link>
            <Link
              href="/故事/童话/小红帽"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200 text-sm sm:text-base"
            >
              📖 童话故事
            </Link>
            <Link
              href="/游戏/冒险/寻宝"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200 text-sm sm:text-base"
            >
              🎮 冒险游戏
            </Link>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">网站任意门</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                一个充满想象力的AI内容生成平台，让探索变得有趣
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">玩法</h3>
              <ul className="text-gray-400 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li>输入任意路径</li>
                <li>AI实时生成内容</li>
                <li>探索无限可能</li>
                <li>纯娱乐体验</li>
              </ul>
            </div>
            {/* <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">相关链接</h3>
              <ul className="text-gray-400 space-y-1 sm:space-y-2 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white">使用说明</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">反馈建议</a></li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2025 网站任意门. 让探索变得有趣.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
