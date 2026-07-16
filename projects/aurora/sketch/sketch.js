// ==============================
// Aurora Borealis — v0 visual prototype
// (additive blending + rebalanced alpha)
// ==============================

// =============================
// SERVER: python3 -m http.server 8000
// http://localhost:8000/
// =============================

let t = 0;

// --- STAR FIELD ---
let stars = [];
let starClusters = [];
let STAR_COUNT = 200;
let CLUSTER_COUNT = 4;
let starTime = 0;
let shootingStars = [];
let meteorTrails = [];
const SHOOTING_STAR_CHANCE = 0.005;
let MAX_SHOOTING_STARS = 2;
let raysEnabled = true;
let auroraKnots = [];
let MAX_KNOTS = 4;
const KNOT_SPAWN_CHANCE = 0.1;
let interactionMode = "magneticVortex";

// --- AURORA ALPHA BALANCE (tuned for additive blend mode) ---
const AURORA_INTENSITY = 2.5;      // overall brightness
const BASE_ALPHA_SCALE = 9;         // per-line base alpha multiplier
const GLOW_BOOST_SCALE = 4;         // cursor-proximity glow boost
const COLLAPSE_ALPHA_SCALE = 1.5;   // periodic "collapse" pulse strength

// --- MOBILE / DEVICE PROFILE ---
let isTouchDevice = false;
let isMobileLayout = false;
let qualityProfile = null;

let pointerX = 0;
let pointerY = 0;
let pointerTargetX = 0;
let pointerTargetY = 0;
let pointerActive = false;

// --- PALETTE CONTROL ---
let auroraPalette = "classic";

const PALETTES = {
    classic:         { green: [0,255,110],   blue: [0,150,255],   lilac: [255,0,220]   },
    violetStorm:     { green: [80,255,120],  blue: [0,70,255],    lilac: [255,0,255]   },
    arcticBlue:      { green: [180,255,160], blue: [0,220,255],   lilac: [120,60,255]  },
    solarFlare:      { green: [255,245,70],  blue: [255,110,0],   lilac: [255,0,150]   },
    deepSpace:       { green: [0,255,140],   blue: [20,40,255],   lilac: [255,0,240]   },
    emeraldStorm:    { green: [0,255,90],    blue: [0,120,255],   lilac: [255,0,200]   },
    neonNebula:      { green: [0,255,220],   blue: [80,0,255],    lilac: [255,0,120]   },
    arcticIce:       { green: [200,255,210], blue: [0,210,255],   lilac: [90,0,255]    },
    deepAurora:      { green: [0,255,150],   blue: [0,60,255],    lilac: [255,0,255]   },
    dreamLavender:   { green: [220,255,170], blue: [120,190,255], lilac: [255,120,230] },
    cottonCandy:     { green: [255,210,120], blue: [100,210,255], lilac: [255,60,220]  },
    synthwave:       { green: [255,80,40],   blue: [80,0,255],    lilac: [255,0,150]   },
    ionStorm:        { green: [180,255,0],   blue: [0,255,220],   lilac: [0,70,255]    },
    plasmaArc:       { green: [255,255,80],  blue: [255,120,0],   lilac: [255,0,40]    },
    alienSky:        { green: [0,255,130],   blue: [180,0,255],   lilac: [255,255,80]  },
    supernova:       { green: [255,240,70],  blue: [255,90,0],    lilac: [255,0,220]   },
    gammaBurst:      { green: [0,255,200],   blue: [0,30,255],    lilac: [255,0,255]   },
    auroraUltra:     { green: [0,255,100],   blue: [0,200,255],   lilac: [255,0,180]   },
    toxicIon:        { green: [170,255,0],   blue: [0,255,120],   lilac: [0,90,255]    },
    cosmicFire:      { green: [255,255,120], blue: [255,150,0],   lilac: [160,0,0]     },
    prismaticShock:  { green: [0,255,0],     blue: [255,0,0],     lilac: [0,120,255]   },
    acidRainbow:     { green: [180,255,0],   blue: [0,255,255],   lilac: [255,0,0]     },
    ultravioletStorm:{ green: [0,255,120],   blue: [255,140,0],   lilac: [120,0,255]   },
    toxicSunset:     { green: [0,255,80],    blue: [255,200,0],   lilac: [255,0,0]     },
    alienPlasma:     { green: [0,255,200],   blue: [255,0,120],   lilac: [255,255,0]   },
    laserStorm:      { green: [255,0,255],   blue: [0,255,0],     lilac: [0,140,255]   },
    cosmicCandy:     { green: [255,120,0],   blue: [0,255,255],   lilac: [180,0,255]   },
    gammaFlux:       { green: [255,255,0],   blue: [0,60,255],    lilac: [255,0,180]   },
    plasmaCircuit:   { green: [0,255,150],   blue: [255,0,0],     lilac: [255,255,255] },
    nebulaChaos:     { green: [0,255,80],    blue: [255,80,0],    lilac: [0,120,255]   },
    highContrast:    { green: [11,21,128],   blue: [120,2,28],    lilac: [227,194,95]  },
};

