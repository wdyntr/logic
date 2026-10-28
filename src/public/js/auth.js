import { showToast } from "./ui.js";

let loginKey = null;
let registerKey = null;
document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

window.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener("auth:expired", () => {
    loginKey = null;
    registerKey = null;
    document.getElementById("active-user").textContent = "Belum Login";
  });

  const notice = sessionStorage.getItem("auth_notice");
  if (notice) {
    showToast("info", notice);
    sessionStorage.removeItem("auth_notice");
  }

  await checkMe();
});

async function checkMe() {
  try {
    const userEl = document.getElementById("active-user");
    userEl.textContent = "Memuat...";

    const result = await window.api.callApi("/api/auth/me", "GET", null);

    if (result && result.status === 200) {
      userEl.textContent = `${result.data.user.name} (${result.data.user.email})`;
    } else if (result && result.status === 401) {
      userEl.textContent = "Belum Login";
    } else {
      userEl.textContent = "Error memuat user!";
    }
  } catch (err) {
    userEl.textContent = "Error memuat user!";
  }
}

async function register() {
  const btn = document.getElementById("register-btn");

  try {
    btn.disabled = true;

    const body = {
      name: document.getElementById("reg_name").value,
      email: document.getElementById("reg_email").value,
      password: document.getElementById("reg_password").value,
    };

    registerKey = crypto.randomUUID();

    const res = await window.api.callApi("/api/auth/register", "POST", body, {
      headers: { "Idempotency-key": registerKey },
      csrfToken: window.api.csrfToken,
    });

    if (res && res.status === 201) {
      document.getElementById("active-user").textContent =
        `${res.data.user.name} (${res.data.user.email})`;
      window.api.csrfToken = await window.api.fetchCsrfToken();
    } else {
      document.getElementById("active-user").textContent = "Belum Login";
      showToast("error", res.data?.message);
    }
  } catch (err) {
    document.getElementById("active-user").textContent = "Belum Login";
    showToast("error", err.message);
  } finally {
    registerKey = null;
    btn.disabled = false;
  }
}

async function login() {
  const btn = document.getElementById("login-btn");
  try {
    btn.disabled = true;
    const body = {
      email: document.getElementById("login_email").value,
      password: document.getElementById("login_password").value,
    };

    loginKey = crypto.randomUUID();

    const res = await window.api.callApi("/api/auth/login", "POST", body, {
      headers: { "Idempotency-key": loginKey },
      csrfToken: window.api.csrfToken,
    });

    if (res && res.status === 200) {
      document.getElementById("active-user").textContent =
        `${res.data.user.name} (${res.data.user.email})`;
      window.api.csrfToken = await window.api.fetchCsrfToken();
    } else {
      document.getElementById("active-user").textContent = "Belum Login";
      showToast("error", res.data?.message);
    }
  } catch (err) {
    document.getElementById("active-user").textContent = "Belum Login";
    showToast("error", err.message);
  } finally {
    loginKey = null;
    btn.disabled = false;
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
  try {
    const key = crypto.randomUUID();
    const body = {};
    const name = document.getElementById("upd_name").value;
    const email = document.getElementById("upd_email").value;
    const currentPass = document.getElementById("upd_current_password").value;
    const newPass = document.getElementById("upd_new_password").value;

    if (name) body.name = name;
    if (email) body.email = email;
    if (newPass) {
      body.password = newPass;
      body.currentPass = currentPass;
    }

    if (Object.keys(body).length === 0) return;
    const res = await window.api.callApi("/api/auth/me", "PATCH", body, {
      headers: { "Idempotency-key": key },
      csrfToken: window.api.csrfToken,
    });

    if (res && res.status === 200) {
      showToast("success", "Update profile Berhasil");
    } else {
      showToast("error", res.data?.message || "Update profile failed");
    }
  } catch (err) {
    showToast("error", err.message || "Update profile failed");
  }
}

window.register = register;
window.login = login;
window.toggleEditProfile = toggleEditProfile;
window.updateProfile = updateProfile;
