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

const fontSize = 16; // Increased font size

// Function to adjust canvas for retina display and dynamic sizing
function resizeCanvasForRetina() {
    const pixelRatio = window.devicePixelRatio || 1;

    // Get the computed style dimensions
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width;
    const displayHeight = rect.height;

    // Set the actual canvas size to the pixel ratio
    canvas.width = displayWidth * pixelRatio;
    canvas.height = displayHeight * pixelRatio;

    // Scale the drawing context to account for the higher DPI
    ctx.scale(pixelRatio, pixelRatio);

    // Ensure the canvas element appears the same size by setting its style back to computed dimensions
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Set high-quality rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Set consistent font styling to match the page
    // const fontSize = 12;
    ctx.font = `${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
}

// Call the function to adjust canvas for retina
resizeCanvasForRetina();

// Add window resize listener to handle dynamic resizing
window.addEventListener('resize', () => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
        resizeCanvasForRetina();
        update(); // Redraw the graph when canvas is resized
    });
});

// Add ResizeObserver for more reliable canvas resizing
if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvasForRetina();
        update();
    });
    resizeObserver.observe(canvas);
}

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

    // Clear canvas with proper background
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvas.getBoundingClientRect().height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set canvas background to match the page
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Reset font and rendering settings after clearing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.font = `${fontSize}px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;

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
    resultsText.innerHTML = `<strong>Calculated Stresses:</strong>
        Normal Stress (σₙ): ${sigmaN.toFixed(2)}
        Shear Stress (τ): ${tau.toFixed(2)}
        <strong>Factor of Safety (FoS):</strong> ${factorOfSafety.toFixed(2)}
        ${factorOfSafety >= 1 ? '<span style="color:green;">No failure.</span>' : '<span style="color:red;">Failure predicted!</span>'}
    `;

    // Draw stress point
    drawStressPoint(sigmaN, tau);

    // Draw Mohr-Coulomb failure envelope
    drawFailureEnvelope();
}

// Function to draw Mohr's Circle with equal scaling
function drawMohrsCircle() {
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvas.getBoundingClientRect().height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.abs((sigma1 - sigma2) / 2);

    // Use a unified scaling factor for both axes to maintain equal scaling
    // Use the smaller dimension to ensure the circle fits properly
    const maxStress = Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20;
    const scale = Math.min(canvasWidth, canvasHeight) / (2 * maxStress) * 0.8; // 0.8 for padding

    // Circle center
    const cX = centerX + ((sigma1 + sigma2) / 2) * scale;
    const cY = centerY;

    // Draw circle with better styling
    ctx.beginPath();
    ctx.arc(cX, cY, radius * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw axes
    drawAxes(scale, canvasWidth, canvasHeight);
}

// Function to draw axes with labels and tick marks
function drawAxes(scale, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw x and y axes with better styling
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasHeight);
    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Set text properties for consistent rendering
    ctx.fillStyle = '#212121';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Add main axis labels with better positioning
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillText('σ (Normal Stress, kPa)', canvasWidth - 180, centerY + 40);
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, 90);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, -40);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('τ (Shear Stress, kPa)', 0, 0);
    ctx.restore();

    // Add tick marks and values for the x-axis (σ)
    ctx.beginPath();
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 1;

    // Calculate stress values at canvas edges using the passed scale
    const sigmaAtLeftEdge = (0 - centerX) / scale;
    const sigmaAtRightEdge = (canvasWidth - centerX) / scale;
    const tauAtTopEdge = (centerY - 0) / scale;
    const tauAtBottomEdge = (centerY - canvasHeight) / scale;

    // Calculate nice tick intervals based on the visible range
    const sigmaRange = sigmaAtRightEdge - sigmaAtLeftEdge;
    const tauRange = tauAtTopEdge - tauAtBottomEdge;

    // Smart tick interval calculation
    const sigmaTickInterval = calculateNiceInterval(sigmaRange / 8); // Aim for ~8 ticks
    const tauTickInterval = calculateNiceInterval(tauRange / 6); // Aim for ~6 ticks

    // X-axis (σ) ticks - span entire canvas width
    const sigmaStart = Math.floor(sigmaAtLeftEdge / sigmaTickInterval) * sigmaTickInterval;
    const sigmaEnd = Math.ceil(sigmaAtRightEdge / sigmaTickInterval) * sigmaTickInterval;

    for (let sigma = sigmaStart; sigma <= sigmaEnd; sigma += sigmaTickInterval) {
        if (Math.abs(sigma) < sigmaTickInterval * 0.1) continue; // Skip values very close to zero

        const x = centerX + sigma * scale;
        if (x >= 0 && x <= canvasWidth) {
            // Tick mark
            ctx.moveTo(x, centerY - 3);
            ctx.lineTo(x, centerY + 3);

            // Label
            ctx.fillStyle = '#757575';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(sigma).toString(), x, centerY + 15);
        }
    }

    // Y-axis (τ) ticks - span entire canvas height
    const tauStart = Math.floor(tauAtBottomEdge / tauTickInterval) * tauTickInterval;
    const tauEndVal = Math.ceil(tauAtTopEdge / tauTickInterval) * tauTickInterval;

    for (let tau = tauStart; tau <= tauEndVal; tau += tauTickInterval) {
        if (Math.abs(tau) < tauTickInterval * 0.1) continue; // Skip values very close to zero

        const y = centerY - tau * scale;
        if (y >= 0 && y <= canvasHeight) {
            // Tick mark
            ctx.moveTo(centerX - 3, y);
            ctx.lineTo(centerX + 3, y);

            // Label
            ctx.fillStyle = '#757575';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(tau).toString(), centerX - 8, y);
        }
    }
    ctx.stroke();
}

