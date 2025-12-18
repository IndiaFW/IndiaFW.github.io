// Aurora Borealis — v0 visual prototype
// Noise-driven flowing curtains

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
  // slow fade for trails
  background(7, 10, 18, 40);

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

  strokeWeight(1.2 + 2.5 * (1 - z));

  const col = auroraColour(z, activity);
  stroke(col[0], col[1], col[2], 40);

  const cols = 80;
  for (let i = 0; i < cols; i++) {
    beginShape();
    for (let y = 0; y < height; y += 14) {
      const n = noise(i * 0.06, y * 0.01, t * 1.2 + z * 3);
      const x =
        (i / cols) * width +
        (n - 0.5) * ampX +
        wind * 120 * (1 - y / height);

      const yy =
        baseY +
        y +
        sin(t * 2 + i * 0.15 + y * 0.01) * ampY * 0.1;

      curveVertex(x, yy);
    }
    endShape();
  }
}

function auroraColour(z, activity) {
  // green → cyan aurora palette
  const c1 = [90, 255, 140];
  const c2 = [60, 220, 255];
  const u = constrain(0.3 + 0.5 * z + 0.2 * activity, 0, 1);
  return [
    lerp(c1[0], c2[0], u),
    lerp(c1[1], c2[1], u),
    lerp(c1[2], c2[2], u),
  ];
}
