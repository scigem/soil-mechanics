import '../css/main.css';
import '../css/footing-settlement.css';
import Plotly from 'plotly.js-dist';
import { concentrationFactor } from './fan.js';

// ---------------------------------------------------------------------------
// Numerics
// ---------------------------------------------------------------------------

const GAMMA_W = 9.81;
const ATMOSPHERIC = 100.0;   // Janbu's reference stress, kPa

// Gauss-Legendre nodes on [-1, 1], by Newton iteration on the Legendre roots.
function gaussLegendre(count) {
    const abscissa = new Float64Array(count);
    const weight = new Float64Array(count);
    for (let i = 0; i < Math.ceil(count / 2); i += 1) {
        let root = Math.cos((Math.PI * (i + 0.75)) / (count + 0.5));
        let derivative = 0;
        for (let iteration = 0; iteration < 100; iteration += 1) {
            let current = 1;
            let previous = 0;
            for (let degree = 0; degree < count; degree += 1) {
                const older = previous;
                previous = current;
                current = ((2 * degree + 1) * root * previous - degree * older) / (degree + 1);
            }
            derivative = (count * (root * current - previous)) / (root * root - 1);
            const step = current / derivative;
            root -= step;
            if (Math.abs(step) < 1e-15) break;
        }
        abscissa[i] = -root;
        abscissa[count - 1 - i] = root;
        weight[i] = 2 / ((1 - root * root) * derivative * derivative);
        weight[count - 1 - i] = weight[i];
    }
    return { abscissa, weight };
}

const QUADRATURE = new Map();
function quadrature(count) {
    if (!QUADRATURE.has(count)) QUADRATURE.set(count, gaussLegendre(count));
    return QUADRATURE.get(count);
}

// Vertical stress under a uniformly loaded rectangle whose edges are given
// relative to the field point, integrated in the angles of the rays that reach
// it. Substituting X = z tan(chi) and Y = sqrt(X^2 + z^2) tan(psi) gives
//
//     sigma_z = (n q / 2 pi) Int cos^(n-1)(chi) Int cos^n(psi) dpsi dchi,
//
// which is smooth and bounded at every depth, including directly under the
// load where the Cartesian integrand is a spike. Only the angular window the
// footing subtends survives, so the influence factor literally counts rays.
function rectangleStress(xMin, xMax, yMin, yMax, depth, exponent, pressure, nodes = 32) {
    if (depth <= 0 || xMax <= xMin || yMax <= yMin) return 0;
    const { abscissa, weight } = quadrature(nodes);
    const chiLower = Math.atan2(xMin, depth);
    const chiUpper = Math.atan2(xMax, depth);
    const chiHalf = 0.5 * (chiUpper - chiLower);
    const chiMid = 0.5 * (chiUpper + chiLower);

    let total = 0;
    for (let i = 0; i < nodes; i += 1) {
        const chi = chiHalf * abscissa[i] + chiMid;
        const cosChi = Math.cos(chi);
        const scaled = depth / cosChi;
        const psiLower = Math.atan2(yMin, scaled);
        const psiUpper = Math.atan2(yMax, scaled);
        const psiHalf = 0.5 * (psiUpper - psiLower);
        const psiMid = 0.5 * (psiUpper + psiLower);
        let inner = 0;
        for (let j = 0; j < nodes; j += 1) {
            inner += Math.cos(psiHalf * abscissa[j] + psiMid) ** exponent * weight[j];
        }
        total += cosChi ** (exponent - 1) * inner * psiHalf * weight[i] * chiHalf;
    }
    return (pressure * exponent * total) / (2 * Math.PI);
}

// Stress increment at horizontal offset (east, north) from the footing centre.
function stressAt(state, east, north, depth, exponent, nodes) {
    return rectangleStress(
        -0.5 * state.width - east,
        0.5 * state.width - east,
        -0.5 * state.length - north,
        0.5 * state.length - north,
        depth,
        exponent,
        state.pressure,
        nodes,
    );
}

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

// Strain produced by an increment applied on top of an existing effective
// stress. Neither law is elastic: m_v and the Janbu modulus number are both
// measured oedometer quantities.
function compressionStrain(state, initial, increment) {
    if (state.law === 'constant') return state.volumeCompressibility * increment;
    const start = Math.max(initial, 1e-6);
    const finish = start + increment;
    const power = 1 - state.stressExponent;
    if (Math.abs(power) < 1e-9) return Math.log(finish / start) / state.modulusNumber;
    return (
        ((finish / ATMOSPHERIC) ** power - (start / ATMOSPHERIC) ** power)
        / (state.modulusNumber * power)
    );
}

