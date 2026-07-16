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

// --- CINEMATIC INTRO ---
// On load: sky is dark, stars fade/twinkle in first, then a "spark" knot
// ignites at screen centre and the aurora curtains rise up from low on the
// horizon into their normal position as they fade in. All driven off
// millis() since setup(), no extra draw loop needed.
let introStartMs = 0;
const INTRO_STAR_DURATION = 1800;        // ms for stars to fully fade in
const INTRO_AURORA_DELAY = 700;          // ms before aurora starts appearing
const INTRO_AURORA_RISE_DURATION = 3200; // ms for aurora to fully fade/rise in
let starIntroMult = 1;
let auroraIntroMult = 1;

// --- LETTER FORMATION ---
// After the intro settles, the curtain columns temporarily snap toward a
// pre-rendered text shape (built once via an offscreen canvas — see
// buildLetterMask()), hold there, then dissolve back into normal flow.
// letterFormMix drives the blend: 0 = pure organic curtain, 1 = fully
// formed letters. Press "L" at any time to replay the sequence immediately.
let letterMaskData = null;
let letterSequenceStartMs = 0;
const LETTER_WORD = "Bring Back Fingering!";
const LETTER_START_DELAY = 5500;     // ms after load before letters start forming
const LETTER_FORM_DURATION = 2600;   // ms to snap into the word
const LETTER_HOLD_DURATION = 2200;   // ms to hold the fully-formed word
const LETTER_DISSOLVE_DURATION = 3000; // ms to release back into normal flow
let letterFormMix = 0;

// Double-tap on touch devices replays the letter sequence, mirroring the
// "L" key on desktop (keyPressed never fires on touch-only devices).
let lastTapMs = 0;
const DOUBLE_TAP_WINDOW_MS = 400;

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

function touchStarted(event) {
    // Let taps on the controls panel (palette/interaction dropdowns, rays
    // checkbox) behave like normal page UI — don't hijack them as canvas
    // pointer input, and don't preventDefault, or mobile browsers won't
    // open the native <select> dropdown.
    if (event && event.target && event.target.closest && event.target.closest('#controlsWrapper')) {
        return;
    }

    if (touches.length > 0) {
        pointerTargetX = touches[0].x;
        pointerTargetY = touches[0].y;
        pointerActive = true;

        const now = millis();
        if (now - lastTapMs < DOUBLE_TAP_WINDOW_MS) {
            letterSequenceStartMs = now; // double-tap replays the letter formation
            lastTapMs = 0; // avoid a fast third tap immediately re-triggering
        } else {
            lastTapMs = now;
        }
    }
    return false;
}

function touchMoved(event) {
    if (event && event.target && event.target.closest && event.target.closest('#controlsWrapper')) {
        return;
    }

    if (touches.length > 0) {
        pointerTargetX = touches[0].x;
        pointerTargetY = touches[0].y;
        pointerActive = true;
    }
    return false;
}

