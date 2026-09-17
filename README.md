# 🌌 CosmoArchitects - CosmicVue 🌌    

![GitHub License](https://img.shields.io/badge/license-LGPL--2.1-blue.svg)
![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%202024-red)
![Status](https://img.shields.io/badge/status-live-brightgreen)
[![Netlify Status](https://api.netlify.com/api/v1/badges/2aa0ba68-42ad-42db-8ce6-a799fbd44d10/deploy-status)](https://app.netlify.com/sites/cosmicvue/deploys)
![Award](https://img.shields.io/badge/NASA%20Space%20Apps-Global%20Nominee%202024-gold)
![Award](https://img.shields.io/badge/NASA%20Space%20Apps-Global%20Finalist%202024-gold)

<div align="center">
  <img src="https://github.com/user-attachments/assets/789b7dfb-af06-4093-a636-fb66e06c6ad9" alt="CosmicVue Logo" width="200"/>

  [View Demo](https://cosmicvue.netlify.app/) · [Report Bug](https://github.com/KhamessiTaha/CosmoArchitects/issues) · [Request Feature](https://github.com/KhamessiTaha/CosmoArchitects/issues)

  <h3>🏆 Global Finalist - 2024 NASA International Space Apps Challenge 🏆</h3>
</div>

## 🚀 About The Project

CosmicVue is our award-nominated submission for the **2024 NASA International Space Apps Challenge** - an interactive orrery web application that brings the solar system to life. Experience real-time visualization of planets, Near-Earth Asteroids (NEAs), Potentially Hazardous Asteroids (PHAs), and Near-Earth Comets (NECs) in stunning 3D.

### 🏆 Recognition & Challenge Details
- **Award**: Global Finalist - 2024 NASA International Space Apps Challenge
- **Event**: 2024 NASA Space Apps Challenge
- **Categories**: Astrophysics, Space Exploration, Software, Games, Planets & Moons
- **Difficulty**: Intermediate to Advanced
- **Team**: CosmoArchitects

## ✨ Features

### 🌍 Core Features
- **3D Interactive Visualization**
  - Real-time solar system rendering
  - Smooth zoom, pan, and rotation controls
  - Dynamic camera perspectives

### 🛸 Advanced Capabilities
- **NASA Data Integration**
  - Live celestial body positioning
  - Accurate Keplerian orbital parameters
  - Real-time trajectory calculations

### 🎮 User Controls
- **Simulation Management**
  - Adjustable time flow controls
  - Orbital path toggles
  - Customizable object labels
  - Multiple viewing modes

## 🛠️ Built With

### Core Technologies
- 📊 **Three.js** - 3D graphics engine
- ⚛️ **React** + **Vite** - Frontend framework and build tooling
- 📡 **NASA APIs** - Data sources

### Data Sources
- 🪐 JPL "Keplerian Elements for Approximate Positions of the Major Planets" (planet orbits)
- 🛰️ NASA JPL Small-Body Database (asteroid & comet catalog)
- 🌠 NASA JPL Horizons (reference positions used to test accuracy)
- 🌍 NASA NeoWs Open API (live near-Earth objects)

## 💻 Getting Started

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- npm (v10 or higher)
- Modern web browser with WebGL

### Installation

1. Clone the repository
```bash
git clone https://github.com/KhamessiTaha/CosmoArchitects.git
cd CosmoArchitects
```

2. Install dependencies
```bash
npm install
```

3. (Optional) Add a NASA API key for live near-Earth objects. Get a free key at [api.nasa.gov](https://api.nasa.gov); without one the app uses the rate-limited `DEMO_KEY`.
```bash
cp .env.example .env.local
# then set VITE_NASA_API_KEY in .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with hot reload (FPS meter shown) |
| `npm run build` | Production build into `build/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests, including positions checked against JPL Horizons |
| `npm run lint` | ESLint, including React hooks rules |
| `node scripts/fetch-horizons.mjs` | Refresh the JPL Horizons reference data used by the tests |
| `node scripts/fetch-featured-bodies.mjs` | Refresh elements for bodies used by moments (e.g. Apophis) |

Add `?stats` to a URL to show the FPS meter in production.

### Project structure
```
src/
  lib/        Ephemeris (planets, Moon, small bodies), Kepler solver, simulation clock, scale modes
  data/       Planet elements (JPL), asteroid & comet catalogs, fact-card content
  services/   NASA NeoWs client
  scene/      Framework-free three.js code
    core/       Shared stage (renderer, camera, controls, loop), glow materials, labels
    orrery/     The orrery: bodies, orbit lines, small bodies, camera rig, screen-space picking
  hooks/      React glue: scene lifecycle, keyboard shortcuts, fullscreen, music
  styles/     Design tokens (colour, type scale, controls) shared by every page
  components/ UI: home/ (landing sections, line-art orrery), orrery/ (explorer overlays)
  pages/      Routes (the explorer is lazy-loaded)
scripts/      Maintenance scripts (Horizons reference data)
```

## 🎮 User Guide

The explorer lives at `/explore`. `/simulation` opens it at visual scale and `/accuratesimulation` at true scale.

### Controls
| Input | Action |
|---|---|
| Drag / right-drag / scroll | Rotate / pan / zoom |
| Click or tap a body, or use the bottom bar | Fly to it and show its facts |
| `/` | Search the Sun, Moon, planets, asteroids, comets and live NEOs |
| `0`–`9` | Fly to the Sun, Mercury … Pluto |
| `V` | Switch between visual and true scale |
| `P` / `N` | Pause / resume time, jump back to now |
| `[` / `]` | Slower / faster time |
| `L` | Toggle planet names |
| `R` / `Esc` | Reset the camera / close the fact card |

The menu (top right) has the scale switch, time controls (speed, **Go to date**, a year scrubber for 1800–2100, **Now**), curated **Moments** (Apophis's 2029 flyby, Mars's 2003 close approach, Halley's 1986 perihelion, Pluto inside Neptune's orbit), and layer toggles.

### Shareable links
The address bar tracks the view, and **Share view** copies a link that includes the simulated date:

```
/explore?focus=earth&date=2029-04-13T18:46Z&scale=true&speed=1h&paused=1
```

| Parameter | Values |
|---|---|
| `focus` | `sun`, `moon`, a planet (`mars`), or a small body's slug (`1p-halley`, `99942-apophis-2004-mn4`) |
| `date` | ISO date or date-time, UTC (`1986-02-09`, `2029-04-13T21:46Z`) |
| `scale` | `visual` or `true` |
| `speed` | `realtime`, `1min`, `1h`, `1d`, `1w`, `1mo`, `1y` |
| `paused` | `1` to start paused |

## 🔬 Technical Details

### Orbital Mechanics
- One simulation clock (Julian date) drives every body; both scale modes show the same positions, only distances and sizes are rescaled.
- **Planets & Pluto**: JPL mean elements with per-century rates, solved with Newton's method on Kepler's equation.
- **Moon**: lunar theory's largest periodic terms, corrected from the equinox of date to J2000.
- **Asteroids & comets**: two-body propagation from each body's osculating elements and epoch.
- **Accuracy, checked in `src/lib/ephemeris.test.js` against JPL Horizons**: planets within 0.2° and 0.5% of distance (1950–2049), the Moon within 0.5°, catalog asteroids within 0.5° near their epoch. Comets with old epochs (e.g. Halley) drift, because planetary perturbations are not modelled.
- **Moments** are verified in `src/data/moments.test.js` against the same engine (and Horizons for Apophis, which our two-body model places within 10,000 km of JPL's 38,000 km pass). Planet positions are flagged as approximate outside 1800–2050.

### Rendering
- Logarithmic depth buffer so a 1,700 km Moon and Pluto's orbit share one scene at true scale.
- Screen-space picking and fixed-pixel markers keep sub-pixel bodies selectable and visible.
- The explorer and three.js are code-split away from the landing page.

## 🎯 Objectives

- **Interactive Education**: Create an engaging platform for solar system exploration
- **Real-time Visualization**: Accurately represent celestial object positions
- **Scientific Accuracy**: Implement precise orbital mechanics calculations
- **User Engagement**: Provide intuitive controls for space exploration

## 🚧 Roadmap

- [ ] **AI Enhancement**
  - Advanced orbit predictions
  - Collision detection systems
  - Machine learning for trajectory optimization
  
- [ ] **Feature Expansion**
  - Extended celestial database
  - Advanced visualization modes
  - Time travel simulations
  
- [ ] **Mobile Optimization**
  - Responsive design improvements
  - Touch controls enhancement
  - Progressive Web App implementation

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 🌟 Acknowledgments

- **NASA** - For providing invaluable data and APIs
- **Space Apps Challenge** - For the opportunity and inspiration
- **Three.js Community** - For excellent documentation and support
- **AI Tools** - For assistance in debugging and optimization

## 🏆 Awards & Recognition

- **Global Finalist** - 2024 NASA International Space Apps Challenge
  - Selected as one of the global nominees from thousands of international submissions
  - Selected as one of the Global Finalists (Top 40 from 10000 submissions )

## 📄 License

Licensed under the LGPL-2.1 License - see [LICENSE](./LICENSE) for details.

## 📞 Contact

Project Link: [https://github.com/KhamessiTaha/CosmoArchitects](https://github.com/KhamessiTaha/CosmoArchitects)

Demo: [https://cosmicvue.netlify.app/](https://cosmicvue.netlify.app/)

Space Apps Project Page: [View our NASA Space Apps submission](https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/cosmoarchitects/?tab=project)

## 🔗 Useful Links

- [NASA Small Body Database](https://ssd.jpl.nasa.gov/sbdb_query.cgi)
- [Three.js Documentation](https://threejs.org/docs/)
- [NASA APIs](https://api.nasa.gov/)
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
