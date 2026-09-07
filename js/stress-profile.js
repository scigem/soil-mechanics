import '../css/main.css';
import '../css/stress-profile.css';
import Plotly from 'plotly.js-dist';

const GAMMA_W = 9.81;

const DEFAULTS = {
    waterTable: 0,
    surcharge: 0,
    capillary: 0,
    probe: 8,
    t1: 5, g1: 18, gs1: 20,
    t2: 3, g2: 17, gs2: 19,
    t3: 4, g3: 19, gs3: 21,
};

const LAYER_COLOURS = ['#b5651d', '#9c7a4e', '#836048'];
const WATER_COLOUR = '#29a3e3';
const COLOUR_SIGMA = '#212121';
const COLOUR_U = '#29a3e3';
const COLOUR_EFF = '#ff6f00';

const plotConfig = { responsive: true, displayModeBar: false };

const el = (id) => document.getElementById(id);

const inputs = {
    waterTable: el('water-table'),
    surcharge: el('surcharge'),
    capillary: el('capillary'),
    probe: el('probe'),
    t1: el('t1'), g1: el('g1'), gs1: el('gs1'),
    t2: el('t2'), g2: el('g2'), gs2: el('gs2'),
    t3: el('t3'), g3: el('g3'), gs3: el('gs3'),
};

const readouts = {
    waterTable: el('waterTableValue'),
    surcharge: el('surchargeValue'),
    capillary: el('capillaryValue'),
    probe: el('probeValue'),
    t1: el('t1Value'), g1: el('g1Value'), gs1: el('gs1Value'),
    t2: el('t2Value'), g2: el('g2Value'), gs2: el('gs2Value'),
    t3: el('t3Value'), g3: el('g3Value'), gs3: el('gs3Value'),
};

const profilePlot = el('profilePlot');
let reference = null;

function getState() {
    const num = (key) => parseFloat(inputs[key].value);
    const layers = [1, 2, 3]
        .map((i) => ({
            thickness: num(`t${i}`),
            gamma: num(`g${i}`),
            gammaSat: num(`gs${i}`),
            colour: LAYER_COLOURS[i - 1],
            name: `Layer ${i}`,
        }))
        .filter((layer) => layer.thickness > 0);

    return {
        waterTable: num('waterTable'),
        surcharge: num('surcharge'),
        capillary: num('capillary'),
        probe: num('probe'),
        layers,
        totalDepth: layers.reduce((sum, layer) => sum + layer.thickness, 0),
    };
}

// Unit weight of the soil at depth z, which depends on whether that soil sits
// above or below the water table.
function unitWeightAt(z, state) {
    let top = 0;
    for (const layer of state.layers) {
        if (z <= top + layer.thickness) {
            return z > state.waterTable ? layer.gammaSat : layer.gamma;
        }
        top += layer.thickness;
    }
    const last = state.layers[state.layers.length - 1];
    return last ? (z > state.waterTable ? last.gammaSat : last.gamma) : 0;
}

function porePressureAt(z, state) {
    // Water is continuous down from the water table, and is drawn up above it
    // by capillarity through a height h_c, where it is in suction.
    if (z < state.waterTable - state.capillary) return 0;
    return GAMMA_W * (z - state.waterTable);
}

// Depths where the profile has a kink: layer boundaries, the water table, the
// top of the capillary fringe, and the ground surface.
function breakpoints(state) {
    const pond = Math.max(0, -state.waterTable);
    const points = [-pond, 0, state.totalDepth];
    let top = 0;
    for (const layer of state.layers) {
        top += layer.thickness;
        points.push(top);
    }
    if (state.waterTable > 0) points.push(state.waterTable);
    if (state.capillary > 0) points.push(state.waterTable - state.capillary);

    const inRange = points.filter((z) => z >= -pond - 1e-9 && z <= state.totalDepth + 1e-9);
    const sorted = [...new Set(inRange.map((z) => Math.round(z * 1e6) / 1e6))].sort((a, b) => a - b);

    // Duplicate each interior kink so the piecewise-linear plot shows the break
    // in slope cleanly, and fill in between so curved segments stay smooth.
    const dense = [];
    for (let i = 0; i < sorted.length - 1; i += 1) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const steps = Math.max(2, Math.ceil((b - a) * 8));
        for (let s = 0; s < steps; s += 1) dense.push(a + ((b - a) * s) / steps);
    }
    dense.push(sorted[sorted.length - 1]);
    return dense;
}

