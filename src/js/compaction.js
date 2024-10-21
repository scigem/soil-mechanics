import '../css/main.css';
import '../css/compaction.css';

const rho_w = 1; // assuming water density is 1 for simplicity
const G_s = 2.7; // typical value for specific gravity of soil solids
const g = 9.81; // acceleration due to gravity

document.getElementById("Vw").addEventListener('input', update);
document.getElementById("Vs").addEventListener('input', update);
document.getElementById("Va").addEventListener('input', update);

console.log("Hello from compaction.js");

function calculateNoAirVoidsLine(max_mc) {
    let m_c_values = [];
    let rho_d_values = [];

    if (!isFinite(max_mc)) {
        max_mc = 20;
    }
    let delta = max_mc / 20;
    
    for (let mc = 0; mc <= max_mc; mc += delta) {
        let rho_d_no_air_voids = (rho_w * G_s) / (1 + mc * G_s);
        m_c_values.push(mc);
        rho_d_values.push(rho_d_no_air_voids);
    }

    return { m_c_values, rho_d_values };
}

function update() {
    let V_w = parseFloat(document.getElementById("Vw").value);
    let V_a = parseFloat(document.getElementById("Va").value);
    let V_s = parseFloat(document.getElementById("Vs").value);

    let V = V_s + V_a + V_w;
    let V_v = V_a + V_w;
    let m_w = V_w * rho_w;
    let m_s = V_s * rho_w * G_s;
    let m_c = m_w / m_s;
    let m = m_s + m_w;
    let e = V_v / V_s;
    let S = V_w / V_v;
    let A = V_a / V_v;
    let rho_d = m_s / V; // correct formula for dry unit weight
    let rho_b = (m_s + m_w) / V;
    let rho_sat = (G_s + e) * rho_w / (1 + e);
    let nu = V_s / V;
    let n = 1 - nu;
    let gamma_d = rho_d * g;
    let gamma_b = rho_b * g;
    let gamma_sat = rho_sat * g;

    document.getElementById("VwValue").textContent = V_w;
    document.getElementById("VaValue").textContent = V_a;
    document.getElementById("VsValue").textContent = V_s;

    // Update displayed values
    document.getElementById("VValue").textContent = V.toFixed(0);
    document.getElementById("VvValue").textContent = V_v.toFixed(0);
    document.getElementById("mwValue").textContent = m_w.toFixed(0);
    document.getElementById("msValue").textContent = m_s.toFixed(0);
    document.getElementById("mcValue").textContent = m_c.toFixed(4);
    document.getElementById("mValue").textContent = m.toFixed(0);
    document.getElementById("eValue").textContent = e.toFixed(4);
    document.getElementById("SValue").textContent = S.toFixed(4);
    document.getElementById("AValue").textContent = A.toFixed(4);
    document.getElementById("nuValue").textContent = nu.toFixed(4);
    document.getElementById("nValue").textContent = n.toFixed(4);
    document.getElementById("rhodValue").textContent = rho_d.toFixed(2);
    document.getElementById("rhobValue").textContent = rho_b.toFixed(2);
    document.getElementById("rhosatValue").textContent = rho_sat.toFixed(2);
    document.getElementById("gammadValue").textContent = gamma_d.toFixed(2);
    document.getElementById("gammabValue").textContent = gamma_b.toFixed(2);
    document.getElementById("gammasatValue").textContent = gamma_sat.toFixed(2);

    let max_mc = Math.max(1, m_c);
    let gamma_d_max = (rho_w * G_s);

    // Calculate no air voids line
    const noAirVoidsLine = calculateNoAirVoidsLine(max_mc);
    // Plot dry unit weight vs. moisture content with no air voids line
    Plotly.newPlot('dryWeightGraph', [
        {
            x: noAirVoidsLine.m_c_values,
            y: noAirVoidsLine.rho_d_values,
            mode: 'lines',
            type: 'scatter',
            name: 'No Air Voids Line',
            line: { dash: 'dash', color: 'red', width: 4 }
        },
        {
            x: [m_c], // current moisture content
            y: [rho_d], // current dry unit weight
            mode: 'markers',
            type: 'scatter',
            name: 'Current State',
            text: [`ρ<sub>d</sub> = ${rho_d.toFixed(2)}`],
            hoverinfo: 'text',
            marker: { size: 15, color: 'black' }
        },
    ], {
        title: 'Dry Unit Weight vs. Moisture Content',
        xaxis: { title: 'Moisture Content (mc)', range: [0, max_mc], linewidth: 4 }, // xmin set to 0 with Unicode
        yaxis: { title: 'Dry Unit Weight (ρ<sub>d</sub>)', linewidth: 4, range: [0, gamma_d_max] },
        autosize: true,
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
        }
    });

    // Plot stacked rectangles (soil, water, air)
    Plotly.newPlot('ternaryGraph', [{
        x: ['Volume Distribution'],
        y: [V_s],
        name: 'Soil',
        type: 'bar',
        marker: { color: 'brown' }
    },
    {
        x: ['Volume Distribution'],
        y: [V_w],
        name: 'Water',
        type: 'bar',
        marker: { color: 'blue' }
    },
    {
        x: ['Volume Distribution'],
        y: [V_a],
        name: 'Air',
        type: 'bar',
        marker: { color: 'lightgrey' }
    }
    ], {
        title: 'Volume Distribution (Soil, Water, Air)',
        barmode: 'stack',
        xaxis: { title: 'Components' },
        yaxis: { title: 'Volume (cm<sup>3</sup>)', range: [0, V] },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
        }
    });
}

update(); // initial call to populate the graphs

// Re-render the plots on window resize for better responsiveness
window.addEventListener('resize', update);