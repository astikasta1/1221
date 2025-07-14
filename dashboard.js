// Dashboard State
let dashboardState = {
    engineOn: false,
    speed: 0,
    rpm: 0,
    fuel: 75,
    temperature: 85,
    oilPressure: 50,
    voltage: 12.6,
    gear: 'P',
    terrainMode: 'NORMAL',
    odometer: 123456,
    tripDistance: 245.7,
    outsideTemp: 22,
    warningLights: {
        engine: false,
        oil: false,
        battery: false,
        temp: false
    }
};

// Animation variables
let animationFrameId;
let lastTime = 0;

// Terrain modes
const terrainModes = ['NORMAL', 'SAND', 'ROCK', 'MUD', 'SNOW', 'AUTO'];
let currentTerrainIndex = 0;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    startTimeUpdate();
    startAnimation();
});

function initializeDashboard() {
    // Initialize all gauges
    drawSpeedometer();
    drawTachometer();
    drawFuelGauge();
    drawTemperatureGauge();
    drawOilPressureGauge();
    drawVoltmeter();
    updateDigitalDisplays();
    updateWarningLights();
}

// Gauge drawing functions
function drawSpeedometer() {
    const canvas = document.getElementById('speedometer');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer ring
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    
    // Draw scale (0-260 km/h)
    drawSpeedScale(ctx, centerX, centerY, radius);
    
    // Draw needle
    const angle = (dashboardState.speed / 260) * 240 - 120; // 240 degree range
    drawNeedle(ctx, centerX, centerY, radius - 20, angle, '#00ff88', 4);
    
    // Draw center cap
    drawCenterCap(ctx, centerX, centerY);
    
    // Draw speed value
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(dashboardState.speed), centerX, centerY + 50);
    ctx.font = '12px Arial';
    ctx.fillText('km/h', centerX, centerY + 70);
}

function drawTachometer() {
    const canvas = document.getElementById('tachometer');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer ring
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    
    // Draw scale (0-8 x1000 RPM)
    drawRPMScale(ctx, centerX, centerY, radius);
    
    // Draw red zone (6000+ RPM)
    drawRedZone(ctx, centerX, centerY, radius);
    
    // Draw needle
    const angle = (dashboardState.rpm / 8000) * 240 - 120;
    const needleColor = dashboardState.rpm > 6000 ? '#ff4444' : '#00ff88';
    drawNeedle(ctx, centerX, centerY, radius - 20, angle, needleColor, 4);
    
    // Draw center cap
    drawCenterCap(ctx, centerX, centerY);
    
    // Draw RPM value
    ctx.fillStyle = dashboardState.rpm > 6000 ? '#ff4444' : '#00ff88';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(dashboardState.rpm / 100) / 10, centerX, centerY + 50);
}

function drawFuelGauge() {
    const canvas = document.getElementById('fuelGauge');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    drawSmallGaugeScale(ctx, centerX, centerY, radius, ['E', '1/2', 'F']);
    
    const angle = (dashboardState.fuel / 100) * 180 - 90;
    const needleColor = dashboardState.fuel < 20 ? '#ff4444' : '#00ff88';
    drawNeedle(ctx, centerX, centerY, radius - 10, angle, needleColor, 2);
    
    drawCenterCap(ctx, centerX, centerY, 8);
}

function drawTemperatureGauge() {
    const canvas = document.getElementById('tempGauge');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    drawSmallGaugeScale(ctx, centerX, centerY, radius, ['C', '1/2', 'H']);
    
    const angle = (dashboardState.temperature / 120) * 180 - 90;
    const needleColor = dashboardState.temperature > 100 ? '#ff4444' : '#00ff88';
    drawNeedle(ctx, centerX, centerY, radius - 10, angle, needleColor, 2);
    
    drawCenterCap(ctx, centerX, centerY, 8);
}

function drawOilPressureGauge() {
    const canvas = document.getElementById('oilPressure');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    drawSmallGaugeScale(ctx, centerX, centerY, radius, ['0', '50', '100']);
    
    const angle = (dashboardState.oilPressure / 100) * 180 - 90;
    const needleColor = dashboardState.oilPressure < 20 ? '#ff4444' : '#00ff88';
    drawNeedle(ctx, centerX, centerY, radius - 10, angle, needleColor, 2);
    
    drawCenterCap(ctx, centerX, centerY, 8);
}

