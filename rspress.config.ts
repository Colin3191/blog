import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: "Colin3191",
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
    nav: [
      {
        text: '博客',
        link: '/',
      }
    ]
  },
});
