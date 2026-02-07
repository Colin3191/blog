---
title: Next.js 入门（二）：导航与链接
date: 2026-02-07
author: Colin
tags: [Next.js, React, App Router, 前端]
---

# Next.js 入门（二）：导航与链接

上一篇讲了怎么用文件夹定义路由，这篇讲怎么在路由之间跳转。

用过 react-router 的话，导航无非就是 `<Link>` 和 `useNavigate`。Next.js 也差不多，但因为页面默认跑在服务端，所以多了 prefetch、流式渲染这些东西。听着复杂，写起来其实没多少新东西。

## 导航背后发生了什么

先花一分钟搞清楚原理，不然后面看 API 会觉得莫名其妙。

Next.js 页面默认是服务端组件，内容在服务器上生成再发给浏览器。那每次跳页面都要等服务器？那不是很慢？

还好，框架在背后做了三件事：

### Prefetch

`<Link>` 出现在屏幕上的时候，Next.js 就偷偷在后台把这个链接的页面数据加载好了。等你真点的时候，数据早就到了，所以感觉是秒开。

不过 prefetch 也分情况：
- **静态路由**：整个页面都 prefetch
- **动态路由**：不 prefetch，或者只 prefetch 到最近的 `loading.tsx` 那一层

### 流式渲染

动态路由没法提前 prefetch，那就换个思路——服务器渲染好一块就先发一块，不用等整个页面都好了才发。配合 `loading.tsx` 的骨架屏，用户至少能先看到个加载状态，不会一直看着白屏。

### 客户端过渡

传统 SSR 每次跳页面都是整页刷新，白屏闪一下。Next.js 的 `<Link>` 不走这套，它在客户端直接替换变化的部分，共享布局和状态都保留着，体验跟 SPA 没区别。

这三个东西配合起来，虽然页面是服务端渲染的，但用起来跟客户端渲染一样流畅。

## `<Link>` 组件

日常写得最多的就是它，react-router 里也有同名组件，用法差不多。

### 基本用法

```tsx
import Link from "next/link";

export default function Navigation() {
  return (
    <nav>
      <Link href="/">首页</Link>
      <Link href="/blog">博客</Link>
      <Link href="/about">关于</Link>
    </nav>
  );
}
```

跟 react-router 的区别：`href` 代替了 `to`，不需要额外的 `<a>` 标签（v13 之前需要）。

### 动态路由链接

结合上一篇讲的动态路由，用模板字符串生成链接：

```tsx
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
}

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

`href` 也可以传对象：

```tsx
<Link
  href={{
    pathname: "/blog/[slug]",
    query: { slug: post.slug },
  }}
>
  {post.title}
</Link>
```

两种写法效果一样，我个人更喜欢模板字符串，直观。对象写法参数多的时候可能更清晰一点。

### 常用 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `href` | `string \| object` | — | 目标路径，必填 |
| `replace` | `boolean` | `false` | 替换当前历史记录，而不是新增一条 |
| `scroll` | `boolean` | `true` | 导航后是否滚动到顶部 |
| `prefetch` | `boolean \| null` | `null`（自动） | 是否 prefetch，`false` 可以关闭 |
| `onNavigate` | `function` | — | 客户端导航时的回调，可以 `preventDefault()` 取消导航 |

### 替换历史记录

默认每次导航都会往浏览器历史栈里 push 一条。不想让用户点返回回到当前页？加个 `replace`：

```tsx
<Link href="/dashboard" replace>
  进入仪表盘
</Link>
```

比如登录成功后跳仪表盘，用户不该再回到登录页。

### 控制滚动行为

默认跳转后会滚到页面顶部（如果目标页面不在视口内的话）。不想要这个行为：

```tsx
<Link href="/blog" scroll={false}>
  博客
</Link>
```

也可以用 `#` 锚点滚动到指定位置：

```tsx
<Link href="/blog/intro#section-2">跳到第二节</Link>
```

### 控制 Prefetch

一般不用管，框架自己处理。但如果页面上链接特别多（比如无限滚动列表），全 prefetch 太浪费了，可以关掉：

```tsx
<Link href={`/products/${id}`} prefetch={false}>
  {name}
</Link>
```

### 拦截导航

`onNavigate` 可以在跳转前拦一下，比如表单还没保存，用户就要走：

```tsx
<Link
  href="/other-page"
  onNavigate={(e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      // 弹窗确认
    }
  }}
>
  离开
</Link>
```

