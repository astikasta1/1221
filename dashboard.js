/* Land Rover Style Dashboard JavaScript */

// =====================
//  CONFIGURATION
// =====================
const CONFIG = {
  maxSpeed: 260,      // km/h
  maxRPM: 8000,       // rev/min
  idleRPM: 800,
  maxFuel: 100,       // percent
  maxTemp: 120,       // °C
  maxOil: 100,        // psi (simulated)
  maxVolt: 16,        // V
  fps: 20             // updates per second
};

// =====================
//  STATE
// =====================
const state = {
  speed: 0,
  rpm: 0,
  fuel: 100,
  temp: 70,
  oil: 40,
  volt: 12.1,
  gear: 'P',
  odometer: 0,  // km
  trip: 0,      // km
  terrainIdx: 0,
  terrainModes: ['NORMAL', 'SAND', 'ROCK', 'MUD', 'SNOW', 'AUTO'],
  airSuspension: 'NORMAL',
  engineOn: false,
  simDriving: false,
  lastTimestamp: performance.now()
};

// =====================
//  DOM REFERENCES
// =====================
const canvases = {
  speed: document.getElementById('speedometer'),
  rpm: document.getElementById('tachometer'),
  fuel: document.getElementById('fuelGauge'),
  temp: document.getElementById('tempGauge'),
  oil: document.getElementById('oilGauge'),
  volt: document.getElementById('voltGauge')
};

const ctx = {};
for (const key in canvases) {
  ctx[key] = canvases[key].getContext('2d');
}

const displays = {
  gear: document.getElementById('gearDisplay'),
  odometer: document.getElementById('odometerDisplay'),
  trip: document.getElementById('tripDisplay'),
  terrain: document.getElementById('terrainDisplay'),
  air: document.getElementById('airDisplay'),
  clock: document.getElementById('clockDisplay'),
  outside: document.getElementById('outsideTempDisplay')
};

const warnings = {
  engine: document.getElementById('engineWarn'),
  oil: document.getElementById('oilWarn'),
  battery: document.getElementById('batteryWarn'),
  temp: document.getElementById('tempWarn')
};

const buttons = {
  engine: document.getElementById('engineBtn'),
  terrain: document.getElementById('terrainBtn'),
  simulate: document.getElementById('simulateBtn'),
  reset: document.getElementById('resetBtn')
};

// =====================
//  INITIALISATION
// =====================
(function init() {
  // Set outside temperature randomly for demo
  state.outsideTemp = (Math.random() * 25 + 5).toFixed(1);
  displays.outside.textContent = `${state.outsideTemp} °C`;

  updateClock();
  setInterval(updateClock, 1000);

  // Button listeners
  buttons.engine.addEventListener('click', toggleEngine);
  buttons.terrain.addEventListener('click', nextTerrainMode);
  buttons.simulate.addEventListener('click', toggleSimDriving);
  buttons.reset.addEventListener('click', resetDashboard);

  // Keyboard listeners
  window.addEventListener('keydown', handleKey);

  // Start animation loop
  requestAnimationFrame(loop);
})();

// =====================
//  CLOCK
// =====================
function updateClock() {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  displays.clock.textContent = `${h}:${m}`;
}

// =====================
//  CONTROLS
// =====================
function toggleEngine() {
  state.engineOn = !state.engineOn;
  if (!state.engineOn) {
    state.speed = 0;
    state.rpm = 0;
    state.gear = 'P';
    state.simDriving = false;
  } else {
    state.rpm = CONFIG.idleRPM;
    state.gear = 'D';
  }
  updateDisplays();
}

function nextTerrainMode() {
  state.terrainIdx = (state.terrainIdx + 1) % state.terrainModes.length;
  updateDisplays();
}

function toggleSimDriving() {
  if (!state.engineOn) return; // only when engine on
  state.simDriving = !state.simDriving;
}

function resetDashboard() {
  Object.assign(state, {
    speed: 0,
    rpm: 0,
    fuel: 100,
    temp: 70,
    oil: 40,
    volt: 12.1,
    gear: 'P',
    odometer: 0,
    trip: 0,
    terrainIdx: 0,
    airSuspension: 'NORMAL',
    engineOn: false,
    simDriving: false
  });
  updateDisplays();
}

function handleKey(e) {
  switch (e.key) {
    case 'E':
    case 'e':
      toggleEngine();
      break;
    case 'T':
    case 't':
      nextTerrainMode();
      break;
    case 'S':
    case 's':
      toggleSimDriving();
      break;
    case 'R':
    case 'r':
      resetDashboard();
      break;
    case 'ArrowUp':
      if (state.engineOn) state.speed = Math.min(CONFIG.maxSpeed, state.speed + 5);
      break;
    case 'ArrowDown':
      if (state.engineOn) state.speed = Math.max(0, state.speed - 5);
      break;
  }
}

