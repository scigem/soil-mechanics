import '../css/main.css';
import '../css/consolidation.css';
import Plotly from 'plotly.js-dist';

const DEFAULTS = {
    stressIncrement: 100,
    layerThickness: 6,
    cv: 0.1,
    mv: 0.0004,
    tMax: 365,
    profileTime: 30,
    drainageTop: true,
    drainageBottom: true,
    loading: 'nc',
    drains: false,
    drainSpacing: 2,
};

const SERIES_TERMS = 60;
const PROFILE_POINTS = 61;
const TIME_POINTS = 181;

const stressIncrementInput = document.getElementById('stress-increment');
const layerThicknessInput = document.getElementById('layer-thickness');
const cvInput = document.getElementById('cv');
const mvInput = document.getElementById('mv');
const tMaxInput = document.getElementById('t-max');
const profileTimeInput = document.getElementById('profile-time');
const drainageTopInput = document.getElementById('drainage-top');
const drainageBottomInput = document.getElementById('drainage-bottom');
const loadingInput = document.getElementById('loading');
const drainsInput = document.getElementById('drains');
const drainSpacingInput = document.getElementById('drain-spacing');
const REload = 6; // Cc / Cr
const resetButton = document.getElementById('reset-button');

const settlementPlot = document.getElementById('settlementPlot');
const profilePlot = document.getElementById('profilePlot');

function getDrainageMode() {
    if (drainageTopInput.checked && drainageBottomInput.checked) {
        return 'double';
    }

    if (drainageTopInput.checked) {
        return 'top';
    }

    if (drainageBottomInput.checked) {
        return 'bottom';
    }

    return 'none';
}

function getDrainageLabel(mode) {
    if (mode === 'double') {
        return 'Double drainage';
    }

    if (mode === 'top') {
        return 'Top drainage only';
    }

    if (mode === 'bottom') {
        return 'Bottom drainage only';
    }

    return 'No drainage';
}

