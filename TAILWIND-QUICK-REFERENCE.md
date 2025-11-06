# Tailwind CSS Quick Reference
## Schnelle Nachschlagewerk für tägliche Entwicklung

---

## Installation & Setup

### Vite (React/Vue/Vanilla)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Next.js
```bash
npx create-next-app@latest --tailwind
```

---

## Layout

### Display
```html
block hidden inline inline-block flex inline-flex grid inline-grid
```

### Flexbox
```html
<!-- Container -->
flex flex-row flex-col flex-wrap flex-nowrap

<!-- Justify Content -->
justify-start justify-center justify-end justify-between justify-around justify-evenly

<!-- Align Items -->
items-start items-center items-end items-stretch items-baseline

<!-- Align Self -->
self-start self-center self-end self-stretch

<!-- Gap -->
gap-0 gap-1 gap-2 gap-4 gap-8
```

### Grid
```html
<!-- Grid Cols -->
grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-12

<!-- Grid Rows -->
grid-rows-1 grid-rows-2 grid-rows-3

<!-- Col Span -->
col-span-1 col-span-2 col-span-full

<!-- Row Span -->
row-span-1 row-span-2 row-span-full

<!-- Gap -->
gap-4 gap-x-4 gap-y-4
```

### Position
```html
static relative absolute fixed sticky

<!-- Placement -->
top-0 right-0 bottom-0 left-0
inset-0 inset-x-0 inset-y-0

<!-- Z-Index -->
z-0 z-10 z-20 z-30 z-40 z-50 z-auto
```

---

## Sizing

### Width
```html
w-0 w-px w-1 w-2 w-4 w-8 w-12 w-16 w-auto
w-1/2 w-1/3 w-2/3 w-1/4 w-3/4
w-full w-screen w-min w-max w-fit
```

### Height
```html
h-0 h-px h-1 h-2 h-4 h-8 h-12 h-16 h-auto
h-full h-screen h-min h-max h-fit
h-dvh (dynamic viewport height)
```

### Min/Max
```html
min-w-0 min-w-full max-w-xs max-w-sm max-w-md max-w-lg max-w-xl
min-h-0 min-h-full max-h-screen
```

---

## Spacing

### Padding
```html
p-0 p-1 p-2 p-4 p-8 p-12 p-16 p-20
px-4 py-4 pt-4 pr-4 pb-4 pl-4
```

### Margin
```html
m-0 m-1 m-2 m-4 m-8 m-12 m-16 m-auto
mx-auto my-4 mt-4 mr-4 mb-4 ml-4
-m-4 (negative margin)
```

### Space Between
```html
space-x-4 space-y-4
```

### Scale Reference
```
0 = 0px
px = 1px
0.5 = 2px
1 = 4px
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
16 = 64px
20 = 80px
24 = 96px
```

---

## Typography

### Font Family
```html
font-sans font-serif font-mono
```

### Font Size
```html
text-xs text-sm text-base text-lg text-xl
text-2xl text-3xl text-4xl text-5xl text-6xl
```

### Font Weight
```html
font-thin font-light font-normal font-medium
font-semibold font-bold font-extrabold font-black
```

### Text Align
```html
text-left text-center text-right text-justify
```

### Text Color
```html
text-black text-white text-gray-500 text-red-500
text-blue-500 text-green-500 text-yellow-500
```

### Text Decoration
```html
underline line-through no-underline
```

### Line Height
```html
leading-none leading-tight leading-normal leading-relaxed leading-loose
```

### Letter Spacing
```html
tracking-tighter tracking-tight tracking-normal tracking-wide tracking-wider
```

---

## Colors

### Background
```html
bg-transparent bg-black bg-white
bg-gray-50 bg-gray-100 ... bg-gray-900
bg-red-500 bg-blue-500 bg-green-500
```

### Color Palette (Standard)
```
gray, red, yellow, green, blue, indigo, purple, pink
```

### Opacity
```html
bg-opacity-0 bg-opacity-50 bg-opacity-100
text-opacity-50
```

---

## Borders

### Border Width
```html
border border-0 border-2 border-4 border-8
border-t border-r border-b border-l
```

### Border Color
```html
border-gray-300 border-blue-500 border-transparent
```

