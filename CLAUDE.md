# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A financial tracker application built with Next.js 15.5.4, React 19, and TypeScript. The app helps users track and manage payments by showing what's pending, due, and past due.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Lint code with Biome
npm run lint

# Format code with Biome
npm run format
```

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS plugin
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font)
- **Linter/Formatter**: Biome 2.2.0
- **Build Tool**: Turbopack (Next.js default)

## Code Quality Tools

### Biome Configuration

The project uses Biome for both linting and formatting with:
- 2-space indentation
- Recommended rules enabled for Next.js and React
- Import organization on save
- Git integration with VCS-aware linting
- `noUnknownAtRules` disabled for Tailwind CSS compatibility

## Architecture

### File Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with font configuration
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles and Tailwind imports
```

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Styling Approach

- Uses Tailwind CSS v4 with the `@theme inline` directive
- Custom CSS variables defined in `globals.css`:
  - `--background` / `--foreground` for theme colors
  - `--font-geist-sans` / `--font-geist-mono` for typography
- Dark mode via `prefers-color-scheme` media query
- Tailwind imports handled via PostCSS with `@tailwindcss/postcss` plugin

### TypeScript Configuration

- Target: ES2017
- Strict mode enabled
- Module resolution: bundler
- Incremental compilation enabled
- Next.js TypeScript plugin included

## Development Notes

- The development and build processes use Turbopack for faster compilation
- Hot module reloading is enabled by default in dev mode
- The app uses the Next.js App Router (not Pages Router)
- Currently a fresh Next.js installation - the financial tracker features are yet to be implemented

## Code Quality Requirements

**Every feature must:**
1. Pass Biome linting (`npm run lint`)
2. Be formatted with Biome (`npm run format`)
3. Pass all unit tests (once test suite is implemented)