// --- ZIP FRAME CAPTURE ---
let cnv;
let FPS = 5;
let SECONDS = 5;
let RECORDING = false;
let zip;
let pending = [];
let capturedFrames = 0;
let targetFrames = 0;
let nextCaptureMs = 0;
let zipBlobReady = null;

// --- MOBILE HELPERS ---
function detectDeviceProfile() {
    isTouchDevice =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

    isMobileLayout = isTouchDevice || windowWidth < 900;

    qualityProfile = isMobileLayout
        ? {
            layers: 3,
            curtainCols: 100,
            curtainStepY: 20,
            interactionRadius: 50,
            starParallaxScale: 0.09,
            starCount: 145,
            clusterCount: 3,
            maxShootingStars: 2,
            maxKnots: 3,
            meteorTrailLifeScale: 0.82,
            sharpStarChanceScale: 0.82,
        }
        : {
            layers: 4,
            curtainCols: 200,
            curtainStepY: 18,
            interactionRadius: 150,
            starParallaxScale: 1.0,
            starCount: 200,
            clusterCount: 4,
            maxShootingStars: 2,
            maxKnots: 4,
            meteorTrailLifeScale: 1.0,
            sharpStarChanceScale: 1.0,
        };

    STAR_COUNT = qualityProfile.starCount;
    CLUSTER_COUNT = qualityProfile.clusterCount;
    MAX_SHOOTING_STARS = qualityProfile.maxShootingStars;
    MAX_KNOTS = qualityProfile.maxKnots;
}

function resetPointerToCentre() {
    pointerX = width * 0.5;
    pointerY = height * 0.5;
    pointerTargetX = pointerX;
    pointerTargetY = pointerY;
}

function updatePointer() {
    if (!isTouchDevice) {
        pointerTargetX = mouseX;
        pointerTargetY = mouseY;
        pointerActive =
            mouseX >= 0 && mouseX <= width &&
            mouseY >= 0 && mouseY <= height;
    } else if (!pointerActive) {
        pointerTargetX = lerp(pointerTargetX, width * 0.5, 0.02);
        pointerTargetY = lerp(pointerTargetY, height * 0.5, 0.02);
    }

    const ease = isMobileLayout ? 0.16 : 0.22;
    pointerX = lerp(pointerX, pointerTargetX, ease);
    pointerY = lerp(pointerY, pointerTargetY, ease);
}

function touchStarted() {
    if (touches.length > 0) {
        pointerTargetX = touches[0].x;
        pointerTargetY = touches[0].y;
        pointerActive = true;
    }
    return false;
}

function touchMoved() {
    if (touches.length > 0) {
        pointerTargetX = touches[0].x;
        pointerTargetY = touches[0].y;
        pointerActive = true;
    }
    return false;
}

