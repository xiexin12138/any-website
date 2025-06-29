'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function AnalyticsScript() {
  const [hostUrl, setHostUrl] = useState<string>('');

  useEffect(() => {
    // 在客户端获取环境变量
    setHostUrl(`https://${process.env.NEXT_PUBLIC_NEXT_PUBLIC_HOST_URL || window.location.host}`);
  }, []);

  if (!hostUrl) {
    return null;
  }

  return (
    <Script
      defer
      data-domain={hostUrl}
      src="https://analytics.gptnb.xyz/js/script.js"
      strategy="beforeInteractive"
    />
  );
} 