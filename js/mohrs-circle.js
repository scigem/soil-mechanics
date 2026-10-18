import { alpha, colors, font, tip } from './ui.js';
import { stressTensor, traction } from './stress-tensor.mjs';
import '../css/mohrs-circle.css';

// A stress in a long (two-dimensional) body has a size p' and a tilt. The tilt
// is an arrow: its length is q/p' and its direction is that of sigma_1', at an
// angle beta from the vertical. Writing
//     C = (q/p') cos 2 beta,   S = (q/p') sin 2 beta
// the stresses on horizontal and vertical planes are
//     sigma_v' = p'(1 + C),   sigma_h' = p'(1 - C),   tau = p' S.
// Friction caps the length of the tilt: q <= (p' + c' cot phi') sin phi'.
// Compression is positive throughout.

const COLORS = {
    ink: colors.ink,
    muted: colors.muted,
    faint: colors.faint,
    grid: colors.grid,
    circle: colors.friction,
    cap: colors.stateActive,
    beyond: colors.failFg,
    allowed: alpha(colors.friction, 0.08),
    // the chosen plane: a green kept apart from the circle, the cap and the
    // failure colours; the palette has no neutral green
    plane: colors.plane,
    element: alpha(colors.soilLight, 0.13),
    halo: colors.surfaceColor,
    normal: colors.friction,
    shear: colors.stateActive,
    minor: colors.waterDark,
};

const ids = ['p', 'tilt', 'beta', 'phi', 'cohesion', 'theta'];
const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const outputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(`${id}-value`)]));
const readout = document.getElementById('readout');
const mohrCanvas = document.getElementById('mohr-canvas');
const discCanvas = document.getElementById('disc-canvas');
const boxCanvas = document.getElementById('box-canvas');
const ellipseCanvas = document.getElementById('ellipse-canvas');
const vectorMode = document.getElementById('vector-mode');

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

function read() {
    const s = Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));
    const phi = rad(s.phi);
    const shift = s.cohesion > 0 ? s.cohesion / Math.tan(phi) : 0;
    const q = s.tilt * s.p;
    const C = s.tilt * Math.cos(2 * rad(s.beta));
    const S = s.tilt * Math.sin(2 * rad(s.beta));
    const capTilt = (Math.sin(phi) * (s.p + shift)) / s.p; // the cap on q/p'
    const planeAngle = 2 * rad(s.beta - s.theta);
    return {
        ...s,
        phiRad: phi,
        shift,
        q,
        C,
        S,
        ...stressTensor(s.p, q, s.beta),
        capTilt,
        planeSigma: s.p + q * Math.cos(planeAngle),
        planeTau: q * Math.sin(planeAngle),
    };
}

function status(st) {
    const tol = 0.004;
    if (st.tilt > st.capTilt + tol) return 'beyond';
    if (st.tilt > st.capTilt - tol) return 'cap';
    return 'safe';
}

// ---------------------------------------------------------------- canvases

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

function niceCeil(x) {
    const m = Math.pow(10, Math.floor(Math.log10(x)));
    for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * m >= x) return k * m;
    return 10 * m;
}

function niceStep(range, target) {
    const rough = range / target;
    const m = Math.pow(10, Math.floor(Math.log10(rough)));
    for (const k of [1, 2, 5, 10]) if (k * m >= rough) return k * m;
    return 10 * m;
}

function dot(ctx, x, y, r, fill, stroke = COLORS.halo) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
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

// ---------------------------------------------------------------- Mohr panel

