const display = document.getElementById('display');
let current = '';
let operator = null;
let operand = null;

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => handleButton(btn));
});

function handleButton(btn) {
    const value = btn.dataset.value;
    if (btn.id === 'clear') {
        clearCalc();
    } else if (btn.id === 'equals') {
        calculate();
    } else if (value !== undefined) {
        if (['+', '-', '*', '/'].includes(value)) {
            setOperator(value);
        } else {
            appendNumber(value);
        }
    }
}

function appendNumber(num) {
    current += num;
    display.value = current;
}

function setOperator(op) {
    if (current === '') return;
    if (operator !== null) calculate();
    operand = parseFloat(current);
    operator = op;
    current = '';
}

function calculate() {
    if (operator === null || current === '') return;
    const second = parseFloat(current);
    let result = 0;
    switch (operator) {
        case '+':
            result = operand + second;
            break;
        case '-':
            result = operand - second;
            break;
        case '*':
            result = operand * second;
            break;
        case '/':
            result = operand / second;
            break;
    }
    display.value = result;
    current = '' + result;
    operator = null;
    operand = null;
}

function clearCalc() {
    current = '';
    operator = null;
    operand = null;
    display.value = '';
}
