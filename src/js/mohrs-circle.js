import '../css/main.css';
import '../css/mohrs-circle.css';

// Get HTML elements
const sigma1Input = document.getElementById('sigma1');
const sigma2Input = document.getElementById('sigma2');
const thetaInput = document.getElementById('theta');
const cohesionInput = document.getElementById('cohesion');
const frictionInput = document.getElementById('friction');
const resetButton = document.getElementById('reset-button');
const resultsText = document.getElementById('results-text');
const canvas = document.getElementById('mohrCanvas');
const ctx = canvas.getContext('2d');

// Function to adjust canvas for retina display
function resizeCanvasForRetina() {
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Save the original canvas width and height
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // Set the actual canvas size to the pixel ratio
    canvas.width = originalWidth * pixelRatio;
    canvas.height = originalHeight * pixelRatio;
    
    // Scale the drawing context to account for the higher DPI
    ctx.scale(pixelRatio, pixelRatio);

    // Ensure the canvas element appears the same size by setting its style back to original dimensions
    canvas.style.width = `${originalWidth}px`;
    canvas.style.height = `${originalHeight}px`;
}

// Call the function to adjust canvas for retina
resizeCanvasForRetina();

// Default values
let sigma1 = parseFloat(sigma1Input.value);
let sigma2 = parseFloat(sigma2Input.value);
let theta = parseFloat(thetaInput.value);
let cohesion = parseFloat(cohesionInput.value);
let frictionAngle = parseFloat(frictionInput.value);

// Event listeners
sigma1Input.addEventListener('input', update);
sigma2Input.addEventListener('input', update);
thetaInput.addEventListener('input', update);
cohesionInput.addEventListener('input', update);
frictionInput.addEventListener('input', update);
resetButton.addEventListener('click', resetValues);

// Function to reset to default values
function resetValues() {
    sigma1Input.value = 100;
    sigma2Input.value = 50;
    thetaInput.value = 0;
    cohesionInput.value = 10;
    frictionInput.value = 30;
    update();
}

// Main update function
function update() {
    // Update variables
    sigma1 = parseFloat(sigma1Input.value);
    sigma2 = parseFloat(sigma2Input.value);
    theta = parseFloat(thetaInput.value);
    cohesion = parseFloat(cohesionInput.value);
    frictionAngle = parseFloat(frictionInput.value);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Mohr's Circle
    drawMohrsCircle();

    // Calculate stresses
    const thetaRad = (theta * Math.PI) / 180;
    const sigmaN = (sigma1 + sigma2) / 2 + (sigma1 - sigma2) / 2 * Math.cos(2 * thetaRad);
    const tau = (sigma1 - sigma2) / 2 * Math.sin(2 * thetaRad);

    let N_phi = (1 + Math.sin(frictionAngle * Math.PI / 180)) / (1 - Math.sin(frictionAngle * Math.PI / 180));
    let sigma_1_threshold = sigma2 * N_phi + 2 * cohesion * Math.sqrt(N_phi);

    // Calculate Factor of Safety
    const factorOfSafety = sigma_1_threshold / sigma1;

    // Update results text
    resultsText.innerHTML = `
        <strong>Calculated Stresses:</strong><br>
        Normal Stress (σₙ): ${sigmaN.toFixed(2)}<br>
        Shear Stress (τ): ${tau.toFixed(2)}<br><br>
        <strong>Factor of Safety (FoS):</strong> ${factorOfSafety.toFixed(2)}<br>
        ${factorOfSafety >= 1 ? '<span style="color:green;">No failure.</span>' : '<span style="color:red;">Failure predicted!</span>'}
    `;

    // Draw stress point
    drawStressPoint(sigmaN, tau);

    // Draw Mohr-Coulomb failure envelope
    drawFailureEnvelope();
}

// Function to draw Mohr's Circle with equal scaling
function drawMohrsCircle() {
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);
    const radius = Math.abs((sigma1 - sigma2) / 2);

    // Use a unified scaling factor for both axes to maintain equal scaling
    const scale = Math.min(canvas.width, canvas.height) / (2 * (Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20)) / window.devicePixelRatio;

    // Circle center
    const cX = centerX + ((sigma1 + sigma2) / 2) * scale;
    const cY = centerY;

    // Draw circle
    ctx.beginPath();
    ctx.arc(cX, cY, radius * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw axes
    drawAxes(scale);
}

// Function to draw axes with labels and tick marks
function drawAxes(scale) {
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);

    // Draw x and y axes
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width / window.devicePixelRatio, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height / window.devicePixelRatio);
    ctx.strokeStyle = '#888';
    ctx.stroke();

    // Add labels
    ctx.fillStyle = '#000';
    ctx.fillText('σ (Stress)', (canvas.width / window.devicePixelRatio) - 50, centerY - 10);
    ctx.fillText('τ (Shear)', centerX + 10, 20);

    // Add tick marks and values for the x-axis (σ)
    for (let i = -5; i <= 5; i++) {
        const x = centerX + i * 20 * scale;
        ctx.moveTo(x, centerY - 5);
        ctx.lineTo(x, centerY + 5);
        ctx.fillText((i * 20).toString(), x - 10, centerY + 20);
    }

    // Add tick marks and values for the y-axis (τ)
    for (let i = -5; i <= 5; i++) {
        const y = centerY - i * 20 * scale;
        ctx.moveTo(centerX - 5, y);
        ctx.lineTo(centerX + 5, y);
        ctx.fillText((i * 20).toString(), centerX + 10, y + 5);
    }
    ctx.stroke();
}

// Function to draw the current stress point
function drawStressPoint(sigmaN, tau) {
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);

    // Use the unified scale
    const scale = Math.min(canvas.width, canvas.height) / (2 * (Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20)) / window.devicePixelRatio;

    // Calculate position
    const x = centerX + sigmaN * scale;
    const y = centerY - tau * scale;

    // Draw point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#f00';
    ctx.fill();
}

// Function to draw Mohr-Coulomb failure envelope
function drawFailureEnvelope() {
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);
    const maxSigma = Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20;

    // Use the unified scale
    const scale = Math.min(canvas.width, canvas.height) / (2 * maxSigma) / window.devicePixelRatio;

    // Calculate points
    const phiRad = (frictionAngle * Math.PI) / 180;
    const tanPhi = Math.tan(phiRad);

    // Failure line from sigma = 0 to sigma = maxSigma
    const sigmaStart = -cohesion/tanPhi;
    const tauStart = 0;

    const sigmaEnd = maxSigma;
    const tauEnd = cohesion + sigmaEnd * tanPhi;

    // Convert to canvas coordinates
    const x1 = centerX + sigmaStart * scale;
    const y1 = centerY - tauStart * scale;

    const x2 = centerX + sigmaEnd * scale;
    const y2 = centerY - tauEnd * scale;

    const y3 = centerY + tauEnd * scale;

    // Draw failure envelope
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#00f';
    ctx.stroke();

    // Draw failure envelope shading
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y3);
    ctx.strokeStyle = '#00f';
    ctx.stroke();

    // Shade failure zone
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y3);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.fill();
}

// Initial update
update();