function drawMohr(st, state) {
    const { ctx, w, h } = prepare(mohrCanvas);
    const pad = 36;

    // A scale that changes in steps, so the picture does not swim as you drag.
    const sigmaMax = niceCeil(Math.max(st.sigma1, st.p * 1.2, 40) * 1.12);
    const sigmaMin = -Math.max(st.shift * 1.15, sigmaMax * 0.08);
    const scale = Math.min((w - 2 * pad) / (sigmaMax - sigmaMin), (h - 2 * pad) / (2 * sigmaMax * 0.62));
    const x0 = pad - sigmaMin * scale;
    const y0 = h / 2;
    const X = (s) => x0 + s * scale;
    const Y = (t) => y0 - t * scale;
    const tauMax = (y0 - pad) / scale;

    // grid and axes
    const step = niceStep(sigmaMax - sigmaMin, 7);
    ctx.lineWidth = 1;
    for (let s = Math.ceil(sigmaMin / step) * step; s <= sigmaMax; s += step) {
        ctx.strokeStyle = COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(X(s), Y(tauMax));
        ctx.lineTo(X(s), Y(-tauMax));
        ctx.stroke();
        if (Math.abs(s) > 1e-9) label(ctx, `${Math.round(s)}`, X(s), y0 + 14, COLORS.muted);
    }
    for (let t = step; t <= tauMax; t += step) {
        for (const sgn of [1, -1]) {
            ctx.strokeStyle = COLORS.grid;
            ctx.beginPath();
            ctx.moveTo(X(sigmaMin), Y(sgn * t));
            ctx.lineTo(X(sigmaMax), Y(sgn * t));
            ctx.stroke();
            label(ctx, `${Math.round(sgn * t)}`, X(0) - 6, Y(sgn * t), COLORS.muted, 'right');
        }
    }
    ctx.strokeStyle = COLORS.muted;
    ctx.beginPath();
    ctx.moveTo(X(sigmaMin), y0);
    ctx.lineTo(X(sigmaMax), y0);
    ctx.moveTo(X(0), Y(tauMax));
    ctx.lineTo(X(0), Y(-tauMax));
    ctx.stroke();
    label(ctx, "σ′ (kPa)", X(sigmaMax), Y(-tauMax) - 4, COLORS.ink, 'right', 'bottom');
    label(ctx, 'τ (kPa)', X(0) + 6, Y(tauMax) + 2, COLORS.ink, 'left', 'top');

    // the Mohr-Coulomb lines and the allowed wedge between them
    const apex = -st.shift;
    const far = sigmaMax;
    const tanPhi = Math.tan(st.phiRad);
    ctx.fillStyle = COLORS.allowed;
    ctx.beginPath();
    ctx.moveTo(X(apex), y0);
    ctx.lineTo(X(far), Y((far - apex) * tanPhi));
    ctx.lineTo(X(far), Y(-(far - apex) * tanPhi));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = COLORS.circle;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(X(apex), y0);
    ctx.lineTo(X(far), Y((far - apex) * tanPhi));
    ctx.moveTo(X(apex), y0);
    ctx.lineTo(X(far), Y(-(far - apex) * tanPhi));
    ctx.stroke();
    const envLabel = st.shift > 0 ? "τ = c′ + σ′ tan φ′" : "τ = σ′ tan φ′";
    ctx.save();
    const lx = apex + 0.72 * (far - apex);
    ctx.translate(X(lx), Y(lx * tanPhi + (st.shift > 0 ? st.cohesion : 0)) - 8);
    ctx.rotate(-Math.atan(tanPhi));
    label(ctx, envLabel, 0, 0, COLORS.circle, 'center', 'bottom');
    ctx.restore();
    if (st.shift > 0) {
        dot(ctx, X(apex), y0, 3.5, COLORS.circle);
        label(ctx, "−c′ cot φ′", X(apex), y0 + 16, COLORS.circle);
    }

    // the circle
    const colour = state === 'safe' ? COLORS.circle : state === 'cap' ? COLORS.cap : COLORS.beyond;
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(X(st.p), y0, st.q * scale, 0, 2 * Math.PI);
    ctx.stroke();

    // at the cap: the touching points, and the radius to them
    if (state !== 'safe') {
        for (const sgn of [1, -1]) {
            const px = st.p - st.q * Math.sin(st.phiRad);
            const py = sgn * st.q * Math.cos(st.phiRad);
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = colour;
            ctx.beginPath();
            ctx.moveTo(X(st.p), y0);
            ctx.lineTo(X(px), Y(py));
            ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, X(px), Y(py), 4, colour);
        }
    }

    // horizontal and vertical planes: the ends of one diameter
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(st.sigmaV), Y(st.tau));
    ctx.lineTo(X(st.sigmaH), Y(-st.tau));
    ctx.stroke();
    dot(ctx, X(st.sigmaV), Y(st.tau), 5.5, COLORS.ink);
    dot(ctx, X(st.sigmaH), Y(-st.tau), 5.5, COLORS.muted);
    const off = st.tau >= 0 ? -14 : 14;
    label(ctx, 'H', X(st.sigmaV), Y(st.tau) + off, COLORS.ink);
    label(ctx, 'V', X(st.sigmaH), Y(-st.tau) - off, COLORS.muted);

    // principal stresses and centre
    dot(ctx, X(st.p), y0, 3, colour);
    label(ctx, "p′", X(st.p), y0 + 14, colour);
    if (st.q * scale > 18) {
        label(ctx, "σ₁′", X(st.sigma1) + 4, y0 - 10, colour, 'left');
        label(ctx, "σ₃′", X(st.sigma3) - 4, y0 - 10, colour, 'right');
    }

    // the chosen plane
    const onH = Math.hypot(st.planeSigma - st.sigmaV, st.planeTau - st.tau) < 1e-6 * st.p;
    const onV = Math.hypot(st.planeSigma - st.sigmaH, st.planeTau + st.tau) < 1e-6 * st.p;
    if (onH || onV) return;
    dot(ctx, X(st.planeSigma), Y(st.planeTau), 4, COLORS.plane);
    label(ctx, 'θ plane', X(st.planeSigma) + 8, Y(st.planeTau) + (st.planeTau >= 0 ? 12 : -12),
        COLORS.plane, 'left');
}

