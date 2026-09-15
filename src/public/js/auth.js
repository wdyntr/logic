let csrfToken = null;
let loginKey = null;
let registerKey = null;

window.addEventListener("DOMContentLoaded", async () => {
  await checkMe();
});

document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

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

async function callApi(path, method, body, options = {}) {
  const { retry = true, headers = {} } = options
  const requestHeaders = { "Content-Type": "application/json", ...headers };

  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && csrfToken) {
    requestHeaders["x-csrf-token"] = csrfToken;
  }

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

async function register() {
  const btn = document.getElementById("register-btn");
  btn.disabled = true;  // disable

  const body = {
    name: document.getElementById("reg_name").value,
    email: document.getElementById("reg_email").value,
    password: document.getElementById("reg_password").value,
  };

  registerKey = crypto.randomUUID()

  const res = await callApi("/api/auth/register", "POST", body, {
    headers: { 'Idempotency-key': registerKey }
  });
  if (res && res.status === 201) {
    document.getElementById("active-user").textContent =
      `${res.data.user.name} (${res.data.user.email})`;
  } else {
    document.getElementById("active-user").textContent = "Belum Login";
  }
  registerKey = null
  btn.disabled = false;
}

async function login() {
  const btn = document.getElementById("login-btn");
  btn.disabled = true;  // disable
  const body = {
    email: document.getElementById("login_email").value,
    password: document.getElementById("login_password").value,
  };

  loginKey = crypto.randomUUID()

  const res = await callApi("/api/auth/login", "POST", body, {
    headers: { 'Idempotency-key': loginKey }
  });

  if (res && res.status === 200) {
    document.getElementById("active-user").textContent =
      `${res.data.user.name} (${res.data.user.email})`;
  } else {
    document.getElementById("active-user").textContent = "Belum Login";
  }
  loginKey = null
  btn.disabled = false
}

async function checkMe() {
  const userEl = document.getElementById("active-user");
  userEl.textContent = "Memuat...";  // Loading state

  const result = await callApi("/api/auth/me", "GET");
  if (result && result.status === 200) {
    userEl.textContent = `${result.data.user.name} (${result.data.user.email})`;
  } else if (result && result.status === 401) {
    userEl.textContent = "Belum Login";
  } else {
    userEl.textContent = "Error memuat user";  // Server error
  }
}

function toggleEditProfile() {
  const form = document.getElementById("edit-profile-form");
  const link = document.querySelector(".toggle-edit");

  if (form.style.display === "none") {
    form.style.display = "block";
    link.textContent = "Edit Profile <";
  } else {
    form.style.display = "none";
    link.textContent = "Edit Profile >";
  }
}

async function updateProfile() {
  const body = {};
  const name = document.getElementById("upd_name").value;
  const email = document.getElementById("upd_email").value;
  const currentPassword = document.getElementById("upd_current_password").value;
  const newPassword = document.getElementById("upd_new_password").value;

  if (name) body.name = name;
  if (email) body.email = email;
  if (newPassword) {
    body.password = newPassword;
    body.currentPassword = currentPassword;
  }

  if (Object.keys(body).length === 0) return;

  await callApi("/api/auth/me", "PATCH", body);
}