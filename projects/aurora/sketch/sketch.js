// ==============================
// Aurora Borealis — v0 visual prototype
// ==============================
// Core idea:
//  Draws layered aurora-like curtains using noise-driven vertical ribbons
//      that drift and shimmer over time.
//  Layers are parametrised to give a sense of depth, motion and transparency.

// =============================
// SERVER: python3 -m http.server 8000
// =============================

let t = 0;

// --- ZIP FRAME CAPTURE (one-download workflow) ---
let cnv;

let FPS = 5;      // capture rate (not draw rate)
let SECONDS = 5;  // capture duration
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
    cnv = createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    noFill();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function clamp01(x) {
    return Math.max(0, Math.min(1, x));
}

function smooth01(x) {
    x = clamp01(x);
    return x * x * (3 - 2 * x);
}

function tri01(x) {
    x = x - Math.floor(x); // fractional part
    return 1 - Math.abs(2 * x - 1);
}

function draw() {
    // slow fade for trails
    background(7, 10, 18, 20);

    t += 0.004;

    // Keep  original mapping (global breeze still responds to cursor x).
    // If I later want the local interaction to dominate, change to -0.4..0.4.
    // const wind = map(mouseX, 0, width, -1, 1);
    // FREEZE MOTION
    // const wind =0;
    //Make global wind autonomous, no cursor, still gentle:
    const wind = map(noise(t * 0.2), 0, 1, -0.4, 0.4);

    const activity = 0.5 + 0.5 * noise(t * 0.6);

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
    const baseY = height * (0.15 + 0.08 * z);
    const ampX = width * (0.15 + 0.1 * (1 - z));
    const ampY = height * (0.2 + 0.15 * (1 - z));

    strokeWeight(0.9 + 1.8 * (1 - z));

    // Your tuned parameters
    const cols = 150;
    const stepY = 10;

    // Palette colours (constant for this curtain)
    const green = [40, 255, 120];   // punchy neon green
    const blue = [0, 170, 255];     // deeper electric blue/cyan
    const lilac = [235, 80, 255];   // light magenta / purple

    // Band settings
    const bandSize = Math.max(6, Math.round(cols / 10)); // derives a band width
    const maxLilac = 0.50;

    // Cursor interaction tuning knobs
    const R = 150;          // radius of influence (px)
    const PUSH_X = 200;     // sideways push strength (px-ish)
    const LIFT_Y = 200;     // upward lift strength (px-ish)
    const GLOW = 10;       // alpha boost near cursor (0..~1)

    for (let i = 0; i < cols; i++) {
        let prevX = null;
        let prevY = null;

        const baseX = (i / cols) * width;

        // Band coordinate depends only on i (not y)
        const bandPos = i / bandSize;                   // increases by 1 each band
        const bandFrac = bandPos - Math.floor(bandPos); // 0..1 within band

        // Alternate between 2-colour and 3-colour mode every band
        const alt = 0.5 + 0.5 * Math.sin(Math.PI * bandPos);
        const modeBlend = smooth01(alt);

        // Lilac amount within a 3-colour band: 0 -> max -> 0 (peaks in band centre)
        const lilacRamp = tri01(bandFrac);

        // Final lilac weight: only present when modeBlend~1, and ramps within that band
        const wL_base = maxLilac * modeBlend * lilacRamp;

        for (let y = 0; y < height; y += stepY) {
            const y01 = y / height;

            // --- Cursor interaction (local force + local energy) ---
            const dx = baseX - mouseX;
            const dy = y - mouseY;
            const d = Math.sqrt(dx * dx + dy * dy);

            // Influence strength 0..1 (1 near cursor, 0 far away)
            const influence = clamp01(1 - d / R);
            // const touch = smooth01(influence); // soften the falloff
            // Softer, more diffuse
            // const touch = influence * influence;
            // Sharper, more aggressive
            const touch = Math.pow(influence, 0.5);



            // Local sideways push: ribbons near the cursor are pushed away
            const localPushX = (dx / (d + 1)) * PUSH_X * touch;

            // Local upward lift near cursor
            const localLiftY = -LIFT_Y * touch;

            // Geometry noise
            const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

            const x =
                baseX +
                (n - 0.5) * ampX +
                wind * 120 * (1 - y01) +
                localPushX;

            const yy =
                baseY +
                y +
                localLiftY +
                sin(t * 2 + i * 0.15 + y * 0.01) *
                ampY *
                0.1 *
                (0.7 + 0.3 * activity);

            // --- Colour logic (with optional local "energy" boost) ---

            // Boost lilac locally near cursor (subtle energy injection)
            const wL = clamp01(wL_base + 0.25 * touch);
            const wGB = 1 - wL;

            // Split remaining weight equally, then apply subtle vertical blue bias (top more blue)
            let wG = 0.5 * wGB;
            let wB = 0.5 * wGB;

            const topBias = 0.18 * (1 - y01); // 0..0.18
            wB = clamp01(wB + topBias);
            wG = clamp01(wGB - wB);

            const col = [
                green[0] * wG + blue[0] * wB + lilac[0] * wL,
                green[1] * wG + blue[1] * wB + lilac[1] * wL,
                green[2] * wG + blue[2] * wB + lilac[2] * wL,
            ];

            // Height-based alpha fade (never fully zero) + local glow near cursor
            const fade = Math.pow(clamp01(1 - y01), 1.4);
            const glow = GLOW * touch;
            const a = 40 * (0.15 + 0.85 * fade) * (1 + glow);
            stroke(col[0], col[1], col[2], a);

            if (prevX !== null) {
                line(prevX, prevY, x, yy);
            }

            prevX = x;
            prevY = yy;
        }
    }
}
