function fetchUserData() {
    return new Promise((resolve, reject) => {
        console.log("Fetching user data...");
        setTimeout(() => {
            const success = true; 

            if (success) {
                resolve("✅ User data fetched successfully!");
            } else {
                reject("❌ Failed to fetch user data.");
            }
        }, 2000);
    });
}

console.log("Start...");

fetchUserData()
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.error(error);
    });

console.log("This runs immediately (non-blocking).");