// Physical coordinates: x right, y up. Compression is positive, and beta is
// anticlockwise from vertical. The tensor's off-diagonal entries are -tau so
// positive tau is the upper soil pushing the lower soil to the right.
export function stressTensor(p, q, beta) {
    const b = beta * Math.PI / 180;
    return {
        sigma1: p + q,
        sigma3: p - q,
        sigmaH: p - q * Math.cos(2 * b),
        sigmaV: p + q * Math.cos(2 * b),
        tau: q * Math.sin(2 * b),
        major: { x: -Math.sin(b), y: Math.cos(b) },
        minor: { x: Math.cos(b), y: Math.sin(b) },
    };
}

// Force per unit area acting on a face with outward unit normal n. The minus
// sign makes compressive normal tractions point into the element.
export function traction(st, n) {
    return {
        x: -st.sigmaH * n.x + st.tau * n.y,
        y: st.tau * n.x - st.sigmaV * n.y,
    };
}
