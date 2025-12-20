// ==============================
// Aurora Borealis — v0 visual prototype
// ==============================
// Core idea:
//  Draws layered aurora-like curtains using noise-driven vertcal ribbons
//      that drift and shimmer over time
//  Layers are parametrised to give a sense of depth, motion and transparency

// =============================
// SERVER: python3 -m http.server 8000
// =============================


let t = 0;

// --- ZIP FRAME CAPTURE (one-download workflow) ---
let cnv;

let FPS = 5;      // capture rate (not draw rate)
let SECONDS = 5;   // capture duration
let RECORDING = false;

let zip;
let pending = [];
let capturedFrames = 0;
let targetFrames = 0;
let nextCaptureMs = 0;
let zipBlobReady = null;
 

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
    if (typeof JSZip === "undefined") {
        console.error("JSZip not found. Did you add the JSZip script tag?");
        return;
    }
    if (!cnv) {
        console.error("Canvas not initialised yet.");
        return;
    }

    zip = new JSZip();
    pending = [];
    capturedFrames = 0;
    targetFrames = Math.max(1, Math.round(FPS * SECONDS));
    nextCaptureMs = millis(); // start immediately
    RECORDING = true;

    console.log(`ZIP capture started: ${targetFrames} frames @ ${FPS} fps`);
}

function finishZipCapture() {
    RECORDING = false;

    Promise.all(pending)
        .then(() => zip.generateAsync({ type: "blob", compression: "STORE" }))
        .then((blob) => {
            zipBlobReady = blob;
            console.log("ZIP ready. Press D to download.");
        })
        .catch((err) => console.error("ZIP capture error:", err));
}

function captureFrameToZip() {
    const frameIndex = capturedFrames; // lock index for async

    const p = new Promise((resolve, reject) => {
        cnv.elt.toBlob(
            (blob) => {
                if (!blob) return reject(new Error("toBlob returned null"));
                const name = `aurora_${String(frameIndex).padStart(4, "0")}.png`;
                zip.file(name, blob);
                resolve();
            },
            "image/png"
        );
    });

    pending.push(p);
}

function keyPressed() {
    if (key === "r" || key === "R") {
        if (!RECORDING) startZipCapture();
    }

    if (key === "d" || key === "D") {
        if (zipBlobReady) {
            downloadBlob(zipBlobReady, "aurora_frames.zip");
            zipBlobReady = null;
            console.log("ZIP download triggered.");
        } else {
            console.log("No ZIP ready yet.");
        }
    }
}




function setup() {
    ////Full canvas for regular display
    cnv = createCanvas(windowWidth, windowHeight);
    ////Change canvas size for gif capture
    // cnv = createCanvas(900, 500);
    pixelDensity(1);
    noFill();
}

// p5 callback: keeps the  canvas matched to the browser window size, 
// e.g., when user stretches window
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ==============================
// Colour Helper Functions
// =============================

// Forces numbers into the range 0-1. Important as in the aurora, many things are
// treated as weights or fractions, which only make sense between 0-1.
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}

// Smoothly remaps a value [0,1] using a smoothstep curve.
// Inputs and outputs are both in [0,1] (clamp01), but changes are
// gradual near 0 and 1, producing softer transitions.
function smooth01(x) {
    // smoothstep(0..1)
    x = clamp01(x);
    return x * x * (3 - 2 * x);
}

// Remaps a value using a repeating triangle wave
// Answers "How close am I to the centre of this repeating unit/colour band?"
// Math.floor throws away the integer part of the unit
// Output peaks at the centre of each unit interval and falls to 0 at edges
// --> Making it useful for emphasising middle of a band and fading towards boundaries
function tri01(x) {
    // triangle wave: 0..1..0 across x in [0,1]
    x = x - Math.floor(x); // fract
    return 1 - Math.abs(2 * x - 1);
}

// UNUSED for now
// Helper function for simple 2-colour RGB blending
// function mixRGB(a, b, t) {
//     return [
//         lerp(a[0], b[0], t),
//         lerp(a[1], b[1], t),
//         lerp(a[2], b[2], t),
//     ];
// }
// '''Colour Helper Functions End'''

