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

// --- STAR FIELD ---
let stars = [];
let starClusters = [];
const STAR_COUNT = 1000;
const CLUSTER_COUNT = 4;
let starTime = 0;
let shootingStars = [];
let meteorTrails = [];
const SHOOTING_STAR_CHANCE = 0.005;
const MAX_SHOOTING_STARS = 2;
let raysEnabled = true;
let auroraKnots = [];
const MAX_KNOTS = 4;
const KNOT_SPAWN_CHANCE = 0.05;
let interactionMode = "magneticVortex";
const AURORA_INTENSITY = 0.9;

// --- PALETTE CONTROL ---
let auroraPalette = "classic";

const PALETTES = {

    classic: {
        green: [0, 255, 110],      // aurora green
        blue: [0, 150, 255],       // cyan-blue
        lilac: [255, 0, 220]       // vivid violet-magenta
    },

    violetStorm: {
        green: [80, 255, 120],     // bright spring green
        blue: [0, 70, 255],        // deep storm blue
        lilac: [255, 0, 255]       // saturated violet
    },

    arcticBlue: {
        green: [180, 255, 160],    // pale mint
        blue: [0, 220, 255],       // icy cyan
        lilac: [120, 60, 255]      // cold indigo-violet
    },

    solarFlare: {
        green: [255, 245, 70],     // plasma yellow
        blue: [255, 110, 0],       // solar orange
        lilac: [255, 0, 150]       // hot flare pink
    },

    deepSpace: {
        green: [0, 255, 140],      // emerald plasma
        blue: [20, 40, 255],       // deep space blue
        lilac: [255, 0, 240]       // nebula magenta
    },

    // cosmic / aurora
    emeraldStorm: {
        green: [0, 255, 90],       // intense aurora green
        blue: [0, 120, 255],       // electric blue
        lilac: [255, 0, 200]       // magenta-violet accent
    },

    neonNebula: {
        green: [0, 255, 220],      // bright aqua
        blue: [80, 0, 255],        // neon purple-blue
        lilac: [255, 0, 120]       // acid pink
    },

    arcticIce: {
        green: [200, 255, 210],    // frosted mint
        blue: [0, 210, 255],       // glacial cyan
        lilac: [90, 0, 255]        // cold ultraviolet
    },

    deepAurora: {
        green: [0, 255, 150],      // aurora emerald
        blue: [0, 60, 255],        // midnight electric blue
        lilac: [255, 0, 255]       // high-energy violet
    },

    // dreamy / pastel
    dreamLavender: {
        green: [220, 255, 170],    // pastel lime-mint
        blue: [120, 190, 255],     // soft sky blue
        lilac: [255, 120, 230]     // lavender-pink
    },

    cottonCandy: {
        green: [255, 210, 120],    // peach candy
        blue: [100, 210, 255],     // baby blue
        lilac: [255, 60, 220]      // candy magenta
    },

    synthwave: {
        green: [255, 80, 40],      // hot red-orange
        blue: [80, 0, 255],        // laser purple
        lilac: [255, 0, 150]       // neon pink
    },

    // experimental / alien
    ionStorm: {
        green: [180, 255, 0],      // charged lime
        blue: [0, 255, 220],       // ion cyan
        lilac: [0, 70, 255]        // electric blue
    },

    plasmaArc: {
        green: [255, 255, 80],     // arc yellow
        blue: [255, 120, 0],       // molten orange
        lilac: [255, 0, 40]        // hot red-pink
    },

    alienSky: {
        green: [0, 255, 130],      // alien green
        blue: [180, 0, 255],       // ultraviolet purple
        lilac: [255, 255, 80]      // strange yellow flare
    },

    supernova: {
        green: [255, 240, 70],     // superheated yellow
        blue: [255, 90, 0],        // blast orange
        lilac: [255, 0, 220]       // stellar magenta
    },

    gammaBurst: {
        green: [0, 255, 200],      // teal burst
        blue: [0, 30, 255],        // gamma blue
        lilac: [255, 0, 255]       // violent violet
    },

    auroraUltra: {
        green: [0, 255, 100],      // classic green
        blue: [0, 200, 255],       // strong cyan
        lilac: [255, 0, 180]       // sharp magenta
    },

    toxicIon: {
        green: [170, 255, 0],      // toxic lime
        blue: [0, 255, 120],       // radioactive teal
        lilac: [0, 90, 255]        // chemical blue
    },

    cosmicFire: {
        green: [255, 255, 120],   // intense solar yellow
        blue: [255, 150, 0],      // bright plasma orange
        lilac: [160, 0, 0]        // deep crimson
    },

    prismaticShock: {
        green: [0, 255, 0],      // pure neon green
        blue: [255, 0, 0],       // pure red
        lilac: [0, 120, 255]     // electric blue
    },
    
    acidRainbow: {
        green: [180, 255, 0],    // acid lime
        blue: [0, 255, 255],     // bright cyan
        lilac: [255, 0, 0]       // fire red
    },
    
    ultravioletStorm: {
        green: [0, 255, 120],    // emerald
        blue: [255, 140, 0],     // strong orange
        lilac: [120, 0, 255]     // ultraviolet purple
    },
    
    toxicSunset: {
        green: [0, 255, 80],     // toxic green
        blue: [255, 200, 0],     // blazing yellow
        lilac: [255, 0, 0]       // sunset red
    },
    
    alienPlasma: {
        green: [0, 255, 200],    // aqua plasma
        blue: [255, 0, 120],     // magenta
        lilac: [255, 255, 0]     // radioactive yellow
    },
    
    laserStorm: {
        green: [255, 0, 255],    // laser magenta
        blue: [0, 255, 0],       // neon green
        lilac: [0, 140, 255]     // intense blue
    },
    
    cosmicCandy: {
        green: [255, 120, 0],    // bright orange
        blue: [0, 255, 255],     // cyan
        lilac: [180, 0, 255]     // violet
    },
    
    gammaFlux: {
        green: [255, 255, 0],    // yellow
        blue: [0, 60, 255],      // deep blue
        lilac: [255, 0, 180]     // hot pink
    },
    
    plasmaCircuit: {
        green: [0, 255, 150],    // turquoise
        blue: [255, 0, 0],       // red
        lilac: [255, 255, 255]   // white plasma
    },
    
    nebulaChaos: {
        green: [0, 255, 80],     // emerald
        blue: [255, 80, 0],      // molten orange
        lilac: [0, 120, 255]     // deep sky blue
    }
};

// const PALETTES = {

//     classic: {
//         green: [40, 255, 120],
//         blue: [0, 170, 255],
//         lilac: [235, 80, 255]
//     },

//     violetStorm: {
//         green: [80, 255, 180],
//         blue: [90, 120, 255],
//         lilac: [255, 80, 255]
//     },

//     arcticBlue: {
//         green: [120, 255, 200],
//         blue: [0, 200, 255],
//         lilac: [150, 120, 255]
//     },

//     solarFlare: {
//         green: [255, 250, 120],
//         blue: [255, 90, 10],
//         lilac: [255, 0, 170]
//     },

//     deepSpace: {
//         green: [60, 255, 140],     // vivid emerald
//         blue: [40, 90, 255],       // deep cosmic blue
//         lilac: [255, 60, 240]      // bright nebula magenta
//     },
    
