import test from 'node:test';
import assert from 'node:assert/strict';
import { stressTensor, traction } from '../js/stress-tensor.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('isotropic and uniaxial limits', () => {
    const iso = stressTensor(100, 0, 37);
    near(iso.sigmaH, 100);
    near(iso.sigmaV, 100);
    near(iso.tau, 0);
    const vertical = stressTensor(100, 100, 0);
    near(vertical.sigma1, 200);
    near(vertical.sigma3, 0);
    near(traction(vertical, { x: 1, y: 0 }).x, 0);
    near(traction(vertical, { x: 0, y: 1 }).y, -200);
});

test('positive and negative shear match the course convention', () => {
    for (const sign of [-1, 1]) {
        const st = stressTensor(100, 30, sign * 45);
        const top = traction(st, { x: 0, y: 1 });
        near(top.x, sign * 30);
        near(top.y, -100);
        const right = traction(st, { x: 1, y: 0 });
        near(right.x, -100);
        near(right.y, sign * 30);
    }
});

test('eigenvectors, face balance and the traction ellipse agree across stress states', () => {
    for (const p of [10, 100, 300]) {
        for (const tilt of [0, 0.3, 1]) {
            for (const beta of [-90, -45, -17, 0, 32, 45, 90]) {
                const st = stressTensor(p, p * tilt, beta);
                near(st.major.x * st.minor.x + st.major.y * st.minor.y, 0);
                for (const [axis, eigenvalue] of [[st.major, st.sigma1], [st.minor, st.sigma3]]) {
                    const v = traction(st, axis);
                    near(v.x, -eigenvalue * axis.x);
                    near(v.y, -eigenvalue * axis.y);
                }
                for (let theta = -90; theta <= 90; theta += 15) {
                    const t = theta * Math.PI / 180;
                    const n = { x: -Math.sin(t), y: Math.cos(t) };
                    const v = traction(st, n);
                    const opposite = traction(st, { x: -n.x, y: -n.y });
                    near(v.x + opposite.x, 0);
                    near(v.y + opposite.y, 0);
                    // Resolve the vector onto the plane's inward normal and
                    // tangent, independently checking the existing Mohr values.
                    near(-(v.x * n.x + v.y * n.y), p + p * tilt * Math.cos(2 * (beta - theta) * Math.PI / 180));
                    near(v.x * Math.cos(t) + v.y * Math.sin(t), p * tilt * Math.sin(2 * (beta - theta) * Math.PI / 180));
                    const major = v.x * st.major.x + v.y * st.major.y;
                    const minor = v.x * st.minor.x + v.y * st.minor.y;
                    if (st.sigma3 > 0) near((major / st.sigma1) ** 2 + (minor / st.sigma3) ** 2, 1);
                    else near(minor, 0);
                }
            }
        }
    }
});
