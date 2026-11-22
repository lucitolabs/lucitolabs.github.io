// The Lucito Labs "Kulak" splash, the same timeline as the apps' studio intro (scenes/ui/studio_intro.gd).
// Plays once per tab session; ?splash forces it, a click or key skips to the exit.
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  let seen = false;
  try { seen = sessionStorage.getItem("ll-splash") === "1"; } catch (_) {}
  if (seen && !params.has("splash")) { root.classList.add("is-ready"); return; }
  root.classList.add("has-splash");

  const PURPLE = "#6c5ce7", LAVENDER = "#a29bfe", INK = "#e8e6f5", BG = "#0a0d1a";
  const BLOOM = 0, EAR = 0.9, WORD = 1.3, HOLD = 2.1, EXIT = 2.6, DURATION = 3.0, REDUCED_HOLD = 1.0;
  const TILE = 300, UNIT = TILE / 96;
  const EYES = [[58.5, 34.5], [75.5, 34.5]], EYE_DIAMETER = 13;
  const GLOW_SIZE = 1040, GLOW_STOP = 0.62 * GLOW_SIZE * 0.5 * Math.SQRT2;
  const WORD_TOP = 1020, WORD_SIZE = 120, LETTER_SPACING = -0.04 * WORD_SIZE, WORD_GAP = 0.24 * WORD_SIZE;
  const WORDS = [["lucito", 700, INK], ["labs", 500, LAVENDER]];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  const progress = (now, a, b) => clamp01((now - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const outCubic = (now, a, b, from, to) => { const p = progress(now, a, b) - 1; return lerp(from, to, p * p * p + 1); };
  const outBack = (now, a, b, from, to) => { const p = progress(now, a, b) - 1; return lerp(from, to, 1 + 2.70158 * p * p * p + 1.70158 * p * p); };
  const inOutSine = (now, a, b, from, to) => lerp(from, to, -(Math.cos(Math.PI * progress(now, a, b)) - 1) * 0.5);

  let view, g, layer, art, W = 0, H = 0, dpr = 1, scale = 1, ox = 0, oy = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    view.width = layer.width = Math.round(W * dpr);
    view.height = layer.height = Math.round(H * dpr);
    scale = Math.min(W / 1080, H / 1300);
    ox = W / 2 - 540 * scale;
    oy = H / 2 - 960 * scale;
  }

  function frame(c, t) {
    const grow = inOutSine(t, EXIT, DURATION, 1, 1.08);
    c.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr);
    c.translate(540, 960);
    c.scale(grow, grow);
    c.translate(-540, -960);
  }

  function roundRect(c, x, y, w, h, radii) {
    c.beginPath();
    c.roundRect(x, y, w, h, radii.map((r) => Math.max(0, r)));
    c.fill();
  }

  function tileSpace(t, tileY) {
    frame(art, t);
    const tilt = -7 * Math.sin(inOutSine(t, EAR, EAR + 0.4, 0, 1) * Math.PI);
    art.translate(540, tileY);
    art.rotate((tilt * Math.PI) / 180);
    art.translate(-TILE / 2, -TILE / 2);
  }

  function drawTile(t, tileY) {
    const bloom = outBack(t, BLOOM + 0.2, BLOOM + 0.8, 0, 1);
    if (bloom > 0) {
      tileSpace(t, tileY);
      const px = 67 * UNIT, py = 34.5 * UNIT;
      art.translate(px * (1 - bloom), py * (1 - bloom));
      art.scale(bloom, bloom);
      const ear = outBack(t, EAR, EAR + 0.35, 0, 1);
      const big = 30 * UNIT;
      art.fillStyle = PURPLE;
      roundRect(art, 0, 0, TILE, TILE, [big, big + (6 * UNIT - big) * ear, big, big]);
    }
    art.fillStyle = "#fff";
    const drop = outCubic(t, BLOOM + 0.45, BLOOM + 0.85, 0, 1);
    if (drop > 0) {
      tileSpace(t, tileY);
      art.translate(0, 22 * UNIT * (1 - drop));
      art.scale(1, drop);
      roundRect(art, 26 * UNIT, 22 * UNIT, 16 * UNIT, 52 * UNIT, Array(4).fill(8 * UNIT));
    }
    const reach = outCubic(t, BLOOM + 0.6, BLOOM + 0.95, 0, 1);
    if (reach > 0) {
      tileSpace(t, tileY);
      art.translate(26 * UNIT * (1 - reach), 0);
      art.scale(reach, 1);
      roundRect(art, 26 * UNIT, 58 * UNIT, 46 * UNIT, 16 * UNIT, Array(4).fill(8 * UNIT));
    }
    const blink = 1 - 0.85 * Math.sin(inOutSine(t, HOLD + 0.15, HOLD + 0.45, 0, 1) * Math.PI);
    art.fillStyle = LAVENDER;
    EYES.forEach(([ex, ey], i) => {
      const start = BLOOM + 0.12 * i;
      const pop = outBack(t, start, start + 0.4, 0, 1);
      if (pop <= 0) return;
      tileSpace(t, tileY);
      art.translate(ex * UNIT, ey * UNIT);
      art.scale(pop, pop * blink);
      art.beginPath();
      art.arc(0, 0, EYE_DIAMETER * 0.5 * UNIT, 0, Math.PI * 2);
      art.fill();
    });
  }

  function drawWord(t) {
    frame(art, t);
    art.font = `700 ${WORD_SIZE}px Sora`;
    const m = art.measureText("l");
    const ascent = m.fontBoundingBoxAscent, descent = m.fontBoundingBoxDescent;
    const baseline = WORD_TOP + (WORD_SIZE - ascent - descent) * 0.5 + ascent;
    const advance = (weight, ch) => { art.font = `${weight} ${WORD_SIZE}px Sora`; return art.measureText(ch).width + LETTER_SPACING; };
    const widths = WORDS.map(([w, weight]) => [...w].reduce((s, ch) => s + advance(weight, ch), 0));
    let x = (1080 - widths[0] - WORD_GAP - widths[1]) * 0.5;
    let index = 0;
    for (const [w, weight, color] of WORDS) {
      for (const ch of w) {
        const start = WORD + 0.1 + index * 0.04;
        const rise = outCubic(t, start, start + 0.5, 70, 0);
        const opacity = inOutSine(t, start, start + 0.3, 0, 1);
        const step = advance(weight, ch);
        if (opacity > 0) {
          art.globalAlpha = opacity;
          art.fillStyle = color;
          art.fillText(ch, x, baseline + rise);
          art.globalAlpha = 1;
        }
        x += step;
        index++;
      }
      x += WORD_GAP;
    }
  }

  function draw(t) {
    const exitOpacity = inOutSine(t, EXIT, DURATION, 1, 0);
    const tileY = outCubic(t, WORD, WORD + 0.7, 960, 800);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, view.width, view.height);
    const glow = outCubic(t, BLOOM + 0.2, BLOOM + 1.0, 0, 1) * exitOpacity;
    if (glow > 0) {
      frame(g, t);
      const grad = g.createRadialGradient(540, tileY, 0, 540, tileY, GLOW_STOP);
      grad.addColorStop(0, "rgba(108,92,231,0.55)");
      grad.addColorStop(1, "rgba(108,92,231,0)");
      g.globalAlpha = glow;
      g.fillStyle = grad;
      g.fillRect(540 - GLOW_SIZE / 2, tileY - GLOW_SIZE / 2, GLOW_SIZE, GLOW_SIZE);
      g.globalAlpha = 1;
    }
    art.setTransform(1, 0, 0, 1, 0, 0);
    art.clearRect(0, 0, layer.width, layer.height);
    drawTile(t, tileY);
    drawWord(t);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = exitOpacity;
    g.drawImage(layer, 0, 0);
    g.globalAlpha = 1;
  }

  function finish() {
    try { sessionStorage.setItem("ll-splash", "1"); } catch (_) {}
    root.classList.add("is-ready");
    view.classList.add("is-gone");
    setTimeout(() => view.remove(), 450);
  }

  async function start() {
    view = document.createElement("canvas");
    view.className = "splash";
    view.setAttribute("aria-hidden", "true");
    document.body.prepend(view);
    g = view.getContext("2d");
    layer = document.createElement("canvas");
    art = layer.getContext("2d");
    resize();
    addEventListener("resize", resize);
    const fonts = Promise.all([document.fonts.load("700 120px Sora"), document.fonts.load("500 120px Sora")]);
    await Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]);

    if (reduced) {
      draw(HOLD);
      setTimeout(finish, REDUCED_HOLD * 1000);
      return;
    }
    let origin = performance.now();
    let revealed = false;
    const skip = () => { const t = (performance.now() - origin) / 1000; if (t < EXIT) origin -= (EXIT - t) * 1000; };
    view.addEventListener("pointerdown", skip);
    addEventListener("keydown", skip, { once: true });
    const tick = (now) => {
      const t = (now - origin) / 1000;
      draw(Math.min(t, DURATION));
      if (!revealed && t >= EXIT) { revealed = true; root.classList.add("is-ready"); }
      if (t < DURATION) requestAnimationFrame(tick);
      else { removeEventListener("resize", resize); finish(); }
    };
    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
