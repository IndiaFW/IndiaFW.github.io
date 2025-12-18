// Aurora Borealis — stable baseline (known-good)

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
  // trailing background for soft motion blur
  background(7, 10, 18, 40);

  // calm evolution
  t += 0.003;

  const wind = map(mouseX, 0, width, -0.6, 0.6);

  const layers = 4;
  for (let L = 0; L < layers; L++) {
    const z = L / (layers - 1);
    drawCurtain(z, wind);
  }

  // tiny on-canvas debug marker (so you *know* draw is running)
  noStroke();
  fill(233, 238, 255, 90);
  circle(18, height - 18, 4);
}

function drawCurtain(z, wind) {
  const baseY = height * (0.15 + 0.08 * z);
  const ampX = width * (0.12 + 0.08 * (1 - z));
  const ampY = height * (0.18 + 0.12 * (1 - z));

  const glowPasses = 2;

  for (let g = 0; g < glowPasses; g++) {
    const alpha = 12 * (1 - g / glowPasses);
    strokeWeight(0.6 + 1.8 * (1 - z));

    const col = auroraColour(z);
    stroke(col[0], col[1], col[2], alpha);

    const cols = 60;
    for (let i = 0; i < cols; i++) {
      beginShape();

      for (let y = 0; y <= height; y += 18) {
        const y01 = y / height;

        const n = noise(i * 0.05, y * 0.01, t + z * 3);

        const x =
          (i / cols) * width +
          (n - 0.5) * ampX +
          wind * 70 * (1 - y01);

        const yy =
          baseY +
          y +
          Math.sin(t * 1.4 + i * 0.12 + y * 0.01) * ampY * 0.09;

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
