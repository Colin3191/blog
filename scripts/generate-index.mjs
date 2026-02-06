import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.join('docs', 'blog');
const INDEX_FILE = path.join('docs', 'index.md');

function getMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      fm[key] = val;
    }
  }
  return fm;
}

const posts = getMarkdownFiles(BLOG_DIR)
  .map((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const fm = parseFrontmatter(content);
    const link = '/' + file.replace(/^docs\//, '').replace(/\.mdx?$/, '');
    return { title: fm.title, date: fm.date, link };
  })
  .filter((p) => p.title && p.date)
  .sort((a, b) => b.date.localeCompare(a.date));

const grouped = {};
for (const post of posts) {
  const year = post.date.slice(0, 4);
  if (!grouped[year]) grouped[year] = [];
  grouped[year].push(post);
}

let md = `# Colin3191's Blog\n\n`;

for (const year of Object.keys(grouped).sort((a, b) => b.localeCompare(a))) {
  md += `## ${year}年\n\n`;
  for (const post of grouped[year]) {
    md += `- [${post.title}](${post.link}) - ${post.date}\n`;
  }
  md += '\n';
}

md += `---\n\n*博客使用 [Rspress](https://rspress.dev) 构建 • 持续更新中...*\n`;

fs.writeFileSync(INDEX_FILE, md);
console.log(`Generated index.md with ${posts.length} posts.`);
