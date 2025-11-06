# 🚀 START HERE - Mountain & Clouds Project

## Quick Start (3 Schritte)

### 1️⃣ Installation

```bash
cd mountain-clouds-project
npm install
```

**Was wird installiert?**
- Three.js (3D Engine)
- GSAP (Animations)
- Lenis (Smooth Scroll)
- Vite (Dev Server)

---

### 2️⃣ Development Server starten

```bash
npm run dev
```

**Was passiert?**
- Server startet auf http://localhost:3000
- Browser öffnet sich automatisch
- Hot-Reload bei Code-Änderungen

---

### 3️⃣ Erkunden & Anpassen!

🎉 **Fertig!** Du solltest jetzt den Berg mit Wolken sehen.

---

## 🎨 Erste Anpassungen

### Farben ändern

**Datei**: `index.html` (Zeile 13)

```css
/* Ändere den Hintergrund */
background: #e8e8e8;  /* Hellgrau */

/* Zu dunkel: */
background: #1a1a1a;  /* Dunkelgrau */

/* Zu blau: */
background: #d0e8f0;  /* Hellblau */
```

### Berg-Höhe anpassen

**Datei**: `src/main.js` (Zeile 103)

```javascript
let amplitude = 60;  // Standard

// Höherer Berg:
let amplitude = 100;

// Flacherer Berg:
let amplitude = 40;
```

### Mehr/Weniger Wolken

**Datei**: `src/main.js` (Zeile 236)

```javascript
// Erste Zeile ändern:
{ count: 8, y: 120, ... },  // Standard

// Mehr Wolken:
{ count: 15, y: 120, ... },

// Weniger Wolken:
{ count: 4, y: 120, ... },
```

### Scroll-Geschwindigkeit

**Datei**: `src/main.js` (Zeile 291)

```javascript
duration: 1.5,  // Standard

// Langsamer:
duration: 2.5,

// Schneller:
duration: 1.0,
```

---

## 📁 Wichtige Dateien

### HTML & Styling
- `index.html` - Hauptseite mit CSS & HTML

### JavaScript
- `src/main.js` - Three.js Setup, Animationen, Scroll

### Shaders (Fortgeschritten)
- `src/shaders/mountain/vertex.glsl` - Berg Vertex Shader
- `src/shaders/mountain/fragment.glsl` - Berg Material (Schnee/Fels)
- `src/shaders/clouds/vertex.glsl` - Wolken Vertex Shader
- `src/shaders/clouds/fragment.glsl` - Volumetrische Wolken

---

## 🛠️ Häufige Probleme

### "npm: command not found"
**Lösung**: Node.js installieren von https://nodejs.org/

### Schwarzer Bildschirm
**Lösung**:
1. Browser-Konsole öffnen (F12)
2. Nach Fehlern suchen
3. WebGL Support prüfen: https://get.webgl.org/

### Performance-Probleme?
**Lösung**: Wolken-Anzahl reduzieren (siehe oben)

---

## 🎓 Nächste Schritte

### Level 1: Basics verstehen
1. **README.md** lesen - Vollständige Dokumentation
2. **src/main.js** durchgehen - Kommentare lesen
3. Kleine Änderungen machen und testen

### Level 2: Shader lernen
1. **The Book of Shaders**: https://thebookofshaders.com/
2. Shader-Dateien in `src/shaders/` studieren
3. Noise-Funktionen verstehen

### Level 3: Erweitern
- Day/Night Cycle hinzufügen
- Mehr Sections erstellen
- Audio integrieren
- Post-Processing (Bloom, DOF)

---

## 📚 Dokumentation

**Im Projekt**:
- `README.md` - Vollständige Projektdokumentation

**Im Parent Directory**:
- `AWARD-WINNING-3D-WEB-MASTERY.md` - Kompletter Guide
- `ADVANCED-TECHNIQUES.md` - Fortgeschrittene Techniken
- `QUICK-REFERENCE.md` - Code-Snippets
- `RESOURCES.md` - Links & Ressourcen

---

## 💡 Tipps

### Beim Entwickeln
- **Speichere oft** - Auto-Reload zeigt Änderungen sofort
- **Browser-Konsole offen** - Siehst Fehler direkt
- **Klein anfangen** - Erst verstehen, dann erweitern
- **Experimentieren** - Zahlen ändern und schauen was passiert!

### Performance
- Nicht zu viele Wolken (max 20 auf Desktop)
- Geometrie-Auflösung anpassen wenn langsam
- Mobile: Weniger Wolken & niedrigere Auflösung

### Lernen
- Ändere **eine Sache** gleichzeitig
- Kommentiere Code den du nicht verstehst
- Schau dir Shadertoy-Beispiele an
- Three.js Journey Kurs ist Gold wert!

---

## 🎯 Ziel: Award-Winning Website

### Checkliste für Awwwards/FWA:

**Visual**:
- ✅ Cinematische Kamerafahrten
- ✅ Fotorealistische Materialien
- ✅ Smooth Scroll
- ⬜ Loading Animation
- ⬜ Sound Design
- ⬜ Mobile Gestures

**Technical**:
- ✅ 60 FPS Desktop
- ⬜ 30 FPS Mobile
- ⬜ SEO optimiert
- ⬜ Analytics integriert

**Polish**:
- ⬜ About/Info Modal
- ⬜ Social Sharing
- ⬜ Easter Eggs
- ⬜ Microinteractions

---

## 🚀 Production Build

Wenn du fertig bist:

```bash
# Build erstellen
npm run build

# Build testen
npm run preview

# Deploy auf Vercel/Netlify
# (Einfach dist/ Ordner hochladen)
```

---

## ❤️ Viel Erfolg!

Du hast jetzt:
- ✅ Procedural Mountain Generation
- ✅ Volumetric Clouds
- ✅ Cinematic Scroll Animations
- ✅ Professional Setup

**Zeit, etwas Episches zu bauen!** 🏔️

**Questions?** Schau in README.md oder die Haupt-Dokumentation.

---

**Happy Coding!** 🎨✨
