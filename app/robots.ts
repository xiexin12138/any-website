import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_HOST_URL || 'any.xiexin.me';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `https://${host}/sitemap.xml`,
    host: `https://${host}`,
  };
}