// Helper function to calculate nice tick intervals
function calculateNiceInterval(roughInterval) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
    const normalized = roughInterval / magnitude;

    let niceNormalized;
    if (normalized <= 1) niceNormalized = 1;
    else if (normalized <= 2) niceNormalized = 2;
    else if (normalized <= 5) niceNormalized = 5;
    else niceNormalized = 10;

    return niceNormalized * magnitude;
}

// Function to draw the current stress point
function drawStressPoint(sigmaN, tau) {
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvas.getBoundingClientRect().height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Use the unified scale
    const maxStress = Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20;
    const scale = Math.min(canvasWidth, canvasHeight) / (2 * maxStress) * 0.8;

    // Calculate position
    const x = centerX + sigmaN * scale;
    const y = centerY - tau * scale;

    // Draw point with better styling
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff9800';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add label for the point
    ctx.fillStyle = '#212121';
    ctx.textAlign = 'center';
    ctx.font = fontSize + 'px Inter, sans-serif';
    ctx.fillText(`(${sigmaN.toFixed(1)}, ${tau.toFixed(1)})`, x, y - 15);
}

// Function to draw Mohr-Coulomb failure envelope
function drawFailureEnvelope() {
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvas.getBoundingClientRect().height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const maxSigma = Math.max(Math.abs(sigma1), Math.abs(sigma2)) + 20;

    // Use the unified scale
    const scale = Math.min(canvasWidth, canvasHeight) / (2 * maxSigma) * 0.8;

    // Calculate points
    const phiRad = (frictionAngle * Math.PI) / 180;
    const tanPhi = Math.tan(phiRad);

    // Failure line - extend to the edge of the canvas
    const sigmaStart = -cohesion / tanPhi;
    const tauStart = 0;

    // Calculate sigma value at the right edge of canvas
    const sigmaAtRightEdge = (canvasWidth - centerX) / scale;
    const sigmaEnd = Math.max(maxSigma, sigmaAtRightEdge);
    const tauEnd = cohesion + sigmaEnd * tanPhi;

    // Convert to canvas coordinates
    const x1 = centerX + sigmaStart * scale;
    const y1 = centerY - tauStart * scale;

    const x2 = Math.min(canvasWidth, centerX + sigmaEnd * scale);
    const y2 = centerY - tauEnd * scale;

    const y3 = centerY + tauEnd * scale;

    // Draw failure envelope with better styling
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw failure envelope bottom line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y3);
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shade failure zone with better styling
    ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y3);
    ctx.lineTo(x1, y1);
    ctx.closePath();
    ctx.fill();

    // Add failure envelope label - rotated and positioned above the top line
    ctx.save();

    // Calculate the angle of the failure envelope line
    const lineAngle = Math.atan2(y2 - y1, x2 - x1);

    // Position the label at the midpoint of the line, offset upward
    const labelX = x1 + (x2 - x1) * 0.5;
    const labelY = y1 + (y2 - y1) * 0.5;

    // Calculate offset perpendicular to the line (upward)
    const offsetDistance = 5;
    const perpAngle = lineAngle - Math.PI / 2; // Perpendicular angle
    const offsetX = Math.cos(perpAngle) * offsetDistance;
    const offsetY = Math.sin(perpAngle) * offsetDistance;

    // Move to the label position with offset
    ctx.translate(labelX + offsetX, labelY + offsetY);

    // Rotate the text to match the line angle
    ctx.rotate(lineAngle);

    // Draw the rotated text
    ctx.fillStyle = '#2196f3';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = fontSize + 'px Inter, sans-serif';
    ctx.fillText('Failure Envelope', 0, 0);

    ctx.restore();
}

// Initial update
update();