function draw() {
    // slow fade for trails
    // background (R, G, B, Alpha), Alpha controls trail length
    background(7, 10, 18, 20);

    // advance global time paramter. Affects:
    // - Perlin noise sampling in drawCurtain()
    // - sine shimmer term in yy
    t += 0.004;

    // Map horizontal cursor positionj to a global wind strength
    // wind representes global horizontal force applied to aurora ribbons
    // mouseX ∈ [0,width] → wind ∈ [-1,1] where:
    // -1 = full left, 0 = neutral, 1 = full right
    const wind = map(mouseX, 0, width, -1, 1);

    // Compute a slow, smooth "activity" value using Perlin noise.
    // noise(t * 0.6) produces a gently drifting value in [0,1]
    // This is remapped to [0.5,1] to avoid fully inactive/low activity states
    // NB: ONLY CONTROLS SUBTLE VERTICAL SHIMMER AMPLITUDE
    const activity = 0.5 + 0.5 * noise(t * 0.6);

    // Draw multiple aurora "curtain" layers to build up depth.
    // Each curtain uses same logic but is parametrised by z (0..1)
    // to create depth, parallax, transparency effects, and motion variation.
    const layers = 4;
    for (let L = 0; L < layers; L++) {
        const z = L / (layers - 1);
        drawCurtain(z, wind, activity);
    }
    // --- ZIP capture timing (runs during draw) ---
    if (RECORDING) {
        const intervalMs = 1000 / FPS;

        let safety = 0;
        while (
            capturedFrames < targetFrames &&
            millis() >= nextCaptureMs &&
            safety < 3
        ) {
            captureFrameToZip();
            capturedFrames++;
            nextCaptureMs += intervalMs;
            safety++;
        }

        if (capturedFrames >= targetFrames) {
            console.log("Capture complete, zipping...");
            finishZipCapture();
        }
    }
}

