const API_URL = window.location.origin;
document.getElementById("apiUrl").textContent = API_URL;

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const dzText = document.getElementById("dzText");
const filehint = document.getElementById("filehint");
const processBtn = document.getElementById("processBtn");
const successMsg = document.getElementById("successMsg");
const errorMsg = document.getElementById("errorMsg");
const tableRow = document.getElementById("tableRow");
const tableSelect = document.getElementById("tableSelect");

const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatHint = document.getElementById("chatHint");

let selectedFile = null;
let currentRunId = null;
let chatHistory = [];

function isValidFile(f) {
  return f && /\.(csv|xlsx|xls|db|sqlite|sqlite3)$/i.test(f.name);
}

function isDbFile(f) {
  return f && /\.(db|sqlite|sqlite3)$/i.test(f.name);
}

async function pickFile(f) {
  hideMessages();
  if (!isValidFile(f)) {
    showError("Please choose a CSV, Excel (.xlsx/.xls), or SQLite (.db/.sqlite) file.");
    return;
  }
  selectedFile = f;
  dzText.textContent = f.name;
  filehint.textContent = `${(f.size / 1024).toFixed(1)} KB — click or drop to replace`;
  processBtn.disabled = false;

  tableRow.style.display = "none";
  tableSelect.innerHTML = "";
  if (isDbFile(f)) {
    await loadTables(f);
  }
}

async function loadTables(f) {
  const form = new FormData();
  form.append("file", f);
  try {
    const res = await fetch(`${API_URL}/tables`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await res.text().catch(() => "Failed to list tables"));
    const data = await res.json();
    tableSelect.innerHTML = data.tables.map((t) => `<option value="${t}">${t}</option>`).join("");
    tableRow.style.display = data.tables.length ? "flex" : "none";
  } catch (err) {
    showError(err.message || "Could not read tables from the database file.");
  }
}

function hideMessages() {
  successMsg.style.display = "none";
  errorMsg.style.display = "none";
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => pickFile(e.target.files[0]));

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("drag");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag");
  pickFile(e.dataTransfer.files[0]);
});

processBtn.addEventListener("click", async () => {
  if (!selectedFile) return;
  hideMessages();
  processBtn.disabled = true;
  processBtn.textContent = "Processing…";

  const mode = document.getElementById("mode").value;
  const horizonValue = Number(document.getElementById("horizonValue").value) || 2;
  const horizonUnit = document.getElementById("horizonUnit").value;
  const horizonParamName = horizonUnit === "days" ? "periods" : horizonUnit;
  const params = new URLSearchParams({ mode, [horizonParamName]: horizonValue });
  if (isDbFile(selectedFile) && tableSelect.value) {
    params.set("table", tableSelect.value);
  }

  const form = new FormData();
  form.append("file", selectedFile);

  try {
    const res = await fetch(`${API_URL}/process?${params.toString()}`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Server responded with ${res.status}`);
    }

    currentRunId = res.headers.get("X-Run-Id");
    chatHistory = [];
    chatLog.innerHTML = "";
    if (currentRunId) {
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatHint.textContent = "Ask anything about this dataset's trends, risks, or recommendations.";
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_scientist_ai_results.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    successMsg.style.display = "block";
  } catch (err) {
    showError(err.message || "Something went wrong while processing the file.");
  } finally {
    processBtn.disabled = false;
    processBtn.textContent = "Process & Download";
  }
});

function addChatMessage(role, text) {
  const div = document.createElement("div");
  div.className = `chatMsg ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendChat() {
  const message = chatInput.value.trim();
  if (!message || !currentRunId) return;

  addChatMessage("user", message);
  chatInput.value = "";
  chatSend.disabled = true;
  chatInput.disabled = true;

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ run_id: currentRunId, message, history: chatHistory }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    addChatMessage("assistant", data.reply);
    chatHistory.push({ role: "user", content: message });
    chatHistory.push({ role: "assistant", content: data.reply });
  } catch (err) {
    addChatMessage("assistant", `Error: ${err.message || "something went wrong"}`);
  } finally {
    chatSend.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

chatSend.addEventListener("click", sendChat);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChat();
});
