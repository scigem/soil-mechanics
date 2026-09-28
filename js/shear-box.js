import { alpha, colors, font, tip } from './ui.js';
import '../css/shear-box.css';

// The shear box, read through Taylor's energy balance.
//
// The top half moves dx sideways under a normal load N and rises dy. The work
// T dx goes into friction, N tan(phi_cs) dx, and into lifting the load, N dy:
//     tau / sigma' = tan(phi_cs) + dy/dx.
// How much a sample dilates at its peak comes from Bolton's (1986) relative
// dilatancy index, I_R = I_D (10 - ln p') - 1, clipped to [0, 4], with
// phi_peak - phi_cs = 5 I_R degrees in plane strain. The shape of the curves
// in displacement is schematic.

const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    grain: colors.soil,
    grainEdge: colors.soilEdge,
    sample: colors.soilLight,
    friction: colors.friction,
    lift: colors.dilate,
    sink: colors.contract,
    plate: colors.structure,
    // the shear zone tinted towards dilation (orange) or contraction (blue);
    // no palette token sits between the soil and those colours
    zoneDilate: colors.zoneDilate,
    zoneContract: colors.zoneContract,
};

const ids = ['ID', 'sigma', 'phics', 'x'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}-value`)]));
const readout = document.getElementById('readout');
const boxCanvas = document.getElementById('box-canvas');
const curveCanvas = document.getElementById('curve-canvas');
const rad = (d) => (d * Math.PI) / 180;
const XMAX = 10; // mm

// ---------------------------------------------------------------- the model

function model(s) {
    const IR = Math.max(0, Math.min(4, s.ID * (10 - Math.log(s.sigma)) - 1));
    const tanCs = Math.tan(rad(s.phics));
    const phiPeak = s.phics + 5 * IR;
    const contract = 0.12 * (1 - s.ID);           // initial settling of a loose sample
    const xp = 1.4;                                // displacement to the peak, mm
    const xc = 1.0;
    const D = Math.tan(rad(phiPeak)) - tanCs + contract * Math.exp(-xp / xc);
    const dydx = (x) => (IR > 0 ? D * (x / xp) * Math.exp(1 - x / xp) : 0) - contract * Math.exp(-x / xc);
    const rise = (x) => 1 - Math.exp(-x / 0.25);
    const ratio = (x) => rise(x) * (tanCs + dydx(x));
    const n = 500;
    const xs = [], R = [], Y = [], G = [];
    let y = 0;
    for (let k = 0; k <= n; k++) {
        const x = (k / n) * XMAX;
        if (k > 0) y += 0.5 * (dydx(x) + dydx(xs[k - 1])) * (x - xs[k - 1]);
        xs.push(x);
        R.push(ratio(x));
        Y.push(y);
        G.push(dydx(x));
    }
    return { IR, tanCs, phiPeak, dydx, rise, ratio, xs, R, Y, G };
}

// The sample fills both halves of the box, which meet at y = 0.4 (in units of
// the box width). Shearing concentrates in a zone at that plane, which leans
// with the displacement and thickens as the sample dilates.
const MID = 0.4;
const BAND = 0.05; // half-thickness of the shear zone before shearing

// ---------------------------------------------------------------- helpers

function prepare(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.font = font(13);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    return { ctx, w: rect.width, h: rect.height };
}

function label(ctx, text, x, y, color, align = 'center', baseline = 'middle') {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}

function arrow(ctx, x0, y0, x1, y1, color, width = 2, head = 9) {
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 - 0.6 * head * Math.cos(a), y1 - 0.6 * head * Math.sin(a));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
    ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
    ctx.closePath();
    ctx.fill();
}

function at(m, x) {
    const k = Math.min(m.xs.length - 1, Math.round((x / XMAX) * (m.xs.length - 1)));
    return k;
}

// ---------------------------------------------------------------- the box

function drawBox(s, m) {
    const { ctx, w, h } = prepare(boxCanvas);
    const width = 0.62 * w;
    const X = (u) => 0.12 * w + u * width;
    const Y = (v) => 0.86 * h - v * width;
    const k = at(m, s.x);
    const shift = (s.x / XMAX) * 0.3;              // 10 mm drawn as 0.3 box widths
    const lift = 3 * (m.Y[k] / 60);                 // box 60 mm wide, rise exaggerated three times

    // The sample, as one shaded region: the bottom half fixed, the top half
    // carried sideways and up, and the shear zone between them.
    const zoneTop = MID + BAND + lift;
    const zoneBottom = MID - BAND;
    const top = 0.8 + lift;
    const P = (x, y) => [X(x), Y(y)];
    const fill = (pts, colour) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = colour;
        ctx.fill();
    };
    fill([P(0, 0), P(1, 0), P(1, zoneBottom), P(0, zoneBottom)], COLORS.sample);
    fill([P(0, zoneBottom), P(1, zoneBottom), P(1 + shift, zoneTop), P(shift, zoneTop)],
        m.G[k] >= 0 ? COLORS.zoneDilate : COLORS.zoneContract);
    fill([P(shift, zoneTop), P(1 + shift, zoneTop), P(1 + shift, top), P(shift, top)], COLORS.sample);
    // a few lines through the sample, so the shearing shows
    ctx.strokeStyle = alpha(COLORS.grainEdge, 0.35);
    ctx.lineWidth = 1;
    for (let u = 0.1; u < 1; u += 0.15) {
        ctx.beginPath();
        ctx.moveTo(...P(u, 0));
        ctx.lineTo(...P(u, zoneBottom));
        ctx.lineTo(...P(u + shift, zoneTop));
        ctx.lineTo(...P(u + shift, top));
        ctx.stroke();
    }

    // the two halves of the box: the bottom one fixed, the top one pushed
    // sideways and carried up by the sample
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(MID));
    ctx.lineTo(X(0), Y(0));
    ctx.lineTo(X(1), Y(0));
    ctx.lineTo(X(1), Y(MID));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(X(shift), Y(MID + lift));
    ctx.lineTo(X(shift), Y(top));
    ctx.moveTo(X(shift + 1), Y(MID + lift));
    ctx.lineTo(X(shift + 1), Y(top));
    ctx.stroke();
    // the loading plate on top of the sample
    ctx.fillStyle = COLORS.plate;
    ctx.fillRect(X(shift), Y(top) - 6, width, 6);

    // loads
    const topY = Y(0.8 + lift) - 6;
    const midX = X(shift + 0.5);
    arrow(ctx, midX, topY - 0.22 * width, midX, topY - 4, COLORS.ink, 2.5, 10);
    label(ctx, `N  (σ′ = ${s.sigma} kPa)`, midX + 8, topY - 0.16 * width, COLORS.ink, 'left');
    const ratio = m.R[k];
    const Tlen = 0.08 * width + 0.25 * width * Math.max(0, ratio);
    const Ty = Y(0.6 + lift);
    arrow(ctx, X(shift) - Tlen - 6, Ty, X(shift) - 4, Ty, COLORS.friction, 2.5, 10);
    label(ctx, 'T', X(shift) - Tlen - 12, Ty, COLORS.friction, 'right');

    // is it climbing or sinking?
    const g = m.G[k];
    if (Math.abs(g) > 0.005) {
        const colour = g > 0 ? COLORS.lift : COLORS.sink;
        const x0 = X(shift + 1) + 18;
        arrow(ctx, x0, Ty + (g > 0 ? 14 : -14), x0, Ty + (g > 0 ? -14 : 14), colour, 2, 8);
        label(ctx, g > 0 ? 'rising' : 'sinking', x0 + 8, Ty, colour, 'left');
    }
    label(ctx, `x = ${s.x.toFixed(2)} mm,  y = ${m.Y[k].toFixed(3)} mm`, w / 2, h - 10, COLORS.muted);
}

// ---------------------------------------------------------------- the curves

function drawCurves(s, m) {
    const { ctx, w, h } = prepare(curveCanvas);
    const left = 52;
    const right = 16;
    const split = 0.6 * h;
    const X = (x) => left + (x / XMAX) * (w - left - right);
    const rMax = Math.max(1.0, ...m.R) * 1.08;
    const Yr = (v) => 12 + (1 - v / rMax) * (split - 30);
    const yMin = Math.min(0, ...m.Y) * 1.15 - 0.02;
    const yMax = Math.max(0.05, ...m.Y) * 1.15;
    const Yy = (v) => split + 16 + ((yMax - v) / (yMax - yMin)) * (h - split - 44);

    // the Taylor strip: between the curve and friction alone
    ctx.beginPath();
    m.xs.forEach((x, k) => (k ? ctx.lineTo(X(x), Yr(m.R[k])) : ctx.moveTo(X(x), Yr(m.R[k]))));
    for (let k = m.xs.length - 1; k >= 0; k--) ctx.lineTo(X(m.xs[k]), Yr(m.rise(m.xs[k]) * m.tanCs));
    ctx.closePath();
    ctx.fillStyle = alpha(COLORS.lift, 0.18);
    ctx.fill();

    // friction alone
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = COLORS.friction;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    m.xs.forEach((x, k) => (k ? ctx.lineTo(X(x), Yr(m.rise(x) * m.tanCs)) : ctx.moveTo(X(x), Yr(0))));
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'tan φ′cs: friction alone', X(XMAX), Yr(m.tanCs) + 12, COLORS.friction, 'right');

    // the strength curve
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    m.xs.forEach((x, k) => (k ? ctx.lineTo(X(x), Yr(m.R[k])) : ctx.moveTo(X(x), Yr(m.R[k]))));
    ctx.stroke();

    // the rise
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(0), Yy(0));
    ctx.lineTo(X(XMAX), Yy(0));
    ctx.stroke();
    ctx.strokeStyle = m.Y[m.Y.length - 1] >= 0 ? COLORS.lift : COLORS.sink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    m.xs.forEach((x, k) => (k ? ctx.lineTo(X(x), Yy(m.Y[k])) : ctx.moveTo(X(x), Yy(m.Y[k]))));
    ctx.stroke();

    // axes
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, 8);
    ctx.lineTo(left, h - 26);
    ctx.lineTo(w - right, h - 26);
    ctx.stroke();
    label(ctx, 'τ/σ′', 6, Yr(rMax * 0.5), COLORS.ink, 'left');
    label(ctx, 'y (mm)', 6, Yy((yMax + yMin) / 2), COLORS.ink, 'left');
    for (let x = 0; x <= XMAX; x += 2) label(ctx, `${x}`, X(x), h - 14, COLORS.muted);
    label(ctx, 'x (mm)', w - right, h - 4, COLORS.muted, 'right', 'bottom');
    for (const v of [0, 0.5, 1.0]) if (v <= rMax) label(ctx, v.toFixed(1), left - 6, Yr(v), COLORS.muted, 'right');

    // where we are
    const k = at(m, s.x);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(s.x), 8);
    ctx.lineTo(X(s.x), h - 26);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const [yy, colour] of [[Yr(m.R[k]), COLORS.ink], [Yy(m.Y[k]), COLORS.ink]]) {
        ctx.beginPath();
        ctx.arc(X(s.x), yy, 5, 0, 2 * Math.PI);
        ctx.fillStyle = colour;
        ctx.fill();
    }
}

// ---------------------------------------------------------------- readout

function drawReadout(s, m) {
    const k = at(m, s.x);
    const ratio = m.R[k];
    const friction = m.rise(s.x) * m.tanCs;
    const lifting = m.rise(s.x) * m.G[k];
    const items = [
        ['τ/σ′ now', ratio.toFixed(3), 'The stress ratio at this displacement: the shear stress over the normal stress on the plane between the halves.'],
        ['= friction', friction.toFixed(3), 'The part of τ/σ′ spent sliding against friction, tan φ′cs.'],
        ['+ lifting (dy/dx)', `${lifting >= 0 ? '+' : '−'}${Math.abs(lifting).toFixed(3)}`, 'The part of τ/σ′ spent lifting the load, dy/dx. Negative when the sample sinks and the load does work on it.'],
        ['τ now', `${(ratio * s.sigma).toFixed(1)} kPa`, 'The shear stress on the plane between the halves: τ/σ′ times σ′.'],
        ['φ′ mobilised', `${(Math.atan(ratio) * 180 / Math.PI).toFixed(1)}°`, 'The friction angle the sample is using now, tan⁻¹(τ/σ′).'],
        ['φ′ peak (Bolton)', `${m.phiPeak.toFixed(1)}°`, 'The peak friction angle from Bolton (1986): φ′cs + 5 I_R degrees in plane strain.'],
        ['I_R', m.IR.toFixed(2), 'Bolton\'s relative dilatancy index, I_D(10 − ln p′) − 1, clipped to between 0 and 4. It measures how much the sample dilates at its peak.'],
        ['rise y', `${m.Y[k].toFixed(3)} mm`, 'How far the top half has moved up: positive when the sample dilates, negative when it contracts.'],
    ];
    readout.innerHTML = items.map(([a, b, t]) => `<div class="item"><span>${a}${tip(t)}</span><strong>${b}</strong></div>`).join('');
}

// ---------------------------------------------------------------- wiring

function update() {
    const units = { ID: '', sigma: ' kPa', phics: '°', x: ' mm' };
    for (const id of ids) {
        const v = parseFloat(inputs[id].value);
        outputs[id].textContent = (id === 'ID' ? v.toFixed(2) : id === 'x' ? v.toFixed(2) : `${v}`) + units[id];
    }
    const s = Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));
    const m = model(s);
    drawBox(s, m);
    drawCurves(s, m);
    drawReadout(s, m);
}

for (const id of ids) inputs[id].addEventListener('input', update);

let playing = null;
document.addEventListener('tool-reset', () => {
    if (playing) cancelAnimationFrame(playing);
    playing = null;
    update();
});
document.getElementById('play').addEventListener('click', () => {
    if (playing) {
        cancelAnimationFrame(playing);
        playing = null;
        return;
    }
    const t0 = performance.now();
    const step = (t) => {
        const f = Math.min(1, (t - t0) / 6000);
        inputs.x.value = (XMAX * f).toFixed(2);
        update();
        playing = f < 1 ? requestAnimationFrame(step) : null;
    };
    playing = requestAnimationFrame(step);
});

if (window.ResizeObserver) new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
update();
