const API_URL = window.location.origin;
document.getElementById("apiUrl").textContent = API_URL;

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const dzText = document.getElementById("dzText");
const filehint = document.getElementById("filehint");
const processBtn = document.getElementById("processBtn");
const successMsg = document.getElementById("successMsg");
const errorMsg = document.getElementById("errorMsg");

let selectedFile = null;

function isValidFile(f) {
  return f && /\.(csv|xlsx|xls)$/i.test(f.name);
}

function pickFile(f) {
  hideMessages();
  if (!isValidFile(f)) {
    showError("Please choose a CSV or Excel (.xlsx/.xls) file.");
    return;
  }
  selectedFile = f;
  dzText.textContent = f.name;
  filehint.textContent = `${(f.size / 1024).toFixed(1)} KB — click or drop to replace`;
  processBtn.disabled = false;
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
  const horizonParam = horizonUnit === "quarters" ? `quarters=${horizonValue}` : `periods=${horizonValue}`;
  const form = new FormData();
  form.append("file", selectedFile);

  try {
    const res = await fetch(`${API_URL}/process?mode=${mode}&${horizonParam}`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Server responded with ${res.status}`);
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
