// ============================================================
// Aurora Magnetosphere Variant
// Separate experimental version of the aurora sketch
// Keep your original sketch.js untouched
// ============================================================

// ---------- GLOBALS ----------
let starTime = 0;
let solarBursts = [];

const MAX_SOLAR_BURSTS = 4;
const SOLAR_BURST_CHANCE = 0.006;

// tune these
const MAGNETIC_SWIRL_STRENGTH = 0.9;
const MAGNETIC_SWIRL_SCALE = 0.0025;
const CURTAIN_LAYERS = 3;
const AURORA_BRIGHTNESS = 0.72;
const CURTAIN_ALPHA = 26;
const HIGHLIGHT_ALPHA = 52;
const VEIL_ALPHA = 1;

// example palette
const PALETTES = {
    magnetosphere: {
        green: [80, 255, 170],
        blue: [60, 160, 255],
        lilac: [210, 120, 255],
        ember: [255, 120, 80]
    }
};

let currentPalette = PALETTES.magnetosphere;

// ---------- SETUP ----------
function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    noStroke();
}

// ---------- DRAW ----------
function draw() {
    background(7, 10, 18, 18);

    starTime += 0.01;

    updateSolarBursts();

    drawBackgroundStars();
    drawAuroraVeilLayer();
    drawAuroraCurtains();
    drawSolarBursts();
    drawForegroundStars();
}

// ============================================================
// AURORA
// ============================================================

function drawAuroraVeilLayer() {
    for (let layer = 0; layer < CURTAIN_LAYERS; layer++) {
        let yBase = height * (0.18 + layer * 0.09);
        let amplitude = 55 + layer * 18;
        let thickness = 120 + layer * 16;
        let xOffset = layer * 1000;

        for (let x = 0; x < width; x += 7) {
            let n = noise(x * 0.002, starTime * 0.12 + xOffset);
            let y = yBase + map(n, 0, 1, -amplitude, amplitude);

            let swirl = magneticVortexOffset(x, y, layer);
            let burstPush = solarBurstInfluence(x, y);

            let finalX = x + swirl.x + burstPush.x * 0.4;
            let finalY = y + swirl.y + burstPush.y * 0.25;

            let c1 = currentPalette.green;
            let c2 = currentPalette.blue;
            let c3 = currentPalette.lilac;

            drawVerticalAuroraStrip(finalX, finalY, thickness, c1, c2, c3, VEIL_ALPHA, 1.2);
        }
    }
}

function drawAuroraCurtains() {
    for (let layer = 0; layer < CURTAIN_LAYERS; layer++) {
        let yBase = height * (0.22 + layer * 0.08);
        let amplitude = 80 + layer * 30;
        let thickness = 170 - layer * 15;
        let xOffset = layer * 2400 + 50;

        for (let x = 0; x < width; x += 5) {
            let largeWave = sin(x * 0.004 + starTime * 0.7 + layer * 1.2) * amplitude * 0.5;
            let mediumWave = sin(x * 0.010 + starTime * 1.1 + layer * 2.4) * amplitude * 0.22;
            let noiseWave = map(noise(x * 0.003, layer * 20 + starTime * 0.2 + xOffset), 0, 1, -amplitude * 0.55, amplitude * 0.55);

            let y = yBase + largeWave + mediumWave + noiseWave;

            let swirl = magneticVortexOffset(x, y, layer);
            let burstPush = solarBurstInfluence(x, y);

            let finalX = x + swirl.x + burstPush.x;
            let finalY = y + swirl.y + burstPush.y * 0.35;

            let shimmer = 0.82 + 0.18 * sin(starTime * 2.8 + x * 0.01 + layer * 1.5);
            let alphaBase = CURTAIN_ALPHA * shimmer * AURORA_BRIGHTNESS;

            let c1 = currentPalette.green;
            let c2 = currentPalette.blue;
            let c3 = currentPalette.lilac;

            drawVerticalAuroraStrip(finalX, finalY, thickness, c1, c2, c3, alphaBase, 1.0);

            // local bright edge highlights
            if (random() < 0.12) {
                drawVerticalAuroraStrip(
                    finalX + random(-2, 2),
                    finalY - 8,
                    thickness * 0.55,
                    currentPalette.lilac,
                    currentPalette.blue,
                    currentPalette.green,
                    HIGHLIGHT_ALPHA * shimmer,
                    0.45
                );
            }
        }
    }
}

