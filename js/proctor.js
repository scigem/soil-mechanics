import { alpha, colors, font, tip } from './ui.js';
import '../css/proctor.css';

// The Proctor test, read through the picture of the course notes
// (civl2410 book, "Compaction"). The model is the one in
// book/images/new/compaction/_proctor.py, which draws the figures there.
//
// Two limits act on each blow.
//   The grains' limit (dry side): the blows are roughly equivalent to a static
//   pressure sigma_b = E, the energy per volume. They compact the network along
//   a log law measured from the stress already holding the grains, the soil's
//   own p_r plus the water's squeeze sigma_s:
//   e_d = eN - C log10(sigma_b / (p_r + sigma_s)).
//   In a clay sigma_s = S s(S) (Bishop's chi ~ S, van Genuchten's s), which
//   grows without limit as it dries; in a sand the bridges give
//   sigma_s = sigma_b (1 - exp(-S/S_b)) (1 - S). S is judged at w Gs / e_ref.
//   The water's limit (wet side): once the air is trapped the soil cannot pass
//   the air-voids line of that air, e_w = (w Gs + A) / (1 - A). A sand drains
//   during the blow, so A = 0 for it.
// The void ratio reached is the larger of the two, smoothed a little.

const GAMMA_W = 9.81;
const E_STANDARD = (3 * 25 * 2.7 * 9.81 * 0.3) / 1e-3 / 1e3;   // 596 kPa
const E_MODIFIED = (5 * 25 * 4.9 * 9.81 * 0.45) / 1e-3 / 1e3;  // 2704 kPa
const blow = (E) => E;   // the equivalent static pressure of the blows
const E_LO = 100;
const E_HI = 6000;
const E_MIN_VOID = 0.2;

const SOILS = {
    sand: { name: 'clean sand', kind: 'bridges', Gs: 2.65, sigma_b: 2.25, S_b: 0.03, eN: 0.914, C: 0.10, p_r: 0.25, A: 0, e_ref: 0.62, e_max: 0.95, y: [14.4, 18.2], x: 26 },
    clay: { name: 'lean clay', kind: 'pores', Gs: 2.70, s_a: 25, n: 1.3, eN: 0.641, C: 0.30, p_r: 2.5, A: 0.06, e_ref: 1.0, e_max: 1.0, y: [13.0, 21.0], x: 30 },
    fat: { name: 'fat clay', kind: 'pores', Gs: 2.70, s_a: 2.5, n: 1.2, eN: 1.401, C: 0.60, p_r: 15, A: 0.05, e_ref: 1.3, e_max: 1.3, y: [11.5, 19.0], x: 38 },
};

const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    grain: colors.soil,
    grainEdge: colors.soilEdge,
    water: colors.water,
    waterDark: colors.waterDark,
    air: colors.air,
    eff: colors.effectiveStress,
};

// ---------------------------------------------------------------- the model

function suction(S, soil) {
    const m = 1 - 1 / soil.n;
    const s = Math.min(1, Math.max(1e-6, S));
    return soil.s_a * Math.pow(Math.max(Math.pow(s, -1 / m) - 1, 0), 1 / soil.n);
}

function suctionStress(S, soil) {
    if (soil.kind === 'bridges') {
        const s = Math.min(1, Math.max(0, S));
        return soil.sigma_b * (1 - Math.exp(-s / soil.S_b)) * (1 - s);
    }
    const s = Math.min(1, Math.max(1e-6, S));   // a bone-dry clay is all suction, not none
    return s * suction(s, soil);
}

const squeeze = (w, soil) => suctionStress(Math.min(1, (w * soil.Gs) / soil.e_ref), soil);

function eDry(w, E, soil) {
    const e = soil.eN - soil.C * Math.log10(blow(E) / (soil.p_r + squeeze(w, soil)));
    return Math.min(soil.e_max, Math.max(E_MIN_VOID, e));
}

const eWet = (w, soil) => (w * soil.Gs + soil.A) / (1 - soil.A);

function compact(w, E, soil) {
    const ed = eDry(w, E, soil);
    const ew = eWet(w, soil);
    const k = 24;
    const e = Math.pow(Math.pow(ed, k) + Math.pow(ew, k), 1 / k);
    const gd = (soil.Gs * GAMMA_W) / (1 + e);
    const S = Math.min(1, (w * soil.Gs) / e);
    const A = Math.max(0, (e - w * soil.Gs) / (1 + e));
    return { e, ed, ew, gd, gb: gd * (1 + w), S, A, sigma: squeeze(w, soil), wet: ew >= ed };
}

