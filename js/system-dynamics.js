import { alpha, colors, tip } from './ui.js';
import '../css/system-dynamics.css';
import Plotly from 'plotly.js-dist';

// Get HTML elements
const modelSelect = document.getElementById('model-select');
const parametersContainer = document.getElementById('parameters-container');
const tMaxInput = document.getElementById('t-max');
const plotContainer = document.getElementById('plot-container');
const equationDisplay = document.getElementById('equation-display');
const solutionDisplay = document.getElementById('solution-display');

// Theme values Plotly needs that the palette does not carry: the body
// typeface, and the accent colour used for the rate of change.
const rootStyle = getComputedStyle(document.documentElement);
const FONT_FAMILY = rootStyle.getPropertyValue('--font-body').trim();
const RATE_COLOR = colors.accent;

// A plain explanation for each parameter, keyed by its label.
const PARAM_TIPS = {
    'Growth rate (r)': 'The rate constant r, per unit time: the fractional growth of x per unit time while x is small.',
    'Decay rate (r)': 'The rate constant r, per unit time: the fraction of x lost per unit time.',
    'Initial value (x₀)': 'The state x at t = 0.',
    'Input rate (u)': 'The constant inflow u, in units of x per unit time.',
    'Carrying capacity (k)': 'The largest stock the logistic model can sustain: growth stops when x reaches k.',
    'Harvest rate (r_h)': 'The fraction of the stock harvested per unit time. The stock persists only while r_h < r.',
    'Normalized harvest (H)': 'H = 4h/(rk): the constant harvest h over the largest growth the logistic model can supply, rk/4.',
};