// =====================
//  MAIN LOOP
// =====================
function loop(timestamp) {
  const delta = timestamp - state.lastTimestamp;
  const dt = delta / 1000; // seconds
  state.lastTimestamp = timestamp;

  if (state.engineOn) {
    // RPM varies with speed plus idle
    const targetRPM = CONFIG.idleRPM + state.speed * 40; // simple linear mapping
    state.rpm += (targetRPM - state.rpm) * 0.1; // smoothing

    // Voltage
    state.volt += ((13.8 - state.volt) * 0.05);

    // Oil pressure related to rpm
    state.oil = Math.max(0, Math.min(CONFIG.maxOil, 20 + state.rpm / 100));

    // Temperature rises slowly
    state.temp += 0.02 * dt * (state.simDriving ? 2 : 1);
    if (state.temp > CONFIG.maxTemp) state.temp = CONFIG.maxTemp;
  } else {
    // Engine off idle values
    state.rpm += (0 - state.rpm) * 0.1;
    state.volt += ((12.1 - state.volt) * 0.05);
    state.oil += ((0 - state.oil) * 0.1);
    // Cool down
    state.temp += ((70 - state.temp) * 0.01);
  }

  // Simulate driving
  if (state.simDriving) {
    // Simple sine wave speed profile
    const t = timestamp / 1000;
    const targetSpeed = 80 + 60 * Math.sin(t / 5);
    state.speed += (targetSpeed - state.speed) * 0.02;

    // Fuel consumption
    state.fuel = Math.max(0, state.fuel - 0.005 * dt * (state.speed / 100));
  } else {
    // Natural slow down when not accelerating
    if (!state.engineOn) {
      state.speed += (0 - state.speed) * 0.05;
    }
  }

  // Odometer update
  state.odometer += state.speed * dt / 3600; // km
  state.trip += state.speed * dt / 3600;

  // Update warnings & display
  updateDisplays();
  drawGauges();

  requestAnimationFrame(loop);
}

// =====================
//  DISPLAY UPDATE
// =====================
function updateDisplays() {
  displays.gear.textContent = state.gear;
  displays.odometer.textContent = `${state.odometer.toFixed(1).padStart(6, '0')} km`;
  displays.trip.textContent = `Trip ${state.trip.toFixed(1)} km`;
  displays.terrain.textContent = state.terrainModes[state.terrainIdx];
  displays.air.textContent = `Air Susp: ${state.airSuspension}`;

  // Warnings
  setWarning(warnings.engine, !state.engineOn);
  setWarning(warnings.oil, state.oil < 20 && state.engineOn);
  setWarning(warnings.battery, (state.volt < 11 || state.volt > 14) && state.engineOn);
  setWarning(warnings.temp, state.temp > 100);
}

function setWarning(el, active) {
  if (active) {
    el.classList.add('active');
  } else {
    el.classList.remove('active');
  }
}

// =====================
//  GAUGE DRAWING HELPERS
// =====================
function clearCanvas(c) {
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
}

function drawCircularGauge(c, value, max, options = {}) {
  const w = c.canvas.width;
  const h = c.canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;

  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 0.25;

  clearCanvas(c);

  // Background arc
  c.lineWidth = 14;
  c.strokeStyle = '#222';
  c.beginPath();
  c.arc(cx, cy, radius, startAngle, endAngle, false);
  c.stroke();

  // Value arc
  const angle = startAngle + (endAngle - startAngle) * (value / max);
  c.strokeStyle = options.color || '#00ff88';
  c.beginPath();
  c.arc(cx, cy, radius, startAngle, angle, false);
  c.stroke();

  // Needle
  const needleLen = radius - 20;
  const nx = cx + needleLen * Math.cos(angle);
  const ny = cy + needleLen * Math.sin(angle);
  c.strokeStyle = options.needleColor || '#fff';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx, cy);
  c.lineTo(nx, ny);
  c.stroke();

  // Center dot
  c.fillStyle = '#444';
  c.beginPath();
  c.arc(cx, cy, 6, 0, 2 * Math.PI);
  c.fill();

  // Label
  c.fillStyle = '#888';
  c.font = '16px Segoe UI';
  c.textAlign = 'center';
  c.fillText(options.label || '', cx, cy + radius + 20);

  // Digital value (optional)
  if (options.digital) {
    c.fillStyle = options.color || '#00ff88';
    c.font = '28px Segoe UI';
    c.fillText(options.digital(value), cx, cy + 8);
  }
}

function drawGauges() {
  // Speedometer
  drawCircularGauge(ctx.speed, state.speed, CONFIG.maxSpeed, {
    label: 'km/h',
    digital: v => v.toFixed(0),
    color: '#00ff88',
    needleColor: '#fff'
  });

  // Tachometer (RPM)
  drawCircularGauge(ctx.rpm, state.rpm, CONFIG.maxRPM, {
    label: 'RPM',
    digital: v => (v / 1000).toFixed(1) + 'k',
    color: state.rpm > 6000 ? '#ff4444' : '#00ff88',
    needleColor: '#fff'
  });

  // Fuel
  drawCircularGauge(ctx.fuel, state.fuel, CONFIG.maxFuel, {
    label: 'FUEL %',
    color: state.fuel < 15 ? '#ff4444' : '#00ff88',
    needleColor: '#fff',
    digital: v => v.toFixed(0) + '%'
  });

  // Temperature
  drawCircularGauge(ctx.temp, state.temp, CONFIG.maxTemp, {
    label: '°C',
    color: state.temp > 100 ? '#ff4444' : '#00ff88',
    needleColor: '#fff',
    digital: v => v.toFixed(0) + '°'
  });

  // Oil
  drawCircularGauge(ctx.oil, state.oil, CONFIG.maxOil, {
    label: 'OIL',
    color: state.oil < 20 ? '#ff4444' : '#00ff88',
    needleColor: '#fff',
    digital: v => v.toFixed(0)
  });

  // Volts
  drawCircularGauge(ctx.volt, state.volt, CONFIG.maxVolt, {
    label: 'V',
    color: (state.volt < 11 || state.volt > 14) ? '#ff4444' : '#00ff88',
    needleColor: '#fff',
    digital: v => v.toFixed(1) + 'V'
  });
}