function optimum(E, soil) {
    let best = { w: 0, gd: 0, S: 0 };
    for (let k = 0; k <= 900; k++) {
        const w = (k / 900) * 0.45;
        const r = compact(w, E, soil);
        if (r.gd > best.gd) best = { w, gd: r.gd, S: r.S };
    }
    return best;
}

// A sand's curve rises again as its bridges go, until it meets the saturation
// line; past that the extra water simply drains out of the mould.
function wetPeak(E, soil) {
    let best = { w: 0.1, gd: 0 };
    for (let k = 0; k <= 400; k++) {
        const w = 0.1 + (k / 400) * 0.3;
        const g = compact(w, E, soil).gd;
        if (g > best.gd) best = { w, gd: g };
    }
    return best.w;
}

const lineS = (w, soil, S) => (soil.Gs * GAMMA_W) / (1 + (w * soil.Gs) / S);
const lineA = (w, soil, A) => ((1 - A) * soil.Gs * GAMMA_W) / (1 + w * soil.Gs);

// ---------------------------------------------------------------- a packing

// A small settled packing of discs in a unit box, made once with a seeded
// generator: gravity and overlap relaxation, as in the notes' figures.
function makePacking() {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const n = 58;
    const R = 0.075;
    const pts = Array.from({ length: n }, () => ({ x: rand(), y: rand() * 1.4, r: R * (1 + 0.36 * (rand() - 0.5)) }));
    for (let it = 0; it < 1800; it++) {
        if (it < 1100) for (const p of pts) p.y -= 0.0015;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const a = pts[i], b = pts[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.hypot(dx, dy) || 1e-6;
                const o = a.r + b.r - d;
                if (o > 0) {
                    const ux = (dx / d) * o * 0.5, uy = (dy / d) * o * 0.5;
                    a.x += ux; a.y += uy; b.x -= ux; b.y -= uy;
                }
            }
        }
        for (const p of pts) {
            p.x = Math.min(1 - p.r, Math.max(p.r, p.x));
            p.y = Math.min(1.6, Math.max(p.r, p.y));
        }
    }
    const kept = pts.filter((p) => p.y + p.r < 1.02);
    const contacts = [];
    for (let i = 0; i < kept.length; i++) {
        for (let j = i + 1; j < kept.length; j++) {
            const a = kept[i], b = kept[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < a.r + b.r + 0.4 * R) contacts.push([a, b, d]);
        }
    }
    // candidate bubble sites: points far from every grain
    const voids = [];
    for (let k = 0; k < 3000; k++) {
        const q = { x: 0.06 + 0.88 * rand(), y: 0.06 + 0.88 * rand() };
        let gap = Infinity;
        for (const p of kept) gap = Math.min(gap, Math.hypot(q.x - p.x, q.y - p.y) - p.r);
        if (gap > 0.012) voids.push({ ...q, gap });
    }
    voids.sort((a, b) => b.gap - a.gap);
    const sites = [];
    for (const v of voids) {
        if (sites.every((s) => Math.hypot(s.x - v.x, s.y - v.y) > 0.17)) sites.push(v);
        if (sites.length === 12) break;
    }
    return { grains: kept, contacts, sites, R };
}

const PACKING = makePacking();

// ---------------------------------------------------------------- state

const soilSelect = document.getElementById('soil');
const energy = document.getElementById('energy');
const energyValue = document.getElementById('energy-value');
const mcInput = document.getElementById('mc');
const mcValue = document.getElementById('mc-value');
const showCurve = document.getElementById('show-curve');
const readout = document.getElementById('readout');
const chartCanvas = document.getElementById('chart-canvas');
const grainCanvas = document.getElementById('grain-canvas');

let points = [];
const toE = (v) => E_LO * Math.pow(E_HI / E_LO, v);
const fromE = (E) => Math.log(E / E_LO) / Math.log(E_HI / E_LO);
energy.value = fromE(E_STANDARD).toFixed(3);

function state() {
    const soil = SOILS[soilSelect.value];
    const E = toE(parseFloat(energy.value));
    const w = parseFloat(mcInput.value) / 100;
    return { soil, E, w, r: compact(w, E, soil), opt: optimum(E, soil) };
}