function touchEnded() {
    if (touches.length === 0) {
        pointerActive = false;
    }
    return false;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function startZipCapture() {
    if (typeof JSZip === "undefined") { console.error("JSZip not found."); return; }
    if (!cnv) { console.error("Canvas not initialised yet."); return; }
    zip = new JSZip();
    pending = [];
    capturedFrames = 0;
    targetFrames = Math.max(1, Math.round(FPS * SECONDS));
    nextCaptureMs = millis();
    RECORDING = true;
    console.log(`ZIP capture started: ${targetFrames} frames @ ${FPS} fps`);
}

function finishZipCapture() {
    RECORDING = false;
    Promise.all(pending)
        .then(() => zip.generateAsync({ type: "blob", compression: "STORE" }))
        .then((blob) => { zipBlobReady = blob; console.log("ZIP ready. Press D to download."); })
        .catch((err) => console.error("ZIP capture error:", err));
}

function captureFrameToZip() {
    const frameIndex = capturedFrames;
    const p = new Promise((resolve, reject) => {
        cnv.elt.toBlob((blob) => {
            if (!blob) return reject(new Error("toBlob returned null"));
            zip.file(`aurora_${String(frameIndex).padStart(4, "0")}.png`, blob);
            resolve();
        }, "image/png");
    });
    pending.push(p);
}

function keyPressed() {
    if (key === "r" || key === "R") { if (!RECORDING) startZipCapture(); }
    if (key === "d" || key === "D") {
        if (zipBlobReady) {
            downloadBlob(zipBlobReady, "aurora_frames.zip");
            zipBlobReady = null;
        }
    }
}

function setup() {
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.style("position", "fixed");
    cnv.style("top", "0");
    cnv.style("left", "0");
    cnv.style("z-index", "0");

    detectDeviceProfile();
    pixelDensity(1);
    noFill();
    resetPointerToCentre();
    makeStars();
    // No createControls() — controls live in index.html
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    detectDeviceProfile();
    resetPointerToCentre();
    makeStars();
}

function makeStars() {
    stars = [];
    starClusters = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        const depth = random();
        const layer = random() < 0.82 ? "back" : "front";
        const sharp = random() < 0.22 * qualityProfile.sharpStarChanceScale;
        const hero = sharp && random() < 0.18;
        stars.push({
            x: random(width), y: random(height * 0.92),
            r: random(0.5, 2.2) * (0.7 + 0.6 * depth),
            baseAlpha: random(30, 120), phase: random(TWO_PI),
            speed: random(0.01, 0.05), drift: random(0.3, 1.2),
            depth, layer, sharp, hero
        });
    }

    for (let c = 0; c < CLUSTER_COUNT; c++) {
        const cx = random(width);
        const cy = random(height * 0.55);
        const clusterRadius = random(60, 140);
        const clusterStars = Math.floor(random(25, 60));
        for (let i = 0; i < clusterStars; i++) {
            const angle = random(TWO_PI);
            const radius = clusterRadius * Math.sqrt(random());
            const x = cx + cos(angle) * radius;
            const y = cy + sin(angle) * radius * 0.6;
            if (x < 0 || x > width || y < 0 || y > height * 0.8) continue;
            stars.push({
                x, y, r: random(0.3, 1.0),
                baseAlpha: random(10, 40), phase: random(TWO_PI),
                speed: random(0.008, 0.03), drift: random(0.2, 0.8),
                depth: random(0.0, 0.4), layer: "back", clustered: true
            });
        }
    }
}

function drawStarSparkle(x, y, size, alpha) {
    stroke(255, 255, 255, alpha);
    strokeWeight(0.8);
    line(x, y - size, x, y + size);
    line(x - size, y, x + size, y);
    stroke(255, 255, 255, alpha * 0.6);
    line(x - size * 0.7, y - size * 0.7, x + size * 0.7, y + size * 0.7);
    line(x + size * 0.7, y - size * 0.7, x - size * 0.7, y + size * 0.7);
}

function getStarOffset(s) {
    const mx = map(pointerX, 0, width, -1, 1);
    const my = map(pointerY, 0, height, -1, 1);
    let parallaxStrength = (1 + 3 * s.depth) * qualityProfile.starParallaxScale;
    if (s.clustered) parallaxStrength *= 0.35;
    return { ox: mx * parallaxStrength, oy: my * parallaxStrength * 0.35 };
}

