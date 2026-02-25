# 🎨 CycleTrust Design System

> **Reference Source**: Extracted from `src/pages/HomePage/HomePage.jsx` and `src/pages/HomePage/HomePage.module.css`.

---

## 1. Typography

| Element | Font Family | Size | Weight | Tracking | Case |
|---------|-------------|------|--------|----------|------|
| **Hero Title** | `Trade Gothic W01` | `5rem` | `900` | `-2px` | `UPPERCASE` |
| **Section Title** | `Trade Gothic W01` | `3.5rem` | `900` | `-1px` | `UPPERCASE` |
| **H3 / Card Title** | `Trade Gothic W01` | `1.5rem` | `800` | `-0.5px` | `UPPERCASE` |
| **Subtitle** | `Trade Gothic W01` | `1.15rem` | `400` | `0` | Normal |
| **Button Text** | `Trade Gothic W01` | `0.9rem` | `700` | `1px` | `UPPERCASE` |
| **Body Text** | `Trade Gothic W01` | `1rem` | `400` | `0` | Normal |

---

## 2. Color Palette

### Primary Colors
- **Black**: `#000000` (Text, Primary Buttons, CTA Background)
- **White**: `#FFFFFF` (Backgrounds, Card Background, Text on Dark)

### Secondary & UI Colors
- **Light Grade Background**: `#F8F8F8` (Sections, Cards, Image Placeholders)
- **Border Grey**: `#E5E5E5` (Dividers, Card Borders)
- **Text Secondary**: `#666666` (Descriptions, Subtitles)
- **Text Tertiary**: `#999999` (Labels, Stats Labels)

### Functional Colors
- **Success/Verified**: `#000000` (Used in Badges - Black bg/White text)

---

## 3. Component Styles

### Buttons
All buttons feature **sharp corners** (`border-radius: 0`) and **uppercase text**.

| Type | Background | Text | Border | Hover Effect |
|------|------------|------|--------|--------------|
| **Primary** | `#000000` | `#FFFFFF` | None | Bg `#333333`, TranslateY `-2px` |
| **Secondary** | `Transparent` | `#000000` | `2px solid #000000` | Bg `#000000`, Text `#FFFFFF` |
| **CTA Primary** | `#FFFFFF` | `#000000` | None | Bg `Transparent`, Text `#FFFFFF`, Border `#FFFFFF` |
| **CTA Secondary**| `Transparent` | `#FFFFFF` | `2px solid #FFFFFF` | Bg `#FFFFFF`, Text `#000000` |

### Cards (Bike/Product)
- **Background**: `#FFFFFF`
- **Border**: `1px solid #E5E5E5`
- **Shadow**: None (default)
- **Hover**:
    -   Transform: `translateY(-8px)`
    -   Shadow: `0 20px 50px rgba(0, 0, 0, 0.12)`
    -   Border: `#000000`

### Badges (Verified)
- **Background**: `#000000`
- **Text**: `#FFFFFF`
- **Style**: Uppercase, Bold (700), Sharp corners

---

## 4. Layout & Spacing

- **Container Width**: `1400px` (Centered)
- **Section Padding**: Typically `6rem` to `8rem` vertical padding.
- **Grid System**: Responsive grid using `read-template-columns: repeat(auto-fit, minmax(380px, 1fr))`

---

## 5. CSS Patterns

### Glassmorphism (Navbar)
```css
background: rgba(255, 255, 255, 0.98);
backdrop-filter: blur(20px);
border-bottom: 1px solid #e5e5e5;
```

### Animations
**Fade In Up**:
```css
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
```

---

## 6. Iconography
- Uses simple unicode symbols (✓, →) or custom SVG icons.
- Font Awesome or Material Icons usage should match the sharp, clean aesthetic.

---

*Last Updated: 2026-02-04 | Extracted from HomePage*