function drawVerticalAuroraStrip(x, yTop, thickness, cTop, cMid, cBottom, alphaBase, widthScale) {
    let steps = 18;

    for (let i = 0; i < steps; i++) {
        let t = i / (steps - 1);
        let y = yTop + t * thickness;

        let fadeTop = pow(sin(t * PI), 0.85);
        let fadeBottom = 1.0 - pow(t, 1.9);
        let alpha = alphaBase * fadeTop * fadeBottom;

        let colourA = lerpColourArray(cTop, cMid, t);
        let colourB = lerpColourArray(cMid, cBottom, t * 0.9);

        let mixAmt = 0.5 + 0.5 * sin(t * PI);
        let finalColour = lerpColourArray(colourA, colourB, mixAmt);

        // let wobble = sin(starTime * 2.1 + y * 0.025 + x * 0.008) * 2.5;
        let wobble = sin(starTime * 2.1 + y * 0.025 + x * 0.008) * 2.5;
        let w = (7 + 10 * fadeTop) * widthScale;

        fill(finalColour[0], finalColour[1], finalColour[2], alpha);
        ellipse(x + wobble, y, w, 11 + 7 * fadeTop);
    }
}

// ============================================================
// MAGNETIC FLOW
// ============================================================

function magneticVortexOffset(x, y, layer) {
    let cx = width * 0.5 + sin(starTime * 0.12 + layer) * width * 0.12;
    let cy = height * (0.22 + layer * 0.08);

    let dx = x - cx;
    let dy = y - cy;
    let r = sqrt(dx * dx + dy * dy) + 0.0001;
    let angle = atan2(dy, dx);

    let twistNoise = noise(x * MAGNETIC_SWIRL_SCALE, y * MAGNETIC_SWIRL_SCALE, starTime * 0.15);
    let twist = MAGNETIC_SWIRL_STRENGTH * map(twistNoise, 0, 1, -1, 1);

    let falloff = exp(-r / 260.0);
    let tangential = twist * falloff * 55.0;

    return {
        x: -sin(angle) * tangential,
        y:  cos(angle) * tangential * 0.55
    };
}

// ============================================================
// SOLAR BURSTS
// ============================================================

function updateSolarBursts() {
    if (random() < SOLAR_BURST_CHANCE && solarBursts.length < MAX_SOLAR_BURSTS) {
        solarBursts.push({
            x: random(width * 0.15, width * 0.85),
            y: random(height * 0.08, height * 0.3),
            radius: random(60, 140),
            strength: random(18, 40),
            age: 0,
            life: random(90, 180)
        });
    }

    for (let i = solarBursts.length - 1; i >= 0; i--) {
        solarBursts[i].age++;
        solarBursts[i].radius += 1.6;

        if (solarBursts[i].age > solarBursts[i].life) {
            solarBursts.splice(i, 1);
        }
    }
}

function solarBurstInfluence(x, y) {
    let totalX = 0;
    let totalY = 0;

    for (let b of solarBursts) {
        let dx = x - b.x;
        let dy = y - b.y;
        let d = sqrt(dx * dx + dy * dy) + 0.0001;

        let pulse = exp(-pow((d - b.radius) / 70.0, 2));
        let strength = b.strength * pulse;

        totalX += (dx / d) * strength * 0.9;
        totalY += (dy / d) * strength * 0.25;
    }

    return { x: totalX, y: totalY };
}

function drawSolarBursts() {
    for (let b of solarBursts) {
        let lifeFade = 1.0 - b.age / b.life;
        noFill();
        stroke(180, 220, 255, 40 * lifeFade);
        strokeWeight(1.2);
        ellipse(b.x, b.y, b.radius * 2);
        noStroke();
    }
}

// ============================================================
// STARS
// ============================================================

function drawBackgroundStars() {
    randomSeed(6);

    for (let i = 0; i < 180; i++) {
        let x = random(width);
        let y = random(height * 0.72);

        let twinkle = 120 + 90 * sin(starTime * 1.7 + i * 0.7);
        fill(255, 255, 255, twinkle * 0.45);
        circle(x, y, random(1, 2.2));
    }
}

function drawForegroundStars() {
    randomSeed(12);

    for (let i = 0; i < 55; i++) {
        let x = random(width);
        let y = random(height * 0.82);

        let twinkle = 150 + 90 * sin(starTime * 2.3 + i * 1.4);
        fill(255, 255, 255, twinkle * 0.65);
        circle(x, y, random(1.5, 3.2));
    }
}

// ============================================================
// HELPERS
// ============================================================

function lerpColourArray(a, b, t) {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t)
    ];
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}