function drawVoltmeter() {
    const canvas = document.getElementById('voltmeter');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGaugeRing(ctx, centerX, centerY, radius, '#333', '#555');
    drawSmallGaugeScale(ctx, centerX, centerY, radius, ['10', '12', '14']);
    
    const angle = ((dashboardState.voltage - 10) / 4) * 180 - 90;
    const needleColor = (dashboardState.voltage < 11 || dashboardState.voltage > 14) ? '#ff4444' : '#00ff88';
    drawNeedle(ctx, centerX, centerY, radius - 10, angle, needleColor, 2);
    
    drawCenterCap(ctx, centerX, centerY, 8);
}

// Helper drawing functions
function drawGaugeRing(ctx, centerX, centerY, radius, innerColor, outerColor) {
    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = outerColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
    ctx.strokeStyle = innerColor;
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawSpeedScale(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= 260; i += 20) {
        const angle = (i / 260) * 240 - 120;
        const radian = (angle * Math.PI) / 180;
        
        const x1 = centerX + (radius - 15) * Math.cos(radian);
        const y1 = centerY + (radius - 15) * Math.sin(radian);
        const x2 = centerX + (radius - 5) * Math.cos(radian);
        const y2 = centerY + (radius - 5) * Math.sin(radian);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = i % 40 === 0 ? 2 : 1;
        ctx.stroke();
        
        if (i % 40 === 0) {
            const textX = centerX + (radius - 25) * Math.cos(radian);
            const textY = centerY + (radius - 25) * Math.sin(radian) + 4;
            ctx.fillText(i.toString(), textX, textY);
        }
    }
}

function drawRPMScale(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= 8; i++) {
        const angle = (i / 8) * 240 - 120;
        const radian = (angle * Math.PI) / 180;
        
        const x1 = centerX + (radius - 15) * Math.cos(radian);
        const y1 = centerY + (radius - 15) * Math.sin(radian);
        const x2 = centerX + (radius - 5) * Math.cos(radian);
        const y2 = centerY + (radius - 5) * Math.sin(radian);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const textX = centerX + (radius - 25) * Math.cos(radian);
        const textY = centerY + (radius - 25) * Math.sin(radian) + 4;
        ctx.fillStyle = i >= 6 ? '#ff4444' : '#00ff88';
        ctx.fillText(i.toString(), textX, textY);
    }
}

function drawRedZone(ctx, centerX, centerY, radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, (6/8) * 240 - 120, 240 - 120);
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 8;
    ctx.stroke();
}

function drawSmallGaugeScale(ctx, centerX, centerY, radius, labels) {
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#00ff88';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let i = 0; i < labels.length; i++) {
        const angle = (i / (labels.length - 1)) * 180 - 90;
        const radian = (angle * Math.PI) / 180;
        
        const x1 = centerX + (radius - 10) * Math.cos(radian);
        const y1 = centerY + (radius - 10) * Math.sin(radian);
        const x2 = centerX + (radius - 3) * Math.cos(radian);
        const y2 = centerY + (radius - 3) * Math.sin(radian);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        const textX = centerX + (radius - 18) * Math.cos(radian);
        const textY = centerY + (radius - 18) * Math.sin(radian) + 3;
        ctx.fillText(labels[i], textX, textY);
    }
}

