import { showToast } from "./ui.js";

let currentPage = 1;

document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

window.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener("auth:expired", () => {
    currentPage = 1;
    document.getElementById("todo-list").innerHTML = '<div class="loading-text">Session expired, silakan login</div>';
    document.getElementById("page-info").textContent = "";
    window.location.href = "/auth";
  });

  window.api.csrfToken = await window.api.fetchCsrfToken();
  setupEventDelegation();
  await loadTodo(1);
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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
  try {
    const nameInput = document.getElementById("name");
    const name = nameInput.value.trim();
    if (!name) {
      showToast("error", "Nama Todo harus terisi");
      return;
    }

    const key = crypto.randomUUID();

    let res = await window.api.callApi("/api/todos", "POST", { name }, {
      headers: { "Idempotency-key": key },
      csrfToken: window.api.csrfToken,
    });

    if (res && res.status === 201) {
      showToast("success", res.data?.message || "Todo berhasil dibuat");
      nameInput.value = "";
      await loadTodo(currentPage);
    } else {
      showToast("error", res.data?.message || "Gagal buat todo");
    }
  } catch (error) {
    showToast("error", error.message || "Todo gagal dibuat");
  }
}

async function toggleTodo(id, currentStatus) {
  try {
    const key = crypto.randomUUID();

    const res = await window.api.callApi(`/api/todos/${id}/toggle`, "PATCH", null, {
      headers: { "Idempotency-key": key },
      csrfToken: window.api.csrfToken,
    });

    if (res && res.status === 200) {
      showToast("success", currentStatus ? "Todo dicentang" : "Todo dikosongkan");
      await loadTodo(currentPage);
    } else {
      showToast("error", res.data?.message || "Gagal update todo");
    }
  } catch (error) {
    showToast("error", error.message || "Todo gagal diupdate");
  }
}

async function loadTodo(page) {
  try {
    const list = document.getElementById("todo-list");
    list.innerHTML = '<div class="loading-text">Memuat...</div>';

    const res = await window.api.callApi(`/api/todos?page=${page}&limit=5`, "GET", null);

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
    } else {
      showToast("error", res.data?.message || "Gagal load todo list");
      list.innerHTML = '<div class="loading-text">Gagal load todo list</div>';
    }
  } catch (error) {
    showToast("error", error.message || "Todo gagal loading");
  }
}

async function deleteTodo(id) {
  try {
    const key = crypto.randomUUID();

    const res = await window.api.callApi(`/api/todos/${id}`, "DELETE", null, {
      headers: { "Idempotency-key": key },
      csrfToken: window.api.csrfToken,
    });

    if (res && (res.status === 200 || res.status === 204)) {
      showToast("success", "Todo berhasil dihapus");
      await loadTodo(currentPage);
    } else {
      showToast("error", res.data?.message || "Gagal hapus todo");
    }
  } catch (error) {
    showToast("error", error.message || "Todo gagal dihapus");
  }
}

// expose ke window agar inline onclick di EJS bisa akses
window.createTodo = createTodo;
window.loadTodo = loadTodo;
window.deleteTodo = deleteTodo;
window.toggleTodo = toggleTodo;
Object.defineProperty(window, "currentPage", {
  get: () => currentPage,
  set: (v) => { currentPage = v; },
});