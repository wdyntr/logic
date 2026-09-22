window.addEventListener("DOMContentLoaded", async () => {

    window.addEventListener('auth:expired', () => {
        // DSA tidak butuh redirect wajib (data in-memory, bukan per-user)
        // Tapi bisa show notif
        showToast("warning", "Session expired, silakan login ulang")
    })
})

async function countDuplikat() {
    const btn = document.querySelector(".dsaButton");
    btn.disabled = true;

    const dsa = document.getElementById("dsa_name");
    const listDsa = dsa.value.split(",").map(s => s.trim())

    const res = await window.api.callApi("/api/dsa", "POST", { data: listDsa },)

    if (res && res.status === 200) {
        dsa.value = "";
        showToast("success", "Count duplikat berhasil");
    }

    btn.disabled = false;
}

async function countStatus() {
    const btn = document.querySelector(".dbDsaButton");
    btn.disabled = true;

    const res = await window.api.callApi("/api/dsa", "GET", null,)

    if (res && res.status === 200) {
        showToast("success", "Count status berhasil");
    }

    btn.disabled = false;
}


function toggleSection(id) {
    const el = document.getElementById(id);
    const icon = el.previousElementSibling.querySelector(".toggle-icon");
    el.classList.toggle("hidden");
    icon.classList.toggle("collapsed");
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

async function queue() {
    const btn = document.querySelector(".queueButton");
    btn.disabled = true;  // disable

    const message = document.getElementById("queue_name");

    const res = await window.api.callApi("/api/dsa/queue", "POST", { message: message.value },)

    if (res && res.status === 201) {
        message.value = "";
        showToast("success", "Antrian berhasil ditambahkan");
    }

    btn.disabled = false;
}

async function queueNext() {
    const btn = document.querySelector(".processButton");
    btn.disabled = true;  // disable

    const res = await window.api.callApi("/api/dsa/dequeue", "POST", null,)

    if (res && res.status === 200) {
        showToast("success", "Status antrian berhasil dicek");
    }

    btn.disabled = false;
}

async function queueCheck() {
    const btn = document.querySelector(".checkButton");
    btn.disabled = true;  // disable

    const res = await window.api.callApi("/api/dsa/peek", "GET", null,)

    if (res && res.status === 200) {
        showToast("success", "Berhasil menampilkan first queue");
    }

    btn.disabled = false;
}

// ===================== Stack
async function pushStack() {
    const btn = document.querySelector(".pushButton");
    btn.disabled = true;  // disable

    const data = document.getElementById("stack_name");

    const res = await window.api.callApi("/api/dsa/push", "POST", { data: data.value },)

    if (res && res.status === 201) {
        showToast("success", "Berhasil menambahkan Stack");
    }

    btn.disabled = false;
}

async function popStack() {
    const btn = document.querySelector(".popButton");
    btn.disabled = true;  // disable

    const res = await window.api.callApi("/api/dsa/pop", "POST", null)

    if (res && res.status === 200) {
        showToast("success", "Berhasil menghapus last Stack");
    }

    btn.disabled = false;
}

async function topStack() {
    const btn = document.querySelector(".topButton");
    btn.disabled = true;  // disable

    const res = await window.api.callApi("/api/dsa/top", "GET", null)

    if (res && res.status === 200) {
        showToast("success", "Berhasil menampilkan last Stack");
    }

    btn.disabled = false;
}

async function snapshotStack() {
    const btn = document.querySelector(".snapshotButton");
    btn.disabled = true;  // disable

    const res = await window.api.callApi("/api/dsa/snapshot", "GET", null)

    if (res && res.status === 200) {
        showToast("success", "Berhasil menampilkan list Stack");
    }

    btn.disabled = false;
}

// =================== Linked list
async function appendList() {
    const btn = document.querySelector('.appendList')
    btn.disabled = true

    const data = document.getElementById('append_name')

    const res = await window.api.callApi("/api/dsa/append", "POST", { data: data.value })

    if (res && res.status === 201) {
        showToast("success", "Berhasil menambahkan node list");
    }

    btn.disabled = false;
}

async function prependList() {
    const btn = document.querySelector('.prependList')
    btn.disabled = true

    const data = document.getElementById('prepend_name')
    const res = await window.api.callApi("/api/dsa/prepend", "POST", { data: data.value })

    if (res && res.status === 201) {
        showToast("success", "Berhasil menambahkan node sebagai first list");
    }

    btn.disabled = false;
}

async function deleteList() {
    const btn = document.querySelector('.deleteList')
    btn.disabled = true

    const data = document.getElementById('delete_name')

    const res = await window.api.callApi("/api/dsa/drop", "POST", { data: data.value })

    if (res && res.status === 200) {
        showToast("success", "Berhasil menghapus node dari list");
    }

    btn.disabled = false;
}

async function findList() {
    const btn = document.querySelector('.findList')
    btn.disabled = true

    const data = document.getElementById('find_name')

    const res = await window.api.callApi("/api/dsa/find", "POST", { data: data.value })

    if (res && res.status === 200) {
        showToast("success", "Node berhasil ditemukan");
    }

    btn.disabled = false;
}

async function toArray() {
    const btn = document.querySelector('.toArray')
    btn.disabled = true
    const res = await window.api.callApi("/api/dsa/toArray", "GET", null)

    if (res && res.status === 200) {
        showToast("success", "Node list berhasil ditampilkan");
    }

    btn.disabled = false;
}

async function getSize() {
    const btn = document.querySelector('.getSize')
    btn.disabled = true

    const res = await window.api.callApi("/api/dsa/size", "GET", null)

    if (res && res.status === 200) {
        showToast("success", "Count node berhasil");
    }

    btn.disabled = false;
}

// bubble sort
async function bubbleSort() {
    const btn = document.querySelector('.bubbleSort')
    btn.disabled = true

    const data = document.getElementById('bubble_name')
    const listSort = data.value.split(",").map(s => Number(s.trim()))

    const res = await window.api.callApi("/api/dsa/sort/bubble", "POST", { data: listSort })

    if (res && res.status === 200) {
        showToast("success", "Bubble sort berhasil");
    }

    btn.disabled = false;
}

async function selectionSort() {
    const btn = document.querySelector('.selectionSort')
    btn.disabled = true

    const data = document.getElementById('selection_name')
    const listSort = data.value.split(",").map(s => Number(s.trim()))

    const res = await window.api.callApi("/api/dsa/sort/selection", "POST", { data: listSort })

    if (res && res.status === 200) {
        showToast("success", "Selection sort berhasil");
    }

    btn.disabled = false;
}