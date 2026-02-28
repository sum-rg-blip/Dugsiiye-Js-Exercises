function changeImage() {
    const image = document.getElementById("myImage");

    // Ask user for new values
    const newUrl = prompt("Enter new image URL:");
    const borderColor = prompt("Enter border color (e.g., red, blue, #000000):");
    const width = prompt("Enter image width in pixels (e.g., 300):");
    const height = prompt("Enter image height in pixels (e.g., 200):");
    const borderRadius = prompt("Enter border radius in pixels (e.g., 20):");

    // Apply changes only if user provides values
    if (newUrl) {
        image.src = newUrl;
    }

    if (borderColor) {
        image.style.border = `4px solid ${borderColor}`;
    }

    if (width) {
        image.style.width = width + "px";
    }

    if (height) {
        image.style.height = height + "px";
    }

    if (borderRadius) {
        image.style.borderRadius = borderRadius + "px";
    }

    console.log("Image updated successfully!");
}