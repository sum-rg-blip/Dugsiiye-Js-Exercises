let temperature = prompt("Enter the temperature:");
temperature = Number(temperature); 

if (temperature < 0) {
  console.log("Very cold");
} else if (temperature >= 0 && temperature < 15) {
  console.log("Cold");
} else if (temperature >= 15 && temperature <= 25) {
  console.log("Warm");
} else {
  console.log("Hot");
}
