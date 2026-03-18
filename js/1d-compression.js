import '../css/main.css';
import '../css/1d-compression.css';
import Plotly from 'plotly.js-dist';

const DEFAULTS = {
    initialStress: 50,
    preconStress: 150,
    peakStress: 300,
    finalStress: 100,
    lambda: 0.18,
    kappa: 0.04,
    preconVoidRatio: 1.0,
};

const POINT_COUNT = 160;
const plotConfig = {
    responsive: true,
    displayModeBar: false,
};

const initialStressInput = document.getElementById('initial-stress');
const preconStressInput = document.getElementById('precon-stress');
const peakStressInput = document.getElementById('peak-stress');
const finalStressInput = document.getElementById('final-stress');
const lambdaInput = document.getElementById('lambda');
const kappaInput = document.getElementById('kappa');
const preconVoidRatioInput = document.getElementById('precon-void-ratio');
const resetButton = document.getElementById('reset-button');
const compressionPlot = document.getElementById('compressionPlot');

function formatStress(value) {
    return `${value.toFixed(0)} kPa`;
}

function formatOCR(value) {
    return value.toFixed(2);
}

function formatVoidRatio(value) {
    return value.toFixed(3);
}

function recompressionVoidRatio(stress, preconStress, preconVoidRatio, kappa) {
    return preconVoidRatio - (kappa * Math.log(stress / preconStress));
}

function virginVoidRatio(stress, preconStress, preconVoidRatio, lambda) {
    return preconVoidRatio - (lambda * Math.log(stress / preconStress));
}

function voidRatioOnLoading(stress, state) {
    if (stress <= state.preconStress) {
        return recompressionVoidRatio(stress, state.preconStress, state.preconVoidRatio, state.kappa);
    }

    return virginVoidRatio(stress, state.preconStress, state.preconVoidRatio, state.lambda);
}

function voidRatioOnCurrentReloading(stress, updatedPreconStress, peakVoidRatio, kappa) {
    return peakVoidRatio - (kappa * Math.log(stress / updatedPreconStress));
}

function logSpace(min, max, count) {
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return Array.from({ length: count }, (_, index) => {
        const fraction = index / (count - 1);
        return 10 ** (logMin + ((logMax - logMin) * fraction));
    });
}

function syncStressBounds() {
    const initialStress = Number(initialStressInput.value);

    preconStressInput.min = String(initialStress);
    if (Number(preconStressInput.value) < initialStress) {
        preconStressInput.value = String(initialStress);
    }

    peakStressInput.min = String(initialStress);
    if (Number(peakStressInput.value) < initialStress) {
        peakStressInput.value = String(initialStress);
    }

    finalStressInput.max = peakStressInput.value;
    if (Number(finalStressInput.value) > Number(peakStressInput.value)) {
        finalStressInput.value = peakStressInput.value;
    }
}

function getState() {
    syncStressBounds();

    return {
        initialStress: Number(initialStressInput.value),
        preconStress: Number(preconStressInput.value),
        peakStress: Number(peakStressInput.value),
        finalStress: Number(finalStressInput.value),
        lambda: Number(lambdaInput.value),
        kappa: Number(kappaInput.value),
        preconVoidRatio: Number(preconVoidRatioInput.value),
    };
}

function updateSliderValues(state) {
    document.getElementById('initialStressValue').textContent = state.initialStress.toFixed(0);
    document.getElementById('preconStressValue').textContent = state.preconStress.toFixed(0);
    document.getElementById('peakStressValue').textContent = state.peakStress.toFixed(0);
    document.getElementById('finalStressValue').textContent = state.finalStress.toFixed(0);
    document.getElementById('lambdaValue').textContent = state.lambda.toFixed(2);
    document.getElementById('kappaValue').textContent = state.kappa.toFixed(3);
    document.getElementById('preconVoidRatioValue').textContent = state.preconVoidRatio.toFixed(2);
}

