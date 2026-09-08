let currentPage = 1;

document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

window.addEventListener("DOMContentLoaded", async () => {
  setupEventDelegation();
  await loadTodo(1);
});

function baseUrl() {
  return (
    window.API_BASE_URL || document.getElementById("baseUrl").value
  ).replace(/\/$/, "");
}

function showResult(status, data) {
  document.getElementById("status").textContent = "Status: " + status;
  try {
    document.getElementById("output").textContent = JSON.stringify(
      data,
      null,
      2,
    );
  } catch {
    document.getElementById("output").textContent = String(data);
  }
}

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

async function callApi(path, method, body, options = {}) {
  const { retry = true, headers = {} } = options;
  const requestHeaders = { "Content-Type": "application/json", ...headers };

  try {
    const res = await fetch(baseUrl() + path, {
      method,
      headers: requestHeaders,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    const contentType = res.headers.get("content-type") || "";

    if (res.status === 204) {
      data = { message: "No Content" };
    } else if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = text ? { message: text } : { message: "Response bukan JSON" };
    }

    showResult(res.status, data);
    return { status: res.status, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan";
    showResult("ERROR", { message });
    return null;
  }
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
  const res = await callApi(
    "/api/todos",
    "POST",
    { name },
    {
      headers: { "Idempotency-key": key },
    },
  );

  if (res && res.status === 201) {
    nameInput.value = "";
    showToast("success", "Todo berhasil dibuat");
    await loadTodo(currentPage);
  }
}

async function toggleTodo(id, currentStatus) {
  const key = crypto.randomUUID();
  const res = await callApi(
    `/api/todos/${id}/toggle`,
    "PATCH",
    {},
    {
      headers: { "Idempotency-key": key },
    },
  );

  if (res && res.status === 200) {
    showToast("success", currentStatus ? "Todo dicentang" : "Todo dikosongkan");
    await loadTodo(currentPage);
  }
}

async function loadTodo(page) {
  const list = document.getElementById("todo-list");
  list.innerHTML = '<div class="loading-text">Memuat...</div>';

  const res = await callApi(`/api/todos?page=${page}&limit=5`, "GET");
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
  const res = await callApi(`/api/todos/${id}`, "DELETE", undefined, {
    headers: { "Idempotency-key": key },
  });

  if (res && (res.status === 200 || res.status === 204)) {
    showToast("success", "Todo berhasil dihapus");
    await loadTodo(currentPage);
  }
}
