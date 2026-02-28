function delayedSuccess() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = true; 

            if (success) {
                resolve("✅ Success! Data fetched after 2 seconds.");
            } else {
                reject("❌ Error! Failed to fetch data.");
            }
        }, 2000);
    });
}
async function fetchData() {
    try {
        console.log("Fetching data...");

        const message = await delayedSuccess(); 

        console.log(message); 
    } catch (error) {
        console.error(error);
    }
}

console.log("Start...");
fetchData();
console.log("This runs immediately (non-blocking).");