# 🚲 Ekibdlo — Design System MASTER

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow all rules below.

---

**Project:** Ekibdlo — Premium Used Bicycle Marketplace  
**Theme:** White & Forest Emerald × Liquid Glass  
**Goal:** Tạo sự tin tưởng tuyệt đối cho khách hàng mua xe đạp cũ cao cấp  
**Stack:** React + CSS Modules  
**Updated:** 2026-02-25  

---

## 1. Color Palette — White & Forest Emerald

Lấy cảm hứng từ thiên nhiên trong lành × công nghệ hiện đại. Xanh rừng sâu tạo sự tin cậy, nền trắng tinh khiết mang lại minh bạch.

| Role | Name | Hex | CSS Variable |
|------|------|-----|--------------|
| **Primary** | Deep Emerald | `#064E3B` | `--color-primary` |
| **Primary Light** | Forest Green | `#065F46` | `--color-primary-light` |
| **Secondary** | Slate 700 | `#334155` | `--color-secondary` |
| **CTA / Accent** | Bright Emerald | `#10B981` | `--color-cta` |
| **CTA Hover** | Mint Green | `#34D399` | `--color-cta-hover` |
| **Background** | Ivory White | `#F8FAFC` | `--color-bg` |
| **Surface** | Pure White | `#FFFFFF` | `--color-surface` |
| **Text Primary** | Charcoal Slate | `#1E293B` | `--color-text` |
| **Text Muted** | Slate 500 | `#64748B` | `--color-text-muted` |
| **Border** | Slate 200 | `#E2E8F0` | `--color-border` |
| **Glass Surface** | White/70 | `rgba(255,255,255,0.7)` | `--color-glass` |
| **Glass Border** | White/30 | `rgba(255,255,255,0.3)` | `--color-glass-border` |

### CSS Variables Definition

```css
:root {
  /* === WHITE & FOREST EMERALD PALETTE === */
  --color-primary:       #064E3B;
  --color-primary-light: #065F46;
  --color-secondary:     #334155;
  --color-cta:           #10B981;
  --color-cta-hover:     #34D399;
  --color-bg:            #F8FAFC;
  --color-surface:       #FFFFFF;
  --color-text:          #1E293B;
  --color-text-muted:    #64748B;
  --color-border:        #E2E8F0;

  /* === LIQUID GLASS (Light Tone) === */
  --color-glass:         rgba(255, 255, 255, 0.7);
  --color-glass-border:  rgba(255, 255, 255, 0.3);
  --glass-blur:          blur(20px);
  --glass-blur-heavy:    blur(28px);
  --glass-saturate:      saturate(180%);

  /* === EMERALD GRADIENTS === */
  --gradient-cta:        linear-gradient(135deg, #064E3B 0%, #10B981 100%);
  --gradient-emerald:    linear-gradient(135deg, #064E3B 0%, #065F46 100%);
  --gradient-glass:      linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 100%);
  --gradient-surface:    linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
}
```

---

## 2. Typography — Elegant Luxury × Barlow Condensed

> [!NOTE]
> **Font chính thức:** `Barlow Condensed` (Google Fonts — miễn phí, không cần file local).
> Condensed geometric sans-serif, gần nhất với Trade Gothic W01 trên Google Fonts.
> Tương phản với `Cormorant Garamond` (Serif — sang trọng) để tạo chiều sâu thương hiệu.

> [!IMPORTANT]
> **Quy tắc bắt buộc:** Mọi Component CSS Modules phải dùng `var(--font-body)` — không hardcode tên font.
> CSS variables được định nghĩa global tại `src/index.css` và kế thừa tự động.

**Triết lý tương phản:** Cormorant Garamond (Serif — cảm xúc, sang trọng) × Barlow Condensed (Industrial sans — sắc bén, độ tin cậy). Bộ đôi này tạo cảm giác một thương hiệu cao cấp vừa có chiều sâu vừa có kỹ thuật.

### 2.1 Font Role Table

