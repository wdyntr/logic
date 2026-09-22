let isRefreshing = false
let waitingCallbacks = []

// helper untuk get csrf-token
async function fetchCsrfToken() {
    try {
        const res = await fetch('/api/auth/csrf-token', { credentials: 'include' })
        if (res.ok) return (await res.json()).csrfToken
    } catch (e) {
        console.error('fetchCsrfToken failed:', e)
    }
    return null
}

// post refresh tanpa csrf token
async function doRefresh() {
    const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
    })

    return res.ok
}

function baseUrl() {
    return (window.API_BASE_URL || document.getElementById("baseUrl")?.value || window.location.origin).replace(/\/$/, "")
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

// universal callApi
async function callApi(path, method, body, options = {}) {
    const { retry = true, headers = {}, csrfToken = null } = options
    const requestHeaders = { 'Content-Type': 'application/json', ...headers }

    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        requestHeaders['x-csrf-token'] = csrfToken
    }

    const doRequest = async () => {
        const res = await fetch(baseUrl() + path, {
            method, headers: requestHeaders, credentials: 'include',
            body: body ? JSON.stringify(body) : undefined
        })

        // PARSE RESPONSE BODY - seperti kode asli
        let data
        const contentType = res.headers.get("content-type") || ""
        if (res.status === 204) {
            data = { message: "No Content" }
        } else if (contentType.includes("application/json")) {
            data = await res.json()
        } else {
            const text = await res.text()
            data = text ? { message: text } : { message: "Response bukan JSON" }
        }

        showResult(res.status, data)  // pakai shared showResult
        return { status: res.status, data }
    }


    // first attempt
    let result = await doRequest()

    // auto refresh 
    if (result?.status === 401 && retry && !path.includes('/refresh') && !path.includes('/csrf-token')) {
        // mutex kalau ada yang request tunggu
        if (isRefreshing) {
            await new Promise((resolve, reject) => waitingCallbacks.push({ resolve, reject }))
        } else {
            isRefreshing = true
            try {
                const refreshOk = await doRefresh()
                if (!refreshOk) throw new Error('Refresh failed')

                // success ambil csrf tokenbaru
                const newCsrfToken = await fetchCsrfToken()
                if (newCsrfToken) window.api.csrfToken = newCsrfToken

                // notif semua yang nunggu 
                waitingCallbacks.forEach(({ resolve }) => resolve())
                waitingCallbacks = []
            } catch (err) {
                // fail reject semua
                waitingCallbacks.forEach(({ reject }) => reject(err))
                waitingCallbacks = []
                window.dispatchEvent(new CustomEvent('auth:expired'))
                window.location.href = '/auth'
                throw err
            } finally {
                isRefreshing = false
            }
        }
        // retry request asli with new token
        result = await doRequest()
    }
    return result
}

window.api = { callApi, fetchCsrfToken, csrfToken: null, baseUrl, showResult }