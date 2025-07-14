# Land Rover Style Car Dashboard

A realistic, interactive car dashboard inspired by Land Rover vehicles, built with HTML5 Canvas and JavaScript.

## Features

### Main Gauges
- **Speedometer**: 0-260 km/h with digital speed display
- **Tachometer**: 0-8000 RPM with red zone warning (6000+ RPM)

### Secondary Gauges
- **Fuel Gauge**: Shows fuel level percentage
- **Temperature Gauge**: Engine temperature monitoring
- **Oil Pressure Gauge**: Oil pressure monitoring
- **Voltmeter**: Battery voltage monitoring
- **Compass**: Displays heading direction

### Digital Displays
- **Gear Display**: Current gear selection (P, D, R, N)
- **Odometer**: Total distance traveled
- **Trip Computer**: Trip distance
- **Terrain Mode**: Selectable driving modes (NORMAL, SAND, ROCK, MUD, SNOW, AUTO)
- **Air Suspension**: Status display
- **Real-time Clock**: Current time display
- **Outside Temperature**: Environmental temperature

### Warning System
- **Engine Warning Light**: Activates when engine is off
- **Oil Warning Light**: Activates when oil pressure is low (<20)
- **Battery Warning Light**: Activates when voltage is abnormal (<11V or >14V)
- **Temperature Warning Light**: Activates when engine overheats (>100°C)

## Controls

### Mouse Controls
- **Engine On/Off**: Toggle engine state
- **Terrain Mode**: Cycle through terrain modes
- **Simulate Driving**: Automatic driving simulation
- **Reset**: Reset dashboard to default state

### Keyboard Controls
- **E**: Toggle Engine On/Off
- **T**: Change Terrain Mode
- **S**: Simulate Driving
- **R**: Reset Dashboard
- **Arrow Up**: Accelerate (when engine is on)
- **Arrow Down**: Decelerate (when engine is on)

## Visual Features

### Styling
- Premium dark theme with Land Rover aesthetics
- Glowing green accents (#00ff88) for active elements
- Realistic gauge designs with needle animations
- Warning lights with pulsing animations
- Responsive design for different screen sizes

### Animations
- Smooth needle movements
- Real-time gauge updates (20 FPS)
- Glowing text effects
- Pulsing warning lights
- Realistic engine parameter fluctuations

## Technical Details

### Files Structure
```
├── index.html          # Main HTML structure
├── dashboard.css       # Styling and animations
├── dashboard.js        # JavaScript functionality
└── README.md          # This file
```

### Canvas Implementation
- Each gauge is rendered on a separate HTML5 Canvas element
- Real-time redrawing with optimized performance
- Vector-based graphics for crisp display at any resolution
- Smooth animations using requestAnimationFrame

### Realistic Behavior
- Engine idle RPM at 800
- Realistic voltage readings (12.1V off, 13.8V running)
- Fuel consumption during driving simulation
- Temperature increase during operation
- Oil pressure variations
- Automatic warning system activation

## Usage Instructions

1. **Starting the Dashboard**:
   - Open `index.html` in a web browser
   - All gauges will initialize in "engine off" state

2. **Basic Operation**:
   - Click "Engine On/Off" or press 'E' to start the engine
   - Use keyboard arrows to manually control speed
   - Watch gauges respond realistically to changes

3. **Driving Simulation**:
   - Click "Simulate Driving" or press 'S' for automatic demo
   - Dashboard will show realistic driving parameters
   - Fuel will gradually decrease
   - Temperature will rise slightly

4. **Terrain Modes**:
   - Click "Terrain Mode" or press 'T' to cycle through modes
   - Each mode represents different Land Rover driving conditions

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

Requires HTML5 Canvas support (all modern browsers).

## Customization

### Colors
Edit `dashboard.css` to change color scheme:
- Primary accent: `#00ff88` (green)
- Warning: `#ff4444` (red)
- Background: `#1a1a1a` (dark gray)

### Gauge Ranges
Edit `dashboard.js` to modify gauge ranges:
- Speedometer: Change `260` for max speed
- Tachometer: Change `8000` for max RPM
- Other gauges: Modify respective range values

### Features
Add new features by:
1. Adding HTML elements in `index.html`
2. Adding styling in `dashboard.css`
3. Implementing functionality in `dashboard.js`

## Performance

- Optimized 20 FPS animation loop
- Efficient canvas clearing and redrawing
- Minimal DOM manipulation
- Smooth performance on modern devices

---

**Note**: This is a demonstration dashboard. For actual vehicle integration, additional safety measures and real sensor data would be required.