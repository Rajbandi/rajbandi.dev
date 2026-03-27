/**
 * Generate RSS feed from blog/posts/index.json
 * Run: node scripts/generate-rss.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://rajbandi.dev';
const postsPath = path.join(__dirname, '..', 'blog', 'posts', 'index.json');
const outputPath = path.join(__dirname, '..', 'blog', 'feed.xml');

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.toUTCString();
}

function generate() {
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  const now = new Date().toUTCString();

  let items = '';
  for (const post of posts) {
    const categories = (post.tags || [])
      .map(t => `      <category>${escapeXml(t)}</category>`)
      .join('\n');

    items += `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/#blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/#blog/${post.slug}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt || '')}</description>
${categories}
    </item>`;
  }

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Raj Bandi — Blog</title>
    <description>Articles on .NET, mobile development, blockchain, bioinformatics, and more.</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-au</language>
    <lastBuildDate>${now}</lastBuildDate>${items}
  </channel>
</rss>
`;

  fs.writeFileSync(outputPath, feed.trim() + '\n', 'utf8');
  console.log(`RSS feed generated with ${posts.length} item(s) -> ${outputPath}`);
}

generate();
