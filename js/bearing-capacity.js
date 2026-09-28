import { alpha, colors, font, tip } from './ui.js';
import '../css/bearing-capacity.css';

// Prandtl's strip footing, read as a quarter turn of the tilt of the stress.
//
// Beside the footing the soil is passive: sigma_1' horizontal, the tilt lying
// flat and at the cap, so sigma_v0' = p'(1 - sin phi'). Under the footing it is
// active: sigma_1' vertical, so q_ult = p'(1 + sin phi'). Between them the tilt
// turns through 90 degrees while staying at the cap, and equilibrium makes the
// squeeze grow as exp(2 tan phi' * angle turned). Cohesion is a built-in
// pressure c' cot phi' added to every normal stress. At phi' = 0 the growth
// becomes additive, 2 s_u per radian, and N_c -> 2 + pi.
// The weight of the soil in the mechanism (the N_gamma term) is left out.

const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    active: colors.stateActive,
    // the passive zone: a purple kept apart from the active orange and the
    // fan's blue; the palette has no third zone colour
    passive: colors.statePassive,
    fan: colors.primary,
    footing: colors.structure,
};

const ids = ['phi', 'c', 'sv0', 'psi'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}-value`)]));
const readout = document.getElementById('readout');
const mechCanvas = document.getElementById('mech-canvas');
const ladderCanvas = document.getElementById('ladder-canvas');
const rad = (d) => (d * Math.PI) / 180;

function solve() {
    const s = Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));
    const phi = rad(s.phi);
    const sin = Math.sin(phi);
    const fromActive = rad(s.psi);            // how far round the fan, out from the footing
    const turned = Math.PI / 2 - fromActive;  // the same point, measured from the passive side
    let pP, pA, pNow, qult, Nq, Nc, Kp, turn;
    if (s.phi < 0.25) {
        // frictionless: the cap is a fixed q = s_u, and turning adds 2 s_u per radian
        Kp = 1;
        turn = 1;
        Nq = 1;
        Nc = 2 + Math.PI;
        pP = s.sv0 + s.c;
        pNow = pP + 2 * s.c * turned;
        pA = pP + Math.PI * s.c;
        qult = pA + s.c;
    } else {
        const shift = s.c / Math.tan(phi);
        Kp = (1 + sin) / (1 - sin);
        turn = Math.exp(Math.PI * Math.tan(phi));
        Nq = Kp * turn;
        Nc = (Nq - 1) / Math.tan(phi);
        const pPs = (s.sv0 + shift) / (1 - sin); // shifted squeeze in the passive zone
        pP = pPs - shift;
        pNow = pPs * Math.exp(2 * Math.tan(phi) * turned) - shift;
        pA = pPs * turn - shift;
        qult = pPs * turn * (1 + sin) - shift;
    }
    return { ...s, phiRad: phi, sin, turned, fromActive, pP, pA, pNow, qult, Nq, Nc, Kp, turn };
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

function arrow(ctx, x0, y0, x1, y1, color, width = 1.5, head = 7) {
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

// ---------------------------------------------------------------- the mechanism

function geometry(phi) {
    // half-width 1; all angles measured in standard maths orientation, y up
    const a = Math.PI / 4 + phi / 2;
    const apex = [0, -Math.tan(a)];
    const r0 = 1 / Math.cos(a);
    const start = Math.PI + a; // direction from the right-hand edge to the apex
    const r = (psiFromActive) => r0 * Math.exp(psiFromActive * Math.tan(phi));
    const r1 = r(Math.PI / 2);
    const D = [1 + r1 * Math.cos(start + Math.PI / 2), r1 * Math.sin(start + Math.PI / 2)];
    const E = [1 + 2 * r1 * Math.cos(Math.PI / 4 - phi / 2), 0];
    return { a, apex, r0, start, r, r1, D, E };
}

function drawMechanism(st) {
    const { ctx, w, h } = prepare(mechCanvas);
    const g = geometry(st.phiRad);
    const depth = Math.max(-g.apex[1], ...Array.from({ length: 31 }, (_, k) => {
        const psi = (k / 30) * (Math.PI / 2);
        return -g.r(psi) * Math.sin(g.start + psi);
    }));
    const halfWidth = g.E[0] + 0.3;
    const scale = Math.min((w - 20) / (2 * halfWidth), (h - 20) / (depth + 0.75));
    const X = (x) => w / 2 + x * scale;
    const Y = (y) => 10 + 0.62 * scale - y * scale;

    for (const sgn of [1, -1]) {
        const m = ([x, y]) => [X(sgn * x), Y(y)];
        const spiral = [];
        for (let k = 0; k <= 60; k++) {
            const psi = (k / 60) * (Math.PI / 2);
            const rr = g.r(psi);
            spiral.push([1 + rr * Math.cos(g.start + psi), rr * Math.sin(g.start + psi)]);
        }
        poly(ctx, [[0, 0], [1, 0], g.apex].map(m), alpha(COLORS.active, 0.22), COLORS.ink);
        poly(ctx, [[1, 0], ...spiral].map(m), alpha(COLORS.fan, 0.12), COLORS.ink);
        poly(ctx, [[1, 0], g.D, g.E].map(m), alpha(COLORS.passive, 0.14), COLORS.ink);

        // the highlighted ray: how far the tilt has turned
        const psiA = st.fromActive;
        const rr = g.r(psiA);
        const end = [1 + rr * Math.cos(g.start + psiA), rr * Math.sin(g.start + psiA)];
        ctx.strokeStyle = COLORS.fan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(...m([1, 0]));
        ctx.lineTo(...m(end));
        ctx.stroke();

        // ticks along the tilt
        const tick = (pt, ang, colour) => {
            const L = 0.09;
            const d = [L * Math.cos(ang), L * Math.sin(ang)];
            const a = m([pt[0] - d[0], pt[1] - d[1]]);
            const b = m([pt[0] + d[0], pt[1] + d[1]]);
            ctx.strokeStyle = colour;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(...a);
            ctx.lineTo(...b);
            ctx.stroke();
        };
        for (const pt of [[0.35, -0.3], [0.4, -0.75]]) tick(pt, Math.PI / 2, COLORS.active);
        for (const f of [0.2, 0.5, 0.8]) {
            const psi = f * (Math.PI / 2);
            const rr2 = 0.6 * g.r(psi);
            const ang = g.start + psi;
            tick([1 + rr2 * Math.cos(ang), rr2 * Math.sin(ang)], ang + Math.PI / 4 - st.phiRad / 2, COLORS.fan);
        }
        const cen = [(1 + g.D[0] + g.E[0]) / 3, (g.D[1]) / 3];
        tick(cen, 0, COLORS.passive);
        // the tilt on the highlighted ray
        const mid = [1 + 0.6 * rr * Math.cos(g.start + psiA), 0.6 * rr * Math.sin(g.start + psiA)];
        tick(mid, g.start + psiA + Math.PI / 4 - st.phiRad / 2, COLORS.ink);
    }

    // ground, footing and loads
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(X(-halfWidth), Y(0));
    ctx.lineTo(X(halfWidth), Y(0));
    ctx.stroke();
    ctx.fillStyle = COLORS.footing;
    ctx.fillRect(X(-1), Y(0.16), 2 * scale, 0.16 * scale);
    for (let k = -3; k <= 3; k++) arrow(ctx, X(0.3 * k), Y(0.5), X(0.3 * k), Y(0.17), COLORS.active, 1.4, 6);
    label(ctx, `q_ult = ${st.qult.toFixed(0)} kPa`, X(1.08), Y(0.4), COLORS.active, 'left');
    if (st.sv0 > 0) {
        for (const sgn of [1, -1]) {
            for (let x = 1.4; x < g.E[0]; x += 0.6) {
                arrow(ctx, X(sgn * x), Y(0.22), X(sgn * x), Y(0.02), COLORS.passive, 1, 5);
            }
        }
        label(ctx, `σv0′ = ${st.sv0} kPa`, X(0.62 * g.E[0]), Y(0.34), COLORS.passive, 'center', 'bottom');
    }
    label(ctx, 'active', X(0), Y(0.45 * g.apex[1]), COLORS.active);
    label(ctx, 'passive', X(g.E[0] * 0.72), Y(g.D[1] * 0.25), COLORS.passive);
    label(ctx, 'fan', X(1 + 0.5 * g.r0), Y(-0.9 * g.r0), COLORS.fan);
}

// ---------------------------------------------------------------- the ladder

function drawLadder(st) {
    const { ctx, w, h } = prepare(ladderCanvas);
    const left = 60;
    const right = 20;
    const top = 16;
    const bottom = 34;
    // read left to right: out from the footing, round the fan, to the surcharge
    const xs = { footing: 0.0, active: 0.16, fan0: 0.28, fan1: 0.72, passive: 0.84, surcharge: 1.0 };
    const X = (f) => left + f * (w - left - right);

    const positive = [st.sv0, st.pP, st.pA, st.qult].filter((v) => v > 0);
    if (positive.length < 2 || st.qult <= 0) {
        label(ctx, 'With no surcharge and no cohesion, a weightless soil carries nothing.', w / 2, h / 2 - 8, COLORS.ink);
        label(ctx, 'All of its bearing capacity then comes from its weight: the ½γB N_γ term.', w / 2, h / 2 + 12, COLORS.muted);
        return;
    }
    const lo = Math.max(Math.min(...positive) / 1.6, 0.5);
    const hi = Math.max(...positive) * 1.4;
    const Y = (p) => top + ((Math.log(hi) - Math.log(Math.max(p, lo))) / (Math.log(hi) - Math.log(lo))) * (h - top - bottom);

    // grid
    ctx.font = font(12);
    for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
        for (const k of [1, 2, 5]) {
            const v = k * Math.pow(10, e);
            if (v < lo || v > hi) continue;
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(left, Y(v));
            ctx.lineTo(w - right, Y(v));
            ctx.stroke();
            label(ctx, `${v}`, left - 6, Y(v), COLORS.muted, 'right');
        }
    }
    label(ctx, "kPa", 8, top + 4, COLORS.muted, 'left');

    // zones
    const zone = (a, b, colour, name) => {
        ctx.fillStyle = colour;
        ctx.fillRect(X(a), top, X(b) - X(a), h - top - bottom);
        label(ctx, name, (X(a) + X(b)) / 2, h - bottom + 14, COLORS.muted);
    };
    zone(xs.active - 0.05, xs.fan0, alpha(COLORS.active, 0.08), 'active zone');
    zone(xs.fan0, xs.fan1, alpha(COLORS.fan, 0.08), 'the fan: a quarter turn');
    zone(xs.fan1, xs.passive + 0.05, alpha(COLORS.passive, 0.07), 'passive zone');

    // the path of p'
    ctx.strokeStyle = COLORS.fan;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(X(xs.active - 0.05), Y(st.pA));
    ctx.lineTo(X(xs.fan0), Y(st.pA));
    for (let k = 0; k <= 60; k++) {
        const f = k / 60;                      // fraction of the way out from the active side
        const turned = (1 - f) * (Math.PI / 2); // measured from the passive side
        let p;
        if (st.phi < 0.25) p = st.pP + 2 * st.c * turned;
        else {
            const shift = st.c / Math.tan(st.phiRad);
            p = (st.pP + shift) * Math.exp(2 * Math.tan(st.phiRad) * turned) - shift;
        }
        ctx.lineTo(X(xs.fan0 + f * (xs.fan1 - xs.fan0)), Y(p));
    }
    ctx.lineTo(X(xs.passive + 0.05), Y(st.pP));
    ctx.stroke();

    // the two ends
    const point = (x, p, colour, text, align = 'center', dy = -12) => {
        ctx.beginPath();
        ctx.arc(X(x), Y(p), 5, 0, 2 * Math.PI);
        ctx.fillStyle = colour;
        ctx.fill();
        label(ctx, text, X(x), Y(p) + dy, colour, align);
    };
    point(xs.footing + 0.03, st.qult, COLORS.active, `q_ult ${st.qult.toFixed(0)}`, 'left');
    point(xs.active, st.pA, COLORS.active, `p′ ${st.pA.toFixed(0)}`);
    point(xs.passive, st.pP, COLORS.passive, `p′ ${st.pP.toFixed(0)}`);
    if (st.sv0 > 0) point(xs.surcharge - 0.04, st.sv0, COLORS.passive, `σv0′ ${st.sv0.toFixed(0)}`, 'right', 14);

    // the ratio across each zone, written along the bottom of the zone
    ctx.font = font(12);
    const yTag = h - bottom - 10;
    const tags = st.phi >= 0.25
        ? [['q_ult / p′ = 1 + sin φ′', COLORS.active], [`across the fan: × e^{π tan φ′} = ${st.turn.toFixed(2)}`, COLORS.fan],
           ['p′ / σv0′ = 1/(1 − sin φ′)', COLORS.passive]]
        : [['q_ult − p = s_u', COLORS.active], ['across the fan: + π s_u', COLORS.fan], ['p − σv0 = s_u', COLORS.passive]];
    label(ctx, tags[0][0], X(xs.active - 0.05) + 4, yTag, tags[0][1], 'left');
    label(ctx, tags[1][0], X(0.5 * (xs.fan0 + xs.fan1)), yTag, tags[1][1]);
    label(ctx, tags[2][0], X(xs.passive + 0.05) - 4, yTag, tags[2][1], 'right');

    // where the slider is
    const f = st.fromActive / (Math.PI / 2);
    const xNow = xs.fan0 + f * (xs.fan1 - xs.fan0);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(xNow), top);
    ctx.lineTo(X(xNow), h - bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(X(xNow), Y(st.pNow), 6, 0, 2 * Math.PI);
    ctx.fillStyle = COLORS.ink;
    ctx.fill();
    label(ctx, `${st.psi}° out from the footing: p′ = ${st.pNow.toFixed(0)}`, X(xNow) + 8, Y(st.pNow) - 12, COLORS.ink, 'left');
}

// ---------------------------------------------------------------- readout

function drawReadout(st) {
    const items = st.phi < 0.25
        ? [
            ['N_c', `2 + π = ${st.Nc.toFixed(2)}`, 'The bearing capacity factor for cohesion. At φ′ = 0 it is 2 + π: 2 from the two ends and π from the quarter turn.'],
            ['q_ult = N_c s_u + σv0', `${st.qult.toFixed(1)} kPa`, 'The ultimate bearing pressure under the footing, without the weight of the soil.'],
            ['the two ends', '2 s_u', 'What the active and passive zones add together at φ′ = 0: s_u each.'],
            ['the quarter turn', 'π s_u', 'What turning the stress through 90° across the fan adds at φ′ = 0: 2 s_u per radian.'],
        ]
        : [
            ['K_p (the two ends)', st.Kp.toFixed(2), 'The passive earth pressure coefficient, (1 + sin φ′)/(1 − sin φ′): the gain from the two ends, where the tilt is at the cap.'],
            ['e^{π tan φ′} (the turn)', st.turn.toFixed(2), 'The gain in squeeze from turning the tilt through a quarter turn at the cap, across the fan.'],
            ['N_q = K_p e^{π tan φ′}', st.Nq.toFixed(2), 'The bearing capacity factor for the surcharge: the two ends times the turn.'],
            ['N_c = (N_q − 1) cot φ′', st.Nc.toFixed(2), 'The bearing capacity factor for cohesion, which acts as a built-in pressure c′ cot φ′.'],
            ['q_ult = N_q σv0′ + N_c c′', `${(st.Nq * st.sv0 + st.Nc * st.c).toFixed(1)} kPa`, 'The ultimate bearing pressure under the footing, without the weight of the soil (the ½γB N_γ term).'],
        ];
    readout.innerHTML = items.map(([k, v, t]) => `<div class="item"><span>${k}${tip(t)}</span><strong>${v}</strong></div>`).join('');
}

// ---------------------------------------------------------------- wiring

function update() {
    const units = { phi: '°', c: ' kPa', sv0: ' kPa', psi: '°' };
    for (const id of ids) outputs[id].textContent = `${parseFloat(inputs[id].value)}${units[id]}`;
    const st = solve();
    drawMechanism(st);
    drawLadder(st);
    drawReadout(st);
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
        const f = Math.min(1, (t - t0) / 3000);
        inputs.psi.value = Math.round(90 * f);
        update();
        playing = f < 1 ? requestAnimationFrame(step) : null;
    };
    playing = requestAnimationFrame(step);
});

if (window.ResizeObserver) new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
update();