function touchEnded(event) {
    if (event && event.target && event.target.closest && event.target.closest('#controlsWrapper')) {
        return;
    }

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
    if (key === "l" || key === "L") {
        letterSequenceStartMs = millis(); // replay the letter formation immediately
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

    // --- Cinematic intro kickoff ---
    // Record the start time so draw() can compute fade/rise progress, and
    // seed one extra-strong "ignition" knot at screen centre. It reuses the
    // exact same knot physics as the normal ambient knots (lift/glow/colour
    // boost, natural fade via life/maxLife) so no new rendering code is
    // needed — it just rides on top of the existing aurora system as the
    // spark the curtains visibly form around.
    introStartMs = millis();
    auroraKnots.push({
        x: width * 0.5,
        y: height * 0.35,
        vx: 0,
        vy: -0.25,
        r: 260,
        life: 0,
        maxLife: 230,
        strength: 1.9,
        phase: 0
    });

    letterMaskData = buildLetterMask(LETTER_WORD);
    letterSequenceStartMs = millis() + LETTER_START_DELAY;

    // No createControls() — controls live in index.html
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    detectDeviceProfile();
    resetPointerToCentre();
    makeStars();
    letterMaskData = buildLetterMask(LETTER_WORD);
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
        fill(255, 255, 255, 2 * starIntroMult);
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
        a *= starIntroMult;

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

// Renders `word` to an offscreen graphics buffer once, then samples it at
// LETTER_MASK_SAMPLES evenly-spaced x positions across the canvas. For each
// sampled column, records the vertical extent (yMin/yMax) of "lit" pixels —
// or null if that column has no letter there (i.e. it's in a gap between/
// around letters). This is the only place any pixel-reading happens; the
// per-frame draw loop just does cheap array lookups against the result.
const LETTER_MASK_SAMPLES = 240;

function buildLetterMask(word) {
    const pg = createGraphics(width, height);
    pg.pixelDensity(1);
    pg.background(0);
    pg.fill(255);
    pg.noStroke();
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textFont('sans-serif');

    // Size relative to the smaller dimension. On desktop (wide, short)
    // that's height, which is what we had before. On mobile portrait
    // (narrow, tall), sizing off height alone would make the word render
    // far wider than the screen — so on mobile we size off width instead.
    const sizeBasis = isMobileLayout ? width : height;
    let textSizePx = sizeBasis * (isMobileLayout ? 0.16 : 0.28);
    pg.textSize(textSizePx);

    // On mobile, wrap the phrase onto multiple lines instead of forcing it
    // onto one — the old approach (single line + shrink-to-fit) made long
    // phrases like "Bring Back Fingering!" shrink to an illegibly thin
    // squiggle on narrow screens. Desktop keeps a single line since it
    // already has room.
    const maxWidth = width * 0.88;
    const lines = isMobileLayout ? wrapTextToLines(pg, word, maxWidth) : [word];

    // Auto-fit: if the longest line still overflows canvas width at this
    // size (can happen on very narrow phones, or with a single very long
    // word that can't be split), scale every line down together until it
    // fits with a small margin.
    let maxLineWidth = 0;
    for (const ln of lines) maxLineWidth = Math.max(maxLineWidth, pg.textWidth(ln));
    if (maxLineWidth > maxWidth) {
        textSizePx *= maxWidth / maxLineWidth;
        pg.textSize(textSizePx);
    }

    const lineHeight = textSizePx * 1.15;
    const blockHeight = lineHeight * lines.length;
    const centerY = height * (isMobileLayout ? 0.34 : 0.38);
    const startY = centerY - blockHeight / 2 + lineHeight / 2;

    for (let li = 0; li < lines.length; li++) {
        pg.text(lines[li], width * 0.5, startY + li * lineHeight);
    }

    pg.loadPixels();

    // Build per-column bands rather than a single yMin/yMax span — with
    // multiple text lines, one column can now pass through more than one
    // line, and a single min/max would draw a solid bar filling the gap
    // between them. A run of "lit" pixels ends a band once it hits a gap
    // taller than a couple of sample steps (GAP_TOLERANCE).
    const GAP_TOLERANCE = 6;
    const mask = [];
    for (let s = 0; s < LETTER_MASK_SAMPLES; s++) {
        const px = Math.min(width - 1, Math.floor((s / LETTER_MASK_SAMPLES) * width));
        const bands = [];
        let bandStart = null, lastOn = null;
        for (let py = 0; py < height; py += 2) {
            const idx = (py * width + px) * 4;
            const on = pg.pixels[idx] > 128;
            if (on) {
                if (bandStart === null) bandStart = py;
                lastOn = py;
            } else if (bandStart !== null && py - lastOn > GAP_TOLERANCE) {
                bands.push({ yMin: bandStart, yMax: Math.max(lastOn, bandStart + 8) });
                bandStart = null;
            }
        }
        if (bandStart !== null) {
            bands.push({ yMin: bandStart, yMax: Math.max(lastOn, bandStart + 8) });
        }

        if (bands.length === 0) {
            mask.push(null);
        } else {
            const totalLength = bands.reduce((sum, b) => sum + (b.yMax - b.yMin), 0);
            mask.push({ x: px, bands, totalLength });
        }
    }

    pg.remove();
    return { samples: LETTER_MASK_SAMPLES, mask };
}

// Greedily packs words onto lines that fit within maxWidth, measured using
// the graphics buffer's current font/size. A single word longer than
// maxWidth on its own is still placed alone on a line (it'll be caught by
// the auto-fit shrink step in buildLetterMask rather than being split).
function wrapTextToLines(pg, phrase, maxWidth) {
    const words = phrase.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        const candidate = current ? current + ' ' + word : word;
        if (pg.textWidth(candidate) > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// Cheap per-column lookup used inside drawCurtain — maps a curtain column's
// baseX to the nearest pre-sampled mask column.
function getLetterMaskCell(baseX) {
    if (!letterMaskData) return null;
    const idx = clamp01(baseX / width) * (letterMaskData.samples - 1);
    return letterMaskData.mask[Math.round(idx)];
}

function draw() {
    background(7, 10, 18, 20);
    updatePointer();
    starTime += 0.02;
    updateAuroraKnots();

    // --- Cinematic intro progress ---
    // starIntroMult ramps 0→1 over INTRO_STAR_DURATION ms; auroraIntroMult
    // waits INTRO_AURORA_DELAY ms then ramps 0→1 over
    // INTRO_AURORA_RISE_DURATION ms. Both are smooth01'd for an eased
    // fade rather than a linear one. After the intro finishes both settle
    // at 1 and have zero further effect on the running sketch.
    const introElapsed = millis() - introStartMs;
    starIntroMult = smooth01(introElapsed / INTRO_STAR_DURATION);
    const auroraElapsed = Math.max(0, introElapsed - INTRO_AURORA_DELAY);
    auroraIntroMult = smooth01(auroraElapsed / INTRO_AURORA_RISE_DURATION);

    // --- Letter formation timeline ---
    // Piecewise: 0 before start → eased ramp up → held at 1 → eased ramp
    // down → 0 forever after (until "L" is pressed to replay).
    const letterElapsed = millis() - letterSequenceStartMs;
    if (letterElapsed < 0) {
        letterFormMix = 0;
    } else if (letterElapsed < LETTER_FORM_DURATION) {
        letterFormMix = smooth01(letterElapsed / LETTER_FORM_DURATION);
    } else if (letterElapsed < LETTER_FORM_DURATION + LETTER_HOLD_DURATION) {
        letterFormMix = 1;
    } else if (letterElapsed < LETTER_FORM_DURATION + LETTER_HOLD_DURATION + LETTER_DISSOLVE_DURATION) {
        const dissolveElapsed = letterElapsed - LETTER_FORM_DURATION - LETTER_HOLD_DURATION;
        letterFormMix = 1 - smooth01(dissolveElapsed / LETTER_DISSOLVE_DURATION);
    } else {
        letterFormMix = 0;
    }

    if (random() < SHOOTING_STAR_CHANCE && shootingStars.length < MAX_SHOOTING_STARS && starIntroMult > 0.6)
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
    // Rise-in: while the aurora is still igniting, push the curtain's base
    // position down toward the horizon; as auroraIntroMult approaches 1 it
    // eases up into its normal resting height. Purely additive to the
    // existing per-layer baseY offset, so layer spacing is unaffected.
    const riseOffset = height * 0.32 * (1 - auroraIntroMult);
    const baseY = height * (0.15 + 0.08 * z) + riseOffset;
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

        // Only look up the letter mask when the sequence is actually running
        // — this keeps the normal running cost identical to before, since
        // letterFormMix sits at 0 the vast majority of the time.
        const letterCell = letterFormMix > 0.001 ? getLetterMaskCell(baseX) : null;
        let prevBandIdx = -1; // tracks which text-line band this column's line was last in

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

            // Knot influence, with a cheap squared-distance early-exit. Most
            // points on screen are far outside any knot's radius, so skipping
            // the sqrt()/pow() work for those points (the common case) avoids
            // most of the cost this loop used to have — especially relevant
            // now that the intro briefly runs an extra, large-radius knot.
            // (This is purely a distance-culling optimization — it doesn't
            // change sampling resolution or introduce banding, unlike the
            // noise-holding change we tried and reverted earlier.)
            let knotLift = 0, knotGlow = 0, knotLilac = 0, knotBlue = 0;
            for (const k of auroraKnots) {
                const dxk = baseX - k.x, dyk = y - k.y;
                const kd2 = dxk * dxk + dyk * dyk;
                const kr2 = k.r * k.r;
                if (kd2 > kr2) continue; // outside influence radius — skip sqrt/pow entirely
                const kd = Math.sqrt(kd2);
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

            // Coherent traveling wave: unlike the noise fields above (which
            // are organic but directionless), this sin term has an x-minus-t
            // phase, so it visibly propagates sideways through the curtain
            // over time rather than just wobbling in place. Layered in at a
            // modest weight under the existing noise detail — it's a subtle
            // "current" pulling the whole curtain rather than a dominant motion.
            const travelWave = Math.sin(baseX * 0.006 - t * 10.0 + z * 2.0);

            const x = baseX +
                (n - 0.5) * ampX +
                wind * 120 * (1 - y01) +
                localPushX +
                foldStrength * 180 * combinedWave +
                travelWave * 6 * (1 - y01 * 0.4) +
                (noise(i * 0.4, y * 0.05, t * 2.0) - 0.5) * 6;

            const yy = baseY + y + localLiftY + knotLift +
                (-foldStrength * 130 * Math.abs(combinedWave)) +
                Math.sin(t * 2 + i * 0.15 + y * 0.01) * ampY * 0.1 * (0.7 + 0.3 * activity);

            // --- Letter formation blend ---
            // When active, columns that fall within a letter's shape get
            // pulled toward a target position tracing that letter's stroke.
            // A column can now have multiple disjoint bands (e.g. it passes
            // through two different text lines) — y01 (0..1 across the full
            // canvas) is mapped proportionally along the concatenated bands
            // by total length, so rows distribute across both lines rather
            // than all collapsing into one. letterBreak flags when this row
            // landed in a different band than the previous row, so the
            // connecting stroke doesn't bridge across the gap between lines.
            let finalX = x, finalY = yy;
            let letterBreak = false;
            if (letterCell) {
                const posAlong = y01 * letterCell.totalLength;
                let cumulative = 0;
                let bandIdx = letterCell.bands.length - 1;
                let chosenBand = letterCell.bands[bandIdx];
                let localT = 1;
                for (let bi = 0; bi < letterCell.bands.length; bi++) {
                    const b = letterCell.bands[bi];
                    const bLen = b.yMax - b.yMin;
                    if (posAlong <= cumulative + bLen) {
                        chosenBand = b;
                        bandIdx = bi;
                        localT = bLen > 0 ? clamp01((posAlong - cumulative) / bLen) : 0;
                        break;
                    }
                    cumulative += bLen;
                }

                const targetX = letterCell.x;
                const targetY = lerp(chosenBand.yMin, chosenBand.yMax, localT) + z * 6;
                finalX = lerp(x, targetX, letterFormMix);
                finalY = lerp(yy, targetY, letterFormMix);

                if (prevBandIdx !== -1 && bandIdx !== prevBandIdx && letterFormMix > 0.5) {
                    letterBreak = true;
                }
                prevBandIdx = bandIdx;
            } else {
                prevBandIdx = -1;
            }

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
            // cursor interaction don't blow out to white. Final auroraIntroMult
            // factor is what makes the whole curtain fade in from nothing at
            // load — everything else is unchanged from the running sketch.
            const a = AURORA_INTENSITY * BASE_ALPHA_SCALE * layerNorm *
                (0.12 + 0.85 * Math.pow(clamp01(1-y01), 1.4)) *
                (1 + GLOW_BOOST_SCALE*touch + 0.6*knotGlow + 0.6*cursorGlowBoost) *
                (1.0 + COLLAPSE_ALPHA_SCALE*collapseAmount) *
                rayAlpha *
                auroraIntroMult *
                (letterCell ? (1 + 1.2 * letterFormMix) : (1 - 0.85 * letterFormMix));

            stroke(col[0], col[1], col[2], a);
            if (prevX !== null && !letterBreak) line(prevX, prevY, finalX, finalY);
            prevX = finalX; prevY = finalY;
        }
    }
}