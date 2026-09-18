// The fan: friction angle to concentration factor.
//
// Shared by footing-settlement.js and newmarks-chart.js. A point load is
// carried away from its application point by force chains; the share heading
// off at each angle is the "fan". Loading aligns those chains with the load,
// but a chain network can only get so lopsided before grains slide over one
// another, and the friction angle sets that limit. Projecting an aligned trial
// fabric onto that limit and fitting Frohlich's cos^n(theta) profile to the
// result gives a concentration factor that depends on phi alone.
//
// n = 3 is the unaligned fabric, which is Boussinesq. The trial concentration
// cancels once the limit binds, so there is no free parameter here.

const FAN_COUNT = 801;
const FAN = (() => {
    const maximum = (89.9 * Math.PI) / 180;
    const angle = new Float64Array(FAN_COUNT);
    const cosTwo = new Float64Array(FAN_COUNT);
    const measure = new Float64Array(FAN_COUNT);
    const logBase = new Float64Array(FAN_COUNT);
    const cosSquared = new Float64Array(FAN_COUNT);
    const sinSquared = new Float64Array(FAN_COUNT);
    const coordinate = new Float64Array(FAN_COUNT);
    const geometry = new Float64Array(FAN_COUNT);
    for (let i = 0; i < FAN_COUNT; i += 1) {
        const theta = 1e-9 + ((maximum - 1e-9) * i) / (FAN_COUNT - 1);
        angle[i] = theta;
        cosTwo[i] = Math.cos(2 * theta);
        measure[i] = Math.sin(theta);
        // The elastic base measure: log(cos theta) with its second harmonic
        // removed, which is the part of a trial the cone projection cannot
        // touch. A trial at this base measure returns n = 3 exactly.
        logBase[i] = Math.log(Math.cos(theta)) - cosTwo[i];
        cosSquared[i] = Math.cos(theta) ** 2;
        sinSquared[i] = Math.sin(theta) ** 2;
        const u = Math.tan(theta);
        coordinate[i] = u;
        geometry[i] = (1 + u * u) ** -2;   // solid angle onto an annulus, in 3D
    }
    return { angle, cosTwo, measure, logBase, cosSquared, sinSquared, coordinate, geometry };
})();

function trapezoid(values, abscissa) {
    let total = 0;
    for (let i = 1; i < values.length; i += 1) {
        total += 0.5 * (values[i] + values[i - 1]) * (abscissa[i] - abscissa[i - 1]);
    }
    return total;
}

// Project an aligned trial fabric onto the Mohr-Coulomb cone and return the
// normalised angular weights. The trial concentration is irrelevant once the
// cone binds, which is why the answer depends on phi alone.
function tiltedFan(multiplier, concentration = 20) {
    const weights = new Float64Array(FAN_COUNT);
    let maximum = -Infinity;
    for (let i = 0; i < FAN_COUNT; i += 1) {
        const logWeight = (concentration - multiplier) * FAN.cosTwo[i] + FAN.logBase[i];
        weights[i] = logWeight;
        if (logWeight > maximum) maximum = logWeight;
    }
    for (let i = 0; i < FAN_COUNT; i += 1) {
        weights[i] = Math.exp(weights[i] - maximum) * FAN.measure[i];
    }
    const norm = trapezoid(weights, FAN.angle);
    for (let i = 0; i < FAN_COUNT; i += 1) weights[i] /= norm;
    return weights;
}

function stressRatio(weights) {
    const axial = new Float64Array(FAN_COUNT);
    const lateral = new Float64Array(FAN_COUNT);
    for (let i = 0; i < FAN_COUNT; i += 1) {
        axial[i] = weights[i] * FAN.cosSquared[i];
        lateral[i] = weights[i] * FAN.sinSquared[i];
    }
    const a = trapezoid(axial, FAN.angle);
    const l = 0.5 * trapezoid(lateral, FAN.angle);
    return (a - l) / (a + l);
}

// Fit Frohlich's profile to the fan's master curve, in L1, exactly as a
// practitioner fits n to a measured profile rather than to its half width.
function fitExponent(curve) {
    const area = trapezoid(curve, FAN.coordinate);
    const normalised = new Float64Array(FAN_COUNT);
    for (let i = 0; i < FAN_COUNT; i += 1) normalised[i] = curve[i] / area;

    const residual = (exponent) => {
        const profile = new Float64Array(FAN_COUNT);
        for (let i = 0; i < FAN_COUNT; i += 1) {
            profile[i] = (1 + FAN.coordinate[i] ** 2) ** (-(exponent + 2) / 2);
        }
        const scale = trapezoid(profile, FAN.coordinate);
        const difference = new Float64Array(FAN_COUNT);
        for (let i = 0; i < FAN_COUNT; i += 1) {
            difference[i] = Math.abs(profile[i] / scale - normalised[i]);
        }
        return trapezoid(difference, FAN.coordinate);
    };

    let best = 3;
    let bestResidual = Infinity;
    for (let exponent = 2; exponent <= 14; exponent += 0.05) {
        const value = residual(exponent);
        if (value < bestResidual) {
            bestResidual = value;
            best = exponent;
        }
    }
    for (let exponent = best - 0.06; exponent <= best + 0.06; exponent += 0.002) {
        const value = residual(exponent);
        if (value < bestResidual) {
            bestResidual = value;
            best = exponent;
        }
    }
    return best;
}

const EXPONENT_CACHE = new Map();
function concentrationFactor(frictionDeg) {
    const key = frictionDeg.toFixed(2);
    if (EXPONENT_CACHE.has(key)) return EXPONENT_CACHE.get(key);
    const target = Math.sin((frictionDeg * Math.PI) / 180);
    let low = 0;
    let high = 300;
    for (let iteration = 0; iteration < 90; iteration += 1) {
        const middle = 0.5 * (low + high);
        if (stressRatio(tiltedFan(middle)) > target) low = middle;
        else high = middle;
    }
    const weights = tiltedFan(0.5 * (low + high));
    const curve = new Float64Array(FAN_COUNT);
    for (let i = 0; i < FAN_COUNT; i += 1) {
        curve[i] = (weights[i] / FAN.measure[i]) * FAN.geometry[i];
    }
    const exponent = fitExponent(curve);
    EXPONENT_CACHE.set(key, exponent);
    return exponent;
}

export { concentrationFactor };