### Border Radius
```html
rounded-none rounded-sm rounded rounded-md rounded-lg rounded-xl
rounded-2xl rounded-3xl rounded-full
rounded-t-lg rounded-r-lg (einzelne Ecken)
```

### Border Style
```html
border-solid border-dashed border-dotted border-double border-none
```

---

## Effects

### Box Shadow
```html
shadow-sm shadow shadow-md shadow-lg shadow-xl shadow-2xl shadow-none
```

### Opacity
```html
opacity-0 opacity-25 opacity-50 opacity-75 opacity-100
```

### Mix Blend Mode
```html
mix-blend-normal mix-blend-multiply mix-blend-screen mix-blend-overlay
```

---

## Filters

### Blur
```html
blur-none blur-sm blur blur-md blur-lg blur-xl blur-2xl blur-3xl
```

### Brightness
```html
brightness-0 brightness-50 brightness-100 brightness-150 brightness-200
```

### Contrast
```html
contrast-0 contrast-50 contrast-100 contrast-150 contrast-200
```

### Backdrop Blur (Glassmorphism)
```html
backdrop-blur-sm backdrop-blur backdrop-blur-md backdrop-blur-lg
```

---

## Transitions & Animations

### Transition
```html
transition transition-all transition-colors transition-opacity
transition-transform

duration-75 duration-100 duration-200 duration-300 duration-500

ease-linear ease-in ease-out ease-in-out

delay-75 delay-100 delay-200
```

### Transform
```html
scale-0 scale-50 scale-100 scale-125 scale-150
rotate-0 rotate-45 rotate-90 rotate-180
translate-x-0 translate-x-4 translate-y-4
skew-x-3 skew-y-3
```

### Built-in Animations
```html
animate-none animate-spin animate-ping animate-pulse animate-bounce
```

---

## Interactivity

### Cursor
```html
cursor-auto cursor-pointer cursor-not-allowed cursor-wait
```

### Pointer Events
```html
pointer-events-none pointer-events-auto
```

### User Select
```html
select-none select-text select-all select-auto
```

### Resize
```html
resize-none resize resize-x resize-y
```

---

## Responsive Design

### Breakpoints
```html
<!-- Mobile First -->
<div class="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">

<!-- Breakpoint Werte -->
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Container
```html
container mx-auto
```

---

## State Variants

### Hover
```html
hover:bg-blue-700 hover:scale-105 hover:shadow-lg
```

### Focus
```html
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
```

### Active
```html
active:bg-blue-800 active:scale-95
```

### Disabled
```html
disabled:opacity-50 disabled:cursor-not-allowed
```

### Group Hover
```html
<div class="group">
  <div class="group-hover:text-blue-500">
</div>
```

### Peer (Sibling State)
```html
<input class="peer" />
<label class="peer-focus:text-blue-500">
```

---

## Dark Mode

### Setup
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
}
```

### Verwendung
```html
<div class="bg-white dark:bg-gray-900 text-black dark:text-white">
```

---

## Common Patterns

### Centered Container
```html
<div class="container mx-auto px-4">
  <!-- Content -->
</div>
```

### Flex Center
```html
<div class="flex items-center justify-center h-screen">
  <!-- Centered Content -->
</div>
```

### Card
```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
  <h2 class="text-2xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-600">Card content</p>
</div>
```

### Button
```html
<button class="
  bg-blue-500 hover:bg-blue-700
  text-white font-bold
  py-2 px-4 rounded
  transition-colors duration-200
">
  Click me
</button>
```

### Input Field
```html
<input
  type="text"
  class="
    w-full px-4 py-2
    border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
  placeholder="Enter text..."
/>
```

### Grid Layout
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Glassmorphism
```html
<div class="
  bg-white/10 backdrop-blur-lg
  border border-white/20
  rounded-2xl p-6
  shadow-xl
">
  Glass Card
</div>
```

### Gradient
```html
<div class="bg-gradient-to-r from-blue-500 to-purple-600">
  Gradient Background
</div>

<!-- Gradients -->
bg-gradient-to-t from-[color] via-[color] to-[color]
bg-gradient-to-tr (top-right)
bg-gradient-to-r (right)
bg-gradient-to-br (bottom-right)
bg-gradient-to-b (bottom)
bg-gradient-to-bl (bottom-left)
bg-gradient-to-l (left)
bg-gradient-to-tl (top-left)
```