//     // cosmic / aurora
//     emeraldStorm: {
//         green: [0, 255, 120],      // intense aurora green
//         blue: [0, 140, 255],       // electric blue
//         lilac: [210, 40, 255]      // sharp violet
//     },
    
//     neonNebula: {
//         green: [0, 255, 200],      // cyan plasma
//         blue: [120, 0, 255],       // deep neon purple
//         lilac: [255, 0, 170]       // hot pink
//     },
    
//     arcticIce: {
//         green: [120, 255, 230],    // icy turquoise
//         blue: [0, 200, 255],       // glacial blue
//         lilac: [180, 120, 255]     // cold lavender
//     },
    
//     deepAurora: {
//         green: [0, 255, 160],      // bright aurora green
//         blue: [0, 80, 255],        // deep polar blue
//         lilac: [255, 0, 220]       // energetic violet
//     },
    
//     // dreamy / pastel
//     dreamLavender: {
//         green: [200, 255, 210],    // mint glow
//         blue: [140, 170, 255],     // pastel sky blue
//         lilac: [255, 110, 255]     // luminous lavender
//     },
    
//     cottonCandy: {
//         green: [255, 160, 220],    // pink candy base
//         blue: [120, 200, 255],     // soft baby blue
//         lilac: [255, 80, 240]      // vivid cotton candy magenta
//     },
    
//     synthwave: {
//         green: [255, 40, 120],     // retro pink-red
//         blue: [80, 0, 255],        // synth purple
//         lilac: [255, 0, 200]       // neon magenta
//     },
    
//     // experimental / alien
//     ionStorm: {
//         green: [120, 255, 0],      // ion green
//         blue: [0, 255, 200],       // electric cyan
//         lilac: [0, 120, 255]       // charged plasma blue
//     },
    
//     plasmaArc: {
//         green: [255, 255, 80],     // solar yellow
//         blue: [255, 120, 0],       // burning orange
//         lilac: [255, 0, 120]       // flare pink
//     },
    
//     alienSky: {
//         green: [0, 255, 150],      // alien emerald
//         blue: [200, 0, 255],       // ultraviolet purple
//         lilac: [80, 255, 220]      // strange aqua
//     },

//     supernova: {
//         green: [255, 240, 60],   // stellar yellow
//         blue: [255, 90, 0],      // supernova orange
//         lilac: [255, 0, 200]     // explosion magenta
//     },
    
//     gammaBurst: {
//         green: [0, 255, 180],    // intense teal
//         blue: [0, 60, 255],      // deep gamma blue
//         lilac: [255, 0, 255]     // violent purple
//     },
    
//     auroraUltra: {
//         green: [0, 255, 120],    // classic aurora green
//         blue: [0, 200, 255],     // icy electric blue
//         lilac: [255, 0, 220]     // energetic violet
//     },
    
//     toxicIon: {
//         green: [140, 255, 0],    // toxic neon green
//         blue: [0, 255, 120],     // bright ion teal
//         lilac: [0, 140, 255]     // alien blue
//     },
    
//     cosmicFire: {
//         green: [255, 200, 0],    // solar gold
//         blue: [255, 80, 0],      // plasma orange
//         lilac: [255, 0, 120]     // flare pink
//     }

// };


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
    makeStars();
    createControls();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    makeStars();
}

function createControls() {
    const panel = createDiv();
    panel.id("controls");
    panel.position(20, 20);
    panel.style("padding", "12px 14px");
    panel.style("background", "rgba(10, 12, 20, 0.65)");
    panel.style("border", "1px solid rgba(255,255,255,0.12)");
    panel.style("border-radius", "12px");
    panel.style("backdrop-filter", "blur(8px)");
    panel.style("color", "white");
    panel.style("font-family", "sans-serif");
    panel.style("font-size", "14px");
    panel.style("z-index", "10");
    panel.style("box-shadow", "0 6px 24px rgba(0,0,0,0.25)");

    const raysRow = createDiv();
    raysRow.parent(panel);
    raysRow.style("display", "flex");
    raysRow.style("align-items", "center");
    raysRow.style("gap", "8px");

    const raysCheckbox = createCheckbox("", raysEnabled);
    raysCheckbox.parent(raysRow);
    raysCheckbox.changed(() => {
        raysEnabled = raysCheckbox.checked();
    });

    const raysLabel = createSpan("Fine vertical rays");
    raysLabel.parent(raysRow);

    const paletteRow = createDiv();
    paletteRow.parent(panel);
    paletteRow.style("margin-top", "8px");

    const paletteLabel = createSpan("Palette ");
    paletteLabel.parent(paletteRow);

    const paletteSelect = createSelect();
    paletteSelect.parent(paletteRow);

    paletteSelect.option("classic");
    paletteSelect.option("violetStorm");
    paletteSelect.option("arcticBlue");
    paletteSelect.option("solarFlare");
    paletteSelect.option("deepSpace");
    paletteSelect.option("emeraldStorm");
    paletteSelect.option("neonNebula");
    paletteSelect.option("arcticIce");
    paletteSelect.option("deepAurora");
    paletteSelect.option("dreamLavender");
    paletteSelect.option("cottonCandy");
    paletteSelect.option("synthwave");
    paletteSelect.option("ionStorm");
    paletteSelect.option("plasmaArc");
    paletteSelect.option("alienSky");
    paletteSelect.option("supernova");
    paletteSelect.option("gammaBurst");
    paletteSelect.option("auroraUltra");
    paletteSelect.option("toxicIon");
    paletteSelect.option("cosmicFire");
    paletteSelect.option("Prismatic Shock", "prismaticShock");
    paletteSelect.option("Acid Rainbow", "acidRainbow");
    paletteSelect.option("Ultraviolet Storm", "ultravioletStorm");
    paletteSelect.option("Toxic Sunset", "toxicSunset");
    paletteSelect.option("Alien Plasma", "alienPlasma");
    paletteSelect.option("Laser Storm", "laserStorm");
    paletteSelect.option("Cosmic Candy", "cosmicCandy");
    paletteSelect.option("Gamma Flux", "gammaFlux");
    paletteSelect.option("Plasma Circuit", "plasmaCircuit");
    paletteSelect.option("Nebula Chaos", "nebulaChaos");


    paletteSelect.value(auroraPalette);

    paletteSelect.changed(() => {
        auroraPalette = paletteSelect.value();
    });

    const interactionRow = createDiv();
    interactionRow.parent(panel);
    interactionRow.style("margin-top", "8px");

    const interactionLabel = createSpan("Cursor ");
    interactionLabel.parent(interactionRow);

    const interactionSelect = createSelect();
    interactionSelect.parent(interactionRow);

    interactionSelect.option("Off", "off");
    interactionSelect.option("Push Lift", "pushLift");
    interactionSelect.option("Magnetic Vortex", "magneticVortex");
    interactionSelect.option("Attractor", "attractor");
    interactionSelect.option("Shockwave", "shockwave");
    interactionSelect.option("Ignition", "ignition");

    interactionSelect.value(interactionMode);

    interactionSelect.changed(() => {
        interactionMode = interactionSelect.value();
    });
}

