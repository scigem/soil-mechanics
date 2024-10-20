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

