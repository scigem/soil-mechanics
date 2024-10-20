import '../css/main.css'; // Import CSS

const rho_w = 1; // assuming water density is 1 for simplicity
const G_s = 2.7; // typical value for specific gravity of soil solids
const g = 9.81; // acceleration due to gravity

document.getElementById("Vw").addEventListener('input', update);
document.getElementById("Vs").addEventListener('input', update);
document.getElementById("Va").addEventListener('input', update);

console.log("Hello from compaction.js");

function calculateNoAirVoidsLine() {
    let m_c_values = [];
    let rho_d_values = [];
    for (let mc = 0; mc <= 1; mc += 0.01) {
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



    // Calculate no air voids line
    const noAirVoidsLine = calculateNoAirVoidsLine();

    // Plot dry unit weight vs. moisture content with no air voids line
    Plotly.newPlot('dryWeightGraph', [
        {
            x: [m_c], // current moisture content
            y: [rho_d], // current dry unit weight
            mode: 'markers',
            type: 'scatter',
            name: 'Current State',
            text: [`ρ<sub>d</sub> = ${rho_d.toFixed(2)}`],
            hoverinfo: 'text',
        },
        {
            x: noAirVoidsLine.m_c_values,
            y: noAirVoidsLine.rho_d_values,
            mode: 'lines',
            type: 'scatter',
            name: 'No Air Voids Line',
            line: { dash: 'dash', color: 'red', width: 4 }
        }
    ], {
        title: 'Dry Unit Weight vs. Moisture Content',
        xaxis: { title: 'Moisture Content (mc)', range: [0, 1], linewidth: 4 }, // xmin set to 0 with Unicode
        yaxis: { title: 'Dry Unit Weight (ρ<sub>d</sub>)', linewidth: 4 },
        autosize: true,
    });

    // Plot V_w/V_s/V_v ternary graph
    Plotly.newPlot('ternaryGraph', [{
        type: 'scatterternary',
        mode: 'markers',
        a: [V_w],
        b: [V_s],
        c: [V_a],
        marker: {
            symbol: 100,
            color: 'blue',
            size: 10
        },
        text: [`V<sub>w</sub> = ${V_w}, V<sub>s</sub> = ${V_s}, V<sub>v</sub> = ${V_a}`],
        hoverinfo: 'text'
    }], {
        ternary: {
            sum: V_w + V_s + V_a,
            aaxis: { title: 'V<sub>w</sub>', linewidth: 4 },
            baxis: { title: 'V<sub>s</sub>', linewidth: 4 },
            caxis: { title: 'V<sub>a</sub>', linewidth: 4 },
        },
        title: 'V<sub>w</sub>/V<sub>s</sub>/V<sub>a</sub> Ternary Graph',
        autosize: true
    });
}

update(); // initial call to populate the graphs

// Re-render the plots on window resize for better responsiveness
window.addEventListener('resize', update);