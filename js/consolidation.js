import '../css/main.css';
import '../css/consolidation.css';
import Plotly from 'plotly.js-dist';

const DEFAULTS = {
    stressIncrement: 100,
    layerThickness: 6,
    cv: 0.4,
    mv: 0.0008,
    tMax: 180,
    profileTime: 45,
    drainageTop: true,
    drainageBottom: true,
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
}

function updatePlots() {
    const state = getState();
    updateSliderValues(state);

    const times = generateTimeSeries(state.tMax);
    const depths = generateDepthSeries(state.layerThickness);
    const finalSettlement = state.drainageMode === 'none'
        ? 0
        : state.mv * state.stressIncrement * state.layerThickness * 1000;

    const degrees = times.map((time) => averageDegreeOfConsolidation(time, state.layerThickness, state.cv, state.drainageMode));
    const settlements = degrees.map((degree) => finalSettlement * degree);
    const profilePressures = depths.map((depth) => state.stressIncrement * excessPorePressureRatio(
        depth,
        state.profileTime,
        state.layerThickness,
        state.cv,
        state.drainageMode,
    ));

    const currentDegree = averageDegreeOfConsolidation(
        state.profileTime,
        state.layerThickness,
        state.cv,
        state.drainageMode,
    );
    const currentSettlement = finalSettlement * currentDegree;

    updateOutputs(state, depths, profilePressures, currentDegree, currentSettlement, finalSettlement);

    const settlementData = [
        {
            x: times,
            y: settlements,
            type: 'scatter',
            mode: 'lines',
            name: 'Settlement',
            line: {
                color: '#646ef6',
                width: 3,
            },
        },
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
            x: profilePressures,
            y: depths,
            type: 'scatter',
            mode: 'lines',
            name: 'Current u(z)',
            line: {
                color: '#646ef6',
                width: 3,
            },
            fill: 'tozerox',
            fillcolor: 'rgba(100, 110, 246, 0.12)',
        },
        {
            x: [state.stressIncrement, state.stressIncrement],
            y: [0, state.layerThickness],
            type: 'scatter',
            mode: 'lines',
            name: 'Initial u₀',
            line: {
                color: '#ff9800',
                width: 2,
                dash: 'dash',
            },
        },
    ];

    const profileLayout = {
        title: {
            text: `Excess pore pressure at t = ${state.profileTime.toFixed(0)} days`,
            font: { size: 16 },
        },
        xaxis: {
            title: 'Excess pore pressure u (kPa)',
            range: [0, state.stressIncrement * 1.05],
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
