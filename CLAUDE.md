# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimalist personal blog built with Rspress, a modern static site generator based on Rust for fast build performance. The blog has been streamlined to use the homepage as the main article listing, with a simplified navigation structure.

## Common Commands

**Development:**
- `npm run dev` - Start the development server (available at http://localhost:3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

**Code Quality:**
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

**Framework:** Rspress (static site generator)
**Content:** MDX files with date-based organization
**Configuration:** `rspress.config.ts` - main configuration file

**Current Structure:**
- **Homepage as Blog**: `docs/index.md` serves as the main article listing page
- **Simplified Navigation**: Single "首页" (Home) navigation item pointing to `/`
- **Custom Avatar**: Uses `/colin3191.jpg` as site icon and logo
- **Minimal Config**: Clean configuration with only essential settings

**Directory Structure:**
- `/docs/` - Content root directory
  - `index.md` - Main page displaying article list by date
  - `_meta.json` - Navigation configuration (single "首页" item)
  - `/blog/` - Blog content organized by date structure
    - `/2025/09/` - Contains welcome post
  - `/public/` - Static assets including `colin3191.jpg`

**Key Configuration Details:**
- `rspress.config.ts:6` - Site title set to "Colin3191"
- `rspress.config.ts:8` - Custom icon/logo using `/colin3191.jpg`
- `rspress.config.ts:17-22` - Navigation with single "博客" item linking to root
- `docs/_meta.json:4-5` - Top-level navigation uses exact match `"^/$"` for homepage

**Content Organization:**
- Articles stored in `/blog/YYYY/MM/` structure for date-based organization
- Homepage (`index.md`) manually lists articles in reverse chronological order
- Individual articles use frontmatter with title, date, author, and tags
- No sidebar navigation - streamlined single-page approach

## Blog Content Guidelines

When adding new blog posts:
1. Create articles in the appropriate `/blog/YYYY/MM/` directory
2. Include frontmatter with title, date, author, and tags
3. Manually add the new article to the homepage (`docs/index.md`) article list
4. Maintain reverse chronological order (newest first) on homepage