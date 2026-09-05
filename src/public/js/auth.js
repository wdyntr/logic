let csrfToken = null;

document.getElementById('baseUrl').value = window.API_BASE_URL || window.location.origin;

function baseUrl() {
  return (window.API_BASE_URL || document.getElementById("baseUrl").value).replace(/\/$/, "");
}

function showResult(status, data) {
  document.getElementById("status").textContent = "Status: " + status;
  try {
    document.getElementById("output").textContent = JSON.stringify(data, null, 2);
  } catch {
    document.getElementById("output").textContent = String(data);
  }
}

async function callApi(path, method, body, retry = true) {
  const headers = { "Content-Type": "application/json" };

  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && csrfToken) {
    headers["x-csrf-token"] = csrfToken;
  }

  try {
    const res = await fetch(baseUrl() + path, {
      method,
      headers,
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
  const body = {
    name: document.getElementById("reg_name").value,
    email: document.getElementById("reg_email").value,
    password: document.getElementById("reg_password").value,
  };

  const res = await callApi("/api/register", "POST", body);
  if (res && res.status === 201) {
    document.getElementById("active-user").textContent =
      `${res.data.user.name} (${res.data.user.email})`;

  } else {
    document.getElementById("active-user").textContent = "Belum Login";
  }
}

async function login() {
  const body = {
    email: document.getElementById("login_email").value,
    password: document.getElementById("login_password").value,
  };

  const res = await callApi("/api/login", "POST", body);
  if (res && res.status === 200) {
    document.getElementById("active-user").textContent =
      `${res.data.user.name} (${res.data.user.email})`;

  } else {
    document.getElementById("active-user").textContent = "Belum Login";
  }
}