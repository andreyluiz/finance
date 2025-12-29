# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

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

# Run type checks
npm run typecheck
```

## Technology Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS plugin
- **UI Components**: shadcn/ui (New York style)
- **Theming**: next-themes for dark/light mode support
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
│   ├── layout.tsx           # Root layout with ThemeProvider
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles, Tailwind, and shadcn variables
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   └── button.tsx       # Button component
│   ├── theme-provider.tsx   # next-themes wrapper
│   └── theme-switcher.tsx   # Theme toggle component
└── lib/
    └── utils.ts             # Utility functions (cn helper)
```

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)

### Styling Approach

- Uses Tailwind CSS v4 with the `@theme inline` directive
- shadcn/ui components with HSL color system
- CSS variables for theming defined in `globals.css`:
  - Light and dark mode variables (background, foreground, primary, secondary, etc.)
  - Component-specific colors (card, popover, muted, accent, destructive)
  - Border, input, and ring colors
  - Custom fonts mapped to Geist Sans and Geist Mono
- Dark mode controlled by next-themes with class-based switching
- Theme persisted to localStorage with system preference support
- Tailwind imports handled via PostCSS with `@tailwindcss/postcss` plugin

### UI Component System

#### shadcn/ui Configuration
- Style: New York
- Base color: Neutral
- CSS variables enabled
- RSC (React Server Components) compatible
- Configuration file: `components.json`

#### Adding New shadcn Components
**Always use the shadcn CLI to add new components:**
```bash
npx shadcn@latest add [component-name]
```

Available components include: button, card, input, label, select, dialog, dropdown-menu, popover, tooltip, badge, avatar, checkbox, radio-group, switch, slider, tabs, accordion, alert, separator, skeleton, table, toast, and many more.

If a component is not available via CLI, manually create it in `src/components/ui/` following the shadcn/ui documentation.

#### Component Guidelines
- All UI components live in `src/components/ui/`
- Use the `cn()` utility from `@/lib/utils` for conditional class names
- Components follow shadcn/ui patterns with class-variance-authority for variants
- Built on Radix UI primitives for accessibility
- **KISS (Keep It Simple, Stupid)**: Write simple, straightforward components that do one thing well
- **DRY (Don't Repeat Yourself)**: Extract and reuse components whenever possible
  - If UI patterns appear more than once, create a shared component
  - Prefer composition over duplication
  - Extract common layouts, headers, footers, and repeated UI elements into reusable components

#### Before Creating UI Components
**IMPORTANT:** Before creating any UI component, always check `src/components/ui/` to see if there are existing shadcn components that might fit your needs.

Common components to check for:
- **Typography**: Check `src/components/ui/typography.tsx` for `H1`, `H2`, `H3`, `H4`, `P`, `Lead`, `Large`, `Small`, `Muted` components
- **Forms**: `input`, `label`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `textarea`
- **Feedback**: `button`, `badge`, `alert`, `toast`, `dialog`, `popover`, `tooltip`
- **Layout**: `card`, `separator`, `tabs`, `accordion`, `table`
- **Navigation**: `dropdown-menu`, `navigation-menu`, `breadcrumb`

**Always reuse existing components instead of creating new ones or using raw HTML elements.**

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
- Theme switching is client-side only - use `"use client"` directive when using theme hooks
- The `suppressHydrationWarning` prop on `<html>` prevents hydration warnings from next-themes

## Available Tools

### Next DevTools MCP
For specifics on Next.js development, use the Next DevTools MCP tool.

### Context7 MCP
When in doubt about implementation details, best practices, or technology-specific questions, use the Context7 MCP tool to search for relevant documentation and examples.

## Code Quality Requirements

**Every feature must:**
1. Pass Biome linting (`npm run lint`)
2. Be formatted with Biome (`npm run format`)
3. Pass all unit tests (once test suite is implemented)
4. Have all strings translated and added to all language files