// ---------------------------------------------------------------- disc panel

let discMap = null;

function drawDisc(st, state) {
    const { ctx, w, h } = prepare(discCanvas);
    const R = 0.42 * Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2 + 0.03 * h;
    const X = (c) => cx + c * R;
    const Y = (s) => cy - s * R;
    discMap = { cx, cy, R };
    const cap = Math.min(st.capTilt, 1);

    // q/p' = 1 is the most any packing could reach
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    label(ctx, "q/p′ = 1", X(0.72), Y(0.76), COLORS.muted, 'left');

    // the cap
    ctx.fillStyle = COLORS.allowed;
    ctx.beginPath();
    ctx.arc(cx, cy, cap * R, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = COLORS.circle;
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, st.shift > 0 ? 'cap, with c′' : 'cap: sin φ′', X(cap * 0.71) + 6, Y(-cap * 0.71) + 10,
        COLORS.circle, 'left', 'top');

    // axes
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(-1.1), cy);
    ctx.lineTo(X(1.1), cy);
    ctx.moveTo(cx, Y(-1.1));
    ctx.lineTo(cx, Y(1.1));
    ctx.stroke();
    label(ctx, 'C', X(1.12), cy - 10, COLORS.ink, 'right');
    label(ctx, 'S', cx + 8, Y(1.1), COLORS.ink, 'left', 'top');
    label(ctx, 'σ₁′ vertical →', X(1.1), Y(-1.05), COLORS.muted, 'right');
    label(ctx, '← σ₁′ horizontal', X(-1.1), Y(-1.05), COLORS.muted, 'left');

    // the named states on the C axis
    const jaky = (1 - (1 - Math.sin(st.phiRad))) / (1 + (1 - Math.sin(st.phiRad)));
    for (const [c, name] of [[cap, 'active'], [-cap, 'passive'], [jaky, 'K₀']]) {
        ctx.fillStyle = COLORS.muted;
        ctx.beginPath();
        ctx.arc(X(c), cy, 3, 0, 2 * Math.PI);
        ctx.fill();
        label(ctx, name, X(c), cy + 13, COLORS.muted);
    }

    // the tilt
    const colour = state === 'safe' ? COLORS.ink : state === 'cap' ? COLORS.cap : COLORS.beyond;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(st.C), Y(st.S));
    ctx.lineTo(X(st.C), cy);
    ctx.moveTo(X(st.C), Y(st.S));
    ctx.lineTo(cx, Y(st.S));
    ctx.stroke();
    ctx.setLineDash([]);
    if (st.tilt > 0.02) arrow(ctx, cx, cy, X(st.C), Y(st.S), colour, 2.5, 10);
    dot(ctx, X(st.C), Y(st.S), 6, colour);
    if (st.tilt > 0.08 && Math.abs(st.beta) >= 4) {
        const a = 2 * rad(st.beta);
        ctx.strokeStyle = COLORS.muted;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 0.18 * R, -Math.max(a, 0), -Math.min(a, 0));
        ctx.stroke();
        label(ctx, '2β', X(0.26 * Math.cos(a / 2)), Y(0.26 * Math.sin(a / 2)), COLORS.muted);
    }

    const size = 0.24 * Math.min(w, h);
    drawElement(ctx, st, 10, 10, size, state);
}