function buildProfile(state) {
    const pond = Math.max(0, -state.waterTable);
    const depths = breakpoints(state);

    const sigma = [];
    const u = [];
    const sigmaEff = [];

    let running = state.surcharge;
    let previous = depths[0];

    for (const z of depths) {
        const dz = z - previous;
        if (dz > 0) {
            // Midpoint of the step tells us which side of the water table and
            // which layer we are integrating through.
            const mid = previous + dz / 2;
            running += (z <= 0 ? GAMMA_W : unitWeightAt(mid, state)) * dz;
        }
        previous = z;

        const uz = porePressureAt(z, state);
        sigma.push(running);
        u.push(uz);
        sigmaEff.push(running - uz);
    }

    return { depths, sigma, u, sigmaEff, pond };
}

function valueAt(profile, key, z) {
    const { depths } = profile;
    const series = profile[key];
    if (z <= depths[0]) return series[0];
    if (z >= depths[depths.length - 1]) return series[series.length - 1];
    for (let i = 0; i < depths.length - 1; i += 1) {
        if (z >= depths[i] && z <= depths[i + 1]) {
            const span = depths[i + 1] - depths[i];
            const f = span === 0 ? 0 : (z - depths[i]) / span;
            return series[i] + f * (series[i + 1] - series[i]);
        }
    }
    return series[series.length - 1];
}

function updateSliderValues(state) {
    readouts.waterTable.textContent = state.waterTable.toFixed(1);
    readouts.surcharge.textContent = state.surcharge.toFixed(0);
    readouts.capillary.textContent = state.capillary.toFixed(1);
    readouts.probe.textContent = state.probe.toFixed(1);
    [1, 2, 3].forEach((i) => {
        readouts[`t${i}`].textContent = parseFloat(inputs[`t${i}`].value).toFixed(1);
        readouts[`g${i}`].textContent = parseFloat(inputs[`g${i}`].value).toFixed(1);
        readouts[`gs${i}`].textContent = parseFloat(inputs[`gs${i}`].value).toFixed(1);
    });
    [1, 2, 3].forEach((i) => {
        const swatch = el(`swatch-${i}`);
        if (swatch) swatch.style.background = LAYER_COLOURS[i - 1];
        const block = el(`layer-${i}-block`);
        if (block) block.classList.toggle('disabled', parseFloat(inputs[`t${i}`].value) === 0);
    });
}

function buildShapes(state, profile, maxStress) {
    const shapes = [];
    let top = 0;

    for (const layer of state.layers) {
        shapes.push({
            type: 'rect', xref: 'x', yref: 'y',
            x0: 0, x1: 1, y0: top, y1: top + layer.thickness,
            fillcolor: layer.colour, line: { color: '#ffffff', width: 1 },
            layer: 'below',
        });
        top += layer.thickness;
    }

    // Tint everything below the water table, and draw ponded water above ground.
    const saturatedTop = Math.max(state.waterTable, 0);
    if (saturatedTop < state.totalDepth) {
        shapes.push({
            type: 'rect', xref: 'x', yref: 'y',
            x0: 0, x1: 1, y0: saturatedTop, y1: state.totalDepth,
            fillcolor: 'rgba(41, 163, 227, 0.24)', line: { width: 0 },
        });
    }
    if (profile.pond > 0) {
        shapes.push({
            type: 'rect', xref: 'x', yref: 'y',
            x0: 0, x1: 1, y0: -profile.pond, y1: 0,
            fillcolor: 'rgba(41, 163, 227, 0.75)', line: { width: 0 },
        });
    }
    if (state.capillary > 0 && state.waterTable > 0) {
        shapes.push({
            type: 'rect', xref: 'x', yref: 'y',
            x0: 0, x1: 1,
            y0: Math.max(0, state.waterTable - state.capillary), y1: state.waterTable,
            fillcolor: 'rgba(41, 163, 227, 0.16)', line: { width: 0 },
        });
    }

    // Water table line, across both panels.
    ['x', 'x2'].forEach((xref, index) => {
        shapes.push({
            type: 'line',
            xref, yref: index === 0 ? 'y' : 'y2',
            x0: index === 0 ? 0 : 0, x1: index === 0 ? 1 : maxStress,
            y0: state.waterTable, y1: state.waterTable,
            line: { color: '#0b6ea8', width: 2.5, dash: 'dash' },
        });
    });

    // Probe line.
    ['x', 'x2'].forEach((xref, index) => {
        shapes.push({
            type: 'line',
            xref, yref: index === 0 ? 'y' : 'y2',
            x0: 0, x1: index === 0 ? 1 : maxStress,
            y0: state.probe, y1: state.probe,
            line: { color: '#9e9e9e', width: 1.5, dash: 'dot' },
        });
    });

    return shapes;
}

