import { useState, useRef } from "react";

// Brand colors (mirrors App.jsx C)
const C = {
  navy: "#2D3347", cream: "#D5CFC1", gold: "#B8965A", bg: "#F5F2ED",
  text: "#1A1F2E", danger: "#DC2626", dangerBg: "#FEE2E2", success: "#059669", successBg: "#D1FAE5",
};

const API_URL = import.meta.env.VITE_DATA_SCIENTIST_API_URL || "http://localhost:8000";

export default function AdminDataScientist() {
  const [file, setFile] = useState(null);
  const [periods, setPeriods] = useState(30);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const isValidFile = (f) => f && /\.(csv|xlsx|xls)$/i.test(f.name);

  const pickFile = (f) => {
    if (!isValidFile(f)) {
      setStatus("error");
      setErrorMsg("Please choose a CSV or Excel (.xlsx/.xls) file.");
      return;
    }
    setFile(f);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_URL}/process?periods=${periods}`, {
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
      a.download = "orbit_data_scientist_results.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.message?.includes("fetch")
          ? "Could not reach the Data Scientist AI server. Make sure it's running (python server.py in data-scientist-ai/)."
          : err.message || "Something went wrong while processing the file."
      );
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 760 }}>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
        Data Scientist AI
      </h1>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>
        Upload an Excel or CSV report and get back a cleaned dataset, a forecast for enrollments / revenue /
        completion rate, a professional dashboard, and a Word report describing it all.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? C.gold : "#D1D5DB"}`,
          borderRadius: 16,
          padding: "40px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(184,150,90,0.06)" : "#fff",
          transition: "all .15s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {file ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>{file.name}</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB — click or drop to replace
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.navy }}>Click to choose or drag an Excel/CSV file here</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>.xlsx, .xls or .csv</p>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>
          Forecast days ahead:&nbsp;
          <input
            type="number"
            min={1}
            max={365}
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value) || 30)}
            style={{ width: 70, padding: "4px 8px", border: "1px solid #D1D5DB", borderRadius: 8 }}
          />
        </label>

        <button
          onClick={handleProcess}
          disabled={!file || status === "uploading"}
          style={{
            marginLeft: "auto",
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            background: !file || status === "uploading" ? "#9CA3AF" : C.gold,
            cursor: !file || status === "uploading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "uploading" ? "Processing…" : "Process & Download"}
        </button>
      </div>

      {status === "done" && (
        <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: C.successBg, color: C.success, fontSize: 13, fontWeight: 600 }}>
          Done — your dashboard.png and report.docx were downloaded as a ZIP.
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: C.dangerBg, color: C.danger, fontSize: 13, fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      <p style={{ marginTop: 28, fontSize: 12, color: "#9CA3AF" }}>
        This calls a local Data Scientist AI server. Start it once with:&nbsp;
        <code style={{ background: "#F3F4F6", padding: "2px 6px", borderRadius: 6 }}>
          cd data-scientist-ai && pip install -r requirements.txt && python server.py
        </code>
      </p>
    </div>
  );
}