// A small element of soil, showing which way sigma_1' points and the chosen plane.
function drawElement(ctx, st, x, y, size, state) {
    const m = size / 2;
    const cx = x + m;
    const cy = y + m;
    const half = 0.28 * size;
    ctx.fillStyle = COLORS.element;
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.fillRect(cx - half, cy - half, 2 * half, 2 * half);
    ctx.strokeRect(cx - half, cy - half, 2 * half, 2 * half);

    // sigma_1' direction: two arrows pushing in on the element along it
    const colour = state === 'safe' ? COLORS.ink : state === 'cap' ? COLORS.cap : COLORS.beyond;
    const b = rad(st.beta);
    const L = 0.5 * size;
    const dx = L * Math.sin(b);
    const dy = L * Math.cos(b);
    const inner = 0.62;
    if (st.tilt > 0.02) {
        arrow(ctx, cx + dx, cy + dy, cx + inner * dx, cy + inner * dy, colour, 2, 7);
        arrow(ctx, cx - dx, cy - dy, cx - inner * dx, cy - inner * dy, colour, 2, 7);
    }
    // the chosen plane
    const t = rad(st.theta);
    const px = 0.5 * size * Math.cos(t);
    const py = 0.5 * size * Math.sin(t);
    ctx.strokeStyle = COLORS.plane;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - px, cy + py);
    ctx.lineTo(cx + px, cy - py);
    ctx.stroke();
    if (st.tilt > 0.02) label(ctx, 'σ₁′', cx + dx + (dx >= 0 ? 4 : -4), cy + dy, colour, dx >= 0 ? 'left' : 'right');
}

// ---------------------------------------------------------------- physical views

function stressScale(ctx, w, h, scale, maxStress) {
    const value = niceStep(maxStress, 4);
    const length = value * scale;
    const x = w - 24 - length;
    const y = h - 22;
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x, y + 3);
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.lineTo(x + length, y - 3);
    ctx.moveTo(x + length, y);
    ctx.lineTo(x + length, y + 3);
    ctx.stroke();
    label(ctx, `${value} kPa`, x + length / 2, y - 10, COLORS.muted);
}