// Sublayer summation down one vertical. Depths are measured from the ground
// surface; the stress increment is measured from founding level.
function settlement(state, exponent, east, sublayers, nodes) {
    const step = state.thickness / sublayers;
    let total = 0;
    for (let i = 0; i < sublayers; i += 1) {
        const depth = state.founding + (i + 0.5) * step;
        const submerged = Math.max(depth - state.waterTable, 0);
        const initial = state.unitWeight * depth - GAMMA_W * submerged;
        const increment = stressAt(state, east, 0, depth - state.founding, exponent, nodes);
        total += compressionStrain(state, initial, increment) * step;
    }
    return total;
}

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

const DEFAULTS = {
    width: 2,
    length: 2,
    pressure: 100,
    founding: 1,
    friction: 32,
    unitWeight: 18,
    waterTable: 30,
    thickness: 16,
    law: 'janbu',
    mv: 0.1,
    modulus: 300,
    stressExponent: 0.5,
};

const BOUSSINESQ_COLOUR = '#646ef6';
const FAN_COLOUR = '#ff9800';
const SMEARED_COLOUR = '#9e9e9e';
const plotConfig = { responsive: true, displayModeBar: false };

const el = (id) => document.getElementById(id);
const inputs = {};
Object.keys(DEFAULTS).forEach((key) => {
    inputs[key] = el(key === 'stressExponent' ? 'stressExponent' : key);
});

const readouts = {
    width: el('widthValue'),
    length: el('lengthValue'),
    pressure: el('pressureValue'),
    founding: el('foundingValue'),
    friction: el('frictionValue'),
    unitWeight: el('unitWeightValue'),
    waterTable: el('waterTableValue'),
    thickness: el('thicknessValue'),
    mv: el('mvValue'),
    modulus: el('modulusValue'),
    stressExponent: el('stressExponentValue'),
};

function getState() {
    const number = (key) => parseFloat(inputs[key].value);
    const waterTable = number('waterTable');
    return {
        width: number('width'),
        length: number('length'),
        pressure: number('pressure'),
        founding: number('founding'),
        friction: number('friction'),
        unitWeight: number('unitWeight'),
        // The top of the slider means "no water table in the profile".
        waterTable: waterTable >= 30 ? Infinity : waterTable,
        thickness: number('thickness'),
        law: inputs.law.value,
        // m_v is quoted in m^2/MN, which is 1e-3 per kPa.
        volumeCompressibility: number('mv') * 1e-3,
        modulusNumber: number('modulus'),
        stressExponent: number('stressExponent'),
    };
}

function updateReadouts(state) {
    readouts.width.textContent = state.width.toFixed(1);
    readouts.length.textContent = state.length.toFixed(1);
    readouts.pressure.textContent = state.pressure.toFixed(0);
    readouts.founding.textContent = state.founding.toFixed(1);
    readouts.friction.textContent = state.friction.toFixed(1);
    readouts.unitWeight.textContent = state.unitWeight.toFixed(1);
    readouts.waterTable.textContent = Number.isFinite(state.waterTable)
        ? state.waterTable.toFixed(1)
        : 'none';
    readouts.thickness.textContent = state.thickness.toFixed(1);
    readouts.mv.textContent = (state.volumeCompressibility * 1e3).toFixed(3);
    readouts.modulus.textContent = state.modulusNumber.toFixed(0);
    readouts.stressExponent.textContent = state.stressExponent.toFixed(2);

    const janbu = state.law === 'janbu';
    el('janbu-group').hidden = !janbu;
    el('mv-group').hidden = janbu;
}

function linspace(start, stop, count) {
    return Array.from({ length: count }, (_, i) => start + ((stop - start) * i) / (count - 1));
}

function pressureBulbs(state, exponent) {
    // Keep the window to the part of the field a pressure bulb is drawn over:
    // beyond about three widths the increment is a few per cent of q and the
    // picture is uniformly empty.
    const reach = 1.8 * state.width + 1;
    const x = linspace(-reach, reach, 61);
    const z = linspace(0.02, 3 * state.width + 1, 45);
    const build = (power) => z.map(
        (depth) => x.map((east) => stressAt(state, east, 0, depth, power, 20) / state.pressure),
    );
    return { x, z, elastic: build(3), fan: build(exponent) };
}