// Model definitions
const models = {
    'exp-growth': {
        name: 'Exponential Growth',
        equation: 'dx/dt = rx',
        solution: 'x(t) = x₀e^(rt)',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            x0: { label: 'Initial value (x₀)', value: 1, min: 0.1, max: 10, step: 0.1 }
        },
        compute: (t, params) => params.x0 * Math.exp(params.r * t),
        derivative: (x, params) => params.r * x
    },
    'exp-decay': {
        name: 'Exponential Decay',
        equation: 'dx/dt = -rx',
        solution: 'x(t) = x₀e^(-rt)',
        params: {
            r: { label: 'Decay rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            x0: { label: 'Initial value (x₀)', value: 10, min: 1, max: 20, step: 0.1 }
        },
        compute: (t, params) => params.x0 * Math.exp(-params.r * t),
        derivative: (x, params) => -params.r * x
    },
    'const-input': {
        name: 'Constant Input with Exponential Decay',
        equation: 'dx/dt = u - rx',
        solution: 'x(t) = (u/r) + (x₀ - u/r)e^(-rt)',
        params: {
            u: { label: 'Input rate (u)', value: 5, min: 0, max: 20, step: 0.5 },
            r: { label: 'Decay rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            x0: { label: 'Initial value (x₀)', value: 1, min: 0, max: 20, step: 0.1 }
        },
        compute: (t, params) => (params.u / params.r) + (params.x0 - params.u / params.r) * Math.exp(-params.r * t),
        derivative: (x, params) => params.u - params.r * x
    },
    'logistic': {
        name: 'Logistic Growth without Harvest',
        equation: 'dx/dt = rx(1 - x/k)',
        solution: 'x(t) = k / (1 + ((k - x₀)/x₀)e^(-rt))',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            k: { label: 'Carrying capacity (k)', value: 100, min: 10, max: 200, step: 5 },
            x0: { label: 'Initial value (x₀)', value: 10, min: 1, max: 50, step: 1 }
        },
        compute: (t, params) => {
            const { r, k, x0 } = params;
            return k / (1 + ((k - x0) / x0) * Math.exp(-r * t));
        },
        derivative: (x, params) => params.r * x * (1 - x / params.k)
    },
    'logistic-stock-harvest': {
        name: 'Logistic Growth with Stock-Dependent Harvest',
        equation: 'dx/dt = rx(1 - x/k) - r_h·x',
        solution: 'x(t) = k / (1/(1 - r_h/r) + [k/x₀ - 1/(1 - r_h/r)]e^(-r(1 - r_h/r)t))',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            k: { label: 'Carrying capacity (k)', value: 100, min: 10, max: 200, step: 5 },
            rh: { label: 'Harvest rate (r_h)', value: 0.1, min: 0, max: 0.4, step: 0.05 },
            x0: { label: 'Initial value (x₀)', value: 10, min: 1, max: 50, step: 1 }
        },
        compute: (t, params) => {
            const { r, k, rh, x0 } = params;
            if (rh >= r) return 0; // Population collapses
            const factor = 1 - rh / r;
            const denominator = 1 / factor + (k / x0 - 1 / factor) * Math.exp(-r * factor * t);
            return k / denominator;
        },
        derivative: (x, params) => params.r * x * (1 - x / params.k) - params.rh * x
    },
    'logistic-const-harvest-critical': {
        name: 'Logistic Growth with Constant Harvest (H=1, Critical)',
        equation: 'dx/dt = rx(1 - x/k) - h, where H = 4h/(rk) = 1',
        solution: 'Equilibrium at x = k/2',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            k: { label: 'Carrying capacity (k)', value: 100, min: 10, max: 200, step: 5 },
            x0: { label: 'Initial value (x₀)', value: 50, min: 1, max: 100, step: 1 }
        },
        compute: (t, params) => {
            // H = 1 means h = rk/4 (critical harvesting)
            const { r, k, x0 } = params;
            const h = r * k / 4;
            return solveLogisticConstHarvest(t, r, k, h, x0);
        },
        derivative: (x, params) => {
            const h = params.r * params.k / 4;
            return params.r * x * (1 - x / params.k) - h;
        }
    },
    'logistic-const-harvest-under': {
        name: 'Logistic Growth with Constant Harvest (H<1, Sustainable)',
        equation: 'dx/dt = rx(1 - x/k) - h, where H = 4h/(rk) < 1',
        solution: 'Two equilibria exist',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            k: { label: 'Carrying capacity (k)', value: 100, min: 10, max: 200, step: 5 },
            H: { label: 'Normalized harvest (H)', value: 0.5, min: 0.1, max: 0.99, step: 0.1 },
            x0: { label: 'Initial value (x₀)', value: 60, min: 1, max: 100, step: 1 }
        },
        compute: (t, params) => {
            const { r, k, H, x0 } = params;
            const h = H * r * k / 4;
            return solveLogisticConstHarvest(t, r, k, h, x0);
        },
        derivative: (x, params) => {
            const h = params.H * params.r * params.k / 4;
            return params.r * x * (1 - x / params.k) - h;
        }
    },
    'logistic-const-harvest-over': {
        name: 'Logistic Growth with Constant Harvest (H>1, Collapse)',
        equation: 'dx/dt = rx(1 - x/k) - h, where H = 4h/(rk) > 1',
        solution: 'x(t) = k/2 - kP·tan[rP(t - (1/rP)arctan(Q))]',
        params: {
            r: { label: 'Growth rate (r)', value: 0.5, min: 0.1, max: 2, step: 0.1 },
            k: { label: 'Carrying capacity (k)', value: 100, min: 10, max: 200, step: 5 },
            H: { label: 'Normalized harvest (H)', value: 1.5, min: 1.01, max: 3, step: 0.1 },
            x0: { label: 'Initial value (x₀)', value: 40, min: 1, max: 100, step: 1 }
        },
        compute: (t, params) => {
            const { r, k, H, x0 } = params;
            const h = H * r * k / 4;

            // For H > 1, the solution is more complex and leads to collapse
            // Using numerical approach
            const P = Math.sqrt(H - 1) / 2;
            const Q = (2 * x0 - k) / (k * P);
            const t0 = Math.atan(Q) / (r * P);

            const result = k / 2 - k * P * Math.tan(r * P * (t - t0));

            // Check for collapse (going to zero or negative)
            return result > 0 ? result : 0;
        },
        derivative: (x, params) => {
            const h = params.H * params.r * params.k / 4;
            return params.r * x * (1 - x / params.k) - h;
        }
    }
};

// Helper function for numerical solution of logistic with constant harvest
function solveLogisticConstHarvest(t, r, k, h, x0) {
    // Using numerical integration (Runge-Kutta 4th order)
    const dt = 0.01;
    let x = x0;
    let time = 0;

    while (time < t && x > 0) {
        const k1 = r * x * (1 - x / k) - h;
        const k2 = r * (x + dt * k1 / 2) * (1 - (x + dt * k1 / 2) / k) - h;
        const k3 = r * (x + dt * k2 / 2) * (1 - (x + dt * k2 / 2) / k) - h;
        const k4 = r * (x + dt * k3) * (1 - (x + dt * k3) / k) - h;

        x = x + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        time += dt;

        if (x < 0) x = 0;
    }

    return x;
}

// Current state
let currentModel = 'exp-growth';
let currentParams = {};

// Initialize
function init() {
    updateParametersUI();
    updateEquationDisplay();
    updatePlot();
}

// Update parameters UI based on selected model
function updateParametersUI() {
    currentModel = modelSelect.value;
    const model = models[currentModel];

    parametersContainer.innerHTML = '';
    currentParams = {};

    Object.keys(model.params).forEach(paramKey => {
        const param = model.params[paramKey];
        currentParams[paramKey] = param.value;

        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';

        const label = document.createElement('label');
        label.textContent = param.label;
        if (PARAM_TIPS[param.label]) label.insertAdjacentHTML('beforeend', tip(PARAM_TIPS[param.label]));
        label.setAttribute('for', paramKey);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = paramKey;
        input.value = param.value;
        input.step = param.step;
        input.min = param.min;
        input.max = param.max;

        input.addEventListener('input', (e) => {
            currentParams[paramKey] = parseFloat(e.target.value);
            updatePlot();
        });

        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        parametersContainer.appendChild(inputGroup);
    });
}

// Update equation display
function updateEquationDisplay() {
    const model = models[currentModel];

    equationDisplay.innerHTML = `
        <h4>Differential equation${tip('How the rate of change dx/dt depends on the state x in this model.')}</h4>
        <div class="equation">${model.equation}</div>
    `;

    solutionDisplay.innerHTML = `
        <h4>Analytical solution${tip('The closed-form x(t) that solves the equation from x₀ at t = 0, or a note on its equilibria where the plot is integrated numerically.')}</h4>
        <div class="solution">${model.solution}</div>
    `;
}

// Generate plot data
function generatePlotData() {
    const tMax = parseFloat(tMaxInput.value);
    const numPoints = 500;
    const dt = tMax / numPoints;

    const model = models[currentModel];
    const tValues = [];
    const xValues = [];
    const dxdtValues = [];

    for (let i = 0; i <= numPoints; i++) {
        const t = i * dt;
        const x = model.compute(t, currentParams);
        const dxdt = model.derivative(x, currentParams);

        tValues.push(t);
        xValues.push(x);
        dxdtValues.push(dxdt);
    }

    return { t: tValues, x: xValues, dxdt: dxdtValues };
}

// Update plot
function updatePlot() {
    const data = generatePlotData();

    const trace1 = {
        x: data.t,
        y: data.x,
        type: 'scatter',
        mode: 'lines',
        name: 'x(t)',
        line: {
            color: colors.primary,
            width: 3
        },
        yaxis: 'y'
    };

    const trace2 = {
        x: data.t,
        y: data.dxdt,
        type: 'scatter',
        mode: 'lines',
        name: 'dx/dt',
        line: {
            color: RATE_COLOR,
            width: 3
        },
        yaxis: 'y2'
    };

    const layout = {
        title: {
            text: modelSelect.selectedOptions[0].textContent,
            font: { size: 18, color: colors.textPrimary }
        },
        xaxis: {
            title: 'Time (t)',
            color: colors.textPrimary,
            gridcolor: colors.grid
        },
        yaxis: {
            title: 'x(t)',
            color: colors.primary,
            gridcolor: colors.grid,
            side: 'left'
        },
        yaxis2: {
            title: 'dx/dt',
            color: RATE_COLOR,
            overlaying: 'y',
            side: 'right'
        },
        margin: { l: 60, r: 60, b: 60, t: 60 },
        font: { family: FONT_FAMILY },
        plot_bgcolor: colors.surfaceMuted,
        paper_bgcolor: colors.surfaceColor,
        showlegend: true,
        legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: alpha(colors.surfaceColor, 0.8),
            bordercolor: colors.borderColor,
            borderwidth: 1
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'],
        displaylogo: false
    };

    Plotly.newPlot(plotContainer, [trace1, trace2], layout, config);
}

// Event listeners
modelSelect.addEventListener('change', () => {
    updateParametersUI();
    updateEquationDisplay();
    updatePlot();
});

tMaxInput.addEventListener('input', updatePlot);

// Handle window resize
window.addEventListener('resize', () => {
    Plotly.Plots.resize(plotContainer);
});

// Initialize on load
init();
