// Aurora Borealis — v0 visual prototype
// Noise-driven flowing curtains

// '''SERVER: python3 -m http.server 8000'''

let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noFill();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// '''Colour Helper Functions'''
function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }
  
  function smooth01(x) {
    // smoothstep(0..1)
    x = clamp01(x);
    return x * x * (3 - 2 * x);
  }
  
  function tri01(x) {
    // triangle wave: 0..1..0 across x in [0,1]
    x = x - Math.floor(x); // fract
    return 1 - Math.abs(2 * x - 1);
  }
  
  function mixRGB(a, b, t) {
    return [
      lerp(a[0], b[0], t),
      lerp(a[1], b[1], t),
      lerp(a[2], b[2], t),
    ];
  }
// '''Colour Helper Functions End'''

function draw() {
  // slow fade for trails
  background(7, 10, 18, 20);

  t += 0.004;

  const wind = map(mouseX, 0, width, -1, 1);
  const activity = 0.5 + 0.5 * noise(t * 0.6);

  const layers = 4;
  for (let L = 0; L < layers; L++) {
    const z = L / (layers - 1);
    drawCurtain(z, wind, activity);
  }
}

function drawCurtain(z, wind, activity) {
    const baseY = height * (0.15 + 0.08 * z);
    const ampX = width * (0.15 + 0.1 * (1 - z));
    const ampY = height * (0.2 + 0.15 * (1 - z));
  
    // strokeWeight(1.2 + 2.5 * (1 - z));
    strokeWeight(0.9 + 1.8 * (1 - z));
  
    const cols = 80;
    const stepY = 8;
  
    for (let i = 0; i < cols; i++) {
      let prevX = null;
      let prevY = null;
  
      for (let y = 0; y < height; y += stepY) {
        const y01 = y / height;
  
        const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);
  
        const x =
          (i / cols) * width +
          (n - 0.5) * ampX +
          wind * 120 * (1 - y01);
  
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
        const blue  = [0, 170, 255];    // deeper electric blue/cyan
        const lilac = [235, 80, 255];   // light magenta / purple

        // --- choose band size ~ 10 "bins" worth of ribbons
        const bandSize = Math.max(6, Math.round(cols / 10)); // keep your cols; just derives a band width

        // --- band coordinate
        const bandPos = i / bandSize;          // increases by 1 each band
        const bandFrac = bandPos - Math.floor(bandPos); // 0..1 within band

        // --- smoothly alternate between 2-colour and 3-colour mode every band
        // modeBlend ~ 0 => 2-colour band, modeBlend ~ 1 => 3-colour band, smooth between them
        const alt = 0.5 + 0.5 * Math.sin(Math.PI * bandPos);   // flips sign each band
        const modeBlend = smooth01(alt);

        // --- lilac amount within a 3-colour band: 0 -> max -> 0
        const lilacRamp = tri01(bandFrac);

        // You can set the maximum lilac share here (0.33 matches your "33% each" idea)
        const maxLilac = 0.50;

        // Final lilac weight: only present when modeBlend~1, and ramps within that band
        const wL = maxLilac * modeBlend * lilacRamp;

        // Remaining weight split between green and blue.
        // (This matches your examples: green and blue equal when lilac is present.)
        const wGB = 1 - wL;
        let wG = 0.5 * wGB;
        let wB = 0.5 * wGB;

        // OPTIONAL: keep your existing vertical bias (top more blue) very subtly:
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

  function auroraColour(z, y01, activity) {
    const c1 = [90, 255, 140]; // green
    const c2 = [60, 220, 255]; // cyan
  
    // Depth influence (subtle)
    const depthMix = 0.2 + 0.55 * z;
  
    // Height influence (stronger): top more cyan
    // const heightMix = 0.45 * (1 - y01);
    const heightMix = 0.55 * Math.pow(1 - y01, 1.6);

  
    // Activity influence (tiny)
    const actMix = 0.1 * activity;
  
    const u = constrain(depthMix + heightMix + actMix, 0, 1);
  
    return [
      lerp(c1[0], c2[0], u),
      lerp(c1[1], c2[1], u),
      lerp(c1[2], c2[2], u),
    ];
  }
  

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
