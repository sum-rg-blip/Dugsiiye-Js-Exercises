const numbers = [1, 2, 3, 4, 5];

const result = numbers.reduce(function(accumulator, currentValue) {
  return accumulator * currentValue;
}, 1);

console.log(result);
