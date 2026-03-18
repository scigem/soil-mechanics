import '../css/main.css';
import '../css/darcy-flow.css';
import Plotly from 'plotly.js-dist';

const defaults = {
    conductivityExponent: -4,
    headLoss: 2,
    length: 4,
    area: 0.2,
};

const sliderIds = ['conductivity', 'headLoss', 'length', 'area'];

sliderIds.forEach((id) => {
    document.getElementById(id).addEventListener('input', updateVisualization);
});

document.getElementById('reset-button').addEventListener('click', () => {
    document.getElementById('conductivity').value = defaults.conductivityExponent;
    document.getElementById('headLoss').value = defaults.headLoss;
    document.getElementById('length').value = defaults.length;
    document.getElementById('area').value = defaults.area;
    updateVisualization();
});

function formatScientific(value) {
    const exponent = Math.floor(Math.log10(value));
    const coefficient = value / (10 ** exponent);
    return `${coefficient.toFixed(1)} × 10<sup>${exponent}</sup>`;
}

function updateVisualization() {
    const conductivityExponent = parseFloat(document.getElementById('conductivity').value);
    const headLoss = parseFloat(document.getElementById('headLoss').value);
    const length = parseFloat(document.getElementById('length').value);
    const area = parseFloat(document.getElementById('area').value);

    const conductivity = 10 ** conductivityExponent;
    const gradient = headLoss / length;
    const flux = conductivity * gradient;
    const discharge = flux * area;

    document.getElementById('conductivityValue').innerHTML = formatScientific(conductivity);
    document.getElementById('headLossValue').textContent = headLoss.toFixed(1);
    document.getElementById('lengthValue').textContent = length.toFixed(1);
    document.getElementById('areaValue').textContent = area.toFixed(2);

    document.getElementById('gradientValue').textContent = gradient.toFixed(3);
    document.getElementById('fluxValue').innerHTML = `${formatScientific(flux)} m/s`;
    document.getElementById('dischargeValue').innerHTML = `${formatScientific(discharge)} m³/s`;

    Plotly.newPlot('headProfile', [{
        x: [0, length],
        y: [headLoss, 0],
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: '#646ef6',
            width: 5,
        },
        marker: {
            size: 10,
            color: '#ff9800',
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(100, 110, 246, 0.18)',
        hovertemplate: 'x = %{x:.2f} m<br>h = %{y:.2f} m<extra></extra>',
        showlegend: false,
    }], {
        title: 'Hydraulic Head Profile',
        margin: { t: 50, r: 20, b: 60, l: 70 },
        xaxis: {
            title: 'Distance x (m)',
            range: [0, length],
            zeroline: false,
        },
        yaxis: {
            title: 'Head h (m)',
            range: [0, Math.max(0.5, headLoss * 1.1)],
            zeroline: false,
        },
        annotations: [{
            x: length * 0.5,
            y: headLoss * 0.6,
            text: `i = ${gradient.toFixed(3)}<br>Q = ${formatScientific(discharge)} m³/s`,
            showarrow: false,
            bgcolor: 'rgba(255,255,255,0.85)',
            bordercolor: '#e0e0e0',
            borderwidth: 1,
        }],
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
    }, {
        responsive: true,
        displayModeBar: false,
    });
}

updateVisualization();
window.addEventListener('resize', updateVisualization);
