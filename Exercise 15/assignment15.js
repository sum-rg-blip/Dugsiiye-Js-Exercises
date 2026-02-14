const people = [
  { name: "Alice", age: 25, city: "Wonderland" },
  { name: "Bob", age: 30, city: "New York" },
  { name: "Charlie", age: 28, city: "London" }
];

for (let person of people) {
  console.log("---- Person ----");
  
 for (let key in person) {
    console.log(key + ": " + person[key]);
  }
}
