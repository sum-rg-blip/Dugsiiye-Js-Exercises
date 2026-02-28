function fetchJsonData() {
    return new Promise((resolve, reject) => {
        console.log("Fetching JSON data...");

        setTimeout(() => {
            const success = true; 

            if (success) {
                resolve({
                    id: 1,
                    name: "Sumeya",
                    role: "Student",
                    course: "JavaScript"
                });
            } else {
                reject("Failed to fetch JSON data.");
            }
        }, 2000);
    });
}

async function getData() {
    try {
        const data = await fetchJsonData();
        console.log("Parsed JSON Object:", data);
    } catch (error) {
        console.error(error);
    }
}

console.log("Start...");
getData();
console.log("Other code runs immediately (non-blocking).");