### Hero Section
```html
<section class="
  h-screen
  flex items-center justify-center
  bg-gradient-to-br from-blue-500 to-purple-600
  text-white
">
  <div class="text-center">
    <h1 class="text-6xl font-bold mb-4">Hero Title</h1>
    <p class="text-xl mb-8">Subtitle</p>
    <button class="bg-white text-blue-500 px-8 py-3 rounded-full">
      Get Started
    </button>
  </div>
</section>
```

---

## Forms

### Input
```html
<input
  class="w-full px-3 py-2 border rounded focus:ring-2"
  type="text"
/>
```

### Select
```html
<select class="w-full px-3 py-2 border rounded">
  <option>Option 1</option>
</select>
```

### Checkbox
```html
<input type="checkbox" class="w-4 h-4 text-blue-500 rounded" />
```

### Radio
```html
<input type="radio" class="w-4 h-4 text-blue-500" />
```

---

## Arbitrary Values

### Custom Values
```html
<!-- Width -->
<div class="w-[137px]">

<!-- Color -->
<div class="bg-[#1da1f2]">

<!-- Spacing -->
<div class="m-[13px]">

<!-- Before/After -->
<div class="before:content-['hello']">
```

---

## Plugins

### Typography
```bash
npm install @tailwindcss/typography
```

```html
<article class="prose lg:prose-xl">
  <!-- Markdown Content -->
</article>
```

### Forms
```bash
npm install @tailwindcss/forms
```

### Line Clamp
```bash
npm install @tailwindcss/line-clamp
```

```html
<p class="line-clamp-3">
  Long text will be truncated after 3 lines...
</p>
```

---

## Custom Configuration

### Extend Theme
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand': '#7C3AED',
        'primary': {
          50: '#f0f9ff',
          // ... 100-900
        }
      },
      spacing: {
        '128': '32rem',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    }
  }
}
```

---

## @apply Directive

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

---

## Debug Utilities

### Ring (Development Helper)
```html
<div class="ring-2 ring-red-500">
  Debug outline
</div>
```

### Screen Size Indicator (Dev)
```html
<div class="fixed bottom-0 right-0 bg-black text-white p-2 text-xs z-50">
  <div class="sm:hidden">xs</div>
  <div class="hidden sm:block md:hidden">sm</div>
  <div class="hidden md:block lg:hidden">md</div>
  <div class="hidden lg:block xl:hidden">lg</div>
  <div class="hidden xl:block 2xl:hidden">xl</div>
  <div class="hidden 2xl:block">2xl</div>
</div>
```

---

## Performance Tips

### JIT Mode
- Seit Tailwind 3.0 standardmäßig aktiviert
- Generiert nur verwendete Klassen
- Schnellere Build-Zeiten

### Content Configuration
```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
}
```

### Production Build
```bash
npm run build
# Automatische Optimierung & Purge
```

---

## VS Code Setup

### Extensions
1. **Tailwind CSS IntelliSense**
2. **Headwind** (Sortiert Klassen)
3. **Tailwind Fold** (Faltet lange Klassenlisten)

### Settings.json
```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

---

## Häufige Fehler vermeiden

### ❌ Falsch
```html
<!-- Klassen werden überschrieben -->
<div class="p-4 p-8">

<!-- Bedingte Klassen mit String-Concat -->
<div className={'text-' + color + '-500'}>
```

### ✅ Richtig
```html
<!-- Letzte Klasse gewinnt -->
<div class="p-8">

<!-- Vollständige Klassennamen -->
<div className={color === 'blue' ? 'text-blue-500' : 'text-red-500'}>
```

---

## Nützliche Links

- **Docs**: https://tailwindcss.com/docs
- **Playground**: https://play.tailwindcss.com/
- **Cheat Sheet**: https://nerdcave.com/tailwind-cheat-sheet
- **Components**: https://tailwindui.com/components
- **Color Palette**: https://tailwindcss.com/docs/customizing-colors

---

**Tipp**: Halte diese Datei in deinem Editor offen während du mit Tailwind entwickelst!

**Zuletzt aktualisiert**: Januar 2025
