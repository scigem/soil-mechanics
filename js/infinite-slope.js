import { alpha, colors, font, tip } from './ui.js';
import '../css/infinite-slope.css';

// The infinite slope with seepage parallel to its surface.
//
// On a plane parallel to the slope at vertical depth z:
//     sigma = gamma z cos^2(alpha),   tau = gamma z sin(alpha) cos(alpha).
// With the water table m z above that plane (flow parallel to the slope, so the
// equipotentials are perpendicular to it), the pore pressure on the plane is
//     u = gamma_w m z cos^2(alpha),
// and the factor of safety is FS = (c' + (sigma - u) tan phi') / tau.

const GW = 9.81;
const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    soil: alpha(colors.soilLight, 0.5),
    soilEdge: colors.soil,
    water: colors.waterLight,
    waterLine: colors.waterDark,
    dry: colors.primary,
    now: colors.dilate,
    wet: colors.waterDark,
    fail: colors.failFg,
};

const ids = ['alpha', 'z', 'm', 'phi', 'c', 'gamma'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}-value`)]));
const readout = document.getElementById('readout');
const slopeCanvas = document.getElementById('slope-canvas');
const fsCanvas = document.getElementById('fs-canvas');
const rad = (d) => (d * Math.PI) / 180;

function stresses(s, alphaDeg = s.alpha, m = s.m) {
    const a = rad(alphaDeg);
    const sigma = s.gamma * s.z * Math.cos(a) ** 2;
    const tau = s.gamma * s.z * Math.sin(a) * Math.cos(a);
    const u = GW * m * s.z * Math.cos(a) ** 2;
    const eff = sigma - u;
    const fs = (s.c + eff * Math.tan(rad(s.phi))) / tau;
    return { sigma, tau, u, eff, fs };
}

function steepest(s, m) {
    // largest alpha with FS >= 1, by bisection
    let lo = 0.1;
    let hi = 89.9;
    if (stresses(s, hi, m).fs >= 1) return hi;
    for (let k = 0; k < 60; k++) {
        const mid = 0.5 * (lo + hi);
        if (stresses(s, mid, m).fs >= 1) lo = mid;
        else hi = mid;
    }
    return lo;
}

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

function arrow(ctx, x0, y0, x1, y1, color, width = 2, head = 8) {
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

function poly(ctx, pts, fill, stroke, width = 1) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }
    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
    }
}

// ---------------------------------------------------------------- the slope

function drawSlope(s, st) {
    const { ctx, w, h } = prepare(slopeCanvas);
    const a = rad(s.alpha);
    const t = Math.tan(a);
    // world: x along the horizontal, y up; the surface is y = -x tan(alpha) through the origin
    const span = 16; // metres of slope drawn
    const drop = span * t;
    const depthShown = s.z + 1.5;
    const scale = Math.min((w - 40) / span, (h - 30) / (drop + depthShown));
    const X = (x) => 20 + x * scale;
    const Y = (y) => 14 - y * scale;
    const surf = (x) => -x * t;
    const zBase = s.z;               // vertical depth of the slip plane
    const zWater = s.z * (1 - s.m);  // vertical depth of the water table

    // soil above the slip plane, and the water in it
    const L = 0;
    const R = span;
    poly(ctx, [[L, surf(L)], [R, surf(R)], [R, surf(R) - depthShown], [L, surf(L) - depthShown]]
        .map(([x, y]) => [X(x), Y(y)]), COLORS.soil, null);
    if (s.m > 0) {
        poly(ctx, [[L, surf(L) - zWater], [R, surf(R) - zWater], [R, surf(R) - zBase], [L, surf(L) - zBase]]
            .map(([x, y]) => [X(x), Y(y)]), COLORS.water, null);
        ctx.strokeStyle = COLORS.waterLine;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(X(L), Y(surf(L) - zWater));
        ctx.lineTo(X(R), Y(surf(R) - zWater));
        ctx.stroke();
        ctx.setLineDash([]);
        label(ctx, '▼ water table', X(L) + 4, Y(surf(L) - zWater) + 12, COLORS.waterLine, 'left');
        // flow arrows, parallel to the slope
        for (const x0 of [2.2, 9.5, 13.5]) {
            const y0 = surf(x0) - 0.5 * (zWater + zBase);
            const dx = 1.1 * Math.cos(a);
            arrow(ctx, X(x0), Y(y0), X(x0 + dx), Y(y0 - dx * t), COLORS.waterLine, 1.5, 7);
        }
    }

    // surface and slip plane
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(L), Y(surf(L)));
    ctx.lineTo(X(R), Y(surf(R)));
    ctx.stroke();
    ctx.strokeStyle = COLORS.soilEdge;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(X(L), Y(surf(L) - zBase));
    ctx.lineTo(X(R), Y(surf(R) - zBase));
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'slip plane', X(R) - 4, Y(surf(R) - zBase) + 12, COLORS.soilEdge, 'right');

    // the slice
    const x0 = 4.2;
    const x1 = 5.4;
    poly(ctx, [[x0, surf(x0)], [x1, surf(x1)], [x1, surf(x1) - zBase], [x0, surf(x0) - zBase]]
        .map(([x, y]) => [X(x), Y(y)]), alpha(colors.soil, 0.25), COLORS.soilEdge, 1.2);
    const xc = 0.5 * (x0 + x1);
    const yc = surf(xc) - 0.5 * zBase;
    arrow(ctx, X(xc), Y(yc), X(xc), Y(yc) + 0.28 * zBase * scale + 14, COLORS.ink, 2, 9);
    label(ctx, 'W', X(xc) + 8, Y(yc) + 0.2 * zBase * scale, COLORS.ink, 'left');

    // the equipotential through the base of the slice, and a standpipe there
    if (s.m > 0) {
        const bx = x1 + 2.6;
        const by = surf(bx) - zBase;
        // equipotential: perpendicular to the slope, up to the water table
        const n = [Math.sin(a), Math.cos(a)];
        const len = s.m * s.z * Math.cos(a);
        ctx.strokeStyle = COLORS.waterLine;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(X(bx), Y(by));
        ctx.lineTo(X(bx + n[0] * len), Y(by + n[1] * len));
        ctx.stroke();
        ctx.setLineDash([]);
        // standpipe: water rises to the height where that equipotential meets the table
        const head = s.m * s.z * Math.cos(a) ** 2;
        ctx.strokeStyle = COLORS.waterLine;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(X(bx), Y(by));
        ctx.lineTo(X(bx), Y(by + head));
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = COLORS.muted;
        ctx.strokeRect(X(bx) - 3, Y(by + Math.max(head, zBase * 0.9)), 6, Math.max(head, zBase * 0.9) * scale);
        label(ctx, `u/γw = ${head.toFixed(2)} m`, X(bx) + 8, Y(by + head), COLORS.waterLine, 'left');
    }
    label(ctx, `α = ${s.alpha}°`, X(0.4), Y(surf(0.4)) + 16, COLORS.ink, 'left');
}

// ---------------------------------------------------------------- FS against alpha

function drawFS(s, st) {
    const { ctx, w, h } = prepare(fsCanvas);
    const left = 48;
    const right = 16;
    const top = 12;
    const bottom = 30;
    const aMax = 50;
    const fsMax = 3;
    const X = (a) => left + (a / aMax) * (w - left - right);
    const Y = (f) => top + (1 - Math.min(f, fsMax) / fsMax) * (h - top - bottom);

    ctx.lineWidth = 1;
    for (let f = 0.5; f <= fsMax; f += 0.5) {
        ctx.strokeStyle = COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(left, Y(f));
        ctx.lineTo(w - right, Y(f));
        ctx.stroke();
        label(ctx, f.toFixed(1), left - 6, Y(f), COLORS.muted, 'right');
    }
    for (let a = 0; a <= aMax; a += 10) label(ctx, `${a}°`, X(a), h - bottom + 14, COLORS.muted);
    label(ctx, 'slope angle α', w - right, h - 4, COLORS.muted, 'right', 'bottom');
    ctx.strokeStyle = COLORS.muted;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, Y(1));
    ctx.lineTo(w - right, Y(1));
    ctx.stroke();
    label(ctx, 'FS = 1', w - right - 4, Y(1) - 9, COLORS.ink, 'right');

    const curve = (m, colour, width, name) => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.beginPath();
        let started = false;
        for (let a = 1; a <= aMax; a += 0.25) {
            const f = stresses(s, a, m).fs;
            if (f > fsMax * 1.2) continue;
            if (!started) ctx.moveTo(X(a), Y(f));
            else ctx.lineTo(X(a), Y(f));
            started = true;
        }
        ctx.stroke();
        const aLab = aMax - 1;
        const fLab = Math.min(stresses(s, aLab, m).fs, fsMax);
        return [name, colour, fLab];
    };
    const labels = [
        curve(0, COLORS.dry, 1.5, 'dry'),
        curve(1, COLORS.wet, 1.5, 'water table at the surface'),
        curve(s.m, COLORS.now, 3, `m = ${s.m.toFixed(2)}`),
    ].sort((a, b) => b[2] - a[2]);
    // stack the labels at the right-hand end so they never overlap
    let last = -Infinity;
    for (const [name, colour, f] of labels) {
        let y = Y(f) - 10;
        if (y < last + 14) y = last + 14;
        label(ctx, name, X(aMax) - 2, y, colour, 'right');
        last = y;
    }

    // where the slope is now, and where it would fail
    const f = st.fs;
    ctx.beginPath();
    ctx.arc(X(s.alpha), Y(f), 6, 0, 2 * Math.PI);
    ctx.fillStyle = f >= 1 ? COLORS.now : COLORS.fail;
    ctx.fill();
    const aCrit = steepest(s, s.m);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.now;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(aCrit), Y(1));
    ctx.lineTo(X(aCrit), h - bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, `steepest: ${aCrit.toFixed(1)}°`, X(aCrit) + 5, h - bottom - 10, COLORS.now, 'left');
}

// ---------------------------------------------------------------- readout

function drawReadout(s, st) {
    const dry = stresses(s, s.alpha, 0).fs;
    const items = [
        ['σ on the slip plane', `${st.sigma.toFixed(1)} kPa`, 'The total normal stress on the slip plane from the weight of the soil above it, γz cos²α.'],
        ['u, the water’s share', `${st.u.toFixed(1)} kPa`, 'The pore pressure on the slip plane, γw m z cos²α: the part of the squeeze carried by the water.'],
        ['σ′ = σ − u', `${st.eff.toFixed(1)} kPa`, 'The effective normal stress: the part of the squeeze that presses the grains together.'],
        ['τ, fixed by the weight', `${st.tau.toFixed(1)} kPa`, 'The shear stress the weight puts on the slip plane, γz sin α cos α. The water does not change it.'],
        ['FS now', st.fs.toFixed(2), 'Factor of safety: the shear strength friction and cohesion can resist, c′ + σ′ tan φ′, over the shear stress τ. Below 1 the slope fails.'],
        ['FS dry', dry.toFixed(2), 'The factor of safety of the same slope with no water, m = 0.'],
        ['steepest safe slope now', `${steepest(s, s.m).toFixed(1)}°`, 'The largest slope angle with FS ≥ 1 at the current water table.'],
        ['steepest, dry', `${steepest(s, 0).toFixed(1)}°`, 'The largest slope angle with FS ≥ 1 with no water.'],
    ];
    const status = st.fs >= 1
        ? `<div class="status safe">The slope stands. The grains are pressed together by ${st.eff.toFixed(1)} kPa, and friction can resist ${(st.eff * Math.tan(rad(s.phi)) + s.c).toFixed(1)} kPa of the ${st.tau.toFixed(1)} kPa the weight asks for.</div>`
        : `<div class="status beyond">The slope fails. The weight asks for ${st.tau.toFixed(1)} kPa of shear, but with the water carrying ${st.u.toFixed(1)} kPa of the squeeze, friction can only resist ${(st.eff * Math.tan(rad(s.phi)) + s.c).toFixed(1)} kPa.</div>`;
    readout.innerHTML = status + items.map(([k, v, t]) => `<div class="item"><span>${k}${tip(t)}</span><strong>${v}</strong></div>`).join('');
}

// ---------------------------------------------------------------- wiring

function update() {
    const units = { alpha: '°', z: ' m', m: '', phi: '°', c: ' kPa', gamma: ' kN/m³' };
    for (const id of ids) {
        const v = parseFloat(inputs[id].value);
        outputs[id].textContent = (id === 'm' ? v.toFixed(2) : `${v}`) + units[id];
    }
    const s = Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));
    const st = stresses(s);
    drawSlope(s, st);
    drawFS(s, st);
    drawReadout(s, st);
}

for (const id of ids) inputs[id].addEventListener('input', update);

let raining = null;
document.addEventListener('tool-reset', () => {
    if (raining) cancelAnimationFrame(raining);
    raining = null;
    update();
});
document.getElementById('rain').addEventListener('click', () => {
    if (raining) {
        cancelAnimationFrame(raining);
        raining = null;
        return;
    }
    const start = parseFloat(inputs.m.value);
    const t0 = performance.now();
    const step = (t) => {
        const f = Math.min(1, (t - t0) / 4000);
        inputs.m.value = (start + (1 - start) * f).toFixed(2);
        update();
        raining = f < 1 ? requestAnimationFrame(step) : null;
    };
    raining = requestAnimationFrame(step);
});

if (window.ResizeObserver) new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
update();
