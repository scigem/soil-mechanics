import '../css/main.css';
import '../css/elastic-footing.css';
import Plotly from 'plotly.js-dist';

// Initialize event listeners
document.getElementById("load").addEventListener('input', updateVisualization);
document.getElementById("width").addEventListener('input', updateVisualization);
document.getElementById("youngs").addEventListener('input', updateVisualization);
document.getElementById("poisson").addEventListener('input', updateVisualization);
document.getElementById("component").addEventListener('change', updateVisualization);
document.getElementById("depth").addEventListener('input', updateVisualization);
document.getElementById("reset-button").addEventListener('click', resetToDefaults);

function resetToDefaults() {
    document.getElementById("load").value = 100;
    document.getElementById("width").value = 2;
    document.getElementById("youngs").value = 20;
    document.getElementById("poisson").value = 0.3;
    document.getElementById("component").value = "vertical";
    document.getElementById("depth").value = 10;
    updateVisualization();
}

function updateSliderValues() {
    document.getElementById("loadValue").textContent = document.getElementById("load").value;
    document.getElementById("widthValue").textContent = document.getElementById("width").value;
    document.getElementById("youngsValue").textContent = document.getElementById("youngs").value;
    document.getElementById("poissonValue").textContent = document.getElementById("poisson").value;
    document.getElementById("depthValue").textContent = document.getElementById("depth").value;
}

// Elastic strip footing displacement calculation
function calculateDisplacements(x, y, q, B, E, nu) {
    // Convert E from MPa to Pa
    E = E * 1e6;
    
    // Plane strain assumption
    const G = E / (2 * (1 + nu));  // Shear modulus
    const factor = q * (1 + nu) / (Math.PI * E);
    
    // Strip footing extends from -B to +B
    const x1 = x + B;  // Distance from left edge
    const x2 = x - B;  // Distance from right edge
    
    // Vertical displacement (Boussinesq solution for strip loading)
    let uy = null;
    let ux = null;

    if (y <= 0) {
        // Surface and above - no displacement above surface
        uy = null;
        ux = null;
    } else {
        // Below surface
        const r1 = Math.sqrt(x1*x1 + y*y);
        const r2 = Math.sqrt(x2*x2 + y*y);
        
        // Vertical displacement
        // theta1/theta2 use atan2 (continuous, range 0 to π for y > 0)
        const theta1 = Math.atan2(y, x1);
        const theta2 = Math.atan2(y, x2);

        // Derived by integrating the Flamant point-load solution over the strip [-B, +B].
        // Both terms are even functions of x, giving the required left-right symmetry.
        uy = factor * (
            -(1 - nu) * (x1 * Math.log(r1) - x2 * Math.log(r2)) +
            y * (1 - 2*nu) / 2 * (theta1 - theta2)
        );

        // Horizontal displacement
        // Must use standard Math.atan(y/xi) – range (-π/2, π/2) – so that the
        // result is negative when xi < 0.  Math.atan2(y, xi) would return a
        // value in (π/2, π) for xi < 0, introducing a spurious symmetric offset
        // that breaks the required antisymmetry of ux.
        // When xi = 0 the product xi·atan(y/xi) → 0; guard against 0/0.
        const x1AtanTerm = x1 !== 0 ? x1 * Math.atan(y / x1) : 0;
        const x2AtanTerm = x2 !== 0 ? x2 * Math.atan(y / x2) : 0;

        ux = factor * (
            nu * y * (Math.log(r1) - Math.log(r2)) -
            (1 - 2*nu) / 2 * (x1AtanTerm - x2AtanTerm)
        );
    }
    
    return { ux: ux, uy: -uy }; // Negative uy for downward displacement
}