// Points are coloured by energy, from light blue (low) to dark orange (high).
function energyColour(E) {
    const f = Math.min(1, Math.max(0, fromE(E)));
    const a = [120, 170, 220], b = [217, 95, 2];
    const c = a.map((x, i) => Math.round(x + (b[i] - x) * f));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
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
    ctx.font = font(12);
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

// ---------------------------------------------------------------- the chart

function drawChart(s) {
    const { ctx, w, h } = prepare(chartCanvas);
    const { soil } = s;
    const left = 48, right = 14, top = 12, bottom = 40;
    const xMax = soil.x / 100;
    const [y0, y1] = soil.y;
    const X = (m) => left + (m / xMax) * (w - left - right);
    const Y = (g) => top + ((y1 - g) / (y1 - y0)) * (h - top - bottom);

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, w - left - right, h - top - bottom);
    ctx.clip();
    // grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let m = 0; m <= xMax + 1e-9; m += 0.05) {
        ctx.beginPath(); ctx.moveTo(X(m), top); ctx.lineTo(X(m), h - bottom); ctx.stroke();
    }
    for (let g = Math.ceil(y0); g <= y1; g += 1) {
        ctx.beginPath(); ctx.moveTo(left, Y(g)); ctx.lineTo(w - right, Y(g)); ctx.stroke();
    }
    const trace = (f, colour, width, dash = []) => {
        ctx.strokeStyle = colour;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        for (let k = 0; k <= 200; k++) {
            const m = (k / 200) * xMax;
            k ? ctx.lineTo(X(m), Y(f(m))) : ctx.moveTo(X(m), Y(f(m)));
        }
        ctx.stroke();
        ctx.setLineDash([]);
    };
    trace((m) => lineS(m, soil, 1), COLORS.waterDark, 2);
    for (const A of [0.05, 0.10]) trace((m) => lineA(m, soil, A), COLORS.waterDark, 1, [5, 4]);
    if (soil.kind !== 'bridges') trace((m) => lineS(m, soil, s.opt.S), COLORS.eff, 1.5, [7, 4]);

    if (showCurve.checked) {
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        const stop = soil.kind === 'bridges' ? wetPeak(s.E, soil) : Infinity;
        for (let k = 0; k <= 300; k++) {
            const m = (k / 300) * xMax;
            const g = compact(m, s.E, soil).gd;
            if (m > stop) break;
            started ? ctx.lineTo(X(m), Y(g)) : ctx.moveTo(X(m), Y(g));
            started = true;
        }
        ctx.stroke();
    }

    // compacted points
    for (const p of points) {
        ctx.beginPath();
        ctx.arc(X(p.w), Y(p.gd), 5, 0, 2 * Math.PI);
        ctx.fillStyle = energyColour(p.E);
        ctx.fill();
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    // where this sample would land
    ctx.beginPath();
    ctx.arc(X(s.w), Y(s.r.gd), 6, 0, 2 * Math.PI);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 2;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // labels on the lines
    const lx = 0.86 * xMax;
    label(ctx, 'S = 1', X(lx) + 4, Y(lineS(lx, soil, 1)) - 9, COLORS.waterDark, 'left');
    if (soil.kind !== 'bridges') {
        const ox = Math.min(0.9 * xMax, s.opt.w + 0.08);
        label(ctx, `line of optimums, S ≈ ${Math.round(100 * s.opt.S)}%`, X(ox) - 6,
            Y(lineS(ox, soil, s.opt.S)) + 12, COLORS.eff, 'right');
    }

    // axes
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.lineTo(w - right, h - bottom);
    ctx.stroke();
    for (let m = 0; m <= xMax + 1e-9; m += 0.05) label(ctx, `${Math.round(100 * m)}`, X(m), h - bottom + 12, COLORS.muted);
    for (let g = Math.ceil(y0); g <= y1; g += 1) label(ctx, `${g}`, left - 6, Y(g), COLORS.muted, 'right');
    label(ctx, 'moisture content mc (%)', (left + w - right) / 2, h - 8, COLORS.ink);
    ctx.save();
    ctx.translate(12, (top + h - bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, 'γdry (kN/m³)', 0, 0, COLORS.ink);
    ctx.restore();
}

// ---------------------------------------------------------------- the mould

function drawGrains(s) {
    const { ctx, w, h } = prepare(grainCanvas);
    const { r, soil } = s;
    const size = Math.min(0.72 * w, h - 70);
    const ox = 14, oy = 30;
    const P = (x, y) => [ox + x * size, oy + (1 - y) * size];

    // which regime?
    const drained = soil.kind === 'bridges' && r.S > 0.93;
    const trapped = soil.kind !== 'bridges' && r.wet;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, size, size);
    ctx.clip();
    ctx.fillStyle = COLORS.air;
    ctx.fillRect(ox, oy, size, size);
    if (trapped || drained) {
        ctx.fillStyle = alpha(colors.water, 0.55);
        ctx.fillRect(ox, oy, size, size);
        if (trapped) {
            const nb = Math.max(1, Math.min(PACKING.sites.length, Math.round(r.A * 110)));
            for (const b of PACKING.sites.slice(0, nb)) {
                const [x, y] = P(b.x, b.y);
                ctx.beginPath();
                ctx.arc(x, y, 0.95 * b.gap * size, 0, 2 * Math.PI);
                ctx.fillStyle = COLORS.air;
                ctx.fill();
                ctx.strokeStyle = COLORS.waterDark;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    } else if (r.S > 0.002) {
        // bridges at the contacts, growing with the saturation
        const f = Math.min(1.05, 0.3 + 0.8 * Math.sqrt(r.S));
        ctx.fillStyle = alpha(colors.water, 0.8);
        for (const [a, b, d] of PACKING.contacts) {
            if (d > a.r + b.r + (0.05 + 0.4 * r.S) * PACKING.R) continue;
            const t = (a.r + 0.5 * (d - a.r - b.r)) / d;
            const [x, y] = P(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
            ctx.beginPath();
            ctx.arc(x, y, f * Math.min(a.r, b.r) * size * 0.75, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    for (const g of PACKING.grains) {
        const [x, y] = P(g.x, g.y);
        ctx.beginPath();
        ctx.arc(x, y, g.r * size, 0, 2 * Math.PI);
        ctx.fillStyle = COLORS.grain;
        ctx.fill();
        ctx.strokeStyle = COLORS.grainEdge;
        ctx.lineWidth = 0.8;
        ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox, oy, size, size);

    // the blow: arrow on top, and whether it gets through
    let caption;
    if (soil.kind === 'bridges' && r.S < 0.002) caption = 'dry: nothing holds the grains';
    else if (drained) caption = 'wet: bridges gone, water drains';
    else if (trapped) caption = 'air trapped: the water takes the blow';
    else if (soil.kind === 'bridges') caption = 'damp: bridges hold the grains loose';
    else caption = 'suction squeezes the contacts; air escapes';
    label(ctx, caption, ox + size / 2, 14, COLORS.ink);

    // the phases, to scale, for a fixed volume of solids
    const bx = ox + size + 22, bw = Math.max(26, w - bx - 34);
    const total = 1 + r.e;
    const air = Math.max(0, r.e - s.w * soil.Gs);
    const water = r.e - air;
    const full = 1 + soil.e_max;                 // the loosest the column is drawn
    const H = size;
    const unit = H / full;
    let y = oy + H;
    const block = (v, colour, text) => {
        const hh = v * unit;
        ctx.fillStyle = colour;
        ctx.fillRect(bx, y - hh, bw, hh);
        ctx.strokeStyle = COLORS.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, y - hh, bw, hh);
        if (hh > 12) label(ctx, text, bx + bw / 2, y - hh / 2, colour === COLORS.air ? COLORS.muted : '#fff');
        y -= hh;
    };
    block(1, COLORS.grain, 'solid');
    block(water, COLORS.water, 'water');
    block(air, COLORS.air, 'air');
    label(ctx, `e = ${r.e.toFixed(2)}`, bx + bw / 2, oy + H + 14, COLORS.muted);
    label(ctx, `V/Vs = ${total.toFixed(2)}`, bx + bw / 2, oy + H + 28, COLORS.muted);
}

// ---------------------------------------------------------------- readout

// Suction in a bone-dry clay is effectively unlimited: say so rather than print it.
const kpa = (x) => (x >= 1e5 ? 'over 100 000' : x < 10 ? x.toFixed(1) : `${Math.round(x)}`);

function drawReadout(s) {
    const { r, opt, soil } = s;
    const items = [
        ['γbulk', `${r.gb.toFixed(2)} kN/m³`, 'Bulk unit weight: the weight of everything in the mould (solid and water) over its volume.'],
        ['γdry', `${r.gd.toFixed(2)} kN/m³`, 'Dry unit weight: the weight of the solid alone over the volume, γbulk/(1 + mc). Higher means a denser network.'],
        ['e', r.e.toFixed(3), 'Void ratio: volume of voids over volume of solid.'],
        ['S', `${Math.round(100 * r.S)}%`, 'Degree of saturation: the fraction of the voids filled with water, S = mc Gs / e.'],
        ['A', `${(100 * r.A).toFixed(1)}%`, 'Air content: the volume of air as a fraction of the whole volume.'],
        ['suction squeeze', `${kpa(r.sigma)} kPa`, 'The extra squeeze that the water bridges put on every contact before the blow (Bishop: χs). It pushes the contacts together without pushing them sideways, so it resists sliding.'],
        ['mc,opt', soil.kind === 'bridges' ? 'none' : `${(100 * opt.w).toFixed(1)}%`, 'Optimum moisture content at this energy: where the dry unit weight peaks. A clean sand has none: it compacts best dry or wet.'],
        ['γdry,max', `${opt.gd.toFixed(2)} kN/m³`, 'Maximum dry unit weight at this energy.'],
    ];
    let status, cls;
    if (soil.kind === 'bridges') {
        if (r.S < 0.002) { status = 'Dry sand: no water, no bridges, nothing to stop the contacts sliding.'; cls = 'safe'; }
        else if (r.S > 0.93) { status = 'Wet sand: the pores are full, the bridges are gone, and the water drains out as the grains pack.'; cls = 'safe'; }
        else { status = `Damp sand: bridges at the contacts add a squeeze of ${r.sigma.toFixed(1)} kPa and hold the grains loose (bulking).`; cls = 'cap'; }
    } else if (r.wet) {
        status = `Wet of the optimum: the air is trapped (A ≈ ${(100 * r.A).toFixed(1)}%), and the water, which cannot leave in a blow, takes it.`;
        cls = 'beyond';
    } else {
        status = `Dry of the optimum: suction holds the grains with ${kpa(r.sigma)} kPa, against a blow of ${kpa(blow(s.E))} kPa. Add water to weaken it.`;
        cls = 'cap';
    }
    readout.innerHTML = items.map(([a, b, t]) => `<div class="item"><span>${a}${tip(t)}</span><strong>${b}</strong></div>`).join('')
        + `<div class="status ${cls}">${status}</div>`;
}

// ---------------------------------------------------------------- wiring

function update() {
    const s = state();
    energyValue.textContent = `${Math.round(s.E)} kPa`;
    mcValue.textContent = `${parseFloat(mcInput.value).toFixed(1)}%`;
    mcInput.max = String(s.soil.x);
    drawChart(s);
    drawGrains(s);
    drawReadout(s);
}

function addPoint(w) {
    const s = state();
    const r = compact(w, s.E, s.soil);
    // a real test scatters a little
    const jitter = 0.08 * (Math.random() - 0.5);
    points.push({ w, E: s.E, gd: Math.min(r.gd + jitter, lineS(w, s.soil, 1)) });
}

energy.addEventListener('input', update);
mcInput.addEventListener('input', update);
showCurve.addEventListener('change', update);
soilSelect.addEventListener('change', () => {
    points = [];
    const soil = SOILS[soilSelect.value];
    mcInput.value = String(Math.round(100 * optimum(E_STANDARD, soil).w * 0.7));
    update();
});
document.getElementById('standard').addEventListener('click', () => { energy.value = fromE(E_STANDARD).toFixed(3); update(); });
document.getElementById('modified').addEventListener('click', () => { energy.value = fromE(E_MODIFIED).toFixed(3); update(); });
document.getElementById('compact').addEventListener('click', () => { addPoint(parseFloat(mcInput.value) / 100); update(); });
document.getElementById('clear').addEventListener('click', () => { points = []; update(); });
document.addEventListener('tool-reset', () => { points = []; update(); });

let sweeping = null;
document.getElementById('sweep').addEventListener('click', () => {
    if (sweeping) return;
    const s = state();
    const centre = s.soil.kind === 'bridges' ? 0.1 : s.opt.w;
    const span = s.soil.kind === 'bridges' ? [-0.1, -0.08, -0.06, -0.03, 0, 0.04, 0.08, 0.11] : [-0.06, -0.04, -0.02, 0, 0.02, 0.04];
    const ws = span.map((d) => Math.max(0, centre + d));
    let k = 0;
    sweeping = setInterval(() => {
        mcInput.value = (100 * ws[k]).toFixed(1);
        addPoint(ws[k]);
        update();
        if (++k >= ws.length) { clearInterval(sweeping); sweeping = null; }
    }, 450);
});

if (window.ResizeObserver) new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
update();
