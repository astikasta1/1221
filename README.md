# Land Rover Style Car Dashboard

A realistic, interactive car dashboard inspired by Land Rover vehicles, implemented using **HTML5 Canvas**, **JavaScript**, and **CSS**.

![screenshot](docs/screenshot.png)

---

## Features

### Main Gauges
- **Speedometer** (0-260 km/h) with digital read-out
- **Tachometer** (0-8000 RPM) with red-zone warning (6000 RPM+)

### Secondary Gauges
- **Fuel Gauge** (percentage)
- **Temperature Gauge** (engine °C)
- **Oil Pressure Gauge**
- **Voltmeter** (battery-voltage)

### Digital Displays
- Current **gear** (P, R, N, D)
- **Odometer** & **Trip counter**
- Current **terrain mode** (NORMAL, SAND, ROCK, MUD, SNOW, AUTO)
- **Air suspension** status
- Real-time **clock** and **outside temperature**

### Warning System
- Engine, oil, battery, and temperature lights with pulsing animation.

### Controls
- **Mouse** buttons or **keyboard** shortcuts:  
  `E` – Engine on/off  •  `T` – Terrain mode  •  `S` – Simulate driving  •  `R` – Reset  •  ↑ / ↓ – Accelerate / Decelerate

### Visual & Technical
- Premium dark theme with glowing green accents (#00ff88)
- Smooth, 20 FPS animation using `requestAnimationFrame`
- Responsive layout – try it on mobile!

---

## Getting Started

1. Clone or download the repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge…).
3. Enjoy!

No build steps or external dependencies are required.

---

## Customisation

All customisation can be done by editing **two** files:

| What | File | How |
|------|------|-----|
| Colours, layout | `dashboard.css` | Tweak CSS variables (`--accent`, `--bg`, etc.) or styles |
| Gauge ranges & behaviour | `dashboard.js` | Adjust constants in the `CONFIG` object |

---

## License

MIT © 2024