function drawBulbs(state, exponent, bulbs) {
    // Contours at tenths of the applied pressure, the way a pressure bulb is
    // drawn in every textbook, so the two panels can be read against each other.
    const shared = {
        type: 'contour',
        colorscale: 'YlOrRd',
        reversescale: true,
        zmin: 0,
        zmax: 1,
        contours: {
            start: 0.1,
            end: 0.9,
            size: 0.1,
            coloring: 'lines',
            showlabels: true,
            labelfont: { size: 9, color: '#424242' },
        },
        line: { width: 1.8 },
        hovertemplate: 'x %{x:.2f} m, z %{y:.2f} m<br>Δσ<sub>z</sub>/q = %{z:.3f}<extra></extra>',
    };
    const footing = (suffix) => ({
        type: 'scatter',
        x: [-0.5 * state.width, 0.5 * state.width],
        y: [0, 0],
        mode: 'lines',
        line: { color: '#212121', width: 7 },
        hoverinfo: 'skip',
        showlegend: false,
        xaxis: `x${suffix}`,
        yaxis: `y${suffix}`,
    });

    const data = [
        { ...shared, x: bulbs.x, y: bulbs.z, z: bulbs.elastic, xaxis: 'x', yaxis: 'y', showscale: false },
        { ...shared, x: bulbs.x, y: bulbs.z, z: bulbs.fan, xaxis: 'x2', yaxis: 'y2', showscale: false },
        footing(''),
        footing('2'),
    ];

    Plotly.react(el('bulbPlot'), data, {
        margin: { l: 62, r: 16, t: 48, b: 48 },
        title: { text: 'Pressure bulb, contours of Δσ<sub>z</sub>/q', font: { size: 14 } },
        xaxis: { domain: [0, 0.47], anchor: 'y', title: { text: 'Offset (m)' }, zeroline: false },
        yaxis: { anchor: 'x', autorange: 'reversed', title: { text: 'Depth below footing (m)' }, zeroline: false },
        xaxis2: { domain: [0.53, 1], anchor: 'y2', title: { text: 'Offset (m)' }, zeroline: false },
        yaxis2: { anchor: 'x2', autorange: 'reversed', matches: 'y', showticklabels: false, zeroline: false },
        annotations: [
            { text: 'Boussinesq, <i>n</i> = 3', x: 0.2, y: 1.05, xref: 'paper', yref: 'paper', showarrow: false, font: { color: BOUSSINESQ_COLOUR, size: 12 } },
            { text: `Fan, <i>n</i> = ${exponent.toFixed(2)}`, x: 0.8, y: 1.05, xref: 'paper', yref: 'paper', showarrow: false, font: { color: FAN_COLOUR, size: 12 } },
        ],
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
    }, plotConfig);
}

function drawProfiles(state, exponent) {
    const depths = linspace(0.02, state.thickness, 90);
    const trace = (power, colour, name) => ({
        type: 'scatter',
        mode: 'lines',
        x: depths.map((depth) => stressAt(state, 0, 0, depth, power, 32)),
        y: depths.map((depth) => depth + state.founding),
        line: { color: colour, width: 2.5 },
        name,
        xaxis: 'x',
        yaxis: 'y',
    });

    const smeared = {
        type: 'scatter',
        mode: 'lines',
        x: depths.map(
            (depth) => (state.pressure * state.width * state.length)
                / ((state.width + depth) * (state.length + depth)),
        ),
        y: depths.map((depth) => depth + state.founding),
        line: { color: SMEARED_COLOUR, width: 1.5, dash: 'dot' },
        name: '2:1 rule',
        xaxis: 'x',
        yaxis: 'y',
    };

    // Offsets cluster near the footing, where the bowl actually has curvature.
    const reach = Math.max(3 * state.width, 8);
    const offsets = linspace(0, 1, 37).map((t) => reach * t * t);
    const bowl = (power, colour) => {
        const values = offsets.map((east) => settlement(state, power, east, 60, 20) * 1000);
        return {
            type: 'scatter',
            mode: 'lines',
            x: offsets.slice().reverse().map((value) => -value).concat(offsets),
            y: values.slice().reverse().concat(values),
            line: { color: colour, width: 2.5 },
            showlegend: false,
            hovertemplate: 'offset %{x:.2f} m<br>settlement %{y:.1f} mm<extra></extra>',
            xaxis: 'x2',
            yaxis: 'y2',
        };
    };

    const data = [
        trace(3, BOUSSINESQ_COLOUR, 'Boussinesq, n = 3'),
        trace(exponent, FAN_COLOUR, `Fan, n = ${exponent.toFixed(2)}`),
        smeared,
        bowl(3, BOUSSINESQ_COLOUR),
        bowl(exponent, FAN_COLOUR),
        {
            type: 'scatter',
            x: [-0.5 * state.width, 0.5 * state.width],
            y: [0, 0],
            mode: 'lines',
            line: { color: '#212121', width: 7 },
            hoverinfo: 'skip',
            showlegend: false,
            xaxis: 'x2',
            yaxis: 'y2',
        },
    ];

    Plotly.react(el('profilePlot'), data, {
        margin: { l: 62, r: 20, t: 74, b: 48 },
        showlegend: true,
        legend: { orientation: 'h', x: 0, y: 1.3, font: { size: 11 } },
        xaxis: { domain: [0, 0.46], anchor: 'y', title: { text: 'Δσ<sub>z</sub> (kPa)' }, rangemode: 'tozero' },
        yaxis: { anchor: 'x', autorange: 'reversed', title: { text: 'Depth below ground (m)' } },
        xaxis2: { domain: [0.58, 1], anchor: 'y2', title: { text: 'Offset from centre (m)' } },
        yaxis2: { anchor: 'x2', autorange: 'reversed', title: { text: 'Settlement (mm)' }, rangemode: 'tozero' },
        annotations: [
            { text: 'Stress on the centre line', x: 0.2, y: 1.09, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 12, color: '#757575' } },
            { text: 'Settlement bowl, flexible footing', x: 0.82, y: 1.09, xref: 'paper', yref: 'paper', showarrow: false, font: { size: 12, color: '#757575' } },
        ],
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
    }, plotConfig);
}