function drawBox(st) {
    const { ctx, w, h } = prepare(boxCanvas);
    const size = Math.min(w, h);
    const cx = w / 2;
    const cy = h * 0.46;
    const half = 0.19 * size;
    const scale = 0.25 * size / niceCeil(st.sigma1);
    const components = vectorMode.value === 'components';
    document.getElementById('vector-legend').innerHTML = components ?
        '<span class="normal-key">Normal</span> · <span class="shear-key">shear</span>' : 'Black: resultant';
    const X = (x) => cx + x;
    const Y = (y) => cy - y;
    ctx.fillStyle = COLORS.element;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 1.5;
    ctx.fillRect(cx - half, cy - half, 2 * half, 2 * half);
    ctx.strokeRect(cx - half, cy - half, 2 * half, 2 * half);

    // Show the chosen plane in the same physical orientation as theta.
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - half, cy - half, 2 * half, 2 * half);
    ctx.clip();
    const t = rad(st.theta);
    ctx.strokeStyle = COLORS.plane;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(X(-2 * half * Math.cos(t)), Y(-2 * half * Math.sin(t)));
    ctx.lineTo(X(2 * half * Math.cos(t)), Y(2 * half * Math.sin(t)));
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-t);
    label(ctx, 'θ', 8, -10, COLORS.plane, 'left');
    ctx.restore();
    label(ctx, 'H', cx, cy - half + 14, COLORS.muted);
    label(ctx, 'V', cx + half - 14, cy, COLORS.muted);

    const vector = (start, v, color) => {
        const length = Math.hypot(v.x, v.y) * scale;
        // A vanishing stress has no arrow, rather than a spurious arrowhead.
        if (length < 0.5) return;
        arrow(ctx, X(start.x), Y(start.y), X(start.x + v.x * scale),
            Y(start.y + v.y * scale), color, 2, Math.min(8, length * 0.4));
    };
    for (const n of [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }]) {
        const v = traction(st, n);
        const normalStress = -(v.x * n.x + v.y * n.y);
        const normal = { x: -normalStress * n.x, y: -normalStress * n.y };
        const shear = { x: v.x - normal.x, y: v.y - normal.y };
        const tangent = { x: -n.y, y: n.x };
        for (const offset of components ? [-0.55, 0.55] : [-0.55, 0, 0.55]) {
            const end = {
                x: half * (n.x + offset * tangent.x),
                y: half * (n.y + offset * tangent.y),
            };
            const force = components ? normal : v;
            vector({ x: end.x - force.x * scale, y: end.y - force.y * scale },
                force, components ? COLORS.normal : COLORS.ink);
        }
        if (components) {
            // Tangential arrows sit just outside each face, centred on it.
            vector({ x: n.x * (half + 0.04 * size) - shear.x * scale / 2,
                y: n.y * (half + 0.04 * size) - shear.y * scale / 2 }, shear, COLORS.shear);
        }
    }

    const origin = { x: 26, y: h - 26 };
    arrow(ctx, origin.x, origin.y, origin.x + 26, origin.y, COLORS.muted, 1, 5);
    arrow(ctx, origin.x, origin.y, origin.x, origin.y - 26, COLORS.muted, 1, 5);
    label(ctx, 'x', origin.x + 34, origin.y, COLORS.muted);
    label(ctx, 'y', origin.x, origin.y - 34, COLORS.muted);
    stressScale(ctx, w, h, scale, st.sigma1);
    const summary = `σᵥ′ = ${fmt(st.sigmaV)}, σₕ′ = ${fmt(st.sigmaH)}, τ on H = ${fmt(st.tau)} kPa`;
    document.getElementById('box-summary').textContent = summary;
    boxCanvas.setAttribute('aria-label', `Square stress element. ${summary}. ${components ?
        'Blue arrows show normal compression; orange arrows show shear.' :
        'Black arrows show the resultant traction on each face.'}`);
}

