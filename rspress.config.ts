import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginRss } from '@rspress/plugin-rss';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Colin3191',
  description: 'A personal blog with thoughts and insights',
  icon: '/colin3191.jpg',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/Colin3191',
      },
    ],
  },
  plugins: [
    pluginRss({
      siteUrl: 'https://colin3191.me',
      feed: { id: 'blog', test: '/blog/', title: 'Colin3191 Blog' },
    }),
  ],
});
