import { Router } from 'express';

const router = Router();

// Serve robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

# Korean Search Engines
User-agent: Yeti
Allow: /

User-agent: NaverBot
Allow: /

User-agent: Daumoa
Allow: /

# Sitemap
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml

# Crawl-delay for Korean search engines
Crawl-delay: 1`);
});

// Serve sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const lastMod = new Date().toISOString().split('T')[0];
  
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${baseUrl}/" />
  </url>
</urlset>`);
});

export default router;