function drawEllipse(st, state) {
    const { ctx, w, h } = prepare(ellipseCanvas);
    const size = Math.min(w, h);
    const cx = w / 2;
    const cy = (h - 70) / 2;
    const scale = Math.min(0.34 * size, 0.43 * (h - 90)) / niceCeil(st.sigma1);
    const a = st.sigma1 * scale;
    const b = st.sigma3 * scale;
    const X = (x) => cx + x * scale;
    const Y = (y) => cy - y * scale;
    const colour = state === 'safe' ? COLORS.circle : state === 'cap' ? COLORS.cap : COLORS.beyond;

    // Reference circle: an isotropic tensor with the same mean stress.
    ctx.strokeStyle = COLORS.faint;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, st.p * scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // The image of the unit-normal circle under the stress tensor. Its
    // semiaxes are the eigenvalues, not their square roots (nor strain).
    ctx.strokeStyle = colour;
    ctx.fillStyle = alpha(colour, 0.08);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (b < 1e-8) {
        ctx.moveTo(X(-st.sigma1 * st.major.x), Y(-st.sigma1 * st.major.y));
        ctx.lineTo(X(st.sigma1 * st.major.x), Y(st.sigma1 * st.major.y));
    } else {
        ctx.ellipse(cx, cy, a, b, -Math.PI / 2 - rad(st.beta), 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.stroke();

    if (st.q > 1e-8) {
        for (const [direction, value, text, color] of [
            [st.major, st.sigma1, 'σ₁′', COLORS.normal],
            [st.minor, st.sigma3, 'σ₃′', COLORS.minor],
        ]) {
            const length = value * scale;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(X(-value * direction.x), Y(-value * direction.y));
            ctx.lineTo(X(value * direction.x), Y(value * direction.y));
            ctx.stroke();
            // Keep the zero eigenvalue's label away from the origin.
            const offset = Math.max(length, 18) + 14;
            label(ctx, text, cx + offset * direction.x, cy - offset * direction.y, color);
        }
    }

    const t = rad(st.theta);
    const v = traction(st, { x: -Math.sin(t), y: Math.cos(t) });
    const length = Math.hypot(v.x, v.y) * scale;
    if (length > 0.5) arrow(ctx, cx, cy, X(v.x), Y(v.y), COLORS.plane, 2, Math.min(8, length * 0.4));
    dot(ctx, X(v.x), Y(v.y), 4.5, COLORS.plane);
    dot(ctx, cx, cy, 2, COLORS.muted);
    ctx.font = font(Math.min(13, (w - 24) / 21));
    label(ctx, st.q < 1e-8 ? 'Isotropic: every direction is principal' :
        st.sigma3 < 1e-8 ? 'σ₃′ = 0: the ellipse becomes a line' : `Principal direction β = ${st.beta}°`,
    cx, h - 62, COLORS.muted);
    ctx.font = font(13);
    stressScale(ctx, w, h, scale, st.sigma1);
    const summary = `Semiaxes: σ₁′ = ${fmt(st.sigma1)} kPa; σ₃′ = ${fmt(st.sigma3)} kPa.`;
    document.getElementById('ellipse-summary').textContent = summary;
    ellipseCanvas.setAttribute('aria-label', `Principal stress ellipse. ${summary} ${st.q < 1e-8 ?
        'Isotropic circle; principal directions are undetermined.' : `Major axis ${st.beta} degrees anticlockwise from vertical.`}`);
}

// ---------------------------------------------------------------- readout

// A plane at θ is the same plane at θ ± 180°: report it inside the slider's range.
const wrap = (angle) => ((((angle + 90) % 180) + 180) % 180) - 90;

function fmt(x, d = 1) {
    return Number.isFinite(x) ? x.toFixed(d) : '∞';
}

function drawReadout(st, state) {
    const K = st.sigmaH / st.sigmaV;
    const mobilised = st.q / (st.p + st.shift);
    const phiMob = mobilised <= 1 ? deg(Math.asin(mobilised)) : NaN;
    const reserve = st.tilt > 0 ? st.capTilt / st.tilt : Infinity;
    const messages = {
        safe: `Inside the cap. The soil is using ${fmt(phiMob)}° of its ${fmt(st.phi)}° of friction.`,
        cap: `At the cap: the soil is on the point of sliding, on the two planes where the circle touches the lines.`,
        beyond: `Beyond the cap. No soil with φ′ = ${fmt(st.phi)}° can carry this stress: it would already have slid.`,
    };
    const items = [
        ["σ₁′", fmt(st.sigma1), 'The major principal effective stress, p′ + q, in kPa.'],
        ["σ₃′", fmt(st.sigma3), 'The minor principal effective stress, p′ − q, in kPa.'],
        ["σᵥ′ (H)", fmt(st.sigmaV), 'The effective normal stress on a horizontal plane (point H), p′(1 + C), in kPa.'],
        ["σₕ′ (V)", fmt(st.sigmaH), 'The effective normal stress on a vertical plane (point V), p′(1 − C), in kPa.'],
        ['τ on H', fmt(st.tau), 'The shear stress on a horizontal plane, p′S, in kPa.'],
        ["K = σₕ′/σᵥ′", fmt(K, 3), 'The earth pressure coefficient: horizontal over vertical effective stress.'],
        ["q/p′", fmt(st.tilt, 3), 'The size of the tilt: the radius of the circle over its centre.'],
        ['cap on q/p′', fmt(st.capTilt, 3), 'The largest tilt friction allows: sin φ′, raised by cohesion to sin φ′ (p′ + c′ cot φ′)/p′.'],
        ["φ′ mobilised", Number.isFinite(phiMob) ? `${fmt(phiMob)}°` : '—', 'The friction angle the soil is using to carry this stress. It reaches φ′ at the cap.'],
        ['cap / tilt', fmt(reserve, 2), 'How far the tilt is from the cap: the cap on q/p′ over the tilt. At the cap it is 1. This is not the factor of safety of a slope or a wall, which divides tan φ′ by the tan φ′ mobilised.'],
        ["σₙ′ on θ plane", fmt(st.planeSigma), 'The effective normal stress on the plane inclined at θ, in kPa.'],
        ['τ on θ plane', fmt(st.planeTau), 'The shear stress on the plane inclined at θ, in kPa.'],
    ];
    readout.innerHTML =
        `<div class="status ${state}">${messages[state]}</div>` +
        items.map(([k, v, t]) => `<div class="item"><span>${k}${tip(t)}</span><strong>${v}</strong></div>`).join('');
    if (state === 'cap') {
        const a = 45 + st.phi / 2;
        readout.querySelector('.status').innerHTML +=
            ` They are at 45° + φ′/2 = ${fmt(a)}° either side of the plane σ₁′ acts on:` +
            ` θ = ${fmt(wrap(st.beta - a))}° and ${fmt(wrap(st.beta + a))}°. Set θ to one of them.`;
    }
}

// ---------------------------------------------------------------- wiring

function update() {
    const units = { p: ' kPa', tilt: '', beta: '°', phi: '°', cohesion: ' kPa', theta: '°' };
    for (const id of ids) {
        const v = parseFloat(inputs[id].value);
        outputs[id].textContent = (id === 'tilt' ? v.toFixed(3) : `${Math.round(v * 10) / 10}`) + units[id];
    }
    const st = read();
    const state = status(st);
    drawMohr(st, state);
    drawDisc(st, state);
    drawBox(st);
    drawEllipse(st, state);
    drawReadout(st, state);
}

for (const id of ids) inputs[id].addEventListener('input', update);
vectorMode.addEventListener('change', update);
document.addEventListener('tool-reset', () => {
    vectorMode.value = 'components';
    update();
});

function setTilt(t, beta) {
    inputs.tilt.value = Math.max(0, Math.min(1, t));
    inputs.beta.value = beta;
    update();
}

document.querySelectorAll('[data-preset]').forEach((button) =>
    button.addEventListener('click', () => {
        const st = read();
        const cap = Math.min(st.capTilt, 1);
        const k0 = 1 - Math.sin(st.phiRad);
        const presets = {
            isotropic: [0, 0],
            rest: [(1 - k0) / (1 + k0), 0],
            active: [cap, 0],
            passive: [cap, 90],
        };
        setTilt(...presets[button.dataset.preset]);
    })
);

// Dragging in the disc sets the tilt directly.
let dragging = false;
function fromPointer(event) {
    if (!discMap) return;
    const rect = discCanvas.getBoundingClientRect();
    const c = (event.clientX - rect.left - discMap.cx) / discMap.R;
    const s = -(event.clientY - rect.top - discMap.cy) / discMap.R;
    const t = Math.min(1, Math.hypot(c, s));
    let beta = deg(Math.atan2(s, c) / 2);
    if (beta <= -90) beta += 180;
    setTilt(Math.round(t * 1000) / 1000, Math.round(beta));
}
discCanvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    discCanvas.setPointerCapture(e.pointerId);
    fromPointer(e);
});
discCanvas.addEventListener('pointermove', (e) => dragging && fromPointer(e));
discCanvas.addEventListener('pointerup', () => (dragging = false));

if (window.ResizeObserver) {
    new ResizeObserver(() => update()).observe(document.querySelector('.panels'));
}
window.addEventListener('resize', update);
update();