function buildAnnotations(state) {
    const annotations = [];
    let top = 0;
    for (const layer of state.layers) {
        annotations.push({
            xref: 'x', yref: 'y', x: 0.5, y: top + layer.thickness / 2,
            text: `${layer.name}<br>γ<sub>bulk</sub> = ${layer.gamma.toFixed(1)} | γ<sub>sat</sub> = ${layer.gammaSat.toFixed(1)}`,
            showarrow: false,
            font: { size: 11, color: '#ffffff' },
            align: 'center',
        });
        top += layer.thickness;
    }
    annotations.push({
        xref: 'x', yref: 'y', x: 1, y: state.waterTable,
        xanchor: 'right', yanchor: 'bottom',
        text: '\u25bd WT', showarrow: false,
        font: { size: 12, color: '#0b6ea8' },
    });
    return annotations;
}

function createPlot(state, profile) {
    const pond = profile.pond;
    const yRange = [state.totalDepth, -Math.max(pond, 0.001)];
    const maxStress = Math.max(10, Math.max(...profile.sigma) * 1.08);

    const line = (x, name, colour, width) => ({
        x, y: profile.depths, name,
        type: 'scatter', mode: 'lines',
        line: { color: colour, width },
        xaxis: 'x2', yaxis: 'y2',
        hovertemplate: `${name}: %{x:.1f} kPa at %{y:.1f} m<extra></extra>`,
    });

    const traces = [
        line(profile.sigma, 'σ', COLOUR_SIGMA, 2.5),
        line(profile.u, 'u', COLOUR_U, 2.5),
        line(profile.sigmaEff, "σ'", COLOUR_EFF, 3.5),
    ];

    if (reference) {
        traces.push({
            x: reference.sigmaEff, y: reference.depths,
            name: "σ' reference", type: 'scatter', mode: 'lines',
            line: { color: '#bdbdbd', width: 2.5, dash: 'dash' },
            xaxis: 'x2', yaxis: 'y2',
            hoverinfo: 'skip',
        });
    }

    traces.push({
        x: [
            valueAt(profile, 'sigma', state.probe),
            valueAt(profile, 'u', state.probe),
            valueAt(profile, 'sigmaEff', state.probe),
        ],
        y: [state.probe, state.probe, state.probe],
        type: 'scatter', mode: 'markers',
        marker: { size: 10, color: [COLOUR_SIGMA, COLOUR_U, COLOUR_EFF] },
        xaxis: 'x2', yaxis: 'y2',
        showlegend: false, hoverinfo: 'skip',
    });

    const layout = {
        margin: { l: 55, r: 20, t: 30, b: 55 },
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: true,
        legend: { orientation: 'h', x: 0.35, y: 1.08 },
        font: { family: 'Inter, sans-serif', size: 12 },
        xaxis: {
            domain: [0, 0.24], range: [0, 1], anchor: 'y',
            showticklabels: false, showgrid: false, zeroline: false, fixedrange: true,
        },
        yaxis: {
            domain: [0, 1], range: yRange, anchor: 'x',
            title: { text: 'Depth (m)' }, zeroline: false, showgrid: false, fixedrange: true,
        },
        xaxis2: {
            domain: [0.36, 1], range: [Math.min(0, Math.min(...profile.u) * 1.2), maxStress],
            anchor: 'y2', title: { text: 'Stress (kPa)' },
            zeroline: true, zerolinecolor: '#bdbdbd', fixedrange: true,
        },
        yaxis2: {
            domain: [0, 1], range: yRange, anchor: 'x2',
            showticklabels: false, showgrid: false, fixedrange: true,
        },
        shapes: buildShapes(state, profile, maxStress),
        annotations: buildAnnotations(state),
    };

    Plotly.react(profilePlot, traces, layout, plotConfig);
}