function drawCurtain(z, wind, activity) {
    // Vertical offset for the layer (slight separation between curtains)
    const baseY = height * (0.15 + 0.08 * z);
    // Horizontal noise amplitude: front layers (z) move more, back layers less
    const ampX = width * (0.15 + 0.1 * (1 - z));
    // Vertical shimmer amplitude: front layers wobble more, back layers less
    const ampY = height * (0.2 + 0.15 * (1 - z));

    // Line thickness as depth cute: front layers thicker, back layers thinner
    // strokeWeight(1.2 + 2.5 * (1 - z));
    strokeWeight(0.9 + 1.8 * (1 - z));

    // No. vertical ribbons across canvas (detail vs perfornmance, prev 80)
    const cols = 150;
    // Vertical step size (pixels) when tracing each ribbon downwards (smoothness vs performance)
    const stepY = 10;

    // Track previous point so we cna draw ribbon as connecting segments
    for (let i = 0; i < cols; i++) {
        // Track previous point so we cna draw ribbon as connecting segments  
        let prevX = null;
        let prevY = null;

        for (let y = 0; y < height; y += stepY) {
            // Normalised height (0 at top --> 1 at bottom)
            const y01 = y / height;

            // 3D Perlin noise sample (ribbon index, vertical pos, time + layer offset)
            const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

            // Horizontal position:
            // - base ribbon position across width
            // - noise-drvien sideways displacement
            // - gloval wind push (stronger near the top))
            const x =
                (i / cols) * width +
                (n - 0.5) * ampX +
                wind * 120 * (1 - y01);

            // Vertical position:
            // - baseline sweep dowwards (baseY + y)
            // - plus a subtle sine-based shimmer (animated + phase-shifted across ribbons)
            const yy =
                baseY +
                y +
                sin(t * 2 + i * 0.15 + y * 0.01) *
                ampY *
                0.1 *
                (0.7 + 0.3 * activity);

            // // Height-based colour (cyan higher up, greener lower down)
            // const col = auroraColour(z, y01, activity);
            // // stable 
            // // stroke(col[0], col[1], col[2], 40);
            // --- palette colours muted
            // const green = [90, 255, 140];
            // const blue  = [60, 220, 255];
            // const lilac = [200, 150, 255];
            // --- palette colours more vibrant
            const green = [40, 255, 120];   // punchy neon green
            const blue = [0, 170, 255];    // deeper electric blue/cyan
            const lilac = [235, 80, 255];   // light magenta / purple

            // --- choose band size ~ 10 "bins" worth of ribbons
            const bandSize = Math.max(6, Math.round(cols / 10)); // keep  cols; just derives a band width

            // --- band coordinate
            const bandPos = i / bandSize;          // increases by 1 each band
            const bandFrac = bandPos - Math.floor(bandPos); // 0..1 within band

            // --- smoothly alternate between 2-colour and 3-colour mode every band
            // modeBlend ~ 0 => 2-colour band, modeBlend ~ 1 => 3-colour band, smooth between them
            const alt = 0.5 + 0.5 * Math.sin(Math.PI * bandPos);   // flips sign each band
            const modeBlend = smooth01(alt);

            // --- lilac amount within a 3-colour band: 0 -> max -> 0
            const lilacRamp = tri01(bandFrac);

            // Set the maximum lilac share here (0.33 matches "33% each" idea)
            const maxLilac = 0.50;

            // Final lilac weight: only present when modeBlend~1, and ramps within that band
            const wL = maxLilac * modeBlend * lilacRamp;

            // Remaining weight split between green and blue.
            // (This matches examples: green and blue equal when lilac is present.)
            const wGB = 1 - wL;
            let wG = 0.5 * wGB;
            let wB = 0.5 * wGB;

            // OPTIONAL: keep  existing vertical bias (top more blue) very subtly:
            const topBias = 0.18 * (1 - y01); // 0..0.18
            wB = clamp01(wB + topBias);
            wG = clamp01(wGB - wB);

            // Mix colours
            let col = [
                green[0] * wG + blue[0] * wB + lilac[0] * wL,
                green[1] * wG + blue[1] * wB + lilac[1] * wL,
                green[2] * wG + blue[2] * wB + lilac[2] * wL,
            ];

            // // Allows fade
            const v = 1 - y01;                           // 1 at top → 0 at bottom
            const vv = Math.max(0, Math.min(1, v));      // clamp 0..1
            const fade = Math.pow(vv, 1.4);              // curve
            const a = 40 * (0.15 + 0.85 * fade);         // NEVER goes to 0
            stroke(col[0], col[1], col[2], a);



            if (prevX !== null) {
                line(prevX, prevY, x, yy);
            }

            prevX = x;
            prevY = yy;
        }
    }
}

// function auroraColour(z, y01, activity) {
//     const c1 = [90, 255, 140]; // green
//     const c2 = [60, 220, 255]; // cyan

//     // Depth influence (subtle)
//     const depthMix = 0.2 + 0.55 * z;

//     // Height influence (stronger): top more cyan
//     // const heightMix = 0.45 * (1 - y01);
//     const heightMix = 0.55 * Math.pow(1 - y01, 1.6);


//     // Activity influence (tiny)
//     const actMix = 0.1 * activity;

//     const u = constrain(depthMix + heightMix + actMix, 0, 1);

//     return [
//         lerp(c1[0], c2[0], u),
//         lerp(c1[1], c2[1], u),
//         lerp(c1[2], c2[2], u),
//     ];
// }


// Aurora colour, stable v0
// function auroraColour(z, activity) {
//   // classic green → cyan
//   const c1 = [90, 255, 140];
//   const c2 = [60, 220, 255];
//   const u = constrain(0.2 + 0.65 * z + 0.1 * activity, 0, 1);
//   return [
//     lerp(c1[0], c2[0], u),
//     lerp(c1[1], c2[1], u),
//     lerp(c1[2], c2[2], u),
//   ];
// }
