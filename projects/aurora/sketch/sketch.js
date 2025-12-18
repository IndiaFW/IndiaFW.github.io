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
  const ampX = width * (0.12 + 0.08 * (1 - z));
  const ampY = height * (0.18 + 0.12 * (1 - z));

  const glowPasses = 3;

  for (let g = 0; g < glowPasses; g++) {
    const alpha = 28 * (1 - g / glowPasses);
    strokeWeight(1.4 + 2.0 * (1 - z));

    const col = auroraColour(z);
    stroke(col[0], col[1], col[2], alpha);

    const cols = 70;
    for (let i = 0; i < cols; i++) {
      beginShape();
      for (let y = 0; y < height; y += 16) {
        const n = noise(i * 0.05, y * 0.01, t + z * 3);

        const x =
          (i / cols) * width +
          (n - 0.5) * ampX +
          wind * 80 * (1 - y / height);

        const yy =
          baseY +
          y +
          sin(t * 1.4 + i * 0.12 + y * 0.01) *
            ampY *
            0.1;

        curveVertex(x, yy);
      }
      endShape();
    }
  }
}

function auroraColour(z) {
  const c1 = [90, 255, 140];
  const c2 = [60, 220, 255];
  const u = constrain(0.3 + 0.6 * z, 0, 1);

  return [
    lerp(c1[0], c2[0], u),
    lerp(c1[1], c2[1], u),
    lerp(c1[2], c2[2], u),
  ];
}
