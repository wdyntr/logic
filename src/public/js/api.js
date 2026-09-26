let isRefreshing = false
let waitingCallbacks = []

// helper untuk get csrf-token
async function fetchCsrfToken() {
    try {
        const res = await fetch(baseUrl() + '/api/auth/csrf-token', { credentials: 'include' })
        if (res.ok) return (await res.json()).csrfToken
    } catch (e) {
        console.error('fetchCsrfToken failed:', e)
    }
    return null
}

// post refresh tanpa csrf token
async function doRefresh() {
    const res = await fetch(baseUrl() + '/api/auth/refresh', {
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
    const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
    const skipRetry = path.includes('/refresh') || path.includes('/csrf-token')
    const requestHeaders = { 'Content-Type': 'application/json', ...headers }

    if (csrfToken && isMutating) {
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

    let result = await doRequest()
    let hasRefreshed = false

    // max 2 iterasi: [normal] atau [refresh → retry]
    for (let i = 0; i < 2; i++) {

        // HANDLE 403: CSRF INVALID → FETCH TOKEN BARU → RETRY (ONCE)
        if (result?.status === 403 && retry && isMutating && !skipRetry) {
            const newCsrfToken = await fetchCsrfToken()
            if (!newCsrfToken) break
            window.api.csrfToken = newCsrfToken
            requestHeaders['x-csrf-token'] = newCsrfToken
            result = await doRequest()
            continue  // re-check status dari atas
        }

        // HANDLE 401: ACCESS TOKEN EXPIRED → REFRESH → RETRY (ONCE)
        if (result?.status === 401 && retry && !hasRefreshed && !skipRetry) {
            hasRefreshed = true

            if (isRefreshing) {
                await new Promise((resolve, reject) => waitingCallbacks.push({ resolve, reject }))
                requestHeaders['x-csrf-token'] = window.api.csrfToken
            } else {
                isRefreshing = true
                try {
                    const refreshOk = await doRefresh()
                    if (!refreshOk) throw new Error('Refresh failed')

                    const newCsrfToken = await fetchCsrfToken()
                    if (newCsrfToken) {
                        window.api.csrfToken = newCsrfToken
                        requestHeaders['x-csrf-token'] = newCsrfToken
                    }

                    waitingCallbacks.forEach(({ resolve }) => resolve())
                    waitingCallbacks = []
                } catch (err) {
                    waitingCallbacks.forEach(({ reject }) => reject(err))
                    waitingCallbacks = []
                    window.dispatchEvent(new CustomEvent('auth:expired'))
                    const goingToAuth = window.location.pathname !== '/auth'
                    if (goingToAuth) sessionStorage.setItem('auth_notice', 'Silakan login terlebih dahulu')
                    window.dispatchEvent(new CustomEvent('auth:expired'))
                    if (goingToAuth) window.location.href = '/auth'
                    throw err
                } finally {
                    isRefreshing = false
                }
            }
            requestHeaders['x-csrf-token'] = window.api.csrfToken
            result = await doRequest()
            continue  // re-check status dari atas → 403 auto ke-handle
        }

        break  // status selain 401/403 → selesai
    }

    return result
}

window.api = { callApi, fetchCsrfToken, csrfToken: null, baseUrl, showResult }