| Role | Font | Weight | Letter-spacing | Usage |
|------|------|--------|----------------|-------|
| **Display / Hero** | Cormorant Garamond | 600–700 | -0.02em | H1, hero titles |
| **Heading** | Cormorant Garamond | 500–600 | -0.01em | H2, H3, section titles |
| **Body** | Barlow Condensed | 400 | 0.02em | Body text, descriptions |
| **UI / Labels** | Barlow Condensed | 500 | 0.04em | Nav, tags, form labels |
| **Buttons / CTA** | Barlow Condensed | **600** | 0.07em | Uppercase buttons |
| **Heading phụ** | Barlow Condensed | **600** | 0.02em | Subtitles, card headers |
| **Price / Stats** | Barlow Condensed | **700** | -0.01em | Prices, numbers, KPIs |
| **Eyebrow / Badge** | Barlow Condensed | 700 | 0.12em | Section labels, overlines |

### 2.2 CSS Variables — Font Stack

```css
/* src/index.css — global, không lặp lại trong CSS Modules */
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Barlow Condensed', sans-serif;

  /* Tracking — Barlow Condensed optimized */
  --tracking-tight:   -0.02em;   /* Display/Hero */
  --tracking-normal:   0em;
  --tracking-wide:     0.02em;   /* Body — tăng độ thoáng */
  --tracking-wider:    0.05em;   /* UI Labels */
  --tracking-widest:   0.12em;   /* Eyebrow / badge uppercase */
}
```

### 2.3 Google Fonts Import

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Barlow+Condensed:wght@300;400;500;600;700&display=swap');
```

### 2.4 Weight Rules

| Context | Weight | Lý do |
|---------|--------|---------|
| Body text | 400 | Dễ đọc ở kích thước nhỏ |
| Nav / Labels | 500 | Nổi bật vừa đủ |
| **Buttons / Heading phụ** | **600** | Tạo cảm giác giống Trade Gothic gốc |
| **Price, Stats, KPI** | **700** | Số liệu được chiếm ưu thế thị giác |
| Eyebrow uppercase | 700 | Barlow Condensed đẹp nhất ở bold + wide tracking |

### 2.5 Component Rules

```css
/* ✅ ĐÚNG — dùng var() để kế thừa từ index.css */
.myComponent  { font-family: var(--font-body); font-weight: 400; }
.myButton     { font-family: var(--font-body); font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; }
.mySubheading { font-family: var(--font-body); font-weight: 600; letter-spacing: 0.02em; }
.myPrice      { font-family: var(--font-body); font-weight: 700; letter-spacing: -0.01em; }
.myTitle      { font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em; }

/* ❌ SAI — hardcode tên font */
.myComponent  { font-family: 'Barlow Condensed', sans-serif; }
```

---

## 3. Spacing System

```css
:root {
  --space-1:  4px;    /* 0.25rem */
  --space-2:  8px;    /* 0.5rem  */
  --space-3:  12px;   /* 0.75rem */
  --space-4:  16px;   /* 1rem    — standard padding */
  --space-5:  20px;   /* 1.25rem */
  --space-6:  24px;   /* 1.5rem  — card padding */
  --space-8:  32px;   /* 2rem    — section gap */
  --space-10: 40px;   /* 2.5rem  */
  --space-12: 48px;   /* 3rem    — section margin */
  --space-16: 64px;   /* 4rem    — hero padding */
  --space-20: 80px;   /* 5rem    */
  --space-24: 96px;   /* 6rem    — large section */
}
```

---

## 4. Liquid Glass Effects

Style đặc trưng của Ekibdlo. Áp dụng cho navbar, cards, modals, sidebars.

### Glass Card (Primary)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(15, 23, 42, 0.08),
    0 2px 8px rgba(15, 23, 42, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 16px 48px rgba(15, 23, 42, 0.12),
    0 4px 16px rgba(202, 138, 4, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}
```

### Glass Navbar (Floating)

```css
.glass-navbar {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
}
```

### Glass Dark (For Dark Section)

```css
.glass-dark {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Morphing / Fluid Animation

```css
/* Fluid blob background */
@keyframes fluid-morph {
  0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
}

