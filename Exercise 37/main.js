// ====== DOM ======
const postForm = document.getElementById("postForm");
const titleInput = document.getElementById("titleInput");
const imageInput = document.getElementById("imageInput");
const descInput = document.getElementById("descInput");
const postsList = document.getElementById("postsList");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// ====== STATE ======
let posts = loadPosts();        // array of posts
let editingId = null;          // if not null => we are editing

// ====== INIT ======
renderPosts();

// ====== EVENTS ======
postForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const image = imageInput.value.trim();
  const desc = descInput.value.trim();

  if (!title || !desc) return;

  if (editingId) {
    // update existing
    posts = posts.map((p) =>
      p.id === editingId ? { ...p, title, image, desc } : p
    );
    editingId = null;
    submitBtn.textContent = "Add Post";
    cancelEditBtn.classList.add("hidden");
  } else {
    // add new
    const newPost = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title,
      image,
      desc,
      createdAt: Date.now(),
    };
    posts.unshift(newPost); // newest on top
  }

  savePosts(posts);
  postForm.reset();
  renderPosts();
});

cancelEditBtn.addEventListener("click", () => {
  editingId = null;
  postForm.reset();
  submitBtn.textContent = "Add Post";
  cancelEditBtn.classList.add("hidden");
});

// ====== FUNCTIONS ======
function renderPosts() {
  postsList.innerHTML = "";

  if (posts.length === 0) {
    postsList.innerHTML = `<p style="text-align:center;color:#666;">No posts yet.</p>`;
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";

    const safeTitle = escapeHtml(post.title);
    const safeDesc = escapeHtml(post.desc);

    card.innerHTML = `
      <div class="post-title">${safeTitle}</div>

      ${
        post.image
          ? `<img class="post-img" src="${escapeAttribute(post.image)}" alt="post image"
               onerror="this.style.display='none'">`
          : ""
      }

      <div class="post-desc">${safeDesc.replace(/\n/g, "<br>")}</div>

      <div class="post-actions">
        <button data-action="edit" data-id="${post.id}">Edit</button>
        <button data-action="delete" data-id="${post.id}">Delete</button>
      </div>
    `;

    postsList.appendChild(card);
  });

  // attach button events (event delegation)
  postsList.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", handlePostAction);
  });
}

function handlePostAction(e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;

  if (action === "delete") {
    const ok = confirm("Delete this post?");
    if (!ok) return;

    posts = posts.filter((p) => p.id !== id);
    savePosts(posts);
    renderPosts();
  }

  if (action === "edit") {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const newTitle = prompt("Edit Title:", post.title);
    if (newTitle === null) return;

    const newImage = prompt("Edit Image URL:", post.image || "");
    if (newImage === null) return;

    const newDesc = prompt("Edit Content:", post.desc);
    if (newDesc === null) return;

    const title = newTitle.trim();
    const image = newImage.trim();
    const desc = newDesc.trim();

    if (!title || !desc) {
      alert("Title and content are required.");
      return;
    }

    posts = posts.map((p) => (p.id === id ? { ...p, title, image, desc } : p));
    savePosts(posts);
    renderPosts();
  }
}

// ====== STORAGE ======
function savePosts(arr) {
  localStorage.setItem("simple_blog_posts", JSON.stringify(arr));
}

function loadPosts() {
  const raw = localStorage.getItem("simple_blog_posts");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

// ====== SAFETY HELPERS (avoid HTML injection) ======
function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(str) {
  // minimal escaping for attributes
  return str.replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