function buildStateResults(state) {
    const initialVoidRatio = recompressionVoidRatio(
        state.initialStress,
        state.preconStress,
        state.preconVoidRatio,
        state.kappa,
    );
    const peakVoidRatio = voidRatioOnLoading(state.peakStress, state);
    const updatedPreconStress = Math.max(state.preconStress, state.peakStress);
    const updatedPreconVoidRatio = state.peakStress > state.preconStress
        ? peakVoidRatio
        : state.preconVoidRatio;
    const finalVoidRatio = state.finalStress === updatedPreconStress
        ? updatedPreconVoidRatio
        : voidRatioOnCurrentReloading(state.finalStress, updatedPreconStress, updatedPreconVoidRatio, state.kappa);

    return {
        initialVoidRatio,
        peakVoidRatio,
        finalVoidRatio,
        updatedPreconStress,
        updatedPreconVoidRatio,
        initialOCR: state.preconStress / state.initialStress,
        currentOCR: updatedPreconStress / state.finalStress,
    };
}

function updateOutputs(state, results) {
    const yielded = state.peakStress > state.preconStress;
    document.getElementById('initialOCR').textContent = formatOCR(results.initialOCR);
    document.getElementById('currentOCR').textContent = formatOCR(results.currentOCR);
    document.getElementById('preconMovement').textContent = `${state.preconStress.toFixed(0)} → ${results.updatedPreconStress.toFixed(0)} kPa`;
    document.getElementById('initialVoidRatio').textContent = formatVoidRatio(results.initialVoidRatio);
    document.getElementById('peakVoidRatio').textContent = formatVoidRatio(results.peakVoidRatio);
    document.getElementById('finalVoidRatio').textContent = formatVoidRatio(results.finalVoidRatio);
    document.getElementById('pathSummary').textContent = yielded
        ? 'Peak stress exceeds the initial σ′pc, so the soil yields and the new σ′pc becomes the past maximum stress.'
        : 'Peak stress stays below the initial σ′pc, so σ′pc does not move and the whole path remains on the same recompression line.';
}