.fluid-blob {
  animation: fluid-morph 8s ease-in-out infinite;
  background: var(--gradient-cta);
  opacity: 0.06;
}

/* Shimmer effect for emerald elements */
@keyframes emerald-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.emerald-shimmer {
  background: linear-gradient(90deg,
    #064E3B 0%,
    #10B981 40%,
    #34D399 50%,
    #10B981 60%,
    #064E3B 100%
  );
  background-size: 200% auto;
  animation: emerald-shimmer 3s linear infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 5. Component Specs

### 5.1 Buttons

```css
/* Primary — Emerald CTA */
.btn-primary {
  background: var(--gradient-cta);
  color: #FFFFFF;
  padding: 12px 28px;
  border-radius: 10px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  transform: translateY(-1px);
}

/* Secondary — Glass Outline */
.btn-secondary {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  color: var(--color-primary);
  border: 1.5px solid var(--color-border);
  padding: 12px 28px;
  border-radius: 10px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  transition: all 250ms ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-cta);
  color: var(--color-primary);
}

/* Ghost — Transparent */
.btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-ghost:hover {
  background: rgba(15, 23, 42, 0.05);
  color: var(--color-primary);
}
```

### 5.2 Bicycle Product Cards

```css
.bicycle-card {
  /* Glass base */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;

  /* Shadow */
  box-shadow:
    0 4px 16px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);

  transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bicycle-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 20px 48px rgba(6, 78, 59, 0.10),
    0 4px 16px rgba(16, 185, 129, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(16, 185, 129, 0.25);
}

/* Image container */
.bicycle-card__image {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  position: relative;
}

.bicycle-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bicycle-card:hover .bicycle-card__image img {
  transform: scale(1.05);
}

/* Body */
.bicycle-card__body {
  padding: var(--space-6);
}

.bicycle-card__brand {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.bicycle-card__title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.bicycle-card__price {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.bicycle-card__price .currency {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 400;
}

/* Condition badge */
.badge-condition {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wide);
}

.badge-condition--excellent {
  background: rgba(16, 185, 129, 0.08);
  color: #064E3B;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.badge-condition--good {
  background: rgba(6, 95, 70, 0.08);
  color: #065F46;
  border: 1px solid rgba(6, 95, 70, 0.15);
}

.badge-condition--fair {
  background: rgba(71, 85, 105, 0.08);
  color: #334155;
  border: 1px solid rgba(71, 85, 105, 0.15);
}
```

### 5.3 Inputs & Search

```css
/* Standard Input */
.input {
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-cta);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.10);
}

.input::placeholder {
  color: var(--color-text-muted);
}

/* Hero Search Bar */
.search-hero {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 8px 8px 8px 20px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.1);
  max-width: 640px;
  width: 100%;
}
```

### 5.4 Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 200ms ease;
}

