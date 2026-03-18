import '../css/main.css';
import '../css/sieve-analysis.css';
import Plotly from 'plotly.js-dist';

const SIEVE_STACK = [
    { id: 'sieve475', label: '4.75 mm', subtitle: 'No. 4 sieve', aperture: 4.75, defaultMass: 20 },
    { id: 'sieve200', label: '2.00 mm', subtitle: 'Coarse sand', aperture: 2.0, defaultMass: 60 },
    { id: 'sieve118', label: '1.18 mm', subtitle: 'Medium sand', aperture: 1.18, defaultMass: 110 },
    { id: 'sieve600', label: '0.60 mm', subtitle: 'Medium sand', aperture: 0.6, defaultMass: 135 },
    { id: 'sieve425', label: '0.425 mm', subtitle: 'Fine sand', aperture: 0.425, defaultMass: 90 },
    { id: 'sieve300', label: '0.30 mm', subtitle: 'Fine sand', aperture: 0.3, defaultMass: 50 },
    { id: 'sieve150', label: '0.15 mm', subtitle: 'Fine sand', aperture: 0.15, defaultMass: 25 },
    { id: 'sieve075', label: '0.075 mm', subtitle: 'No. 200 sieve', aperture: 0.075, defaultMass: 5 },
    { id: 'pan', label: 'Pan', subtitle: 'Passing 0.075 mm', aperture: null, defaultMass: 5 },
];

const inputContainer = document.getElementById('sieveInputs');

inputContainer.innerHTML = SIEVE_STACK.map((sieve) => `
    <label class="sieve-row" for="${sieve.id}">
        <span class="sieve-label">
            <strong>${sieve.label}</strong>
            <span>${sieve.subtitle}</span>
        </span>
        <input class="mass-input" id="${sieve.id}" type="number" min="0" step="1" value="${sieve.defaultMass}">
    </label>
`).join('');

SIEVE_STACK.forEach((sieve) => {
    document.getElementById(sieve.id).addEventListener('input', update);
});

function formatMillimetres(value) {
    return value === null ? '—' : `${value.toFixed(value >= 1 ? 2 : 3)} mm`;
}

function formatNumber(value) {
    return Number.isFinite(value) ? value.toFixed(2) : '—';
}

function interpolateDx(points, targetPercent) {
    for (let index = 0; index < points.length - 1; index += 1) {
        const lowerPoint = points[index];
        const upperPoint = points[index + 1];

        if (lowerPoint.percentPassing === targetPercent) {
            return lowerPoint.aperture;
        }

        if (upperPoint.percentPassing === targetPercent) {
            return upperPoint.aperture;
        }

        if (lowerPoint.percentPassing < targetPercent && upperPoint.percentPassing > targetPercent) {
            const lowerLog = Math.log10(lowerPoint.aperture);
            const upperLog = Math.log10(upperPoint.aperture);
            const percentFraction = (targetPercent - lowerPoint.percentPassing) / (upperPoint.percentPassing - lowerPoint.percentPassing);

            return 10 ** (lowerLog + percentFraction * (upperLog - lowerLog));
        }
    }

    return null;
}

function getSieveData() {
    const rows = SIEVE_STACK.map((sieve) => {
        const rawMass = Number.parseFloat(document.getElementById(sieve.id).value);
        const massRetained = Number.isFinite(rawMass) ? Math.max(rawMass, 0) : 0;

        return { ...sieve, massRetained };
    });

    const totalMass = rows.reduce((sum, row) => sum + row.massRetained, 0);
    let cumulativeMass = 0;

    const withPercentages = rows.map((row) => {
        cumulativeMass += row.massRetained;
        const cumulativePercentRetained = totalMass > 0 ? (cumulativeMass / totalMass) * 100 : 0;
        const percentPassing = totalMass > 0 ? 100 - cumulativePercentRetained : 0;

        return {
            ...row,
            cumulativePercentRetained,
            percentPassing,
        };
    });

    const gradingPoints = withPercentages
        .filter((row) => row.aperture !== null)
        .map((row) => ({ aperture: row.aperture, percentPassing: row.percentPassing, massRetained: row.massRetained }))
        .sort((left, right) => left.aperture - right.aperture);

    return { rows: withPercentages, gradingPoints, totalMass };
}

function updateResults(totalMass, gradingPoints) {
    const d10 = interpolateDx(gradingPoints, 10);
    const d30 = interpolateDx(gradingPoints, 30);
    const d60 = interpolateDx(gradingPoints, 60);
    const cu = d10 && d60 ? d60 / d10 : null;
    const cc = d10 && d30 && d60 ? (d30 * d30) / (d10 * d60) : null;
    const fines = gradingPoints.length > 0 ? gradingPoints[0].percentPassing : 0;

    document.getElementById('totalMassValue').textContent = totalMass.toFixed(0);
    document.getElementById('finesValue').textContent = `${fines.toFixed(1)}%`;
    document.getElementById('d10Value').textContent = formatMillimetres(d10);
    document.getElementById('d30Value').textContent = formatMillimetres(d30);
    document.getElementById('d60Value').textContent = formatMillimetres(d60);
    document.getElementById('cuValue').textContent = formatNumber(cu);
    document.getElementById('ccValue').textContent = formatNumber(cc);
}

function updatePlot(gradingPoints, totalMass) {
    const hasSample = totalMass > 0;

    Plotly.newPlot('gradingCurveGraph', [{
        x: gradingPoints.map((point) => point.aperture),
        y: gradingPoints.map((point) => point.percentPassing),
        mode: 'lines+markers',
        type: 'scatter',
        line: { color: '#646ef6', width: 3 },
        marker: { size: 10, color: '#646ef6' },
        hovertemplate: 'Size: %{x:.3f} mm<br>Passing: %{y:.1f}%<extra></extra>',
    }], {
        title: 'Particle Size Distribution',
        xaxis: {
            title: 'Particle size (mm)',
            type: 'log',
            range: [Math.log10(0.06), Math.log10(6)],
            tickvals: [0.075, 0.15, 0.3, 0.425, 0.6, 1.18, 2.0, 4.75],
            ticktext: ['0.075', '0.15', '0.30', '0.425', '0.60', '1.18', '2.00', '4.75'],
        },
        yaxis: {
            title: 'Percent passing (%)',
            range: [0, 100],
        },
        margin: { t: 50, r: 20, b: 60, l: 65 },
        autosize: true,
        annotations: hasSample ? [] : [{
            text: 'Enter retained masses to plot a grading curve',
            xref: 'paper',
            yref: 'paper',
            x: 0.5,
            y: 0.5,
            showarrow: false,
            font: { size: 16, color: '#757575' },
        }],
    }, {
        responsive: true,
        displayModeBar: false,
    });
}

function update() {
    const { gradingPoints, totalMass } = getSieveData();
    updateResults(totalMass, gradingPoints);
    updatePlot(gradingPoints, totalMass);
}

update();
window.addEventListener('resize', update);
