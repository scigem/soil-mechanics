import '../css/main.css';
import '../css/newmarks-chart.css';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEWBOX_SIZE = 800;
const CENTER = VIEWBOX_SIZE / 2;
const OUTER_RADIUS = 330;
const DEFAULTS = {
    pressure: 150,
    depth: 5,
    rings: 10,
    sectors: 20,
};

const svg = document.getElementById('newmark-chart');
const pressureInput = document.getElementById('pressure');
const depthInput = document.getElementById('depth');
const ringsInput = document.getElementById('rings');
const sectorsInput = document.getElementById('sectors');
const clearDrawingButton = document.getElementById('clear-drawing');
const resetButton = document.getElementById('reset-button');
const chartHint = document.getElementById('chart-hint');

const unitInfluenceOutput = document.getElementById('unit-influence');
const coveredCellsOutput = document.getElementById('covered-cells');
const influenceValueOutput = document.getElementById('influence-value');
const stressResultOutput = document.getElementById('stress-result');
const formulaText = document.getElementById('formula-text');
const assumptionText = document.getElementById('assumption-text');

let chartState = {
    config: null,
    cells: [],
    totalInfluence: 0,
    unitInfluence: 0,
    outerRatio: 0,
    polygonPoints: [],
};

let isDrawing = false;
let activePoints = [];
let activePointerId = null;
let cellGroup;
let guideGroup;
let drawingGroup;
let previewPath;
let polygonPath;

function createSvgElement(tagName, attributes = {}) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}

function toScreenPoint(radius, angle) {
    return {
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle),
    };
}

function describeSector(innerRadius, outerRadius, startAngle, endAngle) {
    const outerStart = toScreenPoint(outerRadius, startAngle);
    const outerEnd = toScreenPoint(outerRadius, endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    if (innerRadius <= 0) {
        return [
            `M ${CENTER} ${CENTER}`,
            `L ${outerStart.x} ${outerStart.y}`,
            `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
            'Z',
        ].join(' ');
    }

    const innerEnd = toScreenPoint(innerRadius, endAngle);
    const innerStart = toScreenPoint(innerRadius, startAngle);

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
    ].join(' ');
}

function formatDecimal(value, digits = 4) {
    return Number.isFinite(value) ? value.toFixed(digits) : '0.0000';
}

function fullCircleInfluence(radiusRatio) {
    return 1 - Math.pow(1 + radiusRatio * radiusRatio, -1.5);
}

function influenceToRadiusRatio(targetInfluence) {
    if (targetInfluence >= 1) {
        return Infinity;
    }

    return Math.sqrt(Math.pow(1 / (1 - targetInfluence), 2 / 3) - 1);
}

function getConfig() {
    const pressure = Math.max(0, parseFloat(pressureInput.value) || DEFAULTS.pressure);
    const depth = Math.max(0.1, parseFloat(depthInput.value) || DEFAULTS.depth);
    const rings = Math.max(4, Math.min(50, Math.round(parseFloat(ringsInput.value) || DEFAULTS.rings)));
    const sectors = Math.max(8, Math.min(100, Math.round(parseFloat(sectorsInput.value) || DEFAULTS.sectors)));

    pressureInput.value = pressure;
    depthInput.value = depth;
    ringsInput.value = rings;
    sectorsInput.value = sectors;

    return { pressure, depth, rings, sectors };
}

function getPolygonBounds(points) {
    if (!points.length) {
        return null;
    }

    return points.reduce((bounds, point) => ({
        minX: Math.min(bounds.minX, point.x),
        maxX: Math.max(bounds.maxX, point.x),
        minY: Math.min(bounds.minY, point.y),
        maxY: Math.max(bounds.maxY, point.y),
    }), {
        minX: points[0].x,
        maxX: points[0].x,
        minY: points[0].y,
        maxY: points[0].y,
    });
}

function svgDistanceToRatio(distance) {
    return chartState.outerRatio ? (distance / OUTER_RADIUS) * chartState.outerRatio : 0;
}

function updateScaleOutputs() {

    const bounds = getPolygonBounds(chartState.polygonPoints);
    if (!bounds) {
        return;
    }
}

function setPathFromPoints(pathElement, points, closePath = false) {
    if (!points.length) {
        pathElement.setAttribute('d', '');
        return;
    }

    const commands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`);
    if (closePath) {
        commands.push('Z');
    }
    pathElement.setAttribute('d', commands.join(' '));
}

function pointerToSvgPoint(event) {
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEWBOX_SIZE / rect.width;
    const scaleY = VIEWBOX_SIZE / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
}

function distanceBetween(pointA, pointB) {
    return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function pointInPolygon(point, polygon) {
    let inside = false;

    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
        const pointA = polygon[index];
        const pointB = polygon[previous];
        const intersects = ((pointA.y > point.y) !== (pointB.y > point.y))
            && (point.x < ((pointB.x - pointA.x) * (point.y - pointA.y)) / ((pointB.y - pointA.y) || 1e-9) + pointA.x);

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}

function simplifyPoints(points, minimumSpacing = 6) {
    if (points.length <= 2) {
        return points.slice();
    }

    const simplified = [points[0]];

    for (let index = 1; index < points.length; index += 1) {
        if (distanceBetween(simplified[simplified.length - 1], points[index]) >= minimumSpacing) {
            simplified.push(points[index]);
        }
    }

    if (simplified.length > 1 && distanceBetween(simplified[simplified.length - 1], points[points.length - 1]) > 0) {
        simplified.push(points[points.length - 1]);
    }

    return simplified;
}

function updateOutputs(coveredCells) {
    const influence = coveredCells * chartState.unitInfluence;
    const stressIncrease = chartState.config.pressure * influence;

    unitInfluenceOutput.textContent = formatDecimal(chartState.unitInfluence);
    coveredCellsOutput.textContent = String(coveredCells);
    influenceValueOutput.textContent = formatDecimal(influence);
    stressResultOutput.textContent = `${stressIncrease.toFixed(2)} kPa`;
    // coverageRatioOutput.textContent = `${coverageRatio.toFixed(1)}%`;
    formulaText.innerHTML = `Δσ<sub>z</sub> = ${chartState.config.pressure.toFixed(2)} × ${formatDecimal(influence)} = ${stressIncrease.toFixed(2)} kPa`;
    // assumptionText.textContent = `The visible chart stops at r/z = ${chartState.outerRatio.toFixed(3)} and captures ${formatDecimal(chartState.totalInfluence)} of the total Newmark influence. The outer infinite annulus is intentionally not rendered.`;
    updateScaleOutputs();
}

function recomputeCoverage() {
    if (!chartState.polygonPoints.length) {
        chartState.cells.forEach((cell) => cell.path.classList.remove('covered'));
        updateOutputs(0);
        chartHint.style.display = 'block';
        return;
    }

    let coveredCells = 0;

    chartState.cells.forEach((cell) => {
        const covered = pointInPolygon(cell.centroid, chartState.polygonPoints);
        cell.path.classList.toggle('covered', covered);
        if (covered) {
            coveredCells += 1;
        }
    });

    updateOutputs(coveredCells);
    chartHint.style.display = 'none';
}

function buildChart() {
    chartState.config = getConfig();
    const visibleRingCount = Math.max(1, chartState.config.rings - 1);
    chartState.totalInfluence = visibleRingCount / chartState.config.rings;
    chartState.unitInfluence = 1 / (chartState.config.rings * chartState.config.sectors);
    chartState.cells = [];

    svg.innerHTML = '';

    const defs = createSvgElement('defs');
    const clipPath = createSvgElement('clipPath', { id: 'chart-clip' });
    clipPath.appendChild(createSvgElement('circle', {
        cx: CENTER,
        cy: CENTER,
        r: OUTER_RADIUS,
    }));
    defs.appendChild(clipPath);
    svg.appendChild(defs);

    svg.appendChild(createSvgElement('rect', {
        x: 0,
        y: 0,
        width: VIEWBOX_SIZE,
        height: VIEWBOX_SIZE,
        fill: 'transparent',
    }));

    cellGroup = createSvgElement('g', { class: 'chart-grid' });
    guideGroup = createSvgElement('g', { class: 'chart-grid' });
    drawingGroup = createSvgElement('g', { class: 'drawing-layer', 'clip-path': 'url(#chart-clip)' });
    previewPath = createSvgElement('path', { class: 'polygon-preview' });
    polygonPath = createSvgElement('path', { class: 'polygon-final' });

    const ringBoundaries = [0];
    for (let ringIndex = 1; ringIndex <= visibleRingCount; ringIndex += 1) {
        const targetInfluence = ringIndex / chartState.config.rings;
        ringBoundaries.push(influenceToRadiusRatio(targetInfluence));
    }
    chartState.outerRatio = ringBoundaries[ringBoundaries.length - 1];

    const angleStep = (Math.PI * 2) / chartState.config.sectors;
    const scaleBarY = VIEWBOX_SIZE - 48;
    const scaleBarLength = OUTER_RADIUS / chartState.outerRatio;
    const scaleBarLeft = CENTER/4. - scaleBarLength / 2;
    const scaleBarRight = CENTER/4. + scaleBarLength / 2;

    for (let ringIndex = 0; ringIndex < visibleRingCount; ringIndex += 1) {
        const innerRatio = ringBoundaries[ringIndex];
        const outerRatio = ringBoundaries[ringIndex + 1];
        const innerRadius = (innerRatio / chartState.outerRatio) * OUTER_RADIUS;
        const outerRadius = (outerRatio / chartState.outerRatio) * OUTER_RADIUS;

        for (let sectorIndex = 0; sectorIndex < chartState.config.sectors; sectorIndex += 1) {
            const startAngle = -Math.PI / 2 + sectorIndex * angleStep;
            const endAngle = startAngle + angleStep;
            const cellPath = createSvgElement('path', {
                d: describeSector(innerRadius, outerRadius, startAngle, endAngle),
                class: 'chart-cell',
            });
            const centroidAngle = startAngle + angleStep / 2;
            const centroidRadius = (innerRadius + outerRadius) / 2;

            chartState.cells.push({
                path: cellPath,
                centroid: toScreenPoint(centroidRadius, centroidAngle),
            });
            cellGroup.appendChild(cellPath);
        }

        guideGroup.appendChild(createSvgElement('circle', {
            cx: CENTER,
            cy: CENTER,
            r: outerRadius,
            class: 'chart-circle',
        }));

        const labelPoint = toScreenPoint(Math.min(outerRadius + 14, OUTER_RADIUS - 10), -Math.PI / 4);
        const label = createSvgElement('text', {
            x: labelPoint.x,
            y: labelPoint.y,
            class: 'chart-label',
            'text-anchor': 'start',
        });
        label.textContent = outerRatio.toFixed(2);
        guideGroup.appendChild(label);
    }

    for (let sectorIndex = 0; sectorIndex < chartState.config.sectors; sectorIndex += 1) {
        const angle = -Math.PI / 2 + sectorIndex * angleStep;
        const endPoint = toScreenPoint(OUTER_RADIUS, angle);
        guideGroup.appendChild(createSvgElement('line', {
            x1: CENTER,
            y1: CENTER,
            x2: endPoint.x,
            y2: endPoint.y,
            class: 'chart-axis',
        }));
    }

    guideGroup.appendChild(createSvgElement('circle', {
        cx: CENTER,
        cy: CENTER,
        r: OUTER_RADIUS,
        class: 'chart-circle',
    }));

    const axisLabel = createSvgElement('text', {
        x: 1.7*CENTER,
        y: 0.35*CENTER,
        class: 'chart-label',
        'text-anchor': 'middle',
    });
    axisLabel.textContent = 'r/z';
    guideGroup.appendChild(axisLabel);

    guideGroup.appendChild(createSvgElement('line', {
        x1: scaleBarLeft,
        y1: scaleBarY,
        x2: scaleBarRight,
        y2: scaleBarY,
        class: 'scale-bar',
    }));
    guideGroup.appendChild(createSvgElement('line', {
        x1: scaleBarLeft,
        y1: scaleBarY - 9,
        x2: scaleBarLeft,
        y2: scaleBarY + 9,
        class: 'scale-bar-cap',
    }));
    guideGroup.appendChild(createSvgElement('line', {
        x1: scaleBarRight,
        y1: scaleBarY - 9,
        x2: scaleBarRight,
        y2: scaleBarY + 9,
        class: 'scale-bar-cap',
    }));

    const scaleBarLabel = createSvgElement('text', {
        x: CENTER/4.,
        y: scaleBarY - 12,
        class: 'scale-bar-label',
        'text-anchor': 'middle',
    });
    scaleBarLabel.textContent = `${chartState.config.depth.toFixed(2)} m`;
    guideGroup.appendChild(scaleBarLabel);

    drawingGroup.appendChild(polygonPath);
    drawingGroup.appendChild(previewPath);

    svg.appendChild(cellGroup);
    svg.appendChild(guideGroup);
    svg.appendChild(drawingGroup);

    setPathFromPoints(polygonPath, chartState.polygonPoints, true);
    setPathFromPoints(previewPath, [], false);
    recomputeCoverage();
}

function clearDrawing() {
    chartState.polygonPoints = [];
    activePoints = [];
    isDrawing = false;
    activePointerId = null;
    setPathFromPoints(previewPath, [], false);
    setPathFromPoints(polygonPath, [], false);
    recomputeCoverage();
}

function handlePointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
        return;
    }

    event.preventDefault();
    const startPoint = pointerToSvgPoint(event);
    isDrawing = true;
    activePointerId = event.pointerId;
    activePoints = [startPoint];
    chartState.polygonPoints = [];
    svg.setPointerCapture(event.pointerId);
    setPathFromPoints(previewPath, activePoints, false);
    setPathFromPoints(polygonPath, [], false);
    chartHint.style.display = 'none';
}

function handlePointerMove(event) {
    if (!isDrawing || event.pointerId !== activePointerId) {
        return;
    }

    const nextPoint = pointerToSvgPoint(event);
    if (!activePoints.length || distanceBetween(activePoints[activePoints.length - 1], nextPoint) >= 4) {
        activePoints.push(nextPoint);
        setPathFromPoints(previewPath, activePoints, false);
    }
}

function finishDrawing(event) {
    if (!isDrawing || event.pointerId !== activePointerId) {
        return;
    }

    isDrawing = false;
    svg.releasePointerCapture(event.pointerId);

    const simplifiedPoints = simplifyPoints(activePoints, 6);
    activePointerId = null;
    activePoints = [];
    setPathFromPoints(previewPath, [], false);

    if (simplifiedPoints.length < 3) {
        clearDrawing();
        return;
    }

    chartState.polygonPoints = simplifiedPoints;
    setPathFromPoints(polygonPath, chartState.polygonPoints, true);
    recomputeCoverage();
}

function resetDefaults() {
    pressureInput.value = DEFAULTS.pressure;
    depthInput.value = DEFAULTS.depth;
    ringsInput.value = DEFAULTS.rings;
    sectorsInput.value = DEFAULTS.sectors;
    clearDrawing();
    buildChart();
}

[pressureInput, depthInput, ringsInput, sectorsInput].forEach((input) => {
    input.addEventListener('input', () => {
        buildChart();
    });
});

clearDrawingButton.addEventListener('click', clearDrawing);
resetButton.addEventListener('click', resetDefaults);

svg.addEventListener('pointerdown', handlePointerDown);
svg.addEventListener('pointermove', handlePointerMove);
svg.addEventListener('pointerup', finishDrawing);
svg.addEventListener('pointercancel', finishDrawing);

buildChart();