function drawClusterHaze() {
    noStroke();
    for (const s of stars) {
        if (!s.clustered) continue;
        const { ox, oy } = getStarOffset(s);
        const driftX = 2.0 * sin(frameCount * 0.002 * s.drift + s.phase);
        const driftY = 1.0 * cos(frameCount * 0.0015 * s.drift + s.phase * 0.7);
        fill(255, 255, 255, 2);
        circle(s.x + ox + driftX, s.y + oy + driftY, s.r * 10);
    }
}

function spawnShootingStar() {
    const meteorColours = [[255,255,255],[120,170,255],[110,255,180],[255,180,120]];
    const col = random(meteorColours);
    const brightness = random(0.9, 1.15);
    const angle = random(PI * 0.15, PI * 0.32);
    const speed = random(14, 24);
    shootingStars.push({
        x: random(width * 0.15, width * 0.85),
        y: random(height * 0.05, height * 0.35),
        vx: cos(angle) * speed, vy: sin(angle) * speed,
        tailLength: random(80, 260), life: 0, maxLife: random(16, 28),
        alpha: random(180, 255),
        colour: [col[0]*brightness, col[1]*brightness, col[2]*brightness]
    });
}

function updateAndDrawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++; s.x += s.vx; s.y += s.vy;
        meteorTrails.push({
            x: s.x, y: s.y, vx: s.vx, vy: s.vy, life: 0,
            maxLife: random(40, 80) * qualityProfile.meteorTrailLifeScale,
            colour: s.colour
        });
        const fade = 1 - s.life / s.maxLife;
        for (let j = 0; j < 18; j++) {
            const t1 = j / 18, t2 = (j + 1) / 18;
            const x1 = s.x - s.vx * s.tailLength * t1 * 0.05;
            const y1 = s.y - s.vy * s.tailLength * t1 * 0.05;
            const x2 = s.x - s.vx * s.tailLength * t2 * 0.05;
            const y2 = s.y - s.vy * s.tailLength * t2 * 0.05;
            stroke(lerp(s.colour[0],255,t1), lerp(s.colour[1],255,t1), lerp(s.colour[2],255,t1), s.alpha * fade * (1 - t1));
            strokeWeight(2.2 * (1 - t1));
            line(x1, y1, x2, y2);
        }
        noStroke();
        fill(s.colour[0], s.colour[1], s.colour[2], s.alpha * fade);
        circle(s.x, s.y, 3.6);
        fill(s.colour[0], s.colour[1], s.colour[2], s.alpha * 0.15 * fade);
        circle(s.x, s.y, 9);
        if (s.life >= s.maxLife || s.x > width + 50 || s.y > height + 50)
            shootingStars.splice(i, 1);
    }
}

function updateAndDrawMeteorTrails() {
    for (let i = meteorTrails.length - 1; i >= 0; i--) {
        const t = meteorTrails[i];
        t.life++;
        const fade = 1 - t.life / t.maxLife;
        if (fade <= 0) { meteorTrails.splice(i, 1); continue; }
        stroke(t.colour[0], t.colour[1], t.colour[2], 80 * fade);
        strokeWeight(1.2);
        line(t.x, t.y, t.x - t.vx * 8, t.y - t.vy * 8);
    }
}

function spawnAuroraKnot() {
    auroraKnots.push({
        x: random(width * 0.1, width * 0.9),
        y: random(height * 0.18, height * 0.55),
        vx: random(-0.25, 0.25), vy: random(-1.2, -0.4),
        r: random(60, 140), life: 0, maxLife: random(120, 240),
        strength: random(0.8, 1.4), phase: random(TWO_PI)
    });
}

function updateAuroraKnots() {
    if (random() < KNOT_SPAWN_CHANCE && auroraKnots.length < MAX_KNOTS) spawnAuroraKnot();
    for (let i = auroraKnots.length - 1; i >= 0; i--) {
        const k = auroraKnots[i];
        k.life++;
        k.x += k.vx + 0.15 * Math.sin(t * 2 + k.phase);
        k.y += k.vy;
        if (k.life >= k.maxLife || k.y < -100) auroraKnots.splice(i, 1);
    }
}

