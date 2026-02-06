---
title: Next.js 入门（一）：App Router 项目结构与路由
date: 2026-02-06
author: Colin
tags: [Next.js, React, App Router, 前端]
---

# Next.js 入门（一）：App Router 项目结构与路由

## Next.js 是什么

Next.js 是 Vercel 维护的 React 全栈框架，开箱就有文件路由、SSR/SSG、API 路由、自动代码分割这些能力。用过 React 的话可以这么理解：React 管 UI，剩下的事 Next.js 都包了。

我之前写 React 项目，路由要装 react-router，SSR 要自己配，代码分割要折腾 lazy loading。换到 Next.js 之后发现这些都不用操心了，框架通过文件约定帮你处理好了。所以学 Next.js 的重点其实就是搞懂这些约定。

## 创建项目

```bash
pnpm create next-app@latest nextjs-demo --yes
cd nextjs-demo
pnpm dev
```

`--yes` 跳过所有交互提示，直接用默认配置（TypeScript、ESLint、Tailwind CSS、`src/` 目录、App Router）。跑起来之后打开 `http://localhost:3000` 能看到欢迎页就行。

## 项目结构

```
nextjs-demo/
├── src/
│   └── app/                  # ⭐ 路由核心目录
│       ├── layout.tsx         # 根布局（必须有）
│       ├── page.tsx           # 首页 /
│       └── globals.css        # 全局样式
├── public/                    # 静态资源，/文件名 直接访问
├── next.config.ts             # Next.js 配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # 依赖和脚本
└── postcss.config.mjs         # PostCSS 配置
```

刚开始只需要关注三个地方：
- `src/app/` — 写页面的地方，这篇文章基本都在讲它
- `public/` — 放图片、字体之类的静态文件
- `.next/` — 构建产物，别提交到 git 就行

根目录那一堆配置文件先不用管，默认的就够用。

## 路由特殊文件

App Router 有一套文件命名约定，放在路由文件夹下的这些文件名会被框架识别：

| 文件 | 干嘛的 |
|------|--------|
| `page.tsx` | 页面本体，有它这个文件夹才算一个路由 |
| `layout.tsx` | 布局，包裹当前和所有子路由 |
| `loading.tsx` | 加载中的 UI |
| `error.tsx` | 出错时的 UI |
| `not-found.tsx` | 404 |
| `route.ts` | API 接口（不能和 page.tsx 放一起） |
| `template.tsx` | 跟 layout 类似，但每次导航都重新渲染 |
| `default.tsx` | 并行路由的 fallback |
| `global-error.tsx` | 全局错误兜底 |

渲染的时候它们是一层套一层的：

```
layout → template → error → loading → not-found → page
```

如果你写过 React，`loading.tsx` 其实就是 `<Suspense fallback={...}>`，`error.tsx` 就是 ErrorBoundary。只不过 Next.js 把它们变成了文件，不用你手动写了。

## 文件即路由

这是 App Router 最核心的东西：**文件夹结构就是 URL 结构**。

用过 react-router 的话需要转变一下思路——没有集中式的路由配置了，你建什么文件夹，URL 就长什么样。

### 基本路由

每个有 `page.tsx` 的文件夹就是一个路由：

```tsx
// src/app/page.tsx → /
export default function Home() {
  return <h1>首页</h1>;
}
```

```tsx
// src/app/blog/page.tsx → /blog
export default function Blog() {
  return <div>博客列表</div>;
}
```

```tsx
// src/app/about/page.tsx → /about
export default function About() {
  return <div>关于我们</div>;
}
```

没有 `page.tsx` 的文件夹不会变成路由，所以你可以放心在 `app/` 下面放组件、工具函数什么的，不会被意外暴露出去。官方管这个叫 colocation（就近放置）。

### 嵌套路由

文件夹套文件夹，URL 就跟着嵌套：

```
src/app/
├── page.tsx                        → /
├── blog/
│   ├── page.tsx                    → /blog
│   └── first-post/
│       └── page.tsx                → /blog/first-post
└── dashboard/
    ├── page.tsx                    → /dashboard
    └── settings/
        └── page.tsx                → /dashboard/settings
```

### 动态路由

文件夹名用方括号包起来就能匹配动态参数：