function updateOutputs(state, profile) {
    const sigma = valueAt(profile, 'sigma', state.probe);
    const u = valueAt(profile, 'u', state.probe);
    const sigmaEff = sigma - u;

    el('sigmaOut').textContent = `${sigma.toFixed(1)} kPa`;
    el('uOut').textContent = `${u.toFixed(1)} kPa`;
    el('sigmaEffOut').textContent = `${sigmaEff.toFixed(1)} kPa`;

    if (reference) {
        const refEff = valueAt(reference, 'sigmaEff', state.probe);
        const delta = sigmaEff - refEff;
        el('deltaOut').textContent = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} kPa`;
        el('deltaOut').className = Math.abs(delta) < 0.05 ? 'neutral' : (delta > 0 ? 'up' : 'down');
    } else {
        el('deltaOut').textContent = '—';
        el('deltaOut').className = 'neutral';
    }

    let note;
    if (sigmaEff <= 0.05) {
        note = "σ′ has reached zero. The grains are no longer in contact: no stiffness, no strength, and the soil behaves as a fluid.";
    } else if (u < -0.05) {
        note = `Pore pressure is negative (suction) at this depth, so σ′ = ${sigmaEff.toFixed(1)} kPa is larger than the total stress of ${sigma.toFixed(1)} kPa.`;
    } else if (reference) {
        const delta = sigmaEff - valueAt(reference, 'sigmaEff', state.probe);
        if (Math.abs(delta) < 0.05) {
            note = 'σ′ is unchanged from the reference, so nothing settles — even though σ and u have both moved.';
        } else if (delta > 0) {
            note = `σ′ is ${delta.toFixed(1)} kPa higher than the reference. That is a permanent surcharge on every element at this depth.`;
        } else {
            note = `σ′ is ${Math.abs(delta).toFixed(1)} kPa lower than the reference, so the soil is unloading and will swell.`;
        }
    } else {
        note = 'Freeze a reference to compare scenarios against it.';
    }
    el('summaryNote').textContent = note;
}

// Saturated soil is never lighter than the same soil unloaded of its water, so
// gamma can never exceed gamma_sat. Whichever slider the user just moved wins,
// and the other one follows it.
function enforceUnitWeightOrder(changedId) {
    [1, 2, 3].forEach((i) => {
        const bulk = inputs[`g${i}`];
        const sat = inputs[`gs${i}`];
        const bulkValue = parseFloat(bulk.value);
        const satValue = parseFloat(sat.value);
        if (bulkValue <= satValue) return;

        if (changedId === sat.id) {
            bulk.value = Math.max(parseFloat(bulk.min), satValue);
        } else {
            sat.value = Math.min(parseFloat(sat.max), bulkValue);
        }
    });
}

function update(event) {
    enforceUnitWeightOrder(event && event.target ? event.target.id : null);
    const state = getState();
    inputs.probe.max = Math.max(1, state.totalDepth);
    if (state.probe > state.totalDepth) {
        inputs.probe.value = state.totalDepth;
        state.probe = state.totalDepth;
    }
    updateSliderValues(state);
    const profile = buildProfile(state);
    updateOutputs(state, profile);
    createPlot(state, profile);
}

function applyPreset(values) {
    Object.entries(values).forEach(([key, value]) => {
        if (inputs[key]) inputs[key].value = value;
    });
    update();
}

function freezeReference() {
    reference = buildProfile(getState());
    update();
}

Object.values(inputs).forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
});

el('freeze-button').addEventListener('click', freezeReference);
el('reset-button').addEventListener('click', () => {
    reference = null;
    applyPreset({ ...DEFAULTS });
});

window.addEventListener('resize', () => Plotly.Plots.resize(profilePlot));

if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => Plotly.Plots.resize(profilePlot)).observe(profilePlot);
}

update();
freezeReference();
requestAnimationFrame(() => Plotly.Plots.resize(profilePlot));
