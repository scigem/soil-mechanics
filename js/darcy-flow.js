import '../css/main.css';
import '../css/darcy-flow.css';

const defaults = {
    conductivityExponent: -4,
    headLoss: 2,
    length: 4,
    area: 0.2,
};

const headProfile = document.getElementById('headProfile');

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

function normalize(value, min, max) {
    return (value - min) / (max - min);
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

    const lengthRatio = normalize(length, 0.1, 10);
    const areaRatio = normalize(area, 0.01, 1);
    const specimenWidth = 250 + lengthRatio * 150;
    const specimenHeight = 42 + areaRatio * 34;
    const pipeWallHeight = specimenHeight + 20;
    const leftX = 132;
    const rightX = leftX + specimenWidth;
    const pipeOuterY = 284 - pipeWallHeight / 2;
    const specimenTopY = 284 - specimenHeight / 2;
    const specimenBottomY = 284 + specimenHeight / 2;
    const standpipeWidth = 32;
    const leftStandpipeX = leftX - standpipeWidth / 2;
    const rightStandpipeX = rightX - standpipeWidth / 2;
    const downstreamHead = Math.max(0.8, Math.min(2.2, headLoss * 0.45 + 0.6));
    const upstreamHead = downstreamHead + headLoss;
    const maxHead = Math.max(upstreamHead, 1);
    const heightScale = 170 / maxHead;
    const waterTopBaseY = 245;
    const upstreamWaterY = waterTopBaseY - upstreamHead * heightScale;
    const downstreamWaterY = waterTopBaseY - downstreamHead * heightScale;
    const headDropMidY = (upstreamWaterY + downstreamWaterY) / 2;
    const flowArrowStartX = leftX + specimenWidth * 0.2;
    const flowArrowEndX = rightX - specimenWidth * 0.2;
    const widthMidX = (leftX + rightX) / 2;
    const porePath = [
        `${leftX},${upstreamWaterY}`,
        `${leftX + specimenWidth * 0.32},${upstreamWaterY + (downstreamWaterY - upstreamWaterY) * 0.3}`,
        `${leftX + specimenWidth * 0.68},${upstreamWaterY + (downstreamWaterY - upstreamWaterY) * 0.68}`,
        `${rightX},${downstreamWaterY}`,
    ].join(' ');

    document.getElementById('gradientEquationText').textContent = `i = ${headLoss.toFixed(1)} / ${length.toFixed(1)} = ${gradient.toFixed(3)}`;

    headProfile.innerHTML = `
        <svg viewBox="0 0 680 420" role="img" aria-labelledby="darcySchematicTitle darcySchematicDesc">
            <title id="darcySchematicTitle">Darcy flow through a soil-filled horizontal specimen</title>
            <desc id="darcySchematicDesc">A horizontal soil specimen connects two standpipes. The water surface stands higher on the left than on the right, showing head loss and driving seepage through the soil.</desc>

            <defs>
                <pattern id="soilPattern" width="18" height="18" patternUnits="userSpaceOnUse">
                    <rect width="18" height="18" fill="#c89f6a"></rect>
                    <circle cx="4" cy="5" r="1.6" fill="#8b5f36"></circle>
                    <circle cx="13" cy="9" r="1.3" fill="#9a6a3c"></circle>
                    <circle cx="8" cy="14" r="1.5" fill="#7b522f"></circle>
                </pattern>
                <linearGradient id="pipeWall" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#cfd5dd"></stop>
                    <stop offset="100%" stop-color="#aab2bf"></stop>
                </linearGradient>
                <linearGradient id="waterFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#9be7ff"></stop>
                    <stop offset="100%" stop-color="#2a7fff"></stop>
                </linearGradient>
                <marker id="dimensionCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#1f2937" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="deltaCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#dc2626" stroke-width="2.4" fill="none"></path>
                </marker>
                <marker id="flowCap" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M 9 0 L 9 10" stroke="#0f766e" stroke-width="2.4" fill="none"></path>
                </marker>
            </defs>

            <rect x="24" y="18" width="632" height="384" rx="24" fill="#f7f8fb"></rect>

            <g class="datum-layer">
                <line x1="50" y1="360" x2="630" y2="360" stroke="#94a3b8" stroke-width="2" stroke-dasharray="7 7"></line>
                <text x="40" y="352" class="datum-label">Datum</text>
            </g>

            <g class="standpipe-layer">
                <rect x="${leftStandpipeX}" y="64" width="32" height="${specimenBottomY - 64}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>
                <rect x="${rightStandpipeX}" y="102" width="32" height="${specimenBottomY - 102}" rx="12" fill="url(#pipeWall)" opacity="0.95"></rect>

                <rect x="${leftStandpipeX + 6}" y="${upstreamWaterY}" width="20" height="${specimenBottomY - upstreamWaterY}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>
                <rect x="${rightStandpipeX + 6}" y="${downstreamWaterY}" width="20" height="${specimenBottomY - downstreamWaterY}" rx="8" fill="url(#waterFill)" opacity="0.82"></rect>

                <line x1="${leftStandpipeX + 2}" y1="${upstreamWaterY}" x2="${leftX + 14}" y2="${upstreamWaterY}" stroke="#0f5bd8" stroke-width="4"></line>
                <line x1="${rightX - 14}" y1="${downstreamWaterY}" x2="${rightStandpipeX + 30}" y2="${downstreamWaterY}" stroke="#0f5bd8" stroke-width="4"></line>
            </g>

            <g class="specimen-layer">
                <rect x="${leftX}" y="${pipeOuterY}" width="${specimenWidth}" height="${pipeWallHeight}" rx="28" fill="url(#pipeWall)"></rect>
                <rect x="${leftX + 14}" y="${specimenTopY}" width="${specimenWidth - 28}" height="${specimenHeight}" rx="20" fill="url(#soilPattern)" stroke="#8b5f36" stroke-width="2"></rect>
            </g>

            <g class="head-layer">
                <polyline points="${porePath}" fill="none" stroke="#2563eb" stroke-width="4" stroke-dasharray="10 8"></polyline>
                <text x="254" y="${headDropMidY - 16}" class="head-line-label">Hydraulic head line</text>

                <line x1="88" y1="360" x2="88" y2="${upstreamWaterY}" stroke="#1f2937" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="10" y="${(360 + upstreamWaterY) / 2}" class="dimension-label">h₁ = ${upstreamHead.toFixed(1)} m</text>

                <line x1="552" y1="360" x2="552" y2="${downstreamWaterY}" stroke="#1f2937" stroke-width="2.5" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="560" y="${(360 + downstreamWaterY) / 2}" class="dimension-label">h₂ = ${downstreamHead.toFixed(1)} m</text>

                <line x1="590" y1="${upstreamWaterY}" x2="590" y2="${downstreamWaterY}" stroke="#dc2626" stroke-width="2.5" marker-start="url(#deltaCap)" marker-end="url(#deltaCap)"></line>
                <text x="600" y="${(upstreamWaterY + downstreamWaterY) / 2}" class="delta-label">Δh = ${headLoss.toFixed(1)} m</text>
            </g>

            <g class="length-layer">
                <line x1="${leftX + 14}" y1="${specimenBottomY + 26}" x2="${rightX - 14}" y2="${specimenBottomY + 26}" stroke="#1f2937" stroke-width="2" marker-start="url(#dimensionCap)" marker-end="url(#dimensionCap)"></line>
                <text x="${widthMidX - 70}" y="${specimenBottomY + 44}" class="dimension-label">Specimen length L = ${length.toFixed(1)} m</text>
            </g>

            <g class="caption-layer">
                <text x="88" y="48" class="caption-label">Upstream standpipe</text>
                <text x="${rightX - 46}" y="86" class="caption-label">Downstream standpipe</text>
                <text x="${widthMidX - 88}" y="394" class="caption-label">Soil specimen area A = ${area.toFixed(2)} m²</text>
                <text x="${widthMidX - 58}" y="288" class="caption-strong">Soil-filled pipe</text>
            </g>
        </svg>
    `;
}

updateVisualization();
