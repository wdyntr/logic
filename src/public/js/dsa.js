import { showToast, withLoading } from "./ui.js";

document.getElementById("baseUrl").value =
  window.API_BASE_URL || window.location.origin;

window.addEventListener("DOMContentLoaded", async () => {
    window.addEventListener("auth:expired", () => {
        showToast("warning", "Session expired, silakan login ulang");
        window.location.href = "/auth"
    });
});

const handleResponse = (res, successMsg, errorPrefix = "Gagal") => {
    if (res && res.status >= 200 && res.status < 300) {
        showToast("success", successMsg);
        return true;
    } else {
        showToast("error", res?.data?.message || `${errorPrefix} (${res?.status || "Unknown"})`);
        return false;
    }
};

async function countDuplikat() {
    const dsa = document.getElementById("dsa_name");
    const listDsa = dsa.value.split(",").map((s) => s.trim());

    const res = await window.api.callApi("/api/dsa", "POST", { data: listDsa });

    if (handleResponse(res, "Count duplikat berhasil")) {
        dsa.value = "";
    }
}

async function countStatus() {
    const res = await window.api.callApi("/api/dsa", "GET", null);
    handleResponse(res, "Count status berhasil");
}

function toggleSection(id) {
    const el = document.getElementById(id);
    const icon = el.previousElementSibling.querySelector(".toggle-icon");
    el.classList.toggle("hidden");
    icon.classList.toggle("collapsed");
}

const queue = withLoading(".queueButton", async () => {
    const message = document.getElementById("queue_name");
    const res = await window.api.callApi("/api/dsa/queue", "POST", { message: message.value });
    if (handleResponse(res, "Antrian berhasil ditambahkan")) {
        message.value = "";
    }
});

const queueNext = withLoading(".processButton", async () => {
    const res = await window.api.callApi("/api/dsa/dequeue", "POST", null);
    handleResponse(res, "Status antrian berhasil dicek");
});

const queueCheck = withLoading(".checkButton", async () => {
    const res = await window.api.callApi("/api/dsa/peek", "GET", null);
    handleResponse(res, "Berhasil menampilkan first queue");
});

const pushStack = withLoading(".pushButton", async () => {
    const data = document.getElementById("stack_name");
    const res = await window.api.callApi("/api/dsa/push", "POST", { data: data.value });
    if (handleResponse(res, "Berhasil menambahkan Stack")) {
        data.value = "";
    }
});

const popStack = withLoading(".popButton", async () => {
    const res = await window.api.callApi("/api/dsa/pop", "POST", null);
    handleResponse(res, "Berhasil menghapus last Stack");
});

const topStack = withLoading(".topButton", async () => {
    const res = await window.api.callApi("/api/dsa/top", "GET", null);
    handleResponse(res, "Berhasil menampilkan last Stack");
});

const snapshotStack = withLoading(".snapshotButton", async () => {
    const res = await window.api.callApi("/api/dsa/snapshot", "GET", null);
    handleResponse(res, "Berhasil menampilkan list Stack");
});

const appendList = withLoading(".appendList", async () => {
    const data = document.getElementById("append_name");
    const res = await window.api.callApi("/api/dsa/append", "POST", { data: data.value });
    if (handleResponse(res, "Berhasil menambahkan node list")) {
        data.value = "";
    }
});

const prependList = withLoading(".prependList", async () => {
    const data = document.getElementById("prepend_name");
    const res = await window.api.callApi("/api/dsa/prepend", "POST", { data: data.value });
    if (handleResponse(res, "Berhasil menambahkan node sebagai first list")) {
        data.value = "";
    }
});

const deleteList = withLoading(".deleteList", async () => {
    const data = document.getElementById("delete_name");
    const res = await window.api.callApi("/api/dsa/drop", "POST", { data: data.value });
    if (handleResponse(res, "Berhasil menghapus node dari list")) {
        data.value = "";
    }
});

const findList = withLoading(".findList", async () => {
    const data = document.getElementById("find_name");
    const res = await window.api.callApi("/api/dsa/find", "POST", { data: data.value });
    handleResponse(res, "Node berhasil ditemukan");
});

const toArray = withLoading(".toArray", async () => {
    const res = await window.api.callApi("/api/dsa/toArray", "GET", null);
    handleResponse(res, "Node list berhasil ditampilkan");
});

const getSize = withLoading(".getSize", async () => {
    const res = await window.api.callApi("/api/dsa/size", "GET", null);
    handleResponse(res, "Count node berhasil");
});

const bubbleSort = withLoading(".bubbleSort", async () => {
    const data = document.getElementById("bubble_name");
    const listSort = data.value.split(",").map((s) => Number(s.trim()));
    const res = await window.api.callApi("/api/dsa/sort/bubble", "POST", { data: listSort });
    if (handleResponse(res, "Bubble sort berhasil")) {
        data.value = "";
    }
});

const selectionSort = withLoading(".selectionSort", async () => {
    const data = document.getElementById("selection_name");
    const listSort = data.value.split(",").map((s) => Number(s.trim()));
    const res = await window.api.callApi("/api/dsa/sort/selection", "POST", { data: listSort });
    if (handleResponse(res, "Selection sort berhasil")) {
        data.value = "";
    }
});

// expose ke window agar inline onclick di EJS bisa akses
window.countDuplikat = countDuplikat;
window.countStatus = countStatus;
window.toggleSection = toggleSection;
window.queue = queue;
window.queueNext = queueNext;
window.queueCheck = queueCheck;
window.pushStack = pushStack;
window.popStack = popStack;
window.topStack = topStack;
window.snapshotStack = snapshotStack;
window.appendList = appendList;
window.prependList = prependList;
window.deleteList = deleteList;
window.findList = findList;
window.toArray = toArray;
window.getSize = getSize;
window.bubbleSort = bubbleSort;
window.selectionSort = selectionSort;