function calculateDisplacementField() {
    const q = parseFloat(document.getElementById("load").value) * 1000; // Convert kPa to Pa
    const B = parseFloat(document.getElementById("width").value);
    const E = parseFloat(document.getElementById("youngs").value);
    const nu = parseFloat(document.getElementById("poisson").value);
    const domainDepth = parseFloat(document.getElementById("depth").value);
    const component = document.getElementById("component").value;
    
    // Create grid for displacement field
    const nx = 51;  // Number of points in x direction
    const ny = 31;  // Number of points in y direction
    
    const xmin = -3 * B;
    const xmax = 3 * B;
    const ymin = 0;
    const ymax = domainDepth;
    
    const dx = (xmax - xmin) / (nx - 1);
    const dy = (ymax - ymin) / (ny - 1);
    
    const x = [];
    const y = [];
    const z = [];
    
    let maxVertical = 0;
    let maxHorizontal = 0;
    let centerSettlement = 0;
    let edgeSettlement = 0;
    
    // Generate grid
    for (let i = 0; i < nx; i++) {
        x.push(xmin + i * dx);
    }
    
    for (let j = 0; j < ny; j++) {
        y.push(ymin + j * dy);
        const row = [];
        
        for (let i = 0; i < nx; i++) {
            const xi = x[i];
            const yj = y[j];
            
            const displacements = calculateDisplacements(xi, yj, q, B, E, nu);
            
            let value;
            if (component === "vertical") {
                value = displacements.uy * 1000; // Convert to mm
            } else if (component === "horizontal") {
                value = displacements.ux * 1000; // Convert to mm
            } else { // magnitude
                value = Math.sqrt(displacements.ux*displacements.ux + displacements.uy*displacements.uy) * 1000;
            }
            
            row.push(value);
            
            // Track maximum values for results
            maxVertical = Math.max(maxVertical, Math.abs(displacements.uy * 1000));
            maxHorizontal = Math.max(maxHorizontal, Math.abs(displacements.ux * 1000));
            
            // Settlement at specific points
            if (Math.abs(xi) < 0.1 && Math.abs(yj - 0.1) < 0.1) {
                centerSettlement = Math.abs(displacements.uy * 1000);
            }
            if (Math.abs(Math.abs(xi) - B) < 0.1 && Math.abs(yj - 0.1) < 0.1) {
                edgeSettlement = Math.abs(displacements.uy * 1000);
            }
        }
        z.push(row);
    }
    
    // Update results display
    // document.getElementById("maxVertical").textContent = maxVertical.toFixed(2);
    // document.getElementById("maxHorizontal").textContent = maxHorizontal.toFixed(2);
    // document.getElementById("centerSettlement").textContent = centerSettlement.toFixed(2);
    // document.getElementById("edgeSettlement").textContent = edgeSettlement.toFixed(2);
    
    return { x, y, z, B };
}

function updateVisualization() {
    updateSliderValues();
    
    const { x, y, z, B } = calculateDisplacementField();
    const component = document.getElementById("component").value;
    
    // Set up colorscale based on component
    let colorscale, title;
    if (component === "vertical") {
        colorscale = 'RdBu';
        title = 'Vertical Displacement u<sub>y</sub> (mm)';
    } else if (component === "horizontal") {
        colorscale = 'RdYlBu';
        title = 'Horizontal Displacement u<sub>x</sub> (mm)';
    } else {
        colorscale = 'Viridis';
        title = 'Displacement Magnitude |u| (mm)';
    }
    
    // Create contour plot
    const data = [{
        x: x,
        y: y,
        z: z,
        type: 'contour',
        colorscale: colorscale,
        contours: {
            showlabels: true,
            labelfont: { size: 10, color: 'white' }
        },
        colorbar: {
            title: title,
            titleside: 'right'
        },
        hoverongaps: false
    }];
    
    // Add footing representation
    const footingTrace = {
        x: [-B, B, B, -B, -B],
        y: [0, 0, -0.2, -0.2, 0],
        mode: 'lines',
        line: { color: 'black', width: 4 },
        fill: 'toself',
        fillcolor: 'rgba(0,0,0,0.3)',
        name: 'Strip Footing',
        showlegend: true,
        hoverinfo: 'name'
    };
    
    // Add load arrows
    const loadArrows = {
        x: [],
        y: [],
        mode: 'markers',
        marker: {
            symbol: 'arrow-down',
            size: 15,
            color: 'red',
            line: { color: 'darkred', width: 1 }
        },
        name: 'Applied Load',
        showlegend: true,
        hoverinfo: 'name'
    };
    
    // Add arrows along the footing
    for (let i = -B; i <= B; i += B/5) {
        loadArrows.x.push(i);
        loadArrows.y.push(-0.1);
    }
    
    const layout = {
        title: {
            text: `Elastic Strip Footing: ${title}`,
            font: { size: 16 }
        },
        xaxis: {
            title: 'Horizontal Distance (m)',
            scaleanchor: 'y',
            scaleratio: 1
        },
        yaxis: {
            title: 'Depth (m)',
            autorange: 'reversed'  // Depth increases downward
        },
        autosize: true,
        margin: { l: 60, r: 60, t: 80, b: 60 },
        showlegend: true,
        legend: {
            x: 1.02,
            y: 1,
            bgcolor: 'rgba(255,255,255,0.8)'
        }
    };
    
    Plotly.newPlot('displacementField', [data[0], footingTrace, loadArrows], layout, {
        responsive: true,
        displayModeBar: true
    });
}

// Initial visualization
updateVisualization();

// Re-render on window resize
window.addEventListener('resize', () => {
    Plotly.Plots.resize('displacementField');
});