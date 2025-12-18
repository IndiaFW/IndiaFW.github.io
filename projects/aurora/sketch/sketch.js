// Aurora Borealis — stable baseline (known good)

let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noFill();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(7, 10, 18, 40);
  t += 0.003;

  const wind = map(mouseX, 0, width, -0.6, 0.6);
  const activity = 0.6;

  const layers = 4;
  for (let L = 0; L < layers; L++) {
    const z = L / (layers - 1);
    drawCurtain(z, wind, activity);
  }
}

function drawCurtain(z, wind, activity) {
    const baseY = height * (0.15 + 0.08 * z);
    const ampX  = width  * (0.12 + 0.08 * (1 - z));
    const ampY  = height * (0.18 + 0.12 * (1 - z));
  
    const glowPasses = 3;
  
    for (let g = 0; g < glowPasses; g++) {
      const glowStrength = 1 - g / glowPasses;
      const alphaBase = 28 * glowStrength;
      strokeWeight(1.4 + 2.0 * (1 - z));
  
      const cols = 70;
      for (let i = 0; i < cols; i++) {
        beginShape();
  
        for (let y = 0; y < height; y += 16) {
          // 0 at top → 1 at bottom
          const y01 = y / height;
  
          // Vertical fade: brighter near top, fades toward bottom
          // (clamp + curved fade, using Math to avoid p5 helper pitfalls)
          const v  = 1 - y01; // 1 at top → 0 at bottom
          const vv = Math.max(0, Math.min(1, v));
          const fade = Math.pow(vv, 1.6);
  
          // Slight colour gradient with height:
          // top = more cyan, bottom = more green (subtle)
          const u = Math.max(0, Math.min(1, 0.25 + 0.55 * z + 0.25 * (1 - y01)));
          const c = auroraColourU(u);
  
          // Noise-driven curtain geometry
          const n = noise(i * 0.05, y * 0.01, t + z * 3);
  
          const x =
            (i / cols) * width +
            (n - 0.5) * ampX +
            wind * 80 * (1 - y01);
  
          const yy =
            baseY +
            y +
            Math.sin(t * 1.4 + i * 0.12 + y * 0.01) * ampY * 0.1;
  
          // Apply per-point colour + alpha (fade)
          stroke(c[0], c[1], c[2], alphaBase * fade);
  
          curveVertex(x, yy);
        }
  
        endShape();
      }
    }
  }
  

  function auroraColourU(u) {
    // u: 0..1, green → cyan
    const c1 = [90, 255, 140];
    const c2 = [60, 220, 255];
    const uu = Math.max(0, Math.min(1, u));
    return [
      lerp(c1[0], c2[0], uu),
      lerp(c1[1], c2[1], uu),
      lerp(c1[2], c2[2], uu),
    ];
  }
  
  // Keep this if other parts still call auroraColour(z)
  function auroraColour(z) {
    return auroraColourU(0.3 + 0.6 * z);
  }
  