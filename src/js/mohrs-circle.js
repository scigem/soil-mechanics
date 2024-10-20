import '../css/style.css'; // Import CSS

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

    // Calculate Factor of Safety
    const phiRad = (frictionAngle * Math.PI) / 180;
    const tauFailure = cohesion + sigmaN * Math.tan(phiRad);
    const factorOfSafety = tauFailure / tau;

    // Update results text
    resultsText.innerHTML = `
        <strong>Calculated Stresses:</strong><br>
        Normal Stress (σₙ): ${sigmaN.toFixed(2)}<br>
        Shear Stress (τ): ${tau.toFixed(2)}<br>
        <strong>Factor of Safety (FoS):</strong> ${factorOfSafety.toFixed(2)}<br>
        ${factorOfSafety >= 1 ? '<span style="color:green;">Material is in safe condition.</span>' : '<span style="color:red;">Failure predicted!</span>'}
    `;

    // Draw stress point
    drawStressPoint(sigmaN, tau);

    // Draw Mohr-Coulomb failure envelope
    drawFailureEnvelope();
}

// Function to draw Mohr's Circle
function drawMohrsCircle() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.abs((sigma1 - sigma2) / 2);

    // Scaling factors
    const scaleX = canvas.width / (2 * (Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20));
    const scaleY = canvas.height / (2 * (radius + 20));

    // Circle center
    const cX = centerX + ((sigma1 + sigma2) / 2) * scaleX;
    const cY = centerY;

    // Draw circle
    ctx.beginPath();
    ctx.arc(cX, cY, radius * scaleX, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.strokeStyle = '#888';
    ctx.stroke();

    // Label axes
    ctx.fillStyle = '#000';
    ctx.fillText('σ', canvas.width - 30, centerY - 10);
    ctx.fillText('τ', centerX + 10, 20);
}

// Function to draw the current stress point
function drawStressPoint(sigmaN, tau) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Scaling factors
    const scaleX = canvas.width / (2 * (Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20));
    const scaleY = canvas.height / (2 * (Math.abs((sigma1 - sigma2) / 2) + 20));

    // Calculate position
    const x = centerX + sigmaN * scaleX;
    const y = centerY - tau * scaleY;

    // Draw point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#f00';
    ctx.fill();
}

// Function to draw Mohr-Coulomb failure envelope
function drawFailureEnvelope() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxSigma = Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20;

    // Scaling factors
    const scaleX = canvas.width / (2 * maxSigma);
    const scaleY = canvas.height / (2 * (Math.abs((sigma1 - sigma2) / 2) + 20));

    // Calculate points
    const phiRad = (frictionAngle * Math.PI) / 180;
    const tanPhi = Math.tan(phiRad);

    // Failure line from sigma = 0 to sigma = maxSigma
    const sigmaStart = 0;
    const tauStart = cohesion;

    const sigmaEnd = maxSigma;
    const tauEnd = cohesion + sigmaEnd * tanPhi;

    // Convert to canvas coordinates
    const x1 = centerX + sigmaStart * scaleX;
    const y1 = centerY - tauStart * scaleY;

    const x2 = centerX + sigmaEnd * scaleX;
    const y2 = centerY - tauEnd * scaleY;

    // Draw failure envelope
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#00f';
    ctx.stroke();

    // Shade failure zone
    ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, centerY + canvas.height / 2);
    ctx.lineTo(x1, centerY + canvas.height / 2);
    ctx.closePath();
    ctx.fill();
}

// Initial update
update();
