document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelector('.calculator');

    let currentInput = '0';
    let previousInput = null;
    let operator = null;
    let waitingForSecondOperand = false;

    function updateDisplay() {
        display.textContent = currentInput;
    }

    function inputDigit(digit) {
        if (currentInput === 'Error') {
            resetCalculator(); // Reset if an error state
        }
        if (waitingForSecondOperand) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
        updateDisplay();
    }

    function inputDecimal(dot) {
        if (currentInput === 'Error') {
            resetCalculator();
        }
        if (waitingForSecondOperand) {
            currentInput = '0.';
            waitingForSecondOperand = false;
            updateDisplay();
            return;
        }

        if (!currentInput.includes(dot)) {
            currentInput += dot;
        }
        updateDisplay();
    }

    function handleOperator(nextOperator) {
        const inputValue = parseFloat(currentInput);

        if (currentInput === 'Error') {
            resetCalculator();
            return;
        }

        if (previousInput === null) {
            // This is the first operand, just store it
            previousInput = inputValue;
        } else if (!waitingForSecondOperand) {
            // A previous operation is pending, calculate it first before applying the new operator
            // Check for division by zero before performing calculation for chained ops
            if (operator === '/' && inputValue === 0) {
                currentInput = 'Error';
                previousInput = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay();
                return;
            }
            const result = performCalculation[operator](previousInput, inputValue);
            currentInput = String(result);
            previousInput = result; // Store result for next chained operation
        }
        // If waitingForSecondOperand is true, it means an operator was just pressed or changed.
        // We just update the operator, no calculation needed yet.

        waitingForSecondOperand = true;
        operator = nextOperator;
        updateDisplay();
    }

    const performCalculation = {
        '/': (firstOperand, secondOperand) => firstOperand / secondOperand,
        '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
        '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
        '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    };

    function resetCalculator() {
        currentInput = '0';
        previousInput = null;
        operator = null;
        waitingForSecondOperand = false;
        updateDisplay();
    }

    buttons.addEventListener('click', (event) => {
        const { target } = event;

        if (!target.matches('button')) {
            return;
        }

        if (target.dataset.digit) {
            if (target.dataset.digit === '.') {
                inputDecimal('.');
            } else {
                inputDigit(target.dataset.digit);
            }
            return;
        }

        if (target.dataset.action === 'clear') {
            resetCalculator();
            return;
        }

        if (target.dataset.action === 'equals') {
            if (previousInput === null || operator === null || waitingForSecondOperand) {
                // Cannot calculate if no previous number, no operator, or if only the first operand has been entered
                // and we're waiting for the second.
                return;
            }

            const inputValue = parseFloat(currentInput);
            
            // Handle division by zero explicitly for equals
            if (operator === '/' && inputValue === 0) {
                currentInput = 'Error';
                previousInput = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay();
                return;
            }

            const result = performCalculation[operator](previousInput, inputValue);

            currentInput = String(result);
            previousInput = null; // Reset for a fresh calculation
            operator = null; // Clear operator
            waitingForSecondOperand = false; // Allow new input directly
            updateDisplay();
            return;
        }

        // If it's an operator button
        if (target.dataset.action) {
            handleOperator(target.dataset.action);
            return;
        }
    });

    // Initial display update
    updateDisplay();
});