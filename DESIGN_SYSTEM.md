# CycleTrust Design System

This document outlines the design system for the CycleTrust website, extracted from the generated page. AI agents should use this reference to maintain consistency across new pages.

## 1. Core Technology Stack
- **Framework:** Tailwind CSS (v3.x)
- **Icons:** Iconify (Set: `solar`)
- **Fonts:** Inter (Google Fonts)

## 2. Configuration & Theme

### Tailwind Config
To replicate the custom theme, ensure your `tailwind.config.js` (or script injection) includes:

```javascript
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9', // Blue
                    600: '#0284c7',
                },
                accent: {
                    400: '#22d3ee', // Cyan
                    500: '#34d399', // Emerald/Soft Green
                }
            },
            animation: {
                'float': 'float 8s ease-in-out infinite',
                'float-delayed': 'float 8s ease-in-out 4s infinite',
                'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    }
}
```

### Global CSS & Utilities
These custom classes are essential for the "Glassmorphism" and "Gradient" look.

```css
/* Base */
body {
    background-color: #f8fafc; /* Very light gray base */
    color: #0f172a;
}

/* Glassmorphism */
.glass-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
}

.glass-card {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease-out;
}

.glass-card:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    border-color: rgba(255, 255, 255, 0.8);
}

/* Gradients */
.text-gradient {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.bg-gradient-brand {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%);
}

/* Animations */
.animate-float {
    animation: float 8s ease-in-out infinite;
}
.animate-float-delayed {
    animation: float 8s ease-in-out 4s infinite;
}

/* Ambient Blobs */
.blob {
    position: absolute;
    filter: blur(80px);
    opacity: 0.4;
    z-index: -1;
    border-radius: 50%;
}
```

## 3. UI Components

### Buttons

**Primary Action Button:**
```html
<a href="#" class="bg-gradient-brand text-white text-base font-medium px-8 py-3.5 rounded-full hover:shadow-xl hover:shadow-cyan-500/20 transition-all text-center">
    Button Text
</a>
```

**Secondary / Glass Button:**
```html
<a href="#" class="glass-card text-slate-700 text-base font-medium px-8 py-3.5 rounded-full hover:bg-white transition-all text-center flex items-center justify-center gap-2">
    <iconify-icon icon="solar:icon-name-linear"></iconify-icon>
    Button Text
</a>
```

### Badges & Tags

**Trust Badge (Blue/Glass):**
```html
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium">
    <iconify-icon icon="solar:shield-check-linear"></iconify-icon>
    Verified Text
</div>
```

**Status Badge (Green):**
```html
<div class="bg-emerald-500/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
    Verified
</div>
```

### Cards

**Feature/Trust Card:**
```html
<div class="glass-panel rounded-3xl p-8">
    <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
        <iconify-icon icon="solar:checklist-minimalistic-linear" width="24"></iconify-icon>
    </div>
    <h3 class="font-semibold text-slate-900 mb-1">Title</h3>
    <p class="text-sm text-slate-500 leading-relaxed">Description text.</p>
</div>
```

**Problem/Solution Card:**
```html
<div class="p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
    <div class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-6">
        <iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon>
    </div>
    <h3 class="text-lg font-semibold text-slate-900 mb-3">Problem Title</h3>
    <p class="text-sm text-slate-500 leading-relaxed">Description of the pain point.</p>
</div>
```

## 4. Typography Rules

- **Headings:**
  - Font: `Inter`
  - Color: `text-slate-900`
  - Style: `font-semibold` or `font-bold`
  - Letter Spacing: `tracking-tight` or `tracking-tighter`
- **Body Text:**
  - Color: `text-slate-500` (primary body), `text-slate-400` (secondary/meta)
  - Size: `text-sm` or `text-base`
  - Leading: `leading-relaxed`

## 5. Icon Usage (Iconify)

Use `solar` icon set with `linear` style for most UI elements and `bold` for active states or emphasis.

examples:
- `solar:bicycle-linear` (Logo/Bike)
- `solar:shield-check-linear` (Trust)
- `solar:check-circle-bold` (Success/Verified)
- `solar:star-bold` (Rating)

## 6. Layout Patterns

- **Page Container:** `max-w-7xl mx-auto px-6 lg:px-8`
- **Section Spacing:** `mb-24` or `mb-32` between major sections.
- **Glass Header:** `fixed top-0 w-full z-50` with an inner `.glass-panel`.
- **Background:** Use `fixed inset-0` with `.blob` elements for ambient background colors (Blue, Cyan, Emerald).

---
*Generated by Antigravity Agent based on existing site designs.*
