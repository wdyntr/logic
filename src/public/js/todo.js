let currentPage = 1;
// todo.js - TAMBAHKAN di DOMContentLoaded (setelah line 15)


document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

window.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener('auth:expired', () => {
    // Clear local state
    currentPage = 1
    // csrfToken di window.api sudah di-handle api.js

    // Update UI
    document.getElementById("todo-list").innerHTML = '<div class="loading-text">Session expired, silakan login</div>'
    document.getElementById("page-info").textContent = ''

    // Redirect
    window.location.href = '/auth'
  })

  window.api.csrfToken = await window.api.fetchCsrfToken()

  setupEventDelegation();
  await loadTodo(1);
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(type, message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

function setupEventDelegation() {
  const list = document.getElementById("todo-list");
  list.addEventListener("click", (e) => {
    const item = e.target.closest(".todo-item");
    if (!item) return;

    const id = item.dataset.id;

    if (e.target.type === "checkbox") {
      const checked = e.target.checked;
      toggleTodo(id, checked);
    } else if (e.target.classList.contains("btn-delete")) {
      deleteTodo(id);
    }
  });
}

function renderTodo(todo) {
  return `
    <div class="todo-item" data-id="${todo.id}">
      <input type="checkbox" ${todo.status ? "checked" : ""}>
      <span class="todo-name ${todo.status ? "completed" : ""}">${escapeHtml(todo.name)}</span>
      <button class="btn-delete" aria-label="Hapus ${escapeHtml(todo.name)}">Hapus</button>
    </div>
  `;
}

async function createTodo() {
  const nameInput = document.getElementById("name");
  const name = nameInput.value.trim();

  if (!name) {
    showToast("error", "Nama Todo harus terisi");
    return;
  }

  const key = crypto.randomUUID();
  const res = await window.api.callApi("/api/todos", "POST", { name }, {
    headers: { 'Idempotency-key': key },
    csrfToken: window.api.csrfToken
  })

  if (res && res.status === 201) {
    nameInput.value = "";
    showToast("success", "Todo berhasil dibuat");
    await loadTodo(currentPage);
  }
}

async function toggleTodo(id, currentStatus) {
  const key = crypto.randomUUID();

  const res = await window.api.callApi(`/api/todos/${id}/toggle`
    , "PATCH",
    null, {
    headers: { 'Idempotency-key': key },
    csrfToken: window.api.csrfToken
  })

  if (res && res.status === 200) {
    showToast("success", currentStatus ? "Todo dicentang" : "Todo dikosongkan");
    await loadTodo(currentPage);
  }
}

async function loadTodo(page) {
  const list = document.getElementById("todo-list");
  list.innerHTML = '<div class="loading-text">Memuat...</div>';

  const res = await window.api.callApi(`/api/todos?page=${page}&limit=5`
    , "GET",
    null)

  if (res && res.status === 200) {
    const { data, pagination } = res.data;
    currentPage = pagination.page;

    if (data.length === 0) {
      list.innerHTML = '<div class="loading-text">Tidak ada todo list</div>';
    } else {
      list.innerHTML = data.map(renderTodo).join("");
    }

    document.getElementById("page-info").textContent =
      `${pagination.page} / ${pagination.totalPages}`;
    document.getElementById("prev-btn").disabled = pagination.page <= 1;
    document.getElementById("next-btn").disabled =
      pagination.page >= pagination.totalPages;
  }
}

async function deleteTodo(id) {
  const key = crypto.randomUUID();

  const res = await window.api.callApi(`/api/todos/${id}`
    , "DELETE",
    null, {
    headers: { 'Idempotency-key': key },
    csrfToken: window.api.csrfToken
  })

  if (res && (res.status === 200 || res.status === 204)) {
    showToast("success", "Todo berhasil dihapus");
    await loadTodo(currentPage);
  }
}