function createPlot(state, results) {
    const sigmaMin = Math.max(10, Math.min(
        state.initialStress,
        state.finalStress,
        state.preconStress,
    ) * 0.7);
    const sigmaMax = Math.max(
        state.peakStress,
        results.updatedPreconStress,
    ) * 1.5;
    const sigmaRange = logSpace(sigmaMin, sigmaMax, POINT_COUNT);

    const ncl = sigmaRange.map((stress) => virginVoidRatio(stress, state.preconStress, state.preconVoidRatio, state.lambda));
    const initialReloadRange = sigmaRange.filter((stress) => stress <= state.preconStress);
    const initialReloading = initialReloadRange.map((stress) => recompressionVoidRatio(
        stress,
        state.preconStress,
        state.preconVoidRatio,
        state.kappa,
    ));
    const currentReloadRange = sigmaRange.filter((stress) => stress <= results.updatedPreconStress);
    const currentReloading = currentReloadRange.map((stress) => voidRatioOnCurrentReloading(
        stress,
        results.updatedPreconStress,
        results.updatedPreconVoidRatio,
        state.kappa,
    ));

    const loadingX = [state.initialStress];
    const loadingY = [results.initialVoidRatio];
    if (state.initialStress < state.preconStress && state.peakStress > state.preconStress) {
        loadingX.push(state.preconStress);
        loadingY.push(state.preconVoidRatio);
    }
    if (state.peakStress !== loadingX[loadingX.length - 1]) {
        loadingX.push(state.peakStress);
        loadingY.push(results.peakVoidRatio);
    }

    const unloadingX = [state.peakStress, state.finalStress];
    const unloadingY = [results.peakVoidRatio, results.finalVoidRatio];

    const traces = [
        {
            x: sigmaRange,
            y: ncl,
            type: 'scatter',
            mode: 'lines',
            name: 'Virgin compression line',
            line: {
                color: '#ff9800',
                width: 2,
                dash: 'dash',
            },
        },
        {
            x: initialReloadRange,
            y: initialReloading,
            type: 'scatter',
            mode: 'lines',
            name: 'Initial recompression line',
            line: {
                color: '#9aa0b4',
                width: 2,
                dash: 'dot',
            },
        },
        {
            x: currentReloadRange,
            y: currentReloading,
            type: 'scatter',
            mode: 'lines',
            name: 'Current unload-reload line',
            line: {
                color: '#2aa876',
                width: 2,
                dash: 'dashdot',
            },
        },
        {
            x: loadingX,
            y: loadingY,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Loading path',
            line: {
                color: '#646ef6',
                width: 4,
            },
            marker: {
                color: '#646ef6',
                size: 8,
            },
        },
        {
            x: unloadingX,
            y: unloadingY,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Unloading path',
            line: {
                color: '#ff6b6b',
                width: 4,
            },
            marker: {
                color: '#ff6b6b',
                size: 8,
            },
        },
        {
            x: [state.initialStress, state.peakStress, state.finalStress],
            y: [results.initialVoidRatio, results.peakVoidRatio, results.finalVoidRatio],
            type: 'scatter',
            mode: 'markers+text',
            name: 'States',
            text: ['Initial', 'Peak', 'Final'],
            textposition: 'top center',
            marker: {
                color: '#212121',
                size: 10,
            },
            showlegend: false,
        },
    ];

    const yValues = [
        ...ncl,
        ...initialReloading,
        ...currentReloading,
        ...loadingY,
        ...unloadingY,
    ];
    const yMin = Math.min(...yValues) - 0.05;
    const yMax = Math.max(...yValues) + 0.05;

    const shapes = [
        {
            type: 'line',
            x0: state.preconStress,
            x1: state.preconStress,
            y0: yMin,
            y1: yMax,
            line: {
                color: 'rgba(154, 160, 180, 0.7)',
                width: 2,
                dash: 'dot',
            },
        },
    ];
    const annotations = [
        {
            x: state.preconStress,
            y: yMax,
            text: "Initial σ′pc",
            showarrow: false,
            yshift: 14,
            font: { color: '#6b7280', size: 12 },
        },
    ];

    if (results.updatedPreconStress !== state.preconStress) {
        shapes.push({
            type: 'line',
            x0: results.updatedPreconStress,
            x1: results.updatedPreconStress,
            y0: yMin,
            y1: yMax,
            line: {
                color: 'rgba(42, 168, 118, 0.85)',
                width: 2,
                dash: 'dash',
            },
        });
        annotations.push({
            x: results.updatedPreconStress,
            y: yMax,
            text: "Current σ′pc",
            showarrow: false,
            yshift: 14,
            font: { color: '#2aa876', size: 12 },
        });
    }

    const layout = {
        title: {
            text: `Stress path: ${state.initialStress.toFixed(0)} → ${state.peakStress.toFixed(0)} → ${state.finalStress.toFixed(0)} kPa`,
            font: { size: 16 },
        },
        xaxis: {
            title: 'Effective vertical stress σ′v (kPa)',
            type: 'log',
            range: [Math.log10(sigmaMin), Math.log10(sigmaMax)],
        },
        yaxis: {
            title: 'Void ratio e',
            range: [yMin, yMax],
        },
        margin: { l: 70, r: 20, t: 88, b: 60 },
        legend: {
            orientation: 'h',
            x: 0,
            y: 1.06,
            xanchor: 'left',
            yanchor: 'bottom',
            font: { size: 11 },
        },
        paper_bgcolor: 'white',
        plot_bgcolor: '#fafafa',
        font: { family: 'Inter, sans-serif' },
        shapes,
        annotations,
    };

    Plotly.react(compressionPlot, traces, layout, plotConfig);
}

function updatePlot() {
    const state = getState();
    updateSliderValues(state);
    const results = buildStateResults(state);
    updateOutputs(state, results);
    createPlot(state, results);
}

function resetToDefaults() {
    initialStressInput.value = DEFAULTS.initialStress;
    preconStressInput.value = DEFAULTS.preconStress;
    peakStressInput.value = DEFAULTS.peakStress;
    finalStressInput.value = DEFAULTS.finalStress;
    lambdaInput.value = DEFAULTS.lambda;
    kappaInput.value = DEFAULTS.kappa;
    preconVoidRatioInput.value = DEFAULTS.preconVoidRatio;
    updatePlot();
}

[
    initialStressInput,
    preconStressInput,
    peakStressInput,
    finalStressInput,
    lambdaInput,
    kappaInput,
    preconVoidRatioInput,
].forEach((input) => {
    input.addEventListener('input', updatePlot);
    input.addEventListener('change', updatePlot);
});

resetButton.addEventListener('click', resetToDefaults);

window.addEventListener('resize', () => {
    Plotly.Plots.resize(compressionPlot);
});

updatePlot();