function describe(state, exponent, elastic, fan, differential) {
    const percent = ((fan / elastic - 1) * 100).toFixed(0);
    const lawText = state.law === 'constant'
        ? 'A constant m<sub>v</sub> makes settlement proportional to the applied pressure; switch to Janbu to see it stiffen as it loads.'
        : `With a Janbu exponent of ${state.stressExponent.toFixed(2)} the soil stiffens as it loads, so doubling <i>q</i> does <em>not</em> double the settlement.`;
    let cone;
    if (Math.abs(exponent - 3) < 0.05) {
        cone = `φ = ${state.friction.toFixed(1)}° is the crossover at arcsin(1/3) = 19.47°: the ray fan sits exactly on the friction cone, so the projection returns Boussinesq untouched and the two curves coincide.`;
    } else if (exponent < 3) {
        cone = `At φ = ${state.friction.toFixed(1)}° the cone binds on the ray fan itself, so the response is <em>broader</em> than Boussinesq, not narrower. This is the elastic-to-yield transition, below arcsin(1/3) = 19.47°.`;
    } else {
        cone = `At φ = ${state.friction.toFixed(1)}° the load is focused onto the centre line, giving ${percent}% more settlement under the middle of the footing than Boussinesq, and correspondingly less on the neighbour.`;
    }
    el('summaryNote').innerHTML =
        `n = ${exponent.toFixed(2)} follows from φ alone — no modulus, no Poisson ratio, no fitted parameter. ${cone} `
        + `Centre-to-edge differential settlement is ${differential.toFixed(1)} mm. ${lawText}`;
}

let pending = null;
function update() {
    const state = getState();
    updateReadouts(state);
    const exponent = concentrationFactor(state.friction);

    const elastic = settlement(state, 3, 0, 200, 40) * 1000;
    const fan = settlement(state, exponent, 0, 200, 40) * 1000;
    const edge = settlement(state, exponent, 0.5 * state.width, 200, 40) * 1000;

    el('exponentOut').textContent = exponent.toFixed(2);
    el('elasticOut').textContent = `${elastic.toFixed(1)} mm`;
    el('fanOut').textContent = `${fan.toFixed(1)} mm`;
    el('ratioOut').textContent = (fan / elastic).toFixed(3);
    el('differentialOut').textContent = `${(fan - edge).toFixed(1)} mm`;
    describe(state, exponent, elastic, fan, fan - edge);

    drawBulbs(state, exponent, pressureBulbs(state, exponent));
    drawProfiles(state, exponent);
}

function schedule() {
    if (pending !== null) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => {
        pending = null;
        update();
    });
}

Object.values(inputs).forEach((input) => {
    input.addEventListener('input', schedule);
    input.addEventListener('change', schedule);
});

function applyPreset(values) {
    Object.entries(values).forEach(([key, value]) => {
        if (inputs[key]) inputs[key].value = value;
    });
    update();
}

el('hertz-button').addEventListener('click', () => applyPreset({ law: 'janbu', stressExponent: 1 / 3 }));
el('clay-button').addEventListener('click', () => applyPreset({ law: 'janbu', stressExponent: 1 }));
el('reset-button').addEventListener('click', () => applyPreset({ ...DEFAULTS }));

window.addEventListener('resize', () => {
    Plotly.Plots.resize(el('bulbPlot'));
    Plotly.Plots.resize(el('profilePlot'));
});

update();
