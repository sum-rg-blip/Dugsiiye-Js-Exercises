function operate(num1, num2, operation) {
    return operation(num1, num2);
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        return "Error: Cannot divide by zero.";
    }
    return a / b;
}

console.log("Multiplication Result:", operate(10, 5, multiply));
console.log("Division Result:", operate(10, 5, divide));