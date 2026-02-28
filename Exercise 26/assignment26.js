function delayBlocking() {
    alert("Fetching user data... (blocking for 2 seconds)");

    const start = Date.now();
    while (Date.now() - start < 2000) {
    }

    return "Blocking delay completed!";
}

console.log("Start blocking delay...");
console.log(delayBlocking());
console.log("This message is blocked until the delay is complete.");


function delayNonBlocking(callback) {
    alert("Fetching user data... (non-blocking)");

    setTimeout(() => {
        callback("Non-blocking delay completed!");
    }, 2000);
}

console.log("Start non-blocking delay...");
delayNonBlocking((message) => {
    console.log(message);
});
console.log("This message is not blocked and runs immediately.");