function drawNeedle(ctx, centerX, centerY, length, angle, color, width) {
    const radian = (angle * Math.PI) / 180;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + length * Math.cos(radian),
        centerY + length * Math.sin(radian)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawCenterCap(ctx, centerX, centerY, radius = 12) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Update functions
function updateDigitalDisplays() {
    document.getElementById('gearDisplay').textContent = dashboardState.gear;
    document.getElementById('odometer').textContent = `${dashboardState.odometer.toLocaleString()} km`;
    document.getElementById('tripDisplay').textContent = `Trip: ${dashboardState.tripDistance.toFixed(1)} km`;
    document.getElementById('terrainMode').textContent = dashboardState.terrainMode;
    document.getElementById('outsideTemp').textContent = `${dashboardState.outsideTemp}°C`;
}

function updateWarningLights() {
    const lights = ['engine', 'oil', 'battery', 'temp'];
    lights.forEach(light => {
        const element = document.getElementById(light + 'Light');
        if (dashboardState.warningLights[light]) {
            element.classList.add('active', light);
        } else {
            element.classList.remove('active', light);
        }
    });
}

function startTimeUpdate() {
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('timeDisplay').textContent = timeString;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

function startAnimation() {
    function animate(currentTime) {
        if (currentTime - lastTime >= 50) { // 20 FPS
            // Add some realistic fluctuations
            if (dashboardState.engineOn) {
                dashboardState.rpm += (Math.random() - 0.5) * 100;
                dashboardState.rpm = Math.max(800, Math.min(dashboardState.rpm, 7500));
                
                if (dashboardState.speed > 0) {
                    dashboardState.oilPressure = 40 + Math.random() * 30;
                    dashboardState.voltage = 13.8 + (Math.random() - 0.5) * 0.4;
                }
            }
            
            // Check warning conditions
            dashboardState.warningLights.oil = dashboardState.oilPressure < 20;
            dashboardState.warningLights.temp = dashboardState.temperature > 100;
            dashboardState.warningLights.battery = dashboardState.voltage < 11 || dashboardState.voltage > 14;
            
            // Redraw gauges
            drawSpeedometer();
            drawTachometer();
            drawFuelGauge();
            drawTemperatureGauge();
            drawOilPressureGauge();
            drawVoltmeter();
            updateWarningLights();
            
            lastTime = currentTime;
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);
}

// Control functions
function toggleEngine() {
    dashboardState.engineOn = !dashboardState.engineOn;
    
    if (dashboardState.engineOn) {
        dashboardState.rpm = 800; // Idle RPM
        dashboardState.oilPressure = 45;
        dashboardState.voltage = 13.8;
        dashboardState.gear = 'D';
        dashboardState.warningLights.engine = false;
    } else {
        dashboardState.rpm = 0;
        dashboardState.speed = 0;
        dashboardState.oilPressure = 0;
        dashboardState.voltage = 12.1;
        dashboardState.gear = 'P';
        dashboardState.warningLights.engine = true;
    }
    
    updateDigitalDisplays();
}

function changeTerrain() {
    currentTerrainIndex = (currentTerrainIndex + 1) % terrainModes.length;
    dashboardState.terrainMode = terrainModes[currentTerrainIndex];
    updateDigitalDisplays();
}

function simulateDriving() {
    if (!dashboardState.engineOn) {
        toggleEngine();
    }
    
    let targetSpeed = 60 + Math.random() * 80;
    let targetRPM = 2000 + Math.random() * 2000;
    
    function driveAnimation() {
        if (dashboardState.speed < targetSpeed) {
            dashboardState.speed += 2;
            dashboardState.rpm = Math.min(targetRPM, dashboardState.rpm + 50);
        }
        
        // Consume fuel
        dashboardState.fuel = Math.max(0, dashboardState.fuel - 0.02);
        
        // Increase temperature slightly
        dashboardState.temperature = Math.min(105, dashboardState.temperature + 0.1);
        
        // Update trip distance
        dashboardState.tripDistance += dashboardState.speed * 0.001;
        
        updateDigitalDisplays();
        
        if (dashboardState.speed < targetSpeed) {
            setTimeout(driveAnimation, 100);
        }
    }
    
    driveAnimation();
}

function resetDashboard() {
    dashboardState = {
        engineOn: false,
        speed: 0,
        rpm: 0,
        fuel: 75,
        temperature: 85,
        oilPressure: 50,
        voltage: 12.6,
        gear: 'P',
        terrainMode: 'NORMAL',
        odometer: 123456,
        tripDistance: 245.7,
        outsideTemp: 22,
        warningLights: {
            engine: false,
            oil: false,
            battery: false,
            temp: false
        }
    };
    
    currentTerrainIndex = 0;
    updateDigitalDisplays();
}

// Keyboard controls
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'e':
        case 'E':
            toggleEngine();
            break;
        case 't':
        case 'T':
            changeTerrain();
            break;
        case 's':
        case 'S':
            simulateDriving();
            break;
        case 'r':
        case 'R':
            resetDashboard();
            break;
        case 'ArrowUp':
            if (dashboardState.engineOn && dashboardState.speed < 260) {
                dashboardState.speed += 5;
                dashboardState.rpm = Math.min(7500, dashboardState.rpm + 200);
            }
            event.preventDefault();
            break;
        case 'ArrowDown':
            if (dashboardState.engineOn && dashboardState.speed > 0) {
                dashboardState.speed = Math.max(0, dashboardState.speed - 5);
                dashboardState.rpm = Math.max(800, dashboardState.rpm - 200);
            }
            event.preventDefault();
            break;
    }
});