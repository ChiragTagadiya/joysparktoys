// Generates public/sitemap.xml with static pages + live product URLs from Supabase.
// Usage: node scripts/generate-sitemap.js
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (same as the app).

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://joysparktoys.netlify.app';

const loadEnv = () => {
  try {
    const envPath = join(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    });
    return env;
  } catch {
    return {};
  }
};

const env = { ...loadEnv(), ...process.env };
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/products', priority: '0.9', changefreq: 'daily' },
  { loc: '/refund-return-policy', priority: '0.3', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
  { loc: '/terms-and-conditions', priority: '0.3', changefreq: 'monthly' },
  { loc: '/shipping-policy', priority: '0.3', changefreq: 'monthly' },
  { loc: '/cancellation-policy', priority: '0.3', changefreq: 'monthly' },
];

const run = async () => {
  const { data: products, error } = await supabase.from('products').select('id, updated_at');
  if (error) {
    console.error('Failed to fetch products:', error.message);
    process.exit(1);
  }

  const urls = [
    ...STATIC_PAGES.map((p) => `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`),
    ...(products || []).map((p) => {
      const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : undefined;
      return `  <url>\n    <loc>${SITE_URL}/products/${p.id}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  const outPath = join(__dirname, '..', 'public', 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap written to ${outPath} with ${products?.length || 0} products.`);
};

run();
