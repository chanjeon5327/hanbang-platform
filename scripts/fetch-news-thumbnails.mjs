#!/usr/bin/env node
/**
 * 1회성 스크립트: 뉴스 기사 썸네일 다운로드 및 16:9 리사이징
 * 실행: node scripts/fetch-news-thumbnails.mjs
 */

import { mkdirSync, existsSync } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'news', '2026-03');
const W = 1200;
const H = 675;

const SOURCES = [
  {
    slug: 'seoul-hallyu-ordinance',
    url: 'https://imggo.seoul.co.kr/img/go_share.png',
    ext: 'jpg',
  },
  {
    slug: 'kbrand-counterfeit',
    url: 'https://cdn.industrynews.co.kr/news/photo/202603/78973_97283_4931.jpg',
    ext: 'jpg',
  },
  {
    slug: 'bts-goods-shinsegae',
    url: 'https://img1.newsis.com/2026/03/11/NISI20260311_0002080655_web.jpg',
    ext: 'jpg',
  },
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  for (const s of SOURCES) {
    const outPath = join(OUT_DIR, `${s.slug}.${s.ext}`);
    console.log(`Fetching ${s.url} -> ${outPath}`);
    const buf = await fetchBuffer(s.url);
    await sharp(buf)
      .resize(W, H, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(outPath);
    console.log(`  -> done`);
  }
  console.log('All thumbnails saved.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
