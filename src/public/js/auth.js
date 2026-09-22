let loginKey = null;
let registerKey = null;

// auth.js - TAMBAHKAN di DOMContentLoaded (setelah line 8)


window.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener('auth:expired', () => {
    // Clear local state
    loginKey = null
    registerKey = null

    // Update UI
    document.getElementById("active-user").textContent = "Belum Login"

    // Redirect ke halaman login (SPA style atau full reload)
    window.location.href = '/auth'
  })

  window.api.csrfToken = await window.api.fetchCsrfToken()

  await checkMe();
});


async function register() {
  try {
    const btn = document.getElementById("register-btn");
    btn.disabled = true;  // disable

    const body = {
      name: document.getElementById("reg_name").value,
      email: document.getElementById("reg_email").value,
      password: document.getElementById("reg_password").value,
    };

    registerKey = crypto.randomUUID()

    const res = await window.api.callApi("/api/auth/register", "POST", body, {
      headers: { 'Idempotency-key': registerKey },
      csrfToken: window.api.csrfToken
    })

    if (res && res.status === 201) {
      document.getElementById("active-user").textContent =
        `${res.data.user.name} (${res.data.user.email})`;
    } else {
      document.getElementById("active-user").textContent = "Belum Login";
    }
  } catch (err) {
    // Network error - callApi sudah showResult("ERROR", ...)
    document.getElementById("active-user").textContent = "Belum Login";
  } finally {
    registerKey = null
    btn.disabled = false;
  }

}

async function login() {
  try {
    const btn = document.getElementById("login-btn");
    btn.disabled = true;  // disable
    const body = {
      email: document.getElementById("login_email").value,
      password: document.getElementById("login_password").value,
    };

    loginKey = crypto.randomUUID()



    const res = await window.api.callApi("/api/auth/login", "POST", body, {
      headers: { 'Idempotency-key': loginKey },
      csrfToken: window.api.csrfToken
    })

    if (res && res.status === 200) {
      document.getElementById("active-user").textContent =
        `${res.data.user.name} (${res.data.user.email})`;
    } else {
      document.getElementById("active-user").textContent = "Belum Login";
    }
    loginKey = null
    btn.disabled = false
  } catch (err) {
    document.getElementById("active-user").textContent = "Belum Login";
  } finally {
    loginKey = null
    btn.disabled = false
  }


}

async function checkMe() {
  try {
    const userEl = document.getElementById("active-user");
    userEl.textContent = "Memuat...";  // Loading state


    const result = await window.api.callApi("/api/auth/me", "GET", null, { csrfToken: window.api.csrfToken }
    )

    if (result && result.status === 200) {
      userEl.textContent = `${result.data.user.name} (${result.data.user.email})`;
    } else if (result && result.status === 401) {
      userEl.textContent = "Belum Login";
    } else {
      userEl.textContent = "Error memuat user";  // Server error
    }
  } catch (err) {
    userEl.textContent = "Error memuat user";
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

    await window.api.callApi("/api/auth/me", "PATCH", body, { csrfToken: window.api.csrfToken })
  } catch (error) {
    console.error('Update profile failed:', error)
  }
}