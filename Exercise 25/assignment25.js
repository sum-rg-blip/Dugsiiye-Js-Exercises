const array1 = [10, 20, 30];
const array2 = [40, 50, 60];

const combinedArray = [...array1, ...array2];

console.log(combinedArray); // Output: [10, 20, 30, 40, 50, 60]


function multiply(...numbers) {
  return numbers.reduce((product, num) => product * num, 1);
}

console.log(multiply(2, 3, 4));
console.log(multiply(5, 5));   
console.log(multiply(7));      
console.log(multiply());       
