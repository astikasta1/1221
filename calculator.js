let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;

const display = document.getElementById('result');

function updateDisplay(value) {
    display.value = value;
    if (value === 'Error') {
        display.classList.add('error');
    } else {
        display.classList.remove('error');
    }
}

function appendToDisplay(value) {
    // Add button press animation
    const button = event.target;
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);

    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }

    // Handle operators
    if (['+', '-', '*', '/'].includes(value)) {
        if (currentInput === '' && previousInput === '') {
            return; // Don't allow operator as first input
        }
        
        if (currentInput === '' && previousInput !== '') {
            operator = value;
            return;
        }

        if (previousInput !== '' && operator !== '' && currentInput !== '') {
            calculateResult();
        }

        operator = value;
        previousInput = currentInput;
        currentInput = '';
        return;
    }

    // Handle decimal point
    if (value === '.') {
        if (currentInput.includes('.')) {
            return; // Don't allow multiple decimal points
        }
        if (currentInput === '') {
            currentInput = '0.';
        } else {
            currentInput += value;
        }
    } else {
        // Handle numbers
        if (currentInput === '0' && value !== '.') {
            currentInput = value;
        } else {
            currentInput += value;
        }
    }

    updateDisplay(currentInput);
}

function calculateResult() {
    if (previousInput === '' || currentInput === '' || operator === '') {
        return;
    }

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;

    try {
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    throw new Error('Division by zero');
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Format result to avoid floating point precision issues
        if (result % 1 === 0) {
            result = result.toString();
        } else {
            result = parseFloat(result.toFixed(10)).toString();
        }

        // Check for invalid results
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid calculation');
        }

        currentInput = result;
        previousInput = '';
        operator = '';
        shouldResetDisplay = true;
        updateDisplay(result);

    } catch (error) {
        updateDisplay('Error');
        currentInput = '';
        previousInput = '';
        operator = '';
        shouldResetDisplay = true;
    }
}

function clearDisplay() {
    currentInput = '';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    updateDisplay('0');
}

function clearEntry() {
    currentInput = '';
    updateDisplay('0');
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
        updateDisplay(currentInput);
    } else {
        currentInput = '';
        updateDisplay('0');
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if ('0123456789+-*/.='.includes(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
    }

    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});

// Initialize display
updateDisplay('0');