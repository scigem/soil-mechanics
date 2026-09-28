import { alpha, colors, font, tip } from './ui.js';
import '../css/earth-pressures.css';

// Behind a smooth vertical wall with level ground there is no shear on
// vertical or horizontal planes, so the tilt of the stress has no sideways
// part. It is one number, the vertical tilt C, and
//     K = sigma_h' / sigma_v' = (1 - C) / (1 + C).
// Friction confines C to [-sin phi', +sin phi']. The two stops are Rankine's
// passive and active states. At rest the soil sits wherever deposition left
// it, C0 = (1 - K0) / (1 + K0). Water has no tilt, and sits at C = 0, K = 1.

const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    dial: colors.friction,
    beyond: alpha(colors.ink, 0.05),
    active: colors.stateActive,
    // passive and at rest: a purple and a green kept apart from the active
    // orange and the dial's blue; the palette has no colours for these states
    passive: colors.statePassive,
    rest: colors.stateRest,
    water: colors.waterDark,
    soil: alpha(colors.soilLight, 0.5),
    wall: colors.structure,
    halo: colors.surfaceColor,
};

const ids = ['C', 'H', 'phi', 'K0', 'gamma'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}-value`)]));
const readout = document.getElementById('readout');
const dialCanvas = document.getElementById('dial-canvas');
const wallCanvas = document.getElementById('wall-canvas');
const mohrCanvas = document.getElementById('mohr-canvas');

const rad = (d) => (d * Math.PI) / 180;
const Kof = (C) => (1 - C) / (1 + C);
const Cof = (K) => (1 - K) / (1 + K);
let note = '';

function read() {
    const s = Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));
    const sin = Math.sin(rad(s.phi));
    const Ka = Kof(sin);
    const Kp = Kof(-sin);
    return { ...s, sin, Ka, Kp, K: Kof(s.C), C0: Cof(s.K0) };
}

// Keep C and K0 inside friction's stops, and say so when they are pushed.
function enforceStops(changed) {
    const st = read();
    note = '';
    if (st.C > st.sin) {
        inputs.C.value = st.sin.toFixed(3);
        if (changed === 'C') note = 'Friction stops the dial here: the soil slides down and outwards (active).';
    } else if (st.C < -st.sin) {
        inputs.C.value = (-st.sin).toFixed(3);
        if (changed === 'C') note = 'Friction stops the dial here: the soil is shoved up and back (passive).';
    }
    if (st.K0 < st.Ka) {
        inputs.K0.value = st.Ka.toFixed(2);
        note = 'No deposit can rest below K_a: it would already have slid.';
    } else if (st.K0 > st.Kp) {
        inputs.K0.value = st.Kp.toFixed(2);
        note = 'No deposit can rest above K_p.';
    }
}

function state(st) {
    const tol = 0.002;
    if (st.C >= st.sin - tol) return 'active';
    if (st.C <= -st.sin + tol) return 'passive';
    return 'between';
}

// ---------------------------------------------------------------- drawing helpers

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

function dot(ctx, x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COLORS.halo;
    ctx.stroke();
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

function stateColour(s) {
    return s === 'active' ? COLORS.active : s === 'passive' ? COLORS.passive : COLORS.ink;
}

// ---------------------------------------------------------------- the dial

let dialMap = null;

function drawDial(st, s) {
    const { ctx, w, h } = prepare(dialCanvas);
    const left = 56;
    const right = 18;
    const top = 16;
    const bottom = 40;
    const X = (C) => left + ((C + 1) / 2) * (w - left - right);
    const logK = (K) => Math.log10(K);
    const kMin = 0.1;
    const kMax = 10;
    const Y = (K) => top + ((logK(kMax) - logK(K)) / (logK(kMax) - logK(kMin))) * (h - top - bottom);
    dialMap = { X, left, right, w };

    // beyond the stops
    ctx.fillStyle = COLORS.beyond;
    ctx.fillRect(X(-1), top, X(-st.sin) - X(-1), h - top - bottom);
    ctx.fillRect(X(st.sin), top, X(1) - X(st.sin), h - top - bottom);
    label(ctx, 'beyond the stop', (X(-1) + X(-st.sin)) / 2, top + 12, COLORS.muted);
    label(ctx, 'beyond the stop', (X(1) + X(st.sin)) / 2, top + 12, COLORS.muted);

    // grid
    ctx.lineWidth = 1;
    for (const K of [0.1, 0.2, 0.5, 1, 2, 5, 10]) {
        ctx.strokeStyle = COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(X(-1), Y(K));
        ctx.lineTo(X(1), Y(K));
        ctx.stroke();
        label(ctx, `${K}`, left - 8, Y(K), COLORS.muted, 'right');
    }
    ctx.strokeStyle = COLORS.muted;
    ctx.beginPath();
    ctx.moveTo(X(-1), h - bottom);
    ctx.lineTo(X(1), h - bottom);
    ctx.moveTo(left, top);
    ctx.lineTo(left, h - bottom);
    ctx.stroke();
    for (const C of [-1, -0.5, 0, 0.5, 1]) label(ctx, `${C}`, X(C), h - bottom + 14, COLORS.muted);
    label(ctx, 'vertical tilt C', (X(-1) + X(1)) / 2, h - 8, COLORS.ink);
    ctx.save();
    ctx.translate(14, (top + h - bottom) / 2);
    ctx.rotate(-Math.PI / 2);
    label(ctx, 'K = σh′/σv′', 0, 0, COLORS.ink);
    ctx.restore();

    // the curve: dotted everywhere, solid between the stops
    const curve = (a, b) => {
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const C = a + ((b - a) * i) / 200;
            const K = Kof(C);
            if (K < kMin || K > kMax) continue;
            if (i === 0 || Kof(a + ((b - a) * (i - 1)) / 200) > kMax) ctx.moveTo(X(C), Y(K));
            else ctx.lineTo(X(C), Y(K));
        }
        ctx.stroke();
    };
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1.5;
    curve(-0.99, 0.99);
    ctx.setLineDash([]);
    ctx.strokeStyle = COLORS.dial;
    ctx.lineWidth = 3;
    curve(-st.sin, st.sin);

    // the trip from rest to here
    if (Math.abs(st.C - st.C0) > 0.01) {
        const yTrip = h - bottom - 12;
        arrow(ctx, X(st.C0), yTrip, X(st.C), yTrip, stateColour(s), 2, 8);
    }

    // named points
    const named = [
        [-st.sin, st.Kp, `passive  K_p = ${st.Kp.toFixed(2)}`, COLORS.passive, 'right'],
        [0, 1, 'water  K = 1', COLORS.water, 'left'],
        [st.C0, st.K0, `at rest  K₀ = ${st.K0.toFixed(2)}`, COLORS.rest, 'left'],
        [st.sin, st.Ka, `active  K_a = ${st.Ka.toFixed(2)}`, COLORS.active, 'left'],
    ];
    for (const [C, K, text, colour, align] of named) {
        dot(ctx, X(C), Y(K), 5, colour);
        label(ctx, text, X(C) + (align === 'left' ? 9 : -9), Y(K) - 11, colour, align);
    }

    // where the dial is now
    ctx.strokeStyle = stateColour(s);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(X(st.C), Y(st.K));
    ctx.lineTo(X(st.C), h - bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    dot(ctx, X(st.C), Y(st.K), 8, stateColour(s));
}

// ---------------------------------------------------------------- the wall

function drawWall(st, s) {
    const { ctx, w, h } = prepare(wallCanvas);
    const top = 34;
    const bottom = 26;
    const scale = (h - top - bottom) / st.H; // pixels per metre, vertically and horizontally
    const wallX = 0.46 * w;
    const Yz = (z) => top + z * scale;

    // soil and wall
    ctx.fillStyle = COLORS.soil;
    ctx.fillRect(wallX, Yz(0), w - wallX, st.H * scale + 6);
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wallX - 10, Yz(0) - 8, 10, st.H * scale + 14);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wallX, Yz(0));
    ctx.lineTo(w, Yz(0));
    ctx.stroke();

    // the slip plane, at a stop
    if (s !== 'between') {
        const ang = s === 'active' ? Math.PI / 4 + rad(st.phi) / 2 : Math.PI / 4 - rad(st.phi) / 2;
        const run = (st.H * scale) / Math.tan(ang);
        const colour = stateColour(s);
        ctx.fillStyle = s === 'active' ? alpha(COLORS.active, 0.18) : alpha(COLORS.passive, 0.14);
        ctx.beginPath();
        ctx.moveTo(wallX, Yz(st.H));
        ctx.lineTo(Math.min(wallX + run, w), Yz(0) + Math.max(0, wallX + run - w) * Math.tan(ang));
        ctx.lineTo(Math.min(wallX + run, w), Yz(0));
        ctx.lineTo(wallX, Yz(0));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = colour;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wallX, Yz(st.H));
        ctx.lineTo(wallX + run, Yz(0));
        ctx.stroke();
        const lab = s === 'active' ? '45° + φ′/2' : '45° − φ′/2';
        label(ctx, lab, Math.min(wallX + run, w - 40) - 6, Yz(0) + 14, colour, 'right');
    }

    // the pressure diagram, on the free side of the wall, pushing it outwards
    const pMax = st.Kp * st.gamma * st.H; // passive at the base sets the scale
    const pscale = (0.9 * (wallX - 20)) / pMax;
    const base = st.K * st.gamma * st.H;
    const colour = stateColour(s);
    ctx.fillStyle = s === 'active' ? alpha(COLORS.active, 0.22) : s === 'passive' ? alpha(COLORS.passive, 0.18) : alpha(COLORS.ink, 0.10);
    ctx.beginPath();
    ctx.moveTo(wallX - 10, Yz(0));
    ctx.lineTo(wallX - 10 - base * pscale, Yz(st.H));
    ctx.lineTo(wallX - 10, Yz(st.H));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    for (let z = st.H / 6; z <= st.H + 1e-9; z += st.H / 6) {
        const len = st.K * st.gamma * z * pscale;
        if (len > 10) arrow(ctx, wallX - 10, Yz(z), wallX - 10 - len, Yz(z), colour, 1.2, 6);
    }
    const bx = wallX - 14 - base * pscale;
    if (bx > 60) label(ctx, `${base.toFixed(1)} kPa`, bx, Yz(st.H) + 13, colour, 'right');
    else label(ctx, `${base.toFixed(1)} kPa`, 4, Yz(st.H) + 13, colour, 'left');

    // the at-rest diagram for comparison
    const rest = st.K0 * st.gamma * st.H;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = COLORS.rest;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(wallX - 10, Yz(0));
    ctx.lineTo(wallX - 10 - rest * pscale, Yz(st.H));
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, 'at rest', wallX - 14 - rest * pscale, Yz(st.H) - 10, COLORS.rest, 'right');

    // which way the wall has moved from rest
    const dC = st.C - st.C0;
    if (Math.abs(dC) > 0.01) {
        const away = dC > 0;
        const y = Yz(0) - 16;
        arrow(ctx, wallX - 5, y, wallX - 5 + (away ? -34 : 34), y, colour, 2, 8);
        label(ctx, away ? 'moved away' : 'pushed in', wallX - 5 + (away ? -40 : 40), y,
            colour, away ? 'right' : 'left');
    }
    label(ctx, `H = ${st.H} m`, w - 8, Yz(st.H) + 13, COLORS.muted, 'right');
}

// ---------------------------------------------------------------- the Mohr circle

function drawMohr(st, s) {
    const { ctx, w, h } = prepare(mohrCanvas);
    const pad = 28;
    const sv = st.gamma * st.H;
    const sh = st.K * sv;
    const p = (sv + sh) / 2;
    const q = Math.abs(sv - sh) / 2;
    const sMax = Math.max(sv, st.Kp * sv) * 1.08;
    const scale = Math.min((w - 2 * pad) / sMax, (h - 2 * pad) / (0.55 * sMax));
    const X = (x) => pad + x * scale;
    const y0 = h / 2 + 0.05 * h;
    const Y = (t) => y0 - t * scale;

    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(0), y0);
    ctx.lineTo(w - 8, y0);
    ctx.moveTo(X(0), 8);
    ctx.lineTo(X(0), h - 8);
    ctx.stroke();
    label(ctx, 'σ′', w - 10, y0 - 10, COLORS.ink, 'right');
    label(ctx, 'τ', X(0) + 6, 12, COLORS.ink, 'left');

    const t = Math.tan(rad(st.phi));
    ctx.strokeStyle = COLORS.dial;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X(0), y0);
    ctx.lineTo(w, Y(((w - pad) / scale) * t));
    ctx.moveTo(X(0), y0);
    ctx.lineTo(w, Y(-((w - pad) / scale) * t));
    ctx.stroke();

    const colour = stateColour(s);
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(X(p), y0, q * scale, 0, 2 * Math.PI);
    ctx.stroke();
    dot(ctx, X(sv), y0, 5, COLORS.ink);
    dot(ctx, X(sh), y0, 5, colour);
    label(ctx, 'σv′', X(sv), y0 + 14, COLORS.ink);
    label(ctx, 'σh′', X(sh), y0 - 14, colour);
}

// ---------------------------------------------------------------- readout

function drawReadout(st, s) {
    const sv = st.gamma * st.H;
    const P = 0.5 * st.K * st.gamma * st.H * st.H;
    const toActive = st.sin - st.C0;
    const toPassive = st.C0 + st.sin;
    const messages = {
        active: 'At the active stop. The soil is sliding down and outwards on a steep plane; K cannot fall any further.',
        passive: 'At the passive stop. The soil is being shoved up and back on a shallow plane; K cannot rise any further.',
        between: 'Between the stops. The soil is not sliding, and where it sits is set by its history and the wall.',
    };
    const items = [
        ['C', st.C.toFixed(3), 'The vertical tilt of the stress: positive when σv′ is the larger, negative when σh′ is.'],
        ['K', st.K.toFixed(3), 'The earth pressure coefficient, σh′/σv′ = (1 − C)/(1 + C).'],
        ['K_a  ·  K₀  ·  K_p', `${st.Ka.toFixed(2)}  ·  ${st.K0.toFixed(2)}  ·  ${st.Kp.toFixed(2)}`, 'The active, at-rest and passive coefficients. K_a = (1 − sin φ′)/(1 + sin φ′) and K_p is its inverse.'],
        ["σv′ at base", `${sv.toFixed(1)} kPa`, 'The vertical effective stress at the base of the wall, γH.'],
        ["σh′ at base", `${(st.K * sv).toFixed(1)} kPa`, 'The horizontal effective stress on the wall at its base, KγH.'],
        ['thrust P = ½Kγ H²', `${P.toFixed(1)} kN/m`, 'The total horizontal force on the wall per metre run: the area of the pressure diagram.'],
        ['from rest to active', `ΔC = ${toActive.toFixed(3)}`, 'How far the tilt has to move from rest to reach the active stop.'],
        ['from rest to passive', `ΔC = ${toPassive.toFixed(3)} (${(toPassive / toActive).toFixed(1)}× further)`, 'How far the tilt has to move from rest to reach the passive stop, and how many times further that is than to the active stop.'],
    ];
    readout.innerHTML =
        `<div class="status ${s === 'between' ? 'safe' : 'cap'}">${note || messages[s]}</div>` +
        items.map(([k, v, t]) => `<div class="item"><span>${k}${tip(t)}</span><strong>${v}</strong></div>`).join('');
}

// ---------------------------------------------------------------- wiring

function update(changed) {
    enforceStops(changed);
    const units = { C: '', H: ' m', phi: '°', K0: '', gamma: ' kN/m³' };
    for (const id of ids) {
        const v = parseFloat(inputs[id].value);
        outputs[id].textContent = (id === 'C' ? v.toFixed(3) : id === 'K0' ? v.toFixed(2) : `${v}`) + units[id];
    }
    const st = read();
    const s = state(st);
    drawDial(st, s);
    drawWall(st, s);
    drawMohr(st, s);
    drawReadout(st, s);
}

for (const id of ids) inputs[id].addEventListener('input', () => update(id));
document.addEventListener('tool-reset', () => update());

document.querySelectorAll('[data-preset]').forEach((button) =>
    button.addEventListener('click', () => {
        const st = read();
        const kind = button.dataset.preset;
        if (kind === 'jaky') {
            inputs.K0.value = (1 - st.sin).toFixed(2);
            inputs.C.value = Cof(1 - st.sin).toFixed(3);
        } else {
            inputs.C.value = { active: st.sin, rest: st.C0, passive: -st.sin }[kind].toFixed(3);
        }
        update(kind);
    })
);

// Dragging along the dial moves C.
let dragging = false;
function fromPointer(event) {
    if (!dialMap) return;
    const rect = dialCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const C = ((x - dialMap.left) / (dialMap.w - dialMap.left - dialMap.right)) * 2 - 1;
    inputs.C.value = Math.max(-1, Math.min(1, C)).toFixed(3);
    update('C');
}
dialCanvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    dialCanvas.setPointerCapture(e.pointerId);
    fromPointer(e);
});
dialCanvas.addEventListener('pointermove', (e) => dragging && fromPointer(e));
dialCanvas.addEventListener('pointerup', () => (dragging = false));

if (window.ResizeObserver) new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
update();
