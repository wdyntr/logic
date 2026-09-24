export function showToast(type, message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("animationend", () => toast.remove());
    }, 3000);
}

export function withLoading(buttonSelector, asyncFn, options = {}) {
    return async function(...args) {
        const btn = document.querySelector(buttonSelector);
        if (!btn) return;
        btn.disabled = true;
        try {
            return await asyncFn(...args);
        } catch (error) {
            showToast("error", options.errorMsg || error.message || "Gagal");
            throw error;
        } finally {
            btn.disabled = false;
        }
    };
}
