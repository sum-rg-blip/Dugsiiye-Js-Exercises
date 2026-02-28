function changeContent() {
    // Change only text
    const title = document.getElementById("title");
    title.textContent = "Updated Title!";

    // Change paragraph text
    const paragraph = document.getElementById("text");
    paragraph.textContent = "The paragraph text has been changed.";

    // Change HTML inside the div
    const box = document.getElementById("box");
    box.innerHTML = "<em>New HTML content with italic style!</em>";

    console.log("Content changed successfully!");
}