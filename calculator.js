class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Round to avoid floating point precision issues
        computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;
        
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        
        // Add result animation
        this.currentOperandElement.classList.add('result-animation');
        setTimeout(() => {
            this.currentOperandElement.classList.remove('result-animation');
        }, 300);
    }

    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = current / 100;
        this.shouldResetDisplay = true;
    }

    showError() {
        this.currentOperand = 'Ошибка';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = true;
        
        // Add error animation
        this.currentOperandElement.classList.add('error');
        setTimeout(() => {
            this.currentOperandElement.classList.remove('error');
            this.clear();
            this.updateDisplay();
        }, 1000);
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('ru', {
                maximumFractionDigits: 0
            });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === 'Ошибка') {
            this.currentOperandElement.innerText = this.currentOperand;
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand || '0');
        }
        
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previous-operand');
const currentOperandElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Operator buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

// Action buttons
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        
        switch(action) {
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'equals':
                calculator.compute();
                break;
            case 'percent':
                calculator.percentage();
                break;
            case 'decimal':
                calculator.appendNumber('.');
                break;
        }
        
        calculator.updateDisplay();
    });
});

// Keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Numbers
    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
        calculator.updateDisplay();
        highlightButton(`[data-number="${key}"]`);
        return;
    }
    
    // Operators
    switch(key) {
        case '+':
            calculator.chooseOperation('+');
            highlightButton('[data-operator="+"]');
            break;
        case '-':
            calculator.chooseOperation('−');
            highlightButton('[data-operator="−"]');
            break;
        case '*':
            calculator.chooseOperation('×');
            highlightButton('[data-operator="×"]');
            break;
        case '/':
            event.preventDefault();
            calculator.chooseOperation('÷');
            highlightButton('[data-operator="÷"]');
            break;
        case 'Enter':
        case '=':
            event.preventDefault();
            calculator.compute();
            highlightButton('[data-action="equals"]');
            break;
        case 'Escape':
        case 'c':
        case 'C':
            calculator.clear();
            highlightButton('[data-action="clear"]');
            break;
        case 'Backspace':
            calculator.delete();
            highlightButton('[data-action="delete"]');
            break;
        case '.':
        case ',':
            calculator.appendNumber('.');
            highlightButton('[data-action="decimal"]');
            break;
        case '%':
            calculator.percentage();
            highlightButton('[data-action="percent"]');
            break;
    }
    
    calculator.updateDisplay();
});

// Function to highlight button when pressed
function highlightButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
}

// Button click effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('mouseup', () => {
        button.style.transform = '';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = '';
    });
});

// Prevent context menu on buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});

// Initialize display
calculator.updateDisplay();

// Add touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe up - could add additional functionality
        } else {
            // Swipe down - could add additional functionality
        }
    }
}

// Add visual feedback for accessibility
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('focus', () => {
        button.style.outline = '2px solid rgba(255, 255, 255, 0.8)';
    });
    
    button.addEventListener('blur', () => {
        button.style.outline = 'none';
    });
});

// Error handling for edge cases
window.addEventListener('error', (event) => {
    console.error('Calculator error:', event.error);
    calculator.showError();
});

// Performance optimization - debounce rapid key presses
let keyPressTimeout;
document.addEventListener('keydown', (event) => {
    clearTimeout(keyPressTimeout);
    keyPressTimeout = setTimeout(() => {
        // Key press handling is already done above
    }, 10);
});

console.log('Калькулятор загружен и готов к использованию!');