.modal {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: var(--space-8);
  box-shadow:
    0 32px 64px rgba(15, 23, 42, 0.15),
    0 8px 24px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  max-width: 520px;
  width: 90%;
  animation: slide-up 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.5 Shadows

```css
:root {
  --shadow-xs:        0 1px 2px rgba(6, 78, 59, 0.04);
  --shadow-sm:        0 2px 4px rgba(6, 78, 59, 0.06);
  --shadow-md:        0 4px 16px rgba(6, 78, 59, 0.08);
  --shadow-lg:        0 10px 32px rgba(6, 78, 59, 0.10);
  --shadow-xl:        0 20px 48px rgba(6, 78, 59, 0.12);
  --shadow-2xl:       0 32px 64px rgba(6, 78, 59, 0.15);
  --shadow-emerald:   0 4px 20px rgba(16, 185, 129, 0.20);
  --shadow-emerald-lg: 0 8px 32px rgba(16, 185, 129, 0.30);
}
```

### 5.6 Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 9999px;
}
```

---

## 6. Animations & Transitions

```css
/* Keyframes */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Transition presets */
:root {
  --transition-fast:   all 150ms ease;
  --transition-base:   all 200ms ease;
  --transition-smooth: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   all 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Page Architecture — Marketplace Pattern

Section thứ tự chuẩn cho Ekibdlo:

```
1. HERO          — Search Bar là CTA chính. "Tìm chiếc xe hoàn hảo"
2. CATEGORIES    — Grid danh mục: Road, Mountain, City, Kids, Vintage…
3. LISTINGS      — Featured bicycle cards (glass cards)
4. TRUST SIGNALS — Số liệu (5,000+ xe, 4.9★, Bảo hành 30 ngày…)
5. HOW IT WORKS  — 3 bước: Duyệt → Liên hệ → Nhận xe
6. TESTIMONIALS  — Reviews từ người mua
7. SELL CTA      — "Đăng xe của bạn" section
8. FOOTER        — Footer chuẩn
```

### CTA Strategy

- **Primary CTA:** Search bar ở Hero (giảm friction tối đa)
- **Secondary CTA:** "Đăng bán xe" trên Navbar
- **Trust element:** Hiển thị số lượng xe + rating ngay dưới search bar

---

## 8. Responsive Breakpoints

```css
/* Mobile first */
:root {
  --container-sm:  640px;
  --container-md:  768px;
  --container-lg:  1024px;
  --container-xl:  1280px;
  --container-2xl: 1440px;
}

/* Usage */
@media (min-width: 375px)  { /* Mobile */ }
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Wide */ }
```

---

## 9. Anti-Patterns — KHÔNG được dùng

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Màu sắc rực rỡ (vàng gold, đỏ, xanh neon) | Deep Emerald `#064E3B` + Bright `#10B981` |
| Nền tối cho các section chính | Nền trắng `#FFFFFF` / `#F8FAFC` để đảm bảo sự liền mạch |
| Emoji làm icon 🚲 🔥 | SVG từ Lucide / Heroicons |
| Scale hover gây layout shift | `translateY(-2px)` + emerald shadow |
| Text xám nhạt (#94A3B8) | `#64748B` (slate-500) tối thiểu |
| Glass opacity thấp (bg-white/10) | `rgba(255,255,255,0.7)` trở lên |
| Navbar dính sát top-0 | `top: 16px` với border-radius |
| Transition nhanh quá (<100ms) | 150–350ms với cubic-bezier |
| Mixed container widths | `max-width: 1280px` nhất quán |
| Font mặc định của browser | Cormorant Garamond + Montserrat |
| Thiếu `cursor: pointer` | Tất cả clickable elements |

---

## 10. Pre-Delivery Checklist

**Trước khi deliver bất kỳ UI component nào, verify:**

### Visual Quality
- [ ] Dùng Cormorant Garamond (display) + Montserrat (body)
- [ ] Màu primary `#0F172A`, accent `#CA8A04` — không dùng màu khác làm accent chính
- [ ] Glass effects có `backdrop-filter: blur()` và `saturate()`
- [ ] Không có emoji làm icon — dùng SVG (Lucide React)
- [ ] Hover gold border/shadow trên cards

### Interaction
- [ ] `cursor: pointer` trên tất cả clickable elements
- [ ] Transition 150–350ms với cubic-bezier
- [ ] Hover states không gây layout shift
- [ ] Focus states visible cho keyboard navigation

### Layout
- [ ] Floating navbar: `top: 16px; left: 16px; right: 16px`
- [ ] Content có padding-top đủ để không bị che bởi fixed navbar
- [ ] Max-width `1280px` được dùng nhất quán
- [ ] Responsive tại: 375px, 768px, 1024px, 1440px
- [ ] Không có horizontal scroll trên mobile

### Accessibility
- [ ] Text contrast ≥ 4.5:1 trên nền trắng
- [ ] All `<img>` có `alt` text
- [ ] Form inputs có `<label>`
- [ ] `prefers-reduced-motion` được respect
- [ ] Color không phải indicator duy nhất

---

*Design System này được gen bởi UI/UX Pro Max skill kết hợp với tinh chỉnh thủ công cho Ekibdlo.*