```tsx
// src/app/blog/[slug]/page.tsx
export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>文章：{slug}</h1>;
}
```

访问 `/blog/hello-world` 的时候，`slug` 就是 `"hello-world"`。

动态路由有三种写法：

| 写法 | 例子 | 能匹配什么 |
|------|------|-----------|
| `[slug]` | `/blog/[slug]` | `/blog/hello`，只匹配一段 |
| `[...slug]` | `/docs/[...slug]` | `/docs/a`、`/docs/a/b/c`，一段或多段 |
| `[[...slug]]` | `/help/[[...slug]]` | `/help`、`/help/a/b`，零段或多段 |

react-router 里 `[slug]` 相当于 `:slug`，`[...slug]` 相当于 `*`，只是定义方式从路由配置变成了文件夹名。

## layout.tsx

Layout 是另一个核心概念。

### 根布局

`src/app/layout.tsx` 是整个应用的根布局，必须有，而且必须包含 `<html>` 和 `<body>`：

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "我的第一个 Next.js 应用",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

`children` 就是当前路由的页面内容，所有页面都会被这个布局包着。

### 嵌套布局

在子路由文件夹里也可以放 `layout.tsx`，只影响这个路由和它下面的子路由：

```tsx
// src/app/blog/layout.tsx
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex" }}>
      <nav style={{ width: 200 }}>
        <h2>博客导航</h2>
        <ul>
          <li>最新文章</li>
          <li>分类</li>
          <li>标签</li>
        </ul>
      </nav>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
```

这样 `/blog` 和 `/blog/first-post` 都有侧边栏，`/about` 不受影响。

有个细节值得注意：layout 在页面切换时不会重新渲染。从 `/blog` 跳到 `/blog/first-post`，`BlogLayout` 不会卸载重建，里面的状态会保留。这个行为在 react-router 里需要额外处理，Next.js 默认就是这样。如果你就是想每次都重新渲染，用 `template.tsx` 替代就行。

## 路由分组和私有文件夹

### 路由分组

文件夹名用圆括号包起来，不会出现在 URL 里，纯粹用来组织代码：

```
src/app/
├── (marketing)/
│   ├── layout.tsx          # marketing 专用布局
│   ├── page.tsx            → /
│   └── about/
│       └── page.tsx        → /about
├── (shop)/
│   ├── layout.tsx          # shop 专用布局
│   ├── cart/
│   │   └── page.tsx        → /cart
│   └── products/
│       └── page.tsx        → /products
```

`(marketing)` 和 `(shop)` 不影响 URL，但可以各自有独立的布局。适合按业务模块拆分代码，或者给不同模块套不同的布局。甚至可以搞多个根布局——把顶层的 `layout.tsx` 删了，每个分组里各写一个。

### 私有文件夹

下划线 `_` 开头的文件夹会被路由系统忽略：

```
src/app/blog/
├── _components/
│   └── PostCard.tsx        # 不会变成路由
├── _lib/
│   └── api.ts              # 不会变成路由
└── page.tsx                → /blog
```

其实没有 `page.tsx` 的文件夹本来就不会生成路由，但加个 `_` 前缀意图更明确，也能避免跟 Next.js 以后可能新增的特殊文件名撞车。

## 并行路由和拦截路由

这两个是进阶玩法，刚入门知道有这回事就行，用到再学。

### 并行路由

`@slot` 命名的文件夹可以在同一个布局里同时渲染多个页面：

```
src/app/dashboard/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
├── layout.tsx              # 同时接收 analytics 和 team
└── page.tsx
```

典型场景是仪表盘，多个面板各自独立加载、独立处理错误。

### 拦截路由

用特殊的括号语法可以在当前布局里渲染另一个路由的内容：

| 写法 | 意思 |
|------|------|
| `(.)folder` | 拦截同级 |
| `(..)folder` | 拦截上一级 |
| `(..)(..)folder` | 拦截上两级 |
| `(...)folder` | 拦截根路由 |

最常见的用法：列表页点击某一项，弹个 Modal 显示详情，URL 变了但没离开当前页面。

---

### 本文源码示例代码已上传至 GitHub：[https://github.com/Colin3191/nextjs-demo](https://github.com/Colin3191/nextjs-demo)