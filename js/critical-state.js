import '../css/main.css';
import '../css/critical-state.css';
import Plotly from 'plotly.js-dist';

// Get HTML elements
const MInput = document.getElementById('M');
const GammaInput = document.getElementById('Gamma');
const lambdaInput = document.getElementById('lambda');
const NInput = document.getElementById('N');
const sigmaScaleSelect = document.getElementById('sigma-scale');
const viewTauSigmaBtn = document.getElementById('view-tau-sigma');
const viewESigmaBtn = document.getElementById('view-e-sigma');
const view3DBtn = document.getElementById('view-3d');
const resetButton = document.getElementById('reset-button');
const plotContainer = document.getElementById('plot-container');

// Default values
let M = parseFloat(MInput.value);
let Gamma = parseFloat(GammaInput.value);
let lambda = parseFloat(lambdaInput.value);
let N = parseFloat(NInput.value);
let sigmaScale = sigmaScaleSelect.value;
let currentView = '3d';

// Event listeners
MInput.addEventListener('input', updatePlot);
GammaInput.addEventListener('input', updatePlot);
lambdaInput.addEventListener('input', updatePlot);
NInput.addEventListener('input', updatePlot);
sigmaScaleSelect.addEventListener('change', updatePlot);
viewTauSigmaBtn.addEventListener('click', () => setView('tau-sigma'));
viewESigmaBtn.addEventListener('click', () => setView('e-sigma'));
view3DBtn.addEventListener('click', () => setView('3d'));
resetButton.addEventListener('click', resetValues);

// Function to reset to default values
function resetValues() {
    MInput.value = 1.2;
    GammaInput.value = 2.0;
    lambdaInput.value = 0.15;
    NInput.value = 2.5;
    sigmaScaleSelect.value = 'linear';
    currentView = '3d';
    updatePlot();
}

// Function to set view
function setView(view) {
    currentView = view;
    updatePlot();
}

// Function to generate data points
function generateData() {
    // Update variables
    M = parseFloat(MInput.value);
    Gamma = parseFloat(GammaInput.value);
    lambda = parseFloat(lambdaInput.value);
    N = parseFloat(NInput.value);
    sigmaScale = sigmaScaleSelect.value;

    // Generate stress range
    const sigmaMin = sigmaScale === 'log' ? 1 : 0;
    const sigmaMax = sigmaScale === 'log' ? 1000 : 500;
    const numPoints = 100;

    let sigmaPoints;
    if (sigmaScale === 'log') {
        // Logarithmic spacing
        const logMin = Math.log10(sigmaMin);
        const logMax = Math.log10(sigmaMax);
        sigmaPoints = Array.from({ length: numPoints }, (_, i) => {
            const logValue = logMin + (logMax - logMin) * i / (numPoints - 1);
            return Math.pow(10, logValue);
        });
    } else {
        // Linear spacing
        sigmaPoints = Array.from({ length: numPoints }, (_, i) => {
            return sigmaMin + (sigmaMax - sigmaMin) * i / (numPoints - 1);
        });
    }

    // Calculate corresponding values
    const tauPoints = sigmaPoints.map(sigma => M * sigma);
    const ePoints = sigmaPoints.map(sigma => {
        const lnSigma = Math.log(sigma);
        return Gamma - lambda * lnSigma;
    });

    // Generate normal compression line
    const eNCL = sigmaPoints.map(sigma => {
        const lnSigma = Math.log(sigma);
        return N - lambda * lnSigma;
    });

    return {
        sigma: sigmaPoints,
        tau: tauPoints,
        e: ePoints,
        eNCL: eNCL
    };
}

// Function to create 3D plot
function create3DPlot(data) {
    const trace1 = {
        x: data.sigma,
        y: data.tau,
        z: data.e,
        type: 'scatter3d',
        mode: 'lines',
        name: 'Critical State Line',
        line: {
            color: '#646ef6',
            width: 6
        }
    };

    const trace2 = {
        x: data.sigma,
        y: Array(data.sigma.length).fill(0),
        z: data.eNCL,
        type: 'scatter3d',
        mode: 'lines',
        name: 'Normal Compression Line',
        line: {
            color: '#ff9800',
            width: 4,
            dash: 'dash'
        }
    };

    // Create surface for better visualization
    const sigmaGrid = [];
    const tauGrid = [];
    const eGrid = [];

    const gridSize = 20;
    for (let i = 0; i < gridSize; i++) {
        const sigmaRow = [];
        const tauRow = [];
        const eRow = [];

        for (let j = 0; j < gridSize; j++) {
            const sigma = data.sigma[0] + (data.sigma[data.sigma.length - 1] - data.sigma[0]) * i / (gridSize - 1);
            const tau = M * sigma * j / (gridSize - 1);
            const e = Gamma - lambda * Math.log(sigma);

            sigmaRow.push(sigma);
            tauRow.push(tau);
            eRow.push(e);
        }

        sigmaGrid.push(sigmaRow);
        tauGrid.push(tauRow);
        eGrid.push(eRow);
    }

    const surface = {
        x: sigmaGrid,
        y: tauGrid,
        z: eGrid,
        type: 'surface',
        name: 'Critical State Surface',
        opacity: 0.3,
        colorscale: 'Viridis',
        showscale: false
    };

    const layout = {
        title: {
            text: 'Critical State Line in 3D Space',
            font: { size: 18, color: '#212121' }
        },
        scene: {
            xaxis: {
                title: sigmaScale === 'log' ? 'σ (kPa) - Log Scale' : 'σ (kPa)',
                type: sigmaScale === 'log' ? 'log' : 'linear',
                color: '#212121'
            },
            yaxis: {
                title: 'τ (kPa)',
                color: '#212121'
            },
            zaxis: {
                title: 'Void Ratio e',
                color: '#212121'
            },
            camera: {
                eye: { x: 1.5, y: 1.5, z: 1.5 }
            }
        },
        margin: { l: 0, r: 0, b: 0, t: 40 },
        font: { family: 'Inter, sans-serif' }
    };

    return {
        data: [trace1, trace2, surface],
        layout: layout
    };
}