function makeStars() {
    stars = [];
    starClusters = [];

    // Main stars
    for (let i = 0; i < STAR_COUNT; i++) {
        const depth = random();
        const layer = random() < 0.82 ? "back" : "front";
        const sharp = random() < 0.22;
        const hero = sharp && random() < 0.18;

        stars.push({
            x: random(width),
            y: random(height * 0.92),
            r: random(0.5, 2.2) * (0.7 + 0.6 * depth),
            baseAlpha: random(30, 120),
            phase: random(TWO_PI),
            speed: random(0.01, 0.05),
            drift: random(0.3, 1.2),
            depth: depth,
            layer: layer,
            sharp: sharp,
            hero: hero
        });
    }

    // Faint clustered background stars
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

            // keep clusters mainly in the sky area
            if (x < 0 || x > width || y < 0 || y > height * 0.8) continue;

            const depth = random(0.0, 0.4);

            stars.push({
                x: x,
                y: y,
                r: random(0.3, 1.0),
                baseAlpha: random(10, 40),
                phase: random(TWO_PI),
                speed: random(0.008, 0.03),
                drift: random(0.2, 0.8),
                depth: depth,
                layer: "back",
                clustered: true
            });
        }
    }
}

function drawStarSparkle(x, y, size, alpha) {
    stroke(255, 255, 255, alpha);
    strokeWeight(0.8);

    // vertical
    line(x, y - size, x, y + size);

    // horizontal
    line(x - size, y, x + size, y);

    // optional subtle diagonals for nicer sparkle
    stroke(255, 255, 255, alpha * 0.6);
    line(x - size * 0.7, y - size * 0.7, x + size * 0.7, y + size * 0.7);
    line(x + size * 0.7, y - size * 0.7, x - size * 0.7, y + size * 0.7);
}

function getStarOffset(s) {
    const mx = map(mouseX, 0, width, -1, 1);
    const my = map(mouseY, 0, height, -1, 1);

    // nearer stars move more
    let parallaxStrength = 1 + 3 * s.depth;

    // clustered stars sit farther back, so reduce their parallax
    if (s.clustered) {
        parallaxStrength *= 0.35;
    }

    return {
        ox: mx * parallaxStrength,
        oy: my * parallaxStrength * 0.35
    };
}

function drawClusterHaze() {
    noStroke();

    for (const s of stars) {
        if (!s.clustered) continue;

        const { ox, oy } = getStarOffset(s);
        const driftX = 2.0 * sin(frameCount * 0.002 * s.drift + s.phase);
        const driftY = 1.0 * cos(frameCount * 0.0015 * s.drift + s.phase * 0.7);

        const sx = s.x + ox + driftX;
        const sy = s.y + oy + driftY;

        fill(255, 255, 255, 2);
        circle(sx, sy, s.r * 10);
    }
}

function spawnShootingStar() {
    const startX = random(width * 0.15, width * 0.85);
    const startY = random(height * 0.05, height * 0.35);

    const angle = random(PI * 0.15, PI * 0.32); // diagonal down-right
    const speed = random(14, 24);
    const tailLength = random(80, 260);

    const meteorColours = [
        [255, 255, 255],   // white
        [120, 170, 255],   // blue
        [110, 255, 180],   // green
        [255, 180, 120]    // amber
    ];
    const col = random(meteorColours);
    const brightness = random(0.9, 1.15);
    
    shootingStars.push({
        x: startX,
        y: startY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        tailLength: tailLength,
        life: 0,
        maxLife: random(16, 28),
        alpha: random(180, 255),
        colour: [
            col[0] * brightness,
            col[1] * brightness,
            col[2] * brightness
        ]
    });
}

function updateAndDrawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        s.life += 1;
        s.x += s.vx;
        s.y += s.vy;

        meteorTrails.push({
            x: s.x,
            y: s.y,
            vx: s.vx,
            vy: s.vy,
            life: 0,
            maxLife: random(40, 80),
            colour: s.colour
        });

        const life01 = s.life / s.maxLife;
        const fade = 1 - life01;

        const segments = 18;

        for (let j = 0; j < segments; j++) {

            const t1 = j / segments;
            const t2 = (j + 1) / segments;

            const x1 = s.x - s.vx * s.tailLength * t1 * 0.05;
            const y1 = s.y - s.vy * s.tailLength * t1 * 0.05;

            const x2 = s.x - s.vx * s.tailLength * t2 * 0.05;
            const y2 = s.y - s.vy * s.tailLength * t2 * 0.05;

            const alpha = s.alpha * fade * (1 - t1);
            
            const mix = t1; // 0 near head → 1 near tail

            const r = lerp(s.colour[0], 255, mix);
            const g = lerp(s.colour[1], 255, mix);
            const b = lerp(s.colour[2], 255, mix);
            
            stroke(r, g, b, alpha);
            strokeWeight(2.2 * (1 - t1));
            
            line(x1, y1, x2, y2);
        }

        // bright meteor head
        noStroke();
        fill(s.colour[0], s.colour[1], s.colour[2], s.alpha * fade);
        circle(s.x, s.y, 3.6);

        // glow around head
        fill(s.colour[0], s.colour[1], s.colour[2], s.alpha * 0.15 * fade);
        circle(s.x, s.y, 9);

        if (
            s.life >= s.maxLife ||
            s.x > width + 50 ||
            s.y > height + 50
        ) {
            shootingStars.splice(i, 1);
        }
    }
}

function updateAndDrawMeteorTrails() {

    for (let i = meteorTrails.length - 1; i >= 0; i--) {

        const t = meteorTrails[i];
        t.life++;

        const fade = 1 - (t.life / t.maxLife);

        if (fade <= 0) {
            meteorTrails.splice(i, 1);
            continue;
        }

        const length = 8;

        const x1 = t.x;
        const y1 = t.y;

        const x2 = t.x - t.vx * length;
        const y2 = t.y - t.vy * length;

        stroke(
            t.colour[0],
            t.colour[1],
            t.colour[2],
            80 * fade
        );

        strokeWeight(1.2);
        line(x1, y1, x2, y2);
    }
}

function spawnAuroraKnot() {
    auroraKnots.push({
        x: random(width * 0.1, width * 0.9),
        y: random(height * 0.18, height * 0.55),
        vx: random(-0.25, 0.25),
        vy: random(-1.2, -0.4),   // upward drift
        r: random(60, 140),
        life: 0,
        maxLife: random(120, 240),
        strength: random(0.8, 1.4),
        phase: random(TWO_PI)
    });
}

function updateAuroraKnots() {
    if (random() < KNOT_SPAWN_CHANCE && auroraKnots.length < MAX_KNOTS) {
        spawnAuroraKnot();
    }

    for (let i = auroraKnots.length - 1; i >= 0; i--) {
        const k = auroraKnots[i];

        k.life++;
        k.x += k.vx + 0.15 * Math.sin(t * 2 + k.phase);
        k.y += k.vy;

        if (k.life >= k.maxLife || k.y < -100) {
            auroraKnots.splice(i, 1);
        }
    }
}

