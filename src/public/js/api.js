let isRefreshing = false;
let waitingCallbacks = [];

async function fetchCsrfToken() {
  try {
    const res = await fetch(baseUrl() + `/api/auth/csrf-token`, {
      credentials: "include",
    });
    if (res.ok) return (await res.json()).csrfToken;
  } catch (e) {
    console.error("fetchCsrfToken failed: ", e);
  }
  return null;
}

async function doRefresh() {
  const res = await fetch(baseUrl() + "/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  return res.ok;
}

function baseUrl() {
  return (
    window.API_BASE_URL ||
    document.getElementById("baseUrl")?.value ||
    window.location.origin
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
  const { retry = true, headers = {}, csrfToken = null } = options;
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const skipRetry = path.includes("/refresh") || path.includes("/csrf-token");
  const requestHeaders = { "Content-Type": "application/json", ...headers };

  if (csrfToken && isMutating) {
    requestHeaders["x-csrf-token"] = csrfToken;
  }

  const doRequest = async () => {
    const res = await fetch(baseUrl() + path, {
      method,
      headers: requestHeaders,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    const contentType = res.headers.get("Content-Type") || "";
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
  };

  let result = await doRequest();
  let hasRefreshed = false;

  // untuk handle fail ada 2 iterasi
  for (let i = 0; i < 2; i++) {
    // handle csrf token invalid 403 -> fetch token baru -> retry (once)
    if (result?.status === 403 && retry && isMutating && !skipRetry) {
      const newCsrfToken = await fetchCsrfToken();
      if (!newCsrfToken) break;
      window.api.csrfToken = newCsrfToken;
      requestHeaders["x-csrf-token"] = newCsrfToken;
      result = await doRequest();
      continue;
    }

    // untuk handle access token expired 401 -> refresh -> retry (once)
    if (result?.status === 401 && retry && !hasRefreshed && !skipRetry) {
      hasRefreshed = true;

      if (isRefreshing) {
        await new Promise((resolve, reject) =>
          waitingCallbacks.push({ resolve, reject }),
        );
      } else {
        isRefreshing = true;
        try {
          const refreshOk = await doRefresh();
          if (!refreshOk) throw new Error("Refresh failed");

          const newCsrfToken = await fetchCsrfToken();
          if (newCsrfToken) {
            window.api.csrfToken = newCsrfToken;
            requestHeaders["x-csrf-token"] = newCsrfToken;
          }

          waitingCallbacks.forEach(({ resolve }) => resolve());
          waitingCallbacks = [];
        } catch (err) {
          waitingCallbacks.forEach(({ reject }) => reject(err));
          waitingCallbacks = [];

          const goingToAuth = window.location.pathname !== "/auth";
          if (goingToAuth)
            sessionStorage.setItem(
              "auth_notice",
              "Silahkan login terlebih dahulu",
            );

          window.dispatchEvent(new CustomEvent("auth:expired"));
          if (goingToAuth) window.location.href = "/auth";
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      if (window.api.csrfToken)
        requestHeaders["x-csrf-token"] = window.api.csrfToken;
      result = await doRequest();
      continue;
    }
    break;
  }
  return result;
}

window.api = { callApi, fetchCsrfToken, csrfToken: null, baseUrl, showResult };