function drawStars(layerName) {
    noStroke();
    for (const s of stars) {
        if (s.layer !== layerName) continue;
        const { ox, oy } = getStarOffset(s);
        const df = s.clustered ? 0.4 : 1.0;
        const sx = s.x + ox + df * 2.0 * sin(frameCount * 0.002 * s.drift + s.phase);
        const sy = s.y + oy + df * 1.0 * cos(frameCount * 0.0015 * s.drift + s.phase * 0.7);

        const twinkleBase = s.hero ? 0.50 : (s.sharp ? 0.60 : 0.78);
        const twinkleAmp  = s.hero ? 0.85 : (s.sharp ? 0.55 : 0.18);
        const twinkle = twinkleBase + twinkleAmp * (
            0.62 * sin(starTime * s.speed * 60 + s.phase) +
            0.38 * sin(starTime * s.speed * 97 + s.phase * 1.7)
        );
        const breathe = 0.82 + 0.18 * sin(starTime * s.speed * 21 + s.phase * 1.7);

        let flash = 1.0;
        if (s.sharp) {
            const f1 = 0.5 + 0.5 * sin(starTime * s.speed * 420 + s.phase * 1.9);
            const f2 = 0.5 + 0.5 * sin(starTime * s.speed * 780 + s.phase * 0.7);
            const spike = pow(0.5 + 0.5 * sin(starTime * s.speed * 1260 + s.phase * 2.3), 6);
            flash = 0.75 + 0.6 * f1 * f2 + 0.9 * spike;
        }

        let a = max(0, s.baseAlpha * twinkle * breathe * flash);
        if (s.sharp) a *= 1.5;
        if (layerName === "front") a *= 0.55;

        fill(255, 255, 255, a);
        circle(sx, sy, s.r * (s.hero ? 1.8 : 1.0));

        if (s.sharp && !s.clustered && a > 25) {
            const sp = 0.85 + 0.45 * sin(starTime * s.speed * 144 + s.phase);
            drawStarSparkle(sx, sy, sp * (s.hero ? 3.0 + 2.8*s.depth : 2.0 + 2.2*s.depth), a * 0.95);
        }
        if (s.r > 1.4) {
            fill(255, 255, 255, a * (s.sharp ? 0.05 : 0.14));
            circle(sx, sy, s.r * (s.sharp ? 1.5 + 0.5*s.depth : 2.4 + 1.2*s.depth));
        }
    }
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function smooth01(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

function draw() {
    background(7, 10, 18, 20);
    updatePointer();
    starTime += 0.02;
    updateAuroraKnots();

    if (random() < SHOOTING_STAR_CHANCE && shootingStars.length < MAX_SHOOTING_STARS)
        spawnShootingStar();

    drawClusterHaze();
    drawStars("back");
    updateAndDrawShootingStars();
    updateAndDrawMeteorTrails();

    t += 0.004;
    const wind = map(noise(t * 0.2), 0, 1, -0.4, 0.4);
    const activity = 0.5 + 0.5 * noise(t * 0.6);

    // Additive blending for the aurora curtains only — gives the light a
    // luminous, overlapping-glow quality instead of flat alpha mixing.
    // Scoped with push()/pop() so it doesn't affect stars/background,
    // which still rely on normal blending.
    push();
    blendMode(ADD);
    for (let L = 0; L < qualityProfile.layers; L++) {
        drawCurtain(L / (qualityProfile.layers - 1), wind, activity);
    }
    pop();

    drawStars("front");

    if (RECORDING) {
        const intervalMs = 1000 / FPS;
        let safety = 0;
        while (capturedFrames < targetFrames && millis() >= nextCaptureMs && safety < 3) {
            captureFrameToZip();
            capturedFrames++;
            nextCaptureMs += intervalMs;
            safety++;
        }
        if (capturedFrames >= targetFrames) { console.log("Capture complete, zipping..."); finishZipCapture(); }
    }
}

function drawCurtain(z, wind, activity) {
    const baseY = height * (0.15 + 0.08 * z);
    const ampX  = width  * (0.15 + 0.1  * (1 - z));
    const ampY  = height * (0.2  + 0.15 * (1 - z));

    strokeWeight((isMobileLayout ? 0.7 : 0.9) + (isMobileLayout ? 1.2 : 1.8) * (1 - z));

    const cols  = qualityProfile.curtainCols;
    const stepY = qualityProfile.curtainStepY;
    const R     = qualityProfile.interactionRadius;

    const palette = PALETTES[auroraPalette];
    const green = palette.green, blue = palette.blue, lilac = palette.lilac;

    const colourScaleX = 0.012, colourScaleY = 0.006;
    const colourTime = t * 0.35, colourRise = t * 5.6;
    const collapseAmount = 0.3 + 0.3 * Math.sin(t * 8.0 + z * 2.0);

    // Normalize per-layer alpha so total additive brightness stays roughly
    // constant regardless of how many layers are active (3 on mobile, 4 on
    // desktop) — otherwise more layers just means more stacked light.
    const layerNorm = 1 / qualityProfile.layers;

    for (let i = 0; i < cols; i++) {
        let prevX = null, prevY = null;
        const baseX = (i / cols) * width;
        const bunch = noise(baseX * 0.004, t * 0.18 + z * 8.0);

        let raySeed =
            0.72 * noise(baseX * 0.028 + z * 20.0, t * 0.65 + z * 3.0) +
            0.28 * noise(baseX * 0.085 + 200 + z * 7.0, t * 1.3 + z * 5.0);
        raySeed = Math.pow(raySeed, 4.8);
        const rayColumn = raySeed * (0.82 + 0.18 * Math.sin(t * 6.0 + i * 0.21 + z * 4.0));

        for (let y = 0; y < height; y += stepY) {
            const y01 = y / height;
            const dx = baseX - pointerX, dy = y - pointerY;
            const d = Math.sqrt(dx * dx + dy * dy);
            const touch = Math.pow(clamp01(1 - d / R), 0.6);

            let localPushX = 0, localLiftY = 0;
            let cursorBlueBoost = 0, cursorLilacBoost = 0, cursorGlowBoost = 0;

            if (interactionMode === "pushLift") {
                localPushX = (dx / (d + 1)) * 10 * touch;
                localLiftY = -200 * touch;
            }
            if (interactionMode === "attractor") {
                localPushX = -(dx / (d + 1)) * 80 * touch;
                localLiftY = -(dy / (d + 1)) * 0.35 * 80 * touch;
            }
            if (interactionMode === "magneticVortex") {
                localPushX = -(dx/(d+1))*60*touch + (-dy/(d+1))*90*touch;
                localLiftY = -(dy/(d+1))*0.3*60*touch + (dx/(d+1))*90*touch;
                cursorBlueBoost = 0.35 * touch;
                cursorLilacBoost = 0.25 * touch;
                cursorGlowBoost = 1.8 * touch;
            }
            if (interactionMode === "shockwave") {
                const rp = Math.pow(Math.max(0, Math.sin(d * 0.08 - t * 18.0)), 3.5);
                localLiftY = 80 * rp * touch; localPushX = 35 * rp * touch;
                cursorBlueBoost = 0.8 * rp; cursorLilacBoost = 0.55 * rp; cursorGlowBoost = 2.5 * rp;
            }
            if (interactionMode === "ignition") {
                localLiftY = -80 * touch;
                cursorBlueBoost = 0.45 * touch; cursorLilacBoost = 0.55 * touch; cursorGlowBoost = 2.4 * touch;
            }

            let knotLift = 0, knotGlow = 0, knotLilac = 0, knotBlue = 0;
            for (const k of auroraKnots) {
                const kd = Math.sqrt((baseX-k.x)**2 + (y-k.y)**2);
                const kTouch = Math.pow(clamp01(1 - kd / k.r), 2.2) * k.strength;
                knotLift += -55 * kTouch; knotGlow += 2.6 * kTouch;
                knotLilac += 0.45 * kTouch; knotBlue += 0.25 * kTouch;
            }

            const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);
            const collapseHeightMask = Math.pow(1 - y01, 1.1);
            const collapseWave =
                0.5 * Math.sin(baseX * 0.004 + t * 2.8 + i * 0.09 + z * 3.0) +
                0.5 * Math.sin(t * 5.0 + i * 0.22 + z * 4.0);
            const foldWave =
                Math.sin(t * 4.2 + i * 0.16 + y * 0.025 + z * 6.0) +
                0.6 * Math.sin(t * 7.5 + i * 0.08 - y * 0.018 + z * 3.0);
            const combinedWave = 0.7 * collapseWave + 0.3 * foldWave;
            const patchMask = Math.pow(noise(baseX * 0.01, y * 0.012, t * 0.9 + z * 20.0), 3.0);
            const foldStrength = collapseAmount * collapseHeightMask * (0.25 + 0.45 * bunch + 0.65 * patchMask);

            const x = baseX +
                (n - 0.5) * ampX +
                wind * 120 * (1 - y01) +
                localPushX +
                foldStrength * 180 * combinedWave +
                (noise(i * 0.4, y * 0.05, t * 2.0) - 0.5) * 6;

            const yy = baseY + y + localLiftY + knotLift +
                (-foldStrength * 130 * Math.abs(combinedWave)) +
                Math.sin(t * 2 + i * 0.15 + y * 0.01) * ampY * 0.1 * (0.7 + 0.3 * activity);

            let wG = smooth01(noise(baseX*colourScaleX, y*colourScaleY+colourRise, colourTime+z*10));
            let wB = smooth01(noise(baseX*colourScaleX+100, y*colourScaleY+40+colourRise*0.8, colourTime+20+z*7));
            let wL = smooth01(noise(baseX*colourScaleX+200, y*colourScaleY+80+colourRise*1.1, colourTime+40+z*5));

            wG *= 1.00;
            wB *= (0.95 + 0.20 * (1 - y01)) * (0.85 + 0.15 * Math.sin(t*3+y*0.02+i*0.08));
            wL *= 1.20 * (1.0 + 0.18 * Math.sin(t*2.2+y*0.015+i*0.03));

            wL += 0.22 * touch + cursorLilacBoost + knotLilac;
            wB += cursorBlueBoost + knotBlue;
            wB *= 1.0 + 0.9 * collapseAmount;
            wL *= 1.0 + 1.6 * collapseAmount;

            const wSum = wG + wB + wL + 1e-6;
            const col = [
                green[0]*(wG/wSum) + blue[0]*(wB/wSum) + lilac[0]*(wL/wSum),
                green[1]*(wG/wSum) + blue[1]*(wB/wSum) + lilac[1]*(wL/wSum),
                green[2]*(wG/wSum) + blue[2]*(wB/wSum) + lilac[2]*(wL/wSum),
            ];

            let rayAlpha = 1.0;
            if (raysEnabled) {
                const rayTexture = 0.92 + 0.08 * noise(baseX*0.03+500, y*0.01, t*0.8+z*9.0);
                rayAlpha = 0.55 + 2.4 * rayColumn * Math.pow(1-y01,0.8) * rayTexture * (1.0+1.2*collapseAmount);
            }

            // Rebalanced for additive blend mode: layer-normalized base term,
            // reduced glow/collapse multipliers so overlapping layers and
            // cursor interaction don't blow out to white.
            const a = AURORA_INTENSITY * BASE_ALPHA_SCALE * layerNorm *
                (0.12 + 0.85 * Math.pow(clamp01(1-y01), 1.4)) *
                (1 + GLOW_BOOST_SCALE*touch + 0.6*knotGlow + 0.6*cursorGlowBoost) *
                (1.0 + COLLAPSE_ALPHA_SCALE*collapseAmount) *
                rayAlpha;

            stroke(col[0], col[1], col[2], a);
            if (prevX !== null) line(prevX, prevY, x, yy);
            prevX = x; prevY = yy;
        }
    }
}