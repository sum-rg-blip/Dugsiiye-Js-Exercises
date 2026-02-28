async function fetchUsers() {
    try {
        console.log("Fetching users...");

        const response = await fetch("https://jsonplaceholder.typicode.com/users");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const users = await response.json(); 

        console.log("Users List:", users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
    }
}

fetchUsers();