function getDrainagePath(thickness, mode) {
    if (mode === 'double') {
        return thickness / 2;
    }

    if (mode === 'top' || mode === 'bottom') {
        return thickness;
    }

    return null;
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

function getDistanceFromNearestDrain(depth, thickness, mode) {
    if (mode === 'double') {
        return Math.min(depth, thickness - depth);
    }

    if (mode === 'top') {
        return depth;
    }

    return thickness - depth;
}

function excessPorePressureRatio(depth, time, thickness, cv, mode) {
    if (mode === 'none') {
        return 1;
    }

    if (time <= 0) {
        return 1;
    }

    const drainagePath = getDrainagePath(thickness, mode);
    const y = getDistanceFromNearestDrain(depth, thickness, mode);
    let ratio = 0;

    for (let termIndex = 0; termIndex < SERIES_TERMS; termIndex += 1) {
        const n = 2 * termIndex + 1;
        const angle = (n * Math.PI * y) / (2 * drainagePath);
        const decay = Math.exp((-n * n * Math.PI * Math.PI * cv * time) / (4 * drainagePath * drainagePath));
        ratio += (4 / (n * Math.PI)) * Math.sin(angle) * decay;
    }

    return clamp01(ratio);
}

function averageDegreeOfConsolidation(time, thickness, cv, mode) {
    if (mode === 'none' || time <= 0) {
        return 0;
    }

    const drainagePath = getDrainagePath(thickness, mode);
    let seriesValue = 0;

    for (let termIndex = 0; termIndex < SERIES_TERMS; termIndex += 1) {
        const n = 2 * termIndex + 1;
        const decay = Math.exp((-n * n * Math.PI * Math.PI * cv * time) / (4 * drainagePath * drainagePath));
        seriesValue += decay / (n * n);
    }

    return clamp01(1 - ((8 / (Math.PI * Math.PI)) * seriesValue));
}

function updateSliderValues(state) {
    document.getElementById('stressIncrementValue').textContent = state.stressIncrement.toFixed(0);
    document.getElementById('layerThicknessValue').textContent = state.layerThickness.toFixed(1);
    document.getElementById('cvValue').textContent = state.cv.toFixed(2);
    document.getElementById('mvValue').textContent = state.mv.toFixed(4);
    document.getElementById('tMaxValue').textContent = state.tMax.toFixed(0);
    document.getElementById('profileTimeValue').textContent = state.profileTime.toFixed(0);
    document.getElementById('drainSpacingValue').textContent = state.drainSpacing.toFixed(1);
    drainSpacingInput.disabled = !state.drains;
}

// Degree of consolidation for a one-dimensional drainage path, from the same series.
function degreeForPath(time, path, cv) {
    if (time <= 0 || !(path > 0)) {
        return 0;
    }
    let seriesValue = 0;
    for (let termIndex = 0; termIndex < SERIES_TERMS; termIndex += 1) {
        const n = 2 * termIndex + 1;
        seriesValue += Math.exp((-n * n * Math.PI * Math.PI * cv * time) / (4 * path * path)) / (n * n);
    }
    return clamp01(1 - ((8 / (Math.PI * Math.PI)) * seriesValue));
}

// With drains, combine vertical drainage with sideways drainage over half the
// drain spacing (Carrillo: 1 - U = (1 - U_v)(1 - U_r)). The sideways part is a
// one-dimensional stand-in for radial flow: a scaling estimate.
function degreeWithDrains(time, state) {
    const Uv = averageDegreeOfConsolidation(time, state.layerThickness, state.cvUse, state.drainageMode);
    if (!state.drains) {
        return Uv;
    }
    const Ur = degreeForPath(time, state.drainSpacing / 2, state.cvUse);
    return 1 - (1 - Uv) * (1 - Ur);
}

function timeTo(target, state) {
    let lo = 0;
    let hi = 1;
    while (degreeWithDrains(hi, state) < target && hi < 1e9) {
        hi *= 2;
    }
    if (degreeWithDrains(hi, state) < target) {
        return null;
    }
    for (let k = 0; k < 60; k += 1) {
        const mid = 0.5 * (lo + hi);
        if (degreeWithDrains(mid, state) < target) lo = mid;
        else hi = mid;
    }
    return hi;
}

function formatDays(days) {
    if (days === null) return 'never';
    if (days < 60) return `${days.toFixed(1)} days`;
    if (days < 730) return `${(days / 30.44).toFixed(1)} months`;
    return `${(days / 365.25).toFixed(1)} years`;
}

function syncProfileTimeBounds() {
    const tMax = Number(tMaxInput.value);
    profileTimeInput.max = String(tMax);

    if (Number(profileTimeInput.value) > tMax) {
        profileTimeInput.value = String(tMax);
    }
}

function getState() {
    syncProfileTimeBounds();
    return {
        stressIncrement: Number(stressIncrementInput.value),
        layerThickness: Number(layerThicknessInput.value),
        cv: Number(cvInput.value),
        mv: Number(mvInput.value),
        tMax: Number(tMaxInput.value),
        profileTime: Number(profileTimeInput.value),
        drainageMode: getDrainageMode(),
        loading: loadingInput.value,
        drains: drainsInput.checked,
        drainSpacing: Number(drainSpacingInput.value),
        get cvUse() { return this.loading === 'oc' ? this.cv * REload : this.cv; },
        get mvUse() { return this.loading === 'oc' ? this.mv / REload : this.mv; },
    };
}

function generateTimeSeries(tMax) {
    const values = [];

    for (let index = 0; index < TIME_POINTS; index += 1) {
        values.push((index / (TIME_POINTS - 1)) * tMax);
    }

    return values;
}

function generateDepthSeries(thickness) {
    const values = [];

    for (let index = 0; index < PROFILE_POINTS; index += 1) {
        values.push((index / (PROFILE_POINTS - 1)) * thickness);
    }

    return values;
}

function updateOutputs(state, profileDepths, profilePressures, currentDegree, currentSettlement, finalSettlement) {
    const drainagePath = getDrainagePath(state.layerThickness, state.drainageMode);
    const midDepthIndex = Math.floor(profileDepths.length / 2);

    document.getElementById('drainageCondition').textContent = getDrainageLabel(state.drainageMode);
    document.getElementById('drainagePath').textContent = drainagePath === null ? '—' : `${drainagePath.toFixed(2)} m`;
    document.getElementById('currentSettlement').textContent = `${currentSettlement.toFixed(2)} mm`;
    document.getElementById('currentDegree').textContent = `${(currentDegree * 100).toFixed(1)}%`;
    document.getElementById('finalSettlement').textContent = `${finalSettlement.toFixed(2)} mm`;
    document.getElementById('midDepthPressure').textContent = `${profilePressures[midDepthIndex].toFixed(1)} kPa`;
    document.getElementById('t90').textContent = state.drainageMode === 'none' && !state.drains
        ? 'never' : formatDays(timeTo(0.9, state));
    document.getElementById('inUse').textContent = `${state.cvUse.toFixed(2)} m²/day, ${state.mvUse.toExponential(1)} m²/kN`;
}

function updatePlots() {
    const state = getState();
    updateSliderValues(state);

    const times = generateTimeSeries(state.tMax);
    const depths = generateDepthSeries(state.layerThickness);
    const finalSettlement = state.drainageMode === 'none' && !state.drains
        ? 0
        : state.mvUse * state.stressIncrement * state.layerThickness * 1000;

    const degrees = times.map((time) => degreeWithDrains(time, state));
    const settlements = degrees.map((degree) => finalSettlement * degree);
    const withoutDrains = times.map((time) => finalSettlement * averageDegreeOfConsolidation(
        time, state.layerThickness, state.cvUse, state.drainageMode));
    // With drains the profile is the vertical solution scaled by the sideways share still to go.
    const sideways = state.drains ? 1 - degreeForPath(state.profileTime, state.drainSpacing / 2, state.cvUse) : 1;
    const profilePressures = depths.map((depth) => state.stressIncrement * sideways * excessPorePressureRatio(
        depth,
        state.profileTime,
        state.layerThickness,
        state.cvUse,
        state.drainageMode,
    ));
    const grainShares = profilePressures.map((u) => state.stressIncrement - u);

    const currentDegree = degreeWithDrains(state.profileTime, state);
    const currentSettlement = finalSettlement * currentDegree;

    updateOutputs(state, depths, profilePressures, currentDegree, currentSettlement, finalSettlement);

    const settlementData = [
        {
            x: times,
            y: settlements,
            type: 'scatter',
            mode: 'lines',
            name: state.drains ? 'Settlement, with drains' : 'Settlement',
            line: {
                color: '#646ef6',
                width: 3,
            },
        },
        ...(state.drains ? [{
            x: times,
            y: withoutDrains,
            type: 'scatter',
            mode: 'lines',
            name: 'Without drains',
            line: { color: '#9aa0b4', width: 2, dash: 'dot' },
        }] : []),
        {
            x: [state.profileTime],
            y: [currentSettlement],
            type: 'scatter',
            mode: 'markers',
            name: 'Selected time',
            marker: {
                color: '#ff9800',
                size: 10,
            },
        },
        {
            x: [0, state.tMax],
            y: [finalSettlement, finalSettlement],
            type: 'scatter',
            mode: 'lines',
            name: 'Final settlement',
            line: {
                color: '#9aa0b4',
                width: 2,
                dash: 'dash',
            },
        },
    ];

    const settlementLayout = {
        title: {
            text: 'Settlement with time',
            font: { size: 16 },
        },
        xaxis: {
            title: 'Time (days)',
        },
        yaxis: {
            title: 'Settlement (mm)',
            rangemode: 'tozero',
        },
        margin: { l: 60, r: 20, t: 50, b: 55 },
        legend: {
            orientation: 'h',
            x: 0,
            y: 1.15,
        },
        font: { family: 'Inter, sans-serif' },
        paper_bgcolor: 'white',
        plot_bgcolor: '#fafafa',
        shapes: [
            {
                type: 'line',
                x0: state.profileTime,
                x1: state.profileTime,
                y0: 0,
                y1: finalSettlement,
                line: {
                    color: 'rgba(255, 152, 0, 0.35)',
                    width: 2,
                    dash: 'dot',
                },
            },
        ],
    };

    const profileData = [
        {
            x: grainShares,
            y: depths,
            type: 'scatter',
            mode: 'lines',
            name: "Grains' share, Δσ′",
            line: { color: '#6b3512', width: 2.5 },
            fill: 'tozerox',
            fillcolor: 'rgba(168, 85, 31, 0.45)',
        },
        {
            x: depths.map(() => state.stressIncrement),
            y: depths,
            type: 'scatter',
            mode: 'lines',
            name: "Water's share, u",
            line: { color: '#0b6ea8', width: 1.5 },
            fill: 'tonextx',
            fillcolor: 'rgba(41, 163, 227, 0.3)',
        },
    ];

    const profileLayout = {
        title: {
            text: `Who carries the load at t = ${state.profileTime.toFixed(0)} days`,
            font: { size: 16 },
        },
        xaxis: {
            title: 'Share of the added load (kPa)',
            range: [0, state.stressIncrement * 1.02],
        },
        yaxis: {
            title: 'Depth z (m)',
            autorange: 'reversed',
        },
        margin: { l: 60, r: 20, t: 50, b: 55 },
        legend: {
            orientation: 'h',
            x: 0,
            y: 1.15,
        },
        font: { family: 'Inter, sans-serif' },
        paper_bgcolor: 'white',
        plot_bgcolor: '#fafafa',
    };

    const plotConfig = {
        responsive: true,
        displayModeBar: false,
    };

    Plotly.react(settlementPlot, settlementData, settlementLayout, plotConfig);
    Plotly.react(profilePlot, profileData, profileLayout, plotConfig);
}

function resetToDefaults() {
    stressIncrementInput.value = DEFAULTS.stressIncrement;
    layerThicknessInput.value = DEFAULTS.layerThickness;
    cvInput.value = DEFAULTS.cv;
    mvInput.value = DEFAULTS.mv;
    tMaxInput.value = DEFAULTS.tMax;
    profileTimeInput.value = DEFAULTS.profileTime;
    drainageTopInput.checked = DEFAULTS.drainageTop;
    drainageBottomInput.checked = DEFAULTS.drainageBottom;
    loadingInput.value = DEFAULTS.loading;
    drainsInput.checked = DEFAULTS.drains;
    drainSpacingInput.value = DEFAULTS.drainSpacing;
    updatePlots();
}

[
    stressIncrementInput,
    layerThicknessInput,
    cvInput,
    mvInput,
    tMaxInput,
    profileTimeInput,
    drainageTopInput,
    drainageBottomInput,
    loadingInput,
    drainsInput,
    drainSpacingInput,
].forEach((input) => {
    input.addEventListener('input', updatePlots);
    input.addEventListener('change', updatePlots);
});

resetButton.addEventListener('click', resetToDefaults);

window.addEventListener('resize', () => {
    Plotly.Plots.resize(settlementPlot);
    Plotly.Plots.resize(profilePlot);
});

updatePlots();