function drawStars(layerName) {
    noStroke();

    for (const s of stars) {
        if (s.layer !== layerName) continue;

        const { ox, oy } = getStarOffset(s);

        // make clusters drift less
        const driftFactor = s.clustered ? 0.4 : 1.0;

        const driftX = driftFactor * 2.0 * sin(frameCount * 0.002 * s.drift + s.phase);
        const driftY = driftFactor * 1.0 * cos(frameCount * 0.0015 * s.drift + s.phase * 0.7);

        // const { ox, oy } = getStarOffset(s);
        // // const sx = s.x + ox;
        // // const sy = s.y + oy;
        // // add drift sideways ove time
        // const driftX = 2.0 * sin(frameCount * 0.002 * s.drift + s.phase);
        // const driftY = 1.0 * cos(frameCount * 0.0015 * s.drift + s.phase * 0.7);

        const sx = s.x + ox + driftX;
        const sy = s.y + oy + driftY;

        // soft twinkle / breathing fade
        const twinkleBase = s.hero ? 0.50 : (s.sharp ? 0.60 : 0.78);
        const twinkleAmp = s.hero ? 0.85 : (s.sharp ? 0.55 : 0.18);

        const twinkle =
            twinkleBase +
            twinkleAmp *
            (
                0.62 * sin(starTime * s.speed * 60 + s.phase) +
                0.38 * sin(starTime * s.speed * 97 + s.phase * 1.7)
            );

        // slow extra modulation so some feel like they are emerging/receding
        const breathe = 0.82 + 0.18 * sin(starTime * s.speed * 21 + s.phase * 1.7);

        // extra fast scintillation for sharp stars
        let flash = 1.0;
        if (s.sharp) {
            const flicker1 = 0.5 + 0.5 * sin(starTime * (s.speed * 420) + s.phase * 1.9);
            const flicker2 = 0.5 + 0.5 * sin(starTime * (s.speed * 780) + s.phase * 0.7);
            const spike = pow(0.5 + 0.5 * sin(starTime * (s.speed * 1260) + s.phase * 2.3), 6);

            flash = 0.75 + 0.6 * flicker1 * flicker2 + 0.9 * spike;
        }

        let a = s.baseAlpha * twinkle * breathe * flash;
        a = max(0, a);

        if (s.sharp) {
            a *= 1.5;
        }

        // front stars should be fewer and more delicate so they do not overpower the curtain
        if (layerName === "front") {
            a *= 0.55;
        }

        // only hero stars are physically bigger
        const coreScale = s.hero ? 1.8 : 1.0;

        if (s.sharp) {
            noStroke();
            fill(255, 255, 255, a);
            circle(sx, sy, s.r * coreScale);
        } else {
            noStroke();
            fill(255, 255, 255, a);
            circle(sx, sy, s.r);
        }

        if (s.sharp && !s.clustered && a > 25) {
            const sparklePulse = 0.85 + 0.45 * sin(starTime * s.speed * 144 + s.phase);
            const sparkleSize = s.hero
                ? sparklePulse * (3.0 + 2.8 * s.depth)
                : sparklePulse * (2.0 + 2.2 * s.depth);

            drawStarSparkle(sx, sy, sparkleSize, a * 0.95);
        }

        // glow halo for larger / nearer stars
        if (s.r > 1.4) {
            if (s.sharp) {
                fill(255, 255, 255, a * 0.05);
                circle(sx, sy, s.r * (1.5 + 0.5 * s.depth));
            } else {
                fill(255, 255, 255, a * 0.14);
                circle(sx, sy, s.r * (2.4 + 1.2 * s.depth));
            }
        }
    }
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
// // debug function to visualize aurora knot positions and sizes
// function drawAuroraKnotsDebug() {
//     noFill();
//     stroke(255, 80);
//     strokeWeight(1);

//     for (const k of auroraKnots) {
//         circle(k.x, k.y, k.r * 2);
//     }
// }

function draw() {
    // slow fade for trails
    background(7, 10, 18, 20);

    // drawAuroraKnotsDebug();

    starTime += 0.02;
    updateAuroraKnots();

    if (random() < SHOOTING_STAR_CHANCE && shootingStars.length < MAX_SHOOTING_STARS) {
        spawnShootingStar();
    }

    // stars and haze behind the aurora
    drawClusterHaze();
    drawStars("back");

    updateAndDrawShootingStars();
    updateAndDrawMeteorTrails();

    t += 0.004;

    // Keep original mapping (global breeze still responds to cursor x).
    // If I later want the local interaction to dominate, change to -0.4..0.4.
    // const wind = map(mouseX, 0, width, -1, 1);
    // FREEZE MOTION
    // const wind = 0;
    // Make global wind autonomous, no cursor, still gentle:
    const wind = map(noise(t * 0.2), 0, 1, -0.4, 0.4);

    const activity = 0.5 + 0.5 * noise(t * 0.6);

    const layers = 4;
    for (let L = 0; L < layers; L++) {
        const z = L / (layers - 1);
        drawCurtain(z, wind, activity);
    }

    // a few stars in front for depth
    drawStars("front");

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

    // Geometry resolution
    const cols = 150;
    const stepY = 15;

    // Palette
    const palette = PALETTES[auroraPalette];

    const green = palette.green;
    const blue = palette.blue;
    const lilac = palette.lilac;

    // Cursor interaction
    const R = 150;
    const PUSH_X = 10;
    const LIFT_Y = 200;
    const GLOW = 10;

    // Colour-field controls
    const colourScaleX = 0.012;
    const colourScaleY = 0.006;
    const colourTime = t * 0.35;
    const colourRise = t * 5.6;

    // Temporary obvious debug substorm pulse !!!!!! change back
    const collapseAmount = 0.3 + 0.3 * Math.sin(t * 8.0 + z * 2.0);

    for (let i = 0; i < cols; i++) {
        let prevX = null;
        let prevY = null;

        const baseX = (i / cols) * width;

        // Broad x-scale grouping for collapse structure
        const bunch = noise(baseX * 0.004, t * 0.18 + z * 8.0);

        // Column-anchored vertical ray seed
        let raySeed =
            0.72 * noise(baseX * 0.028 + z * 20.0, t * 0.65 + z * 3.0) +
            0.28 * noise(baseX * 0.085 + 200 + z * 7.0, t * 1.3 + z * 5.0);

        raySeed = Math.pow(raySeed, 4.8);

        const rayFlicker =
            0.82 + 0.18 * Math.sin(t * 6.0 + i * 0.21 + z * 4.0);

        const rayColumn = raySeed * rayFlicker;

        for (let y = 0; y < height; y += stepY) {
            const y01 = y / height;

            // --- Cursor interaction ---
            const dx = baseX - mouseX;
            const dy = y - mouseY;
            const d = Math.sqrt(dx * dx + dy * dy);
            
            const influence = clamp01(1 - d / R);
            const touch = Math.pow(influence, 0.6);
            
            let localPushX = 0;
            let localLiftY = 0;
            let cursorBlueBoost = 0;
            let cursorLilacBoost = 0;
            let cursorGlowBoost = 0;
            
            if (interactionMode === "pushLift") {
                localPushX = (dx / (d + 1)) * PUSH_X * touch;
                localLiftY = -LIFT_Y * touch;
            }
            
            if (interactionMode === "attractor") {
                const attractStrength = 80;
                localPushX = -(dx / (d + 1)) * attractStrength * touch;
                localLiftY = -(dy / (d + 1)) * 0.35 * attractStrength * touch;
            }
            
            if (interactionMode === "magneticVortex") {
                const attractStrength = 60;
                const swirlStrength = 90;
            
                const attractX = -(dx / (d + 1)) * attractStrength * touch;
                const attractY = -(dy / (d + 1)) * 0.3 * attractStrength * touch;
            
                const swirlX = (-dy / (d + 1)) * swirlStrength * touch;
                const swirlY = (dx / (d + 1)) * swirlStrength * touch;
            
                localPushX = attractX + swirlX;
                localLiftY = attractY + swirlY;
            
                cursorBlueBoost = 0.35 * touch;
                cursorLilacBoost = 0.25 * touch;
                cursorGlowBoost = 1.8 * touch;
            }
            
            // if (interactionMode === "shockwave") {

            //     // faster travelling wave
            //     const wave = Math.sin(d * 0.06 - t * 14.0);
            
            //     const ring = Math.pow(touch, 1.6);
            //     localLiftY = wave * 130 * ring;

            //     // // strong vertical ripple
            //     // localLiftY = wave * 110 * touch;
            
            //     // sideways distortion
            //     localPushX = wave * 45 * touch;
            
            //     // colour energising
            //     cursorBlueBoost = 0.6 * touch;
            //     cursorLilacBoost = 0.4 * touch;
            
            //     // strong brightness flash
            //     cursorGlowBoost = 2.5 * touch;
            // }
            if (interactionMode === "shockwave") {
                const ringWave = Math.sin(d * 0.08 - t * 18.0);
            
                // narrow bright ring instead of broad wobble
                const ringPulse = Math.pow(Math.max(0, ringWave), 3.5);
            
                localLiftY = 80 * ringPulse * touch;
                localPushX = 35 * ringPulse * touch;
            
                cursorBlueBoost = 0.8 * ringPulse;
                cursorLilacBoost = 0.55 * ringPulse;
                cursorGlowBoost = 2.5 * ringPulse;
            }
            // if (interactionMode === "shockwave") {
            //     const ringWave = Math.sin(d * 0.12 - t * 20.0);
            //     const ringPulse = Math.pow(Math.max(0, ringWave), 4.0);
            
            //     localLiftY = 160 * ringPulse * touch;
            //     localPushX = 60 * ringPulse * touch;
            
            //     cursorBlueBoost = 0.7 * ringPulse;
            //     cursorLilacBoost = 0.45 * ringPulse;
            //     cursorGlowBoost = 4.0 * ringPulse;
            // }

            if (interactionMode === "ignition") {
                localLiftY = -80 * touch;
                cursorBlueBoost = 0.45 * touch;
                cursorLilacBoost = 0.55 * touch;
                cursorGlowBoost = 2.4 * touch;
            }

            // --- Local aurora knot influence ---
            let knotLift = 0;
            let knotGlow = 0;
            let knotLilac = 0;
            let knotBlue = 0;

            for (const k of auroraKnots) {
                const kdx = baseX - k.x;
                const kdy = y - k.y;
                const kd = Math.sqrt(kdx * kdx + kdy * kdy);

                const kInfluence = clamp01(1 - kd / k.r);
                const kTouch = Math.pow(kInfluence, 2.2) * k.strength;

                knotLift += -55 * kTouch;
                knotGlow += 2.6 * kTouch;
                knotLilac += 0.45 * kTouch;
                knotBlue += 0.25 * kTouch;
            }

            // --- Base geometry ---
            const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

            // --- Magnetic curtain collapse / ripple ---
            const collapseHeightMask = Math.pow(1 - y01, 1.1);

            const collapseWave =
                0.5 * Math.sin(baseX * 0.004 + t * 2.8 + i * 0.09 + z * 3.0) +
                0.5 * Math.sin(t * 5.0 + i * 0.22 + z * 4.0);

            const foldWave =
                Math.sin(t * 4.2 + i * 0.16 + y * 0.025 + z * 6.0) +
                0.6 * Math.sin(t * 7.5 + i * 0.08 - y * 0.018 + z * 3.0);

            const combinedWave = 0.7 * collapseWave + 0.3 * foldWave;

            const eventPatch = noise(baseX * 0.01, y * 0.012, t * 0.9 + z * 20.0);
            const patchMask = Math.pow(eventPatch, 3.0);

            const foldStrength =
                collapseAmount *
                collapseHeightMask *
                (0.25 + 0.45 * bunch + 0.65 * patchMask);

            const collapseX = foldStrength * 180 * combinedWave;
            const collapseY = -foldStrength * 130 * Math.abs(combinedWave);

            const x =
                baseX +
                (n - 0.5) * ampX +
                wind * 120 * (1 - y01) +
                localPushX +
                collapseX;

            const yy =
                baseY +
                y +
                localLiftY +
                knotLift +
                collapseY +
                Math.sin(t * 2 + i * 0.15 + y * 0.01) *
                    ampY *
                    0.1 *
                    (0.7 + 0.3 * activity);

            // --- Blotchy colour field with upward drift ---
            const cNoise1 = noise(
                baseX * colourScaleX,
                y * colourScaleY + colourRise,
                colourTime + z * 10
            );
            const cNoise2 = noise(
                baseX * colourScaleX + 100,
                y * colourScaleY + 40 + colourRise * 0.8,
                colourTime + 20 + z * 7
            );
            const cNoise3 = noise(
                baseX * colourScaleX + 200,
                y * colourScaleY + 80 + colourRise * 1.1,
                colourTime + 40 + z * 5
            );

            let wG = smooth01(cNoise1);
            let wB = smooth01(cNoise2);
            let wL = smooth01(cNoise3);

            wG *= 1.00;
            wB *= 0.95 + 0.20 * (1 - y01);
            wL *= 1.20;

            // Cursor injects local lilac energy
            wL += 0.22 * touch + cursorLilacBoost;
            wB += cursorBlueBoost;
            wB += knotBlue;

            const shimmer = 0.85 + 0.15 * Math.sin(t * 3 + y * 0.02 + i * 0.08);
            wB *= shimmer;
            wL *= 1.0 + 0.18 * Math.sin(t * 2.2 + y * 0.015 + i * 0.03);

            // Substorm energises blue/lilac
            wB *= 1.0 + 0.9 * collapseAmount;
            wL *= 1.0 + 1.6 * collapseAmount;

            const wSum = wG + wB + wL + 1e-6;
            wG /= wSum;
            wB /= wSum;
            wL /= wSum;

            const col = [
                green[0] * wG + blue[0] * wB + lilac[0] * wL,
                green[1] * wG + blue[1] * wB + lilac[1] * wL,
                green[2] * wG + blue[2] * wB + lilac[2] * wL,
            ];

            // --- Fine vertical plasma rays ---
            const rayMask = Math.pow(1 - y01, 0.8);

            const rayTexture =
                0.92 + 0.08 * noise(baseX * 0.03 + 500, y * 0.01, t * 0.8 + z * 9.0);

            const rayBoost = 1.0 + 1.2 * collapseAmount;

            let rayAlpha = 1.0;
            if (raysEnabled) {
                rayAlpha =
                    0.55 + 2.4 * rayColumn * rayMask * rayTexture * rayBoost;
            }

            // --- Final alpha ---
            const fade = Math.pow(clamp01(1 - y01), 1.4);
            const glow = GLOW * touch + knotGlow + cursorGlowBoost;
            const substormBoost = 1.0 + 1.6 * collapseAmount;

            const a =
                AURORA_INTENSITY *    
                22 *
                (0.12 + 0.85 * fade) *
                (1 + glow) *
                substormBoost *
                rayAlpha;

            stroke(col[0], col[1], col[2], a);

            if (prevX !== null) {
                line(prevX, prevY, x, yy);
            }

            prevX = x;
            prevY = yy;
        }
    }
}

// function drawCurtain(z, wind, activity) {
//     const baseY = height * (0.15 + 0.08 * z);
//     const ampX = width * (0.15 + 0.1 * (1 - z));
//     const ampY = height * (0.2 + 0.15 * (1 - z));

//     strokeWeight(0.9 + 1.8 * (1 - z));

//     // Your tuned parameters
//     const cols = 150;
//     const stepY = 10;

//     // Palette colours
//     const green = [40, 255, 120];
//     const blue = [0, 170, 255];
//     const lilac = [235, 80, 255];

//     // Cursor interaction tuning knobs
//     const R = 150;
//     const PUSH_X = 10;
//     const LIFT_Y = 200;
//     const GLOW = 10;

//     // Colour-field controls
//     const colourScaleX = 0.012;
//     const colourScaleY = 0.006;
//     const colourTime = t * 0.35;
//     const colourRise = t * 5.6;

//     // Temporary obvious debug substorm pulse
//     const collapseAmount =
//         0.5 + 0.5 * Math.sin(t * 8.0 + z * 2.0);

//     for (let i = 0; i < cols; i++) {
//         let prevX = null;
//         let prevY = null;

//         const baseX = (i / cols) * width;

//         // Broad horizontal bunching field
//         const bunch = noise(baseX * 0.004, t * 0.18 + z * 8.0);

//         // --- Column-anchored vertical ray seed ---
//         // Mostly depends on x, so strands stay vertical
//         let raySeed =
//             0.72 * noise(baseX * 0.028 + z * 20.0, t * 0.65 + z * 3.0) +
//             0.28 * noise(baseX * 0.085 + 200 + z * 7.0, t * 1.3 + z * 5.0);

//         // Sharpen into narrow bright strands
//         raySeed = Math.pow(raySeed, 4.8);

//         // Per-column flicker
//         const rayFlicker =
//             0.82 +
//             0.18 * Math.sin(t * 6.0 + i * 0.21 + z * 4.0);

//         // Final per-column ray strength
//         const rayColumn = raySeed * rayFlicker;

//         for (let y = 0; y < height; y += stepY) {
//             const y01 = y / height;

//             // --- Cursor interaction (local force + local energy) ---
//             const dx = baseX - mouseX;
//             const dy = y - mouseY;
//             const d = Math.sqrt(dx * dx + dy * dy);

//             const influence = clamp01(1 - d / R);
//             const touch = Math.pow(influence, 0.5);

//             const localPushX = (dx / (d + 1)) * PUSH_X * touch;
//             const localLiftY = -LIFT_Y * touch;

//             // Base geometry noise
//             const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

//             // Magnetic curtain collapse / ripple
//             const collapseHeightMask = Math.pow(1 - y01, 1.1);

//             const collapseWave =
//                 0.5 * Math.sin(baseX * 0.004 + t * 2.8 + i * 0.09 + z * 3.0) +
//                 0.5 * Math.sin(t * 5.0 + i * 0.22 + z * 4.0);

//             const foldWave =
//                 Math.sin(t * 4.2 + i * 0.16 + y * 0.025 + z * 6.0) +
//                 0.6 * Math.sin(t * 7.5 + i * 0.08 - y * 0.018 + z * 3.0);

//             const combinedWave = 0.7 * collapseWave + 0.3 * foldWave;

//             const eventPatch = noise(baseX * 0.01, y * 0.012, t * 0.9 + z * 20.0);
//             const patchMask = Math.pow(eventPatch, 3.0);

//             const foldStrength =
//                 collapseAmount *
//                 collapseHeightMask *
//                 (0.4 + 0.6 * patchMask);

//             const collapseX = foldStrength * 180 * combinedWave;
//             const collapseY = -foldStrength * 130 * Math.abs(combinedWave);

//             const x =
//                 baseX +
//                 (n - 0.5) * ampX +
//                 wind * 120 * (1 - y01) +
//                 localPushX +
//                 collapseX;

//             const yy =
//                 baseY +
//                 y +
//                 localLiftY +
//                 collapseY +
//                 Math.sin(t * 2 + i * 0.15 + y * 0.01) *
//                 ampY *
//                 0.1 *
//                 (0.7 + 0.3 * activity);

//             // --- Colour logic: blotchy evolving colour field with upward drift ---
//             const cNoise1 = noise(
//                 baseX * colourScaleX,
//                 y * colourScaleY + colourRise,
//                 colourTime + z * 10
//             );
//             const cNoise2 = noise(
//                 baseX * colourScaleX + 100,
//                 y * colourScaleY + 40 + colourRise * 0.8,
//                 colourTime + 20 + z * 7
//             );
//             const cNoise3 = noise(
//                 baseX * colourScaleX + 200,
//                 y * colourScaleY + 80 + colourRise * 1.1,
//                 colourTime + 40 + z * 5
//             );

//             let wG = smooth01(cNoise1);
//             let wB = smooth01(cNoise2);
//             let wL = smooth01(cNoise3);

//             wG *= 1.00;
//             wB *= 0.95 + 0.20 * (1 - y01);
//             wL *= 1.20;

//             wL += 0.22 * touch;

//             const shimmer = 0.85 + 0.15 * Math.sin(t * 3 + y * 0.02 + i * 0.08);
//             wB *= shimmer;
//             wL *= 1.0 + 0.18 * Math.sin(t * 2.2 + y * 0.015 + i * 0.03);

//             wB *= 1.0 + 0.9 * collapseAmount;
//             wL *= 1.0 + 1.6 * collapseAmount;

//             const wSum = wG + wB + wL + 1e-6;
//             wG /= wSum;
//             wB /= wSum;
//             wL /= wSum;

//             const col = [
//                 green[0] * wG + blue[0] * wB + lilac[0] * wL,
//                 green[1] * wG + blue[1] * wB + lilac[1] * wL,
//                 green[2] * wG + blue[2] * wB + lilac[2] * wL,
//             ];

//             // --- Fine vertical plasma rays ---
//             // Strongest in upper/middle curtain
//             const rayMask = Math.pow(1 - y01, 0.8);

//             // Slight y-variation so rays are not perfectly uniform from top to bottom
//             const rayTexture =
//                 0.92 + 0.08 * noise(baseX * 0.03 + 500, y * 0.01, t * 0.8 + z * 9.0);

//             const rayBoost = 1.0 + 1.2 * collapseAmount;

//             let rayAlpha = 1.0;

//             if (raysEnabled) {
//                 rayAlpha =
//                     0.55 + 2.4 * rayColumn * rayMask * rayTexture * rayBoost;
//             }

//             // Height-based alpha fade + local glow near cursor
//             const fade = Math.pow(clamp01(1 - y01), 1.4);
//             const glow = GLOW * touch;

//             const substormBoost = 1.0 + 3.0 * collapseAmount;

//             const a =
//                 40 *
//                 (0.15 + 0.85 * fade) *
//                 (1 + glow) *
//                 substormBoost *
//                 rayAlpha;

//             stroke(col[0], col[1], col[2], a);

//             if (prevX !== null) {
//                 line(prevX, prevY, x, yy);
//             }

//             prevX = x;
//             prevY = yy;
//         }
//     }
// }

// function drawCurtain(z, wind, activity) {
//     const baseY = height * (0.15 + 0.08 * z);
//     const ampX = width * (0.15 + 0.1 * (1 - z));
//     const ampY = height * (0.2 + 0.15 * (1 - z));

//     strokeWeight(0.9 + 1.8 * (1 - z));

//     // Your tuned parameters
//     const cols = 150;
//     const stepY = 10;

//     // Palette colours
//     const green = [40, 255, 120];
//     const blue = [0, 170, 255];
//     const lilac = [235, 80, 255];

//     // Cursor interaction tuning knobs
//     const R = 150;
//     const PUSH_X = 10;
//     const LIFT_Y = 200;
//     const GLOW = 10;

//     // Colour-field controls
//     const colourScaleX = 0.012;
//     const colourScaleY = 0.006;
//     const colourTime = t * 0.35;
//     const colourRise = t * 5.6;   // vertical colour drift

//     // Slow substorm-like collapse/ripple envelope
//     // temporary stronger debug version for localhost testing
//     const collapseField = noise(t * 0.22 + z * 4.0);
//     const collapseAmount = Math.pow(collapseField, 4.5);

//     // debug
//     // const collapseAmount =
//     //     0.5 + 0.5 * Math.sin(t * 8.0 + z * 2.0);

//     for (let i = 0; i < cols; i++) {
//         let prevX = null;
//         let prevY = null;

//         const baseX = (i / cols) * width;

//         // Broad horizontal bunching field
//         const bunch = noise(baseX * 0.004, t * 0.18 + z * 8.0);

//         for (let y = 0; y < height; y += stepY) {
//             const y01 = y / height;

//             // --- Cursor interaction (local force + local energy) ---
//             const dx = baseX - mouseX;
//             const dy = y - mouseY;
//             const d = Math.sqrt(dx * dx + dy * dy);

//             const influence = clamp01(1 - d / R);
//             const touch = Math.pow(influence, 0.5);

//             const localPushX = (dx / (d + 1)) * PUSH_X * touch;
//             const localLiftY = -LIFT_Y * touch;

//             // Base geometry noise
//             const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

//             // Magnetic curtain collapse / ripple
//             // Stronger in upper-mid curtain, weaker near the bottom
//             const collapseHeightMask = Math.pow(1 - y01, 1.1);

//             // Large-scale folding / bunching
//             const collapseWave =
//                 0.5 * Math.sin(baseX * 0.004 + t * 2.8 + i * 0.09 + z * 3.0) +
//                 0.5 * Math.sin(t * 5.0 + i * 0.22 + z * 4.0);

//             // Fine internal ripple / plasma texture
//             const foldWave =
//                 Math.sin(t * 4.2 + i * 0.16 + y * 0.025 + z * 6.0) +
//                 0.6 * Math.sin(t * 7.5 + i * 0.08 - y * 0.018 + z * 3.0);

//             // Combine both motions
//             const combinedWave = 0.7 * collapseWave + 0.3 * foldWave;


//             const eventPatch = noise(baseX * 0.01, y * 0.012, t * 0.9 + z * 20.0);
//             const patchMask = Math.pow(eventPatch, 3.0);

//             // const foldStrength =
//             //     collapseAmount *
//             //     collapseHeightMask *
//             //     (0.35 + 0.65 * bunch) *
//             //     (0.25 + 1.4 * patchMask);
//             const foldStrength =
//                 collapseAmount *
//                 collapseHeightMask *
//                 (0.4 + 0.6 * patchMask);
                
//             // temporary stronger debug version for localhost testing
//             const collapseX = foldStrength * 120 * combinedWave;
//             const collapseY = -foldStrength * 85 * Math.abs(combinedWave);
//             // const collapseX = foldStrength * 180 * combinedWave;
//             // const collapseY = -foldStrength * 130 * Math.abs(combinedWave);

//             const x =
//                 baseX +
//                 (n - 0.5) * ampX +
//                 wind * 120 * (1 - y01) +
//                 localPushX +
//                 collapseX;

//             const yy =
//                 baseY +
//                 y +
//                 localLiftY +
//                 collapseY +
//                 Math.sin(t * 2 + i * 0.15 + y * 0.01) *
//                 ampY *
//                 0.1 *
//                 (0.7 + 0.3 * activity);

//             // --- Colour logic: blotchy evolving colour field with upward drift ---
//             const cNoise1 = noise(
//                 baseX * colourScaleX,
//                 y * colourScaleY + colourRise,
//                 colourTime + z * 10
//             );
//             const cNoise2 = noise(
//                 baseX * colourScaleX + 100,
//                 y * colourScaleY + 40 + colourRise * 0.8,
//                 colourTime + 20 + z * 7
//             );
//             const cNoise3 = noise(
//                 baseX * colourScaleX + 200,
//                 y * colourScaleY + 80 + colourRise * 1.1,
//                 colourTime + 40 + z * 5
//             );

//             let wG = smooth01(cNoise1);
//             let wB = smooth01(cNoise2);
//             let wL = smooth01(cNoise3);

//             // More lilac than before
//             wG *= 1.00;
//             wB *= 0.95 + 0.20 * (1 - y01);
//             wL *= 1.20;

//             // local cursor energy can still inject lilac
//             wL += 0.22 * touch;

//             // subtle internal colour shimmer
//             const shimmer = 0.85 + 0.15 * Math.sin(t * 3 + y * 0.02 + i * 0.08);
//             wB *= shimmer;
//             wL *= 1.0 + 0.18 * Math.sin(t * 2.2 + y * 0.015 + i * 0.03);

//             // During collapse events, slightly energise blue/lilac
//             wB *= 1.0 + 0.55 * collapseAmount;
//             wL *= 1.0 + 0.95 * collapseAmount;

//             // normalise weights
//             const wSum = wG + wB + wL + 1e-6;
//             wG /= wSum;
//             wB /= wSum;
//             wL /= wSum;

//             const col = [
//                 green[0] * wG + blue[0] * wB + lilac[0] * wL,
//                 green[1] * wG + blue[1] * wB + lilac[1] * wL,
//                 green[2] * wG + blue[2] * wB + lilac[2] * wL,
//             ];

//             // --- Fine vertical plasma rays ---
//             const rayField1 = noise(baseX * 0.045 + z * 30.0, t * 0.9 + y * 0.002);
//             const rayField2 = noise(baseX * 0.09 + 200 + z * 10.0, t * 1.6 + y * 0.004);

//             // combine two scales of vertical structure
//             let rayMix = 0.7 * rayField1 + 0.3 * rayField2;

//             // sharpen into thinner strands
//             rayMix = Math.pow(rayMix, 3.5
//             );

//             // strongest in the upper/middle curtain, weaker near the bottom
//             const rayMask = Math.pow(1 - y01, 0.8);


//             // substorm events energise the rays
//             const rayBoost = 1.0 + 0.9 * collapseAmount;

//             // final ray modulation
//             const rayAlpha = 0.65 + 1.35 * rayMix * rayMask * rayBoost;
//             // const rayAlpha = 0.3 + 3.0 * rayMix;

//             // Height-based alpha fade + local glow near cursor
//             const fade = Math.pow(clamp01(1 - y01), 1.4);
//             const glow = GLOW * touch;

//             // Slight brightening during collapse events
//             const substormBoost = 1.0 + 1.8 * collapseAmount;

//             const a =
//             40 *
//             (0.15 + 0.85 * fade) *
//             (1 + glow) *
//             substormBoost *
//             rayAlpha;

//             stroke(col[0], col[1], col[2], a);

//             if (prevX !== null) {
//                 line(prevX, prevY, x, yy);
//             }

//             prevX = x;
//             prevY = yy;
//         }
//     }
// }




// function drawCurtain(z, wind, activity) {
//     const baseY = height * (0.15 + 0.08 * z);
//     const ampX = width * (0.15 + 0.1 * (1 - z));
//     const ampY = height * (0.2 + 0.15 * (1 - z));

//     strokeWeight(0.9 + 1.8 * (1 - z));

//     // Your tuned parameters
//     const cols = 100;
//     const stepY = 10;

//     // Palette colours
//     const green = [40, 255, 120];
//     const blue = [0, 170, 255];
//     const lilac = [235, 80, 255];

//     // Cursor interaction tuning knobs
//     const R = 150;
//     const PUSH_X = 10;
//     const LIFT_Y = 200;
//     const GLOW = 10;

//     // Colour-field controls
//     const colourScaleX = 0.012;
//     const colourScaleY = 0.006;
//     const colourTime = t * 0.35;

//     for (let i = 0; i < cols; i++) {
//         let prevX = null;
//         let prevY = null;

//         const baseX = (i / cols) * width;

//         for (let y = 0; y < height; y += stepY) {
//             const y01 = y / height;

//             // --- Cursor interaction (local force + local energy) ---
//             const dx = baseX - mouseX;
//             const dy = y - mouseY;
//             const d = Math.sqrt(dx * dx + dy * dy);

//             const influence = clamp01(1 - d / R);
//             const touch = Math.pow(influence, 0.5);

//             const localPushX = (dx / (d + 1)) * PUSH_X * touch;
//             const localLiftY = -LIFT_Y * touch;

//             // Geometry noise
//             const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

//             const x =
//                 baseX +
//                 (n - 0.5) * ampX +
//                 wind * 120 * (1 - y01) +
//                 localPushX;

//             const yy =
//                 baseY +
//                 y +
//                 localLiftY +
//                 sin(t * 2 + i * 0.15 + y * 0.01) *
//                 ampY *
//                 0.1 *
//                 (0.7 + 0.3 * activity);

//             // --- Colour logic: blotchy evolving colour field ---
//             const cNoise1 = noise(baseX * colourScaleX, y * colourScaleY, colourTime + z * 10);
//             const cNoise2 = noise(baseX * colourScaleX + 100, y * colourScaleY + 40, colourTime + 20 + z * 7);
//             const cNoise3 = noise(baseX * colourScaleX + 200, y * colourScaleY + 80, colourTime + 40 + z * 5);

//             let wG = smooth01(cNoise1);
//             let wB = smooth01(cNoise2);
//             let wL = smooth01(cNoise3);

//             // bias toward green overall, with more blue higher up
//             wG *= 0.95;
//             wB *= 0.95 + 0.20 * (1 - y01);
//             wL *= 1.35

//             // local cursor energy can still inject lilac
//             wL += 0.22 * touch;

//             // subtle internal colour shimmer
//             const shimmer = 0.85 + 0.15 * sin(t * 3 + y * 0.02 + i * 0.08);
//             wB *= shimmer;
//             wL *= 0.9 + 0.1 * sin(t * 2.2 + y * 0.015);

//             // normalise weights
//             const wSum = wG + wB + wL + 1e-6;
//             wG /= wSum;
//             wB /= wSum;
//             wL /= wSum;

//             const col = [
//                 green[0] * wG + blue[0] * wB + lilac[0] * wL,
//                 green[1] * wG + blue[1] * wB + lilac[1] * wL,
//                 green[2] * wG + blue[2] * wB + lilac[2] * wL,
//             ];

//             // Height-based alpha fade + local glow near cursor
//             const fade = Math.pow(clamp01(1 - y01), 1.4);
//             const glow = GLOW * touch;
//             const a = 40 * (0.15 + 0.85 * fade) * (1 + glow);
//             stroke(col[0], col[1], col[2], a);

//             if (prevX !== null) {
//                 line(prevX, prevY, x, yy);
//             }

//             prevX = x;
//             prevY = yy;
//         }
//     }
// }

// function drawCurtain(z, wind, activity) {
//     const baseY = height * (0.15 + 0.08 * z);
//     const ampX = width * (0.15 + 0.1 * (1 - z));
//     const ampY = height * (0.2 + 0.15 * (1 - z));

//     strokeWeight(0.9 + 1.8 * (1 - z));

//     // Your tuned parameters
//     const cols = 150;
//     const stepY = 10;

//     // Palette colours (constant for this curtain)
//     const green = [40, 255, 120];
//     const blue = [0, 170, 255];
//     const lilac = [235, 80, 255];

//     // Band settings
//     const bandSize = Math.max(6, Math.round(cols / 10));
//     const maxLilac = 0.50;

//     // Cursor interaction tuning knobs
//     const R = 150;
//     const PUSH_X = 10;
//     const LIFT_Y = 200;
//     const GLOW = 10;

//     for (let i = 0; i < cols; i++) {
//         let prevX = null;
//         let prevY = null;

//         const baseX = (i / cols) * width;

//         // Band coordinate depends only on i (not y)
//         const bandPos = i / bandSize;
//         const bandFrac = bandPos - Math.floor(bandPos);

//         // Alternate between 2-colour and 3-colour mode every band
//         const alt = 0.5 + 0.5 * Math.sin(Math.PI * bandPos);
//         const modeBlend = smooth01(alt);

//         // Lilac amount within a 3-colour band: 0 -> max -> 0
//         const lilacRamp = tri01(bandFrac);

//         // Final lilac weight
//         const wL_base = maxLilac * modeBlend * lilacRamp;

//         for (let y = 0; y < height; y += stepY) {
//             const y01 = y / height;

//             // --- Cursor interaction (local force + local energy) ---
//             const dx = baseX - mouseX;
//             const dy = y - mouseY;
//             const d = Math.sqrt(dx * dx + dy * dy);

//             // Influence strength 0..1
//             const influence = clamp01(1 - d / R);
//             const touch = Math.pow(influence, 0.5);

//             // Local sideways push
//             const localPushX = (dx / (d + 1)) * PUSH_X * touch;

//             // Local upward lift near cursor
//             const localLiftY = -LIFT_Y * touch;

//             // Geometry noise
//             const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);

//             const x =
//                 baseX +
//                 (n - 0.5) * ampX +
//                 wind * 120 * (1 - y01) +
//                 localPushX;

//             const yy =
//                 baseY +
//                 y +
//                 localLiftY +
//                 sin(t * 2 + i * 0.15 + y * 0.01) *
//                 ampY *
//                 0.1 *
//                 (0.7 + 0.3 * activity);

//             // --- Colour logic ---
//             const wL = clamp01(wL_base + 0.25 * touch);
//             const wGB = 1 - wL;

//             let wG = 0.5 * wGB;
//             let wB = 0.5 * wGB;

//             const topBias = 0.18 * (1 - y01);
//             wB = clamp01(wB + topBias);
//             wG = clamp01(wGB - wB);

//             const col = [
//                 green[0] * wG + blue[0] * wB + lilac[0] * wL,
//                 green[1] * wG + blue[1] * wB + lilac[1] * wL,
//                 green[2] * wG + blue[2] * wB + lilac[2] * wL,
//             ];

//             // Height-based alpha fade + local glow near cursor
//             const fade = Math.pow(clamp01(1 - y01), 1.4);
//             const glow = GLOW * touch;
//             const a = 40 * (0.15 + 0.85 * fade) * (1 + glow);
//             stroke(col[0], col[1], col[2], a);

//             if (prevX !== null) {
//                 line(prevX, prevY, x, yy);
//             }

//             prevX = x;
//             prevY = yy;
//         }
//     }
// }