// Function to create 2D tau-sigma plot
function createTauSigmaPlot(data) {
    const trace1 = {
        x: data.sigma,
        y: data.tau,
        type: 'scatter',
        mode: 'lines',
        name: 'Critical State Line',
        line: {
            color: '#646ef6',
            width: 3
        }
    };

    const layout = {
        title: {
            text: 'Critical State Line - Stress Space (τ vs σ)',
            font: { size: 18, color: '#212121' }
        },
        xaxis: {
            title: sigmaScale === 'log' ? 'σ (kPa) - Log Scale' : 'σ (kPa)',
            type: sigmaScale === 'log' ? 'log' : 'linear',
            color: '#212121'
        },
        yaxis: {
            title: 'τ (kPa)',
            color: '#212121'
        },
        margin: { l: 60, r: 40, b: 60, t: 60 },
        font: { family: 'Inter, sans-serif' },
        plot_bgcolor: '#fafafa',
        paper_bgcolor: 'white'
    };

    return {
        data: [trace1],
        layout: layout
    };
}

// Function to create 2D e-sigma plot
function createESigmaPlot(data) {
    const trace1 = {
        x: data.sigma,
        y: data.e,
        type: 'scatter',
        mode: 'lines',
        name: 'Critical State Line',
        line: {
            color: '#646ef6',
            width: 3
        }
    };

    const trace2 = {
        x: data.sigma,
        y: data.eNCL,
        type: 'scatter',
        mode: 'lines',
        name: 'Normal Compression Line',
        line: {
            color: '#ff9800',
            width: 3,
            dash: 'dash'
        }
    };

    const layout = {
        title: {
            text: 'Critical State Line - Void Ratio Space (e vs ln σ)',
            font: { size: 18, color: '#212121' }
        },
        xaxis: {
            title: sigmaScale === 'log' ? 'σ (kPa) - Log Scale' : 'σ (kPa)',
            type: sigmaScale === 'log' ? 'log' : 'linear',
            color: '#212121'
        },
        yaxis: {
            title: 'Void Ratio e',
            color: '#212121'
        },
        margin: { l: 60, r: 40, b: 60, t: 60 },
        font: { family: 'Inter, sans-serif' },
        plot_bgcolor: '#fafafa',
        paper_bgcolor: 'white'
    };

    return {
        data: [trace1, trace2],
        layout: layout
    };
}

// Main update function
function updatePlot() {
    const data = generateData();
    let plotData;

    switch (currentView) {
        case 'tau-sigma':
            plotData = createTauSigmaPlot(data);
            break;
        case 'e-sigma':
            plotData = createESigmaPlot(data);
            break;
        case '3d':
        default:
            plotData = create3DPlot(data);
            break;
    }

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false
    };

    Plotly.newPlot(plotContainer, plotData.data, plotData.layout, config);
}

// Add click handlers for axis snapping in 3D view
plotContainer.addEventListener('plotly_click', function (data) {
    if (currentView === '3d' && data.points.length > 0) {
        const clickedAxis = determineClickedAxis(data.points[0]);
        if (clickedAxis) {
            snapToAxis(clickedAxis);
        }
    }
});

function determineClickedAxis(point) {
    // Simple heuristic to determine which axis was clicked
    const { x, y, z } = point;

    // Check if click is near an axis (this is a simplified approach)
    if (Math.abs(y) < 0.1 * Math.max(...generateData().tau) && Math.abs(z) < 0.1) {
        return 'x'; // sigma axis
    } else if (Math.abs(x) < 0.1 * Math.max(...generateData().sigma) && Math.abs(z) < 0.1) {
        return 'y'; // tau axis
    } else if (Math.abs(x) < 0.1 * Math.max(...generateData().sigma) && Math.abs(y) < 0.1) {
        return 'z'; // void ratio axis
    }
    return null;
}

function snapToAxis(axis) {
    const cameraSettings = {
        'x': { eye: { x: 2.5, y: 0, z: 0 } }, // View along sigma axis
        'y': { eye: { x: 0, y: 2.5, z: 0 } }, // View along tau axis
        'z': { eye: { x: 0, y: 0, z: 2.5 } }  // View along void ratio axis
    };

    if (cameraSettings[axis]) {
        const update = {
            'scene.camera': cameraSettings[axis]
        };

        Plotly.relayout(plotContainer, update);
    }
}

// Initialize the plot
updatePlot();

// Handle window resize
window.addEventListener('resize', () => {
    Plotly.Plots.resize(plotContainer);
});