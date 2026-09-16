let key = null;

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

async function countDuplikat() {
    const btn = document.querySelector(".dsaButton");
    btn.disabled = true;  // disable
    key = crypto.randomUUID();

    const dsa = document.getElementById("dsa_name");
    const listDsa = dsa.value.split(",").map(s => s.trim())

    const res = await callApi(
        "/api/dsa",
        "POST",
        { data: listDsa },
        { headers: { "Idempotency-key": key }, },
    );

    if (res && res.status === 200) {
        dsa.value = "";
        showToast("success", "Count duplikat berhasil");
    }

    btn.disabled = false;
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