注意这个回调只在客户端导航时触发，Ctrl/Cmd + 点击开新标签页不会走这里。

## `useRouter` Hook

`<Link>` 是写在 JSX 里的，`useRouter` 是写在逻辑里的——表单提交完跳转、判断条件后跳转，这种场景用它。

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await login();
    if (success) {
      router.push("/dashboard");
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

两个容易踩的坑：
1. 必须加 `"use client"`，hook 只能在客户端组件里用
2. 从 `next/navigation` 导入，别写成 `next/router`，那是老版 Pages Router 的

### 常用方法

| 方法 | 说明 |
|------|------|
| `router.push(url)` | 跳转到新页面，新增历史记录 |
| `router.replace(url)` | 跳转到新页面，替换当前历史记录 |
| `router.back()` | 返回上一页 |
| `router.forward()` | 前进到下一页 |
| `router.refresh()` | 刷新当前路由（重新请求服务器，不丢失客户端状态） |
| `router.prefetch(url)` | 手动 prefetch 某个路由 |

### `push` vs `replace`

跟 `<Link>` 的 `replace` prop 一样的逻辑：

```tsx
// 用户可以点返回回到当前页
router.push("/dashboard");

// 用户点返回会跳过当前页
router.replace("/dashboard");
```

### `refresh` 挺好用的

`router.refresh()` 会让服务端组件重新从服务器拿数据、重新渲染，但客户端组件的状态不会丢（`useState` 的值、滚动位置都还在）。

```tsx
async function handleDelete(id: string) {
  await deletePost(id);
  router.refresh(); // 重新获取列表数据，UI 自动更新
}
```

react-router 里没有对应的东西，这算是服务端组件带来的新能力。

### `<Link>` 还是 `useRouter`

| 场景 | 用什么 |
|------|--------|
| 导航栏、列表里的链接 | `<Link>` |
| 表单提交后跳转 | `useRouter` |
| 条件判断后跳转 | `useRouter` |
| 需要 prefetch 和 SEO | `<Link>` |
| 返回上一页 | `useRouter` |

原则很简单：能用 `<Link>` 就用 `<Link>`，自动 prefetch、语义化都有了。`useRouter` 留给那些非得用代码控制的场景。

## `usePathname`：拿当前路径

返回当前 URL 的路径部分，不含查询参数和 hash。用得最多的地方就是导航高亮：

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            fontWeight: pathname === link.href ? "bold" : "normal",
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

| URL | `usePathname()` 返回值 |
|-----|----------------------|
| `/` | `"/"` |
| `/dashboard` | `"/dashboard"` |
| `/dashboard?v=2` | `"/dashboard"` |
| `/blog/hello-world` | `"/blog/hello-world"` |

只返回路径，不带查询参数。查询参数要用下面的 `useSearchParams`。

## `useSearchParams`：读查询参数

返回一个只读的 `URLSearchParams` 对象，就是 URL 里 `?` 后面那部分。

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // /search?q=nextjs → "nextjs"
  const page = searchParams.get("page"); // /search?q=nextjs&page=2 → "2"

  return (
    <div>
      <p>搜索：{query}</p>
      <p>第 {page ?? 1} 页</p>
    </div>
  );
}
```

### 常用方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `get(key)` | 获取参数值，不存在返回 `null` | `searchParams.get("q")` |
| `has(key)` | 判断参数是否存在 | `searchParams.has("page")` |
| `getAll(key)` | 获取同名参数的所有值 | `?tag=a&tag=b` → `["a", "b"]` |
| `toString()` | 转成字符串 | `"q=nextjs&page=2"` |

### 更新查询参数

`useSearchParams` 本身是只读的，改参数得配合 `useRouter` 或 `<Link>`：

```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Pagination() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <button onClick={() => goToPage(1)}>第 1 页</button>
      <button onClick={() => goToPage(2)}>第 2 页</button>
    </div>
  );
}
```

### 服务端组件里怎么读

服务端组件用不了 hook，但 `page.tsx` 有个 `searchParams` prop：

```tsx
// src/app/search/page.tsx（服务端组件）
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const results = await fetchResults(q, Number(page) || 1);

  return <div>{/* 渲染搜索结果 */}</div>;
}
```

### 用哪个

| 场景 | 用什么 |
|------|--------|
| 服务端根据参数加载数据（分页、筛选） | `searchParams` prop |
| 客户端读取/操作参数（筛选已有数据） | `useSearchParams` |
| 事件回调里读参数，不想触发重渲染 | `new URLSearchParams(window.location.search)` |

### 别忘了包 `<Suspense>`

这里有个坑：静态渲染的路由里用了 `useSearchParams`，会导致从这个组件往上到最近的 `<Suspense>` 边界全部变成客户端渲染。所以记得包一层 `<Suspense>`：

```tsx
import { Suspense } from "react";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <SearchResults />
    </Suspense>
  );
}
```

这样 `<Suspense>` 外面的部分还能正常静态渲染，不会被影响到。

## `redirect`：服务端重定向

用在服务端组件、Server Action、Route Handler 里，把用户重定向到另一个 URL。

```tsx
import { redirect } from "next/navigation";

async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
}

export default async function DashboardPage() {
  await checkAuth();
  return <div>仪表盘内容</div>;
}
```

### `redirect` vs `permanentRedirect`

| 函数 | HTTP 状态码 | 用途 |
|------|------------|------|
| `redirect(url)` | 307 | 临时重定向（未登录跳登录页） |
| `permanentRedirect(url)` | 308 | 永久重定向（URL 改了，告诉搜索引擎） |

为什么是 307/308 而不是 302/301？因为 302 会把 POST 请求变成 GET，307 会保留原始请求方法。这在表单提交场景下很重要。

### 注意事项

- `redirect` 内部是靠抛异常来中断渲染的，别放在 `try/catch` 里，会被吞掉
- 不用写 `return redirect(...)`，TypeScript 类型是 `never`
- 客户端组件里只能在渲染过程中调 `redirect`，事件处理器里要用 `useRouter`

## 原生 History API

浏览器自带的 `window.history.pushState` 和 `replaceState` 也能用，Next.js 会自动跟路由器同步。

### `pushState`：加一条历史记录

只想改 URL 不想触发页面导航的时候用，比如排序：

```tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SortProducts() {
  const searchParams = useSearchParams();

  function updateSorting(sortOrder: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortOrder);
    window.history.pushState(null, "", `?${params.toString()}`);
  }

  return (
    <div>
      <button onClick={() => updateSorting("asc")}>升序</button>
      <button onClick={() => updateSorting("desc")}>降序</button>
    </div>
  );
}
```

### `replaceState`：替换当前那条

不需要用户能回退的场景，比如切语言：

```tsx
"use client";

export default function LocaleSwitcher() {
  function changeLocale(locale: string) {
    window.history.replaceState(null, "", `/${locale}`);
  }

  return (
    <div>
      <button onClick={() => changeLocale("zh")}>中文</button>
      <button onClick={() => changeLocale("en")}>English</button>
    </div>
  );
}
```

跟 `useRouter` 的区别：这俩只改 URL，不会触发导航、不会重新拿数据。就是想让 URL 反映当前状态，但页面不用动。

## 导航 API 一览

| API | 类型 | 用在哪 | 典型场景 |
|-----|------|--------|----------|
| `<Link>` | 声明式 | 服务端/客户端组件 | 导航栏、列表链接 |
| `useRouter` | 编程式 | 客户端组件 | 表单提交后跳转、条件跳转 |
| `redirect` | 服务端重定向 | 服务端组件/Server Action | 权限校验、未登录跳转 |
| `usePathname` | 读取路径 | 客户端组件 | 导航高亮 |
| `useSearchParams` | 读取查询参数 | 客户端组件 | 筛选、分页 |
| `searchParams` prop | 读取查询参数 | 服务端 page.tsx | 服务端数据加载 |
| `history.pushState` | 原生 API | 客户端组件 | 只改 URL 不导航 |

## 导航慢？查查这几个原因

实际开发中如果觉得页面跳转卡，大概率是这几个问题：

1. **动态路由没写 `loading.tsx`** — 浏览器干等服务器渲染完，用户看到的就是卡住了。加个 `loading.tsx` 马上就有加载状态，体感完全不一样。

2. **该静态的路由变成了动态** — 动态路由段忘了加 `generateStaticParams`，本来构建时就能生成的页面，变成每次请求都要现算。

3. **网络不好** — prefetch 还没完成用户就点了，数据没到位。可以用 `useLinkStatus` hook 加个加载指示器，至少让用户知道在转。

4. **JS bundle 太大** — `<Link>` 要水合完才能开始 prefetch，bundle 大了水合就慢，prefetch 也跟着延迟。

---

### 本文源码示例代码已上传至 GitHub：[https://github.com/Colin3191/nextjs-demo](https://github.com/Colin3191/nextjs-demo)
