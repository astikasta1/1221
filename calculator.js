class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
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
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('Ошибка: Деление на ноль!');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Округляем результат до 10 знаков после запятой, чтобы избежать проблем с плавающей точкой
        computation = Math.round(computation * 10000000000) / 10000000000;
        
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
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
        if (this.currentOperand === '') {
            this.currentOperandTextElement.innerText = '0';
        } else {
            this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        }
        
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Инициализация калькулятора
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Поддержка клавиатуры
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Числа
    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
    }
    
    // Десятичная точка
    if (key === '.' || key === ',') {
        calculator.appendNumber('.');
    }
    
    // Операции
    if (key === '+') {
        calculator.chooseOperation('+');
    }
    if (key === '-') {
        calculator.chooseOperation('-');
    }
    if (key === '*') {
        calculator.chooseOperation('×');
    }
    if (key === '/') {
        event.preventDefault(); // Предотвращаем поиск в браузере
        calculator.chooseOperation('÷');
    }
    
    // Равно
    if (key === 'Enter' || key === '=') {
        calculator.compute();
    }
    
    // Удаление
    if (key === 'Backspace') {
        calculator.delete();
    }
    
    // Очистка
    if (key === 'Escape' || key === 'Delete') {
        calculator.clear();
    }
});

// Добавляем визуальную обратную связь для нажатых клавиш
document.addEventListener('keydown', function(event) {
    const key = event.key;
    let buttonToHighlight = null;
    
    // Находим соответствующую кнопку
    if (key >= '0' && key <= '9') {
        buttonToHighlight = document.querySelector(`button[onclick*="'${key}'"]`);
    } else if (key === '.') {
        buttonToHighlight = document.querySelector(`button[onclick*="'.'"]`);
    } else if (key === '+') {
        buttonToHighlight = document.querySelector(`button[onclick*="'+'"]`);
    } else if (key === '-') {
        buttonToHighlight = document.querySelector(`button[onclick*="'-'"]`);
    } else if (key === '*') {
        buttonToHighlight = document.querySelector(`button[onclick*="'×'"]`);
    } else if (key === '/') {
        buttonToHighlight = document.querySelector(`button[onclick*="'÷'"]`);
    } else if (key === 'Enter' || key === '=') {
        buttonToHighlight = document.querySelector(`button[onclick*="compute()"]`);
    } else if (key === 'Backspace') {
        buttonToHighlight = document.querySelector(`button[onclick*="delete()"]`);
    } else if (key === 'Escape' || key === 'Delete') {
        buttonToHighlight = document.querySelector(`button[onclick*="clear()"]`);
    }
    
    // Подсвечиваем кнопку
    if (buttonToHighlight) {
        buttonToHighlight.style.background = 'rgba(255, 255, 255, 0.5)';
        setTimeout(() => {
            buttonToHighlight.style.background = '';
        }, 150);
    }
});