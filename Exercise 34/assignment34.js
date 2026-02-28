let itemCount = 2;

function addItem() {
    const list = document.getElementById("myList");

    itemCount++;

    const newItem = document.createElement("li");
    newItem.textContent = "Item " + itemCount;

    list.appendChild(newItem);

    console.log("Item added");
}

function removeItem() {
    const list = document.getElementById("myList");

    if (list.children.length > 0) {
        list.removeChild(list.lastElementChild);
        itemCount--;
        console.log("Last item removed");
    } else {
        console.log("No items to remove");
    }
}