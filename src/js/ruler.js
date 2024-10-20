import '../css/main.css';
import '../css/ruler.css';

// Define the number of divisions on each axis
const divisions = 10;

function createRuler(id) {
    const ruler = document.getElementById(id);
        
    for (let i = 0; i <= divisions; i++) {
        const mark = document.createElement('div');
        mark.classList.add('mark');
        let solidFraction = i / divisions;
        let porosity = 1 - solidFraction;
        let voidRatio = 1 / (1 - porosity) - 1;
        
        // Positioning the mark based on index
        mark.style.left = `${(i / divisions) * 100}%`;

        // Create numeric label
        const label = document.createElement('div');
        label.classList.add('label');
        
        // Calculate and set the label value
        // const value = startValue + (range * i / divisions);
        let value;
        if (id == "void-ratio") {
            value = voidRatio;
        }
        else if (id == "porosity") {
            value = porosity;
        }
        else if (id == "solid-fraction") {
            value = solidFraction;
        }
        label.innerText = value.toFixed(2); // Format to 2 decimal places
        label.style.left = `${(i / divisions) * 100}%`;

        // Add marks and labels to the ruler
        ruler.appendChild(mark);
        ruler.appendChild(label);
    }
}

// Create rulers with labels for void ratio, porosity, and solid fraction
createRuler('solid-fraction');
createRuler('porosity');
createRuler('void-ratio');

// Moving the vertical line on mousemove
const container = document.querySelector('.container');
const verticalLine = document.getElementById('vertical-line');

// Helper function to calculate the numeric value based on mouse position
function calculateValue(id, mouseX, containerWidth) {
    const i = mouseX / containerWidth;
    let value;
    if (id == "solid-fraction") {
        value = i;
    }
    else if (id == "porosity") {
        value = 1-i;
    }
    else if (id == "void-ratio") {
        value = 1 / i - 1;
    }
    
    return value.toFixed(2);
}

// Markers
const markerVoidRatio = document.getElementById('marker-void-ratio');
const markerPorosity = document.getElementById('marker-porosity');
const markerSolidFraction = document.getElementById('marker-solid-fraction');

// Show vertical line on mouse move
container.addEventListener('mousemove', (event) => {
    const containerRect = container.getBoundingClientRect();
    
    // Calculate position relative to container
    const xPos = event.clientX - containerRect.left;

    // Ensure the line and markers stay within the bounds of the container
    if (xPos >= 0 && xPos <= containerRect.width) {
        // Move the vertical line
        verticalLine.style.left = `${xPos}px`;
        verticalLine.style.display = 'block';

        // Calculate values and update marker positions
        const voidRatioValue = calculateValue('void-ratio', xPos, containerRect.width);
        const porosityValue = calculateValue('porosity', xPos, containerRect.width);
        const solidFractionValue = calculateValue('solid-fraction', xPos, containerRect.width);

        // Update marker content and position
        markerVoidRatio.innerText = voidRatioValue;
        markerVoidRatio.style.left = `${xPos}px`;
        markerVoidRatio.style.display = 'block';

        markerPorosity.innerText = porosityValue;
        markerPorosity.style.left = `${xPos}px`;
        markerPorosity.style.display = 'block';

        markerSolidFraction.innerText = solidFractionValue;
        markerSolidFraction.style.left = `${xPos}px`;
        markerSolidFraction.style.display = 'block';
    }
});

// Hide the vertical line when the mouse leaves the container
container.addEventListener('mouseleave', () => {
    verticalLine.style.display = 'none';
    markerVoidRatio.style.display = 'none';
    markerPorosity.style.display = 'none';
    markerSolidFraction.style.display = 'none';
});
