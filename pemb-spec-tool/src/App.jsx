import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { Upload, FileText, Loader2, Download, Save, FolderOpen, AlertCircle, CheckCircle2, Building2, RefreshCw, Files, Database, ChevronDown, ChevronRight } from "lucide-react";

const SCHEMA = [
  { group: "Zoho Inquiry Link", note: "Fill these in after you create and save the Inquiry in Zoho.", fields: [
    { key: "inquiryLink", label: "Inquiry (exact name, e.g. Q26-1516 - CGCP Spec IOS Site)" },
    { key: "inquiryId", label: "Inquiry Record ID (long number at end of the inquiry's URL)" },
    { key: "buildingName", label: "Building Name (Zoho 'Name')" },
  ]},
  { group: "Project Information", note: "For the estimate PDF. Lives on the Inquiry in Zoho, not on the Building.", fields: [
    { key: "projectName", label: "Project Name" },
    { key: "jobNumber", label: "Job Number" },
    { key: "client", label: "Client / GC" },
    { key: "estimator", label: "Estimator" },
    { key: "date", label: "Date" },
    { key: "locationCity", label: "City" },
    { key: "locationState", label: "State" },
    { key: "locationZip", label: "Zip" },
  ]},
  { group: "Code & Load", fields: [
    { key: "deflections", label: "Deflections" },
    { key: "enclosure", label: "Enclosure" },
    { key: "thermalCoefficient", label: "Thermal Coefficient" },
  ]},
  { group: "Building Specifications", fields: [
    { key: "roofType", label: "Roof Type" },
    { key: "frameFinish", label: "Frame Finish" },
    { key: "purlinFinish", label: "Purlin Finish" },
    { key: "roofInsulation", label: "Roof Insulation" },
    { key: "buildingNotes", label: "Building Notes" },
    { key: "roofPanelProfile", label: "Roof Panel Profile" },
    { key: "roofPanelGauge", label: "Roof Panel Gauge" },
    { key: "roofColor", label: "Roof Color" },
    { key: "girtFinish", label: "Girt Finish" },
    { key: "wallInsulation", label: "Wall Insulation" },
    { key: "wallPanelProfile", label: "Wall Panel Profile" },
    { key: "wallPanelGauge", label: "Wall Panel Gauge" },
    { key: "wallPanelColor", label: "Wall Panel Color" },
    { key: "trimColor", label: "Trim Color" },
    { key: "foundation", label: "Foundation" },
  ]},
  { group: "Geometry", fields: [
    { key: "frameType", label: "Frame Type" },
    { key: "width", label: "Width" },
    { key: "length", label: "Length" },
    { key: "rightEWBaySpacing", label: "Right EW Bay Spacing (From FSW)" },
    { key: "leftEWBaySpacing", label: "Left EW Bay Spacing (From BSW)" },
    { key: "sidewallBaySpacing", label: "Sidewall Bay Spacing (from LEW)" },
    { key: "rightEWExpandable", label: "Right EW Expandable?" },
    { key: "leftEWExpandable", label: "Left EW Expandable?" },
    { key: "frontRoofSlope", label: "Front Roof Slope" },
    { key: "backRoofSlope", label: "Back Roof Slope" },
    { key: "ridgeOffset", label: "Ridge Offset (from BSW)" },
    { key: "bswEaveHeight", label: "BSW Eave Height" },
    { key: "fswEaveHeight", label: "FSW Eave Height" },
  ]},
  { group: "Codes and Loads", fields: [
    { key: "buildingCodes", label: "Building Codes" },
    { key: "liveLoad", label: "Live Load (PSF)" },
    { key: "deadLoad", label: "Dead Load (PSF)" },
    { key: "groundSnow", label: "Ground Snow (PSF)" },
    { key: "roofSnow", label: "Roof Snow (PSF)" },
    { key: "snowImportance", label: "Snow Importance Factor" },
    { key: "snowExposure", label: "Snow Exposure" },
    { key: "tributaryReduction", label: "Tributary Reduction?" },
    { key: "seismicImportance", label: "Seismic Importance Factor" },
    { key: "seismicDesignCategory", label: "Seismic Design Category" },
    { key: "s1", label: "S1 (1 Sec Accel)" },
    { key: "ss", label: "Ss (Short Period)" },
    { key: "seismicSiteClass", label: "Seismic Site Class (Soil)" },
    { key: "windSpeed", label: "Wind (3 sec gust) (MPH)" },
    { key: "windExposure", label: "Wind Exposure" },
    { key: "windImportance", label: "Wind Importance" },
    { key: "closureClassification", label: "Closure Classification" },
    { key: "occupancy", label: "Occupancy" },
    { key: "thermalFactor", label: "Thermal Factor" },
    { key: "collateralLoad", label: "Collateral Load (PSF)" },
    { key: "rainIntensity", label: "Rain Intensity (MSB 100yr, in/hr)" },
    { key: "adjacentBuilding", label: "Another Building within 20' of Proposed Building?" },
  ]},
  { group: "Roof Information", fields: [
    { key: "roofPurlinCondition", label: "Roof Purlin Condition" },
    { key: "purlinDepth", label: "Purlin Depth (in)" },
    { key: "purlinShape", label: "Purlin Shape" },
    { key: "purlinBraceType", label: "Purlin Brace Type" },
    { key: "purlinAttachment", label: "Purlin Attachment" },
    { key: "purlinSpacing", label: "Purlin Spacing" },
  ]},
  { group: "Sidewall Information", fields: [
    { key: "fswGirtCondition", label: "FSW Girt Condition" },
    { key: "fswGirtDepth", label: "FSW Girt Depth (in)" },
    { key: "fswGirtAttachment", label: "FSW Girt Attachment" },
    { key: "fswBaseElevation", label: "FSW Base Elevation (in) (If Not FF)" },
    { key: "fswGirtSpacing", label: "FSW Girt Spacing" },
    { key: "bswGirtCondition", label: "BSW Girt Condition" },
    { key: "bswGirtDepth", label: "BSW Girt Depth (in)" },
    { key: "bswGirtAttachment", label: "BSW Girt Attachment" },
    { key: "bswBaseElevation", label: "BSW Base Elevation (in) (If Not FF)" },
    { key: "bswGirtSpacing", label: "BSW Girt Spacing" },
    { key: "girtShape", label: "Girt Shape" },
  ]},
  { group: "Endwall Information", fields: [
    { key: "lewFrameType", label: "LEW Frame Type" },
    { key: "lewCornerType", label: "LEW Corner Type" },
    { key: "lewGirtType", label: "LEW Girt Type" },
    { key: "lewGirtDepth", label: "LEW Girt Depth (in)" },
    { key: "lewGirtSpacing", label: "LEW Girt Spacing" },
    { key: "lewGirtAttachment", label: "LEW Girt Attachment" },
    { key: "lewInset", label: "LEW Inset" },
    { key: "lewColType", label: "LEW Col. Type" },
    { key: "lewBaseElevation", label: "LEW Base Elevation (in)" },
    { key: "lewRafterType", label: "LEW Rafter Type" },
    { key: "rewFrameType", label: "REW Frame Type" },
    { key: "rewCornerType", label: "REW Corner Type" },
    { key: "rewGirtType", label: "REW Girt Type" },
    { key: "rewGirtDepth", label: "REW Girt Depth (in)" },
    { key: "rewGirtSpacing", label: "REW Girt Spacing" },
    { key: "rewGirtAttachment", label: "REW Girt Attachment" },
    { key: "rewInset", label: "REW Inset" },
    { key: "rewColType", label: "REW Col. Type" },
    { key: "rewBaseElevation", label: "REW Base Elevation (in)" },
    { key: "rewRafterType", label: "REW Rafter Type" },
  ]},
];

const ALL_FIELDS = SCHEMA.flatMap((g) => g.fields);
const ALL_KEYS = ALL_FIELDS.map((f) => f.key);
const NON_BUILDING_GROUPS = ["Zoho Inquiry Link", "Project Information"];
const BUILDING_FIELDS = SCHEMA.filter((g) => !NON_BUILDING_GROUPS.includes(g.group)).flatMap((g) => g.fields);
const ZOHO_HEADER_OVERRIDE = {
  fswBaseElevation: "FSW Base Elevation (in)  (If Not FF)",
  bswBaseElevation: "BSW Base Elevation (in)  (If Not FF)",
};
const zohoHeader = (f) => ZOHO_HEADER_OVERRIDE[f.key] || f.label;
const STORAGE_PREFIX = "pemb_project:";

function emptyData() {
  const d = {};
  ALL_KEYS.forEach((k) => (d[k] = ""));
  return d;
}
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export default function App() {
  const [data, setData] = useState(emptyData());
  const dataRef = useRef(data);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedKeys, setExtractedKeys] = useState(new Set());
  const [mergeMode, setMergeMode] = useState("fillBlanks");
  const mergeModeRef = useRef(mergeMode);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [savedList, setSavedList] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const applyData = (next) => { dataRef.current = next; setData(next); };
  const chooseMergeMode = (m) => { mergeModeRef.current = m; setMergeMode(m); };
  const setField = (k, v) => applyData({ ...dataRef.current, [k]: v });
  const flash = (msg, isErr) => { setToast({ msg, isErr }); setTimeout(() => setToast(null), 2500); };

  const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Could not read file"));
    r.readAsDataURL(file);
  });

  const buildPrompt = () => {
    const fieldList = SCHEMA.filter((g) => g.group !== "Zoho Inquiry Link")
      .map((g) => `${g.group}:\n` + g.fields.map((f) => `  - ${f.key}: ${f.label}`).join("\n"))
      .join("\n");
    return `You are an expert estimator for pre-engineered metal buildings (PEMB), structural steel, and metal panel systems. Read the attached project specification document and extract every relevant design and material value. The document may be a multi-page internal quote form with fields arranged in two columns; read all pages and all columns carefully.

Return ONLY a single JSON object (no markdown, no backticks, no preamble) with exactly these keys. For any value you cannot find, use an empty string "". Keep values exactly as written in the document, including units and dropdown selections. Ignore placeholder values like "-None-" and treat them as empty. Do not invent values.

Keys to extract:
${fieldList}

Respond with only the JSON object.`;
  };

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setErrorMsg("");
    setLastResult(null);
    setStatus("reading");
    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const lowerName = file.name.toLowerCase();
      const SUPPORTED_IMG = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const isImg = SUPPORTED_IMG.includes(file.type);
      if (!isPdf && !isImg) {
        if (file.type.startsWith("image/") || /\.(heic|heif|tif|tiff|bmp)$/i.test(lowerName)) {
          throw new Error("That image format is not supported. Use PDF, JPG, PNG, GIF, or WEBP.");
        }
        throw new Error("Please upload a PDF or a JPG/PNG/GIF/WEBP image.");
      }
          const sizeMB = file.size / (1024 * 1024);
    const MAX_MB = 24; // keeps the base64-inflated payload safely under Anthropic's ~32MB request limit
    if (sizeMB > MAX_MB) {
      throw new Error("This file is " + sizeMB.toFixed(1) + " MB. Please keep uploads under ~" + MAX_MB + " MB, or extract just the spec pages first.");
    }
    setStatus("extracting");

    const form = new FormData();
    form.append("file", file);
    form.append("mediaType", file.type);
    form.append("isPdf", String(isPdf));
    form.append("prompt", buildPrompt());

    const response = await fetch("/api/extract", {
      method: "POST",
      body: form,
    });
      if (!response.ok) {
        let detail = "";
        try { const j = await response.json(); detail = j?.error || ""; } catch {}
        if (response.status === 413) throw new Error("The server rejected the file as too large. Upload just the spec pages.");
        if (response.status === 502 || response.status === 504) throw new Error("The extraction timed out. Try a smaller file, or switch the model to Haiku in extract.js.");
        throw new Error("Extraction failed (HTTP " + response.status + ")" + (detail ? ": " + detail : ""));
      }
      const { text } = await response.json();
      const clean = (text || "").replace(/```json|```/g, "").trim();
      const start = clean.indexOf("{");
      const end = clean.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Could not read a valid response from the document.");
      const parsed = JSON.parse(clean.slice(start, end + 1));

      const mode = mergeModeRef.current;
      const base = { ...dataRef.current };
      const updated = new Set();
      let foundCount = 0, skippedCount = 0;
      ALL_KEYS.forEach((k) => {
        let val = parsed[k] != null ? String(parsed[k]).trim() : "";
        if (val === "" || /^-?none-?$/i.test(val)) return;
        foundCount += 1;
        const existing = (base[k] || "").trim();
        if (existing === "" || mode === "overwrite") {
          if (existing !== val) { updated.add(k); base[k] = val; }
        } else { skippedCount += 1; }
      });

      applyData(base);
      setExtractedKeys((prev) => new Set([...prev, ...updated]));
      setScannedFiles((prev) => (prev.includes(file.name) ? prev : [...prev, file.name]));
      setLastResult({ file: file.name, updated: updated.size, skipped: skippedCount, found: foundCount });
      setStatus("done");
    } catch (e) {
      setErrorMsg(e.message || "Something went wrong during extraction.");
      setStatus("error");
    }
  };

  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  const refreshSaved = () => {
    try {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          try { items.push({ key: k, ...JSON.parse(localStorage.getItem(k)) }); } catch {}
        }
      }
      items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
      setSavedList(items);
    } catch { setSavedList([]); }
  };
  const saveProject = () => {
    const name = data.projectName || data.buildingName || data.jobNumber || "Untitled " + new Date().toLocaleDateString();
    const id = STORAGE_PREFIX + Date.now();
    try {
      localStorage.setItem(id, JSON.stringify({ name, savedAt: Date.now(), data: dataRef.current, scannedFiles }));
      refreshSaved();
      flash("Project saved.");
    } catch { flash("Could not save.", true); }
  };
  const loadProject = (item) => {
    const merged = emptyData();
    ALL_KEYS.forEach((k) => (merged[k] = item.data?.[k] || ""));
    applyData(merged);
    setExtractedKeys(new Set());
    setScannedFiles(item.scannedFiles || []);
    setLastResult(null);
    setShowSaved(false);
  };
  const deleteProject = (key) => { try { localStorage.removeItem(key); refreshSaved(); } catch {} };

  const resetAll = () => {
    applyData(emptyData());
    setFileName(""); setStatus("idle"); setExtractedKeys(new Set());
    setScannedFiles([]); setLastResult(null); setErrorMsg("");
  };

  const downloadFile = (filename, contentStr, mime) => {
    try {
      const blob = new Blob([contentStr], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flash("Exported " + filename);
    } catch { flash("Export failed.", true); }
  };
  const baseName = () => (dataRef.current.inquiryLink || dataRef.current.buildingName || dataRef.current.jobNumber || "inquiry_building").replace(/[^a-z0-9_-]+/gi, "_");

  const exportBuildingsCSV = () => {
    const d = dataRef.current;
    const esc = (s) => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
    const cols = [
      { header: "Name", value: d.buildingName || d.projectName || "" },
      { header: "Inquiry", value: d.inquiryLink || "" },
      { header: "Inquiry.id", value: d.inquiryId || "" },
      ...BUILDING_FIELDS.map((f) => ({ header: zohoHeader(f), value: d[f.key] || "" })),
    ];
    downloadFile(baseName() + "_inquiry_building.csv", cols.map((c) => esc(c.header)).join(",") + "\n" + cols.map((c) => esc(c.value)).join(","), "text/csv");
  };
  const exportSpecList = () => {
    const d = dataRef.current;
    const esc = (s) => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
    const lines = [esc("Field") + "," + esc("Value")];
    SCHEMA.forEach((g) => {
      lines.push(esc(g.group.toUpperCase()) + ",");
      g.fields.forEach((f) => lines.push(esc(f.label) + "," + esc(d[f.key] || "")));
    });
    downloadFile(baseName() + "_spec_list.csv", lines.join("\n"), "text/csv");
  };

  const generatePDF = () => {
    const d = dataRef.current;
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 40, pageW = 612, pageH = 792, gap = 24;
      const colW = (pageW - 2 * margin - gap) / 2;
      const leftX = margin, rightX = margin + colW + gap;
      const title = d.projectName || d.buildingName || "Project Specification";
      const sub = [d.jobNumber && "Job " + d.jobNumber, d.inquiryLink, [d.locationCity, d.locationState].filter(Boolean).join(", ")].filter(Boolean).join("   |   ");
      const meta = (d.estimator ? "Estimator: " + d.estimator + "   |   " : "") + (d.client ? "Client: " + d.client + "   |   " : "") + "Generated " + new Date().toLocaleDateString();

      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(30, 58, 95);
      const titleLines = doc.splitTextToSize(title, pageW - 2 * margin);
      let hy = 52;
      titleLines.forEach((l) => { doc.text(l, margin, hy); hy += 22; });
      hy += 2;
      if (sub) { doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(90, 90, 90); doc.splitTextToSize(sub, pageW - 2 * margin).forEach((l) => { doc.text(l, margin, hy); hy += 13; }); }
      doc.setFontSize(8); doc.setTextColor(140, 140, 140); doc.splitTextToSize(meta, pageW - 2 * margin).forEach((l) => { doc.text(l, margin, hy); hy += 11; });
      doc.setDrawColor(30, 58, 95); doc.setLineWidth(2); doc.line(margin, hy, pageW - margin, hy);

      let pageTop = hy + 20, colIndex = 0, y = pageTop;
      const colX = () => (colIndex === 0 ? leftX : rightX);
      const ensureSpace = (need) => {
        if (y + need <= pageH - margin) return;
        if (colIndex === 0) { colIndex = 1; y = pageTop; }
        else { doc.addPage(); pageTop = 50; colIndex = 0; y = pageTop; }
      };
      SCHEMA.filter((g) => g.group !== "Zoho Inquiry Link").forEach((g) => {
        const rows = g.fields.filter((f) => (d[f.key] || "").trim() !== "").map((f) => ({ label: f.label, value: String(d[f.key]) }));
        if (!rows.length) return;
        ensureSpace(34);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(30, 58, 95);
        doc.text(g.group.toUpperCase(), colX(), y);
        doc.setDrawColor(205, 205, 205); doc.setLineWidth(0.5); doc.line(colX(), y + 4, colX() + colW, y + 4);
        y += 16;
        rows.forEach((r) => {
          doc.setFont("helvetica", "normal"); doc.setFontSize(8);
          const labelLines = doc.splitTextToSize(r.label, colW);
          doc.setFont("helvetica", "bold"); doc.setFontSize(9);
          const valueLines = doc.splitTextToSize(r.value, colW);
          ensureSpace(labelLines.length * 10 + valueLines.length * 11 + 7);
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 110);
          labelLines.forEach((l) => { doc.text(l, colX(), y); y += 10; });
          doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(25, 25, 25);
          valueLines.forEach((l) => { doc.text(l, colX(), y); y += 11; });
          y += 7;
        });
        y += 10;
      });
      doc.save(baseName() + "_spec_sheet.pdf");
      flash("PDF downloaded.");
    } catch (e) { flash("PDF failed: " + (e.message || "error"), true); }
  };

  const filledCount = ALL_KEYS.filter((k) => (data[k] || "").trim() !== "").length;
  const resultMessage = () => {
    if (!lastResult) return null;
    const { file, updated, skipped, found } = lastResult;
    if (updated > 0) return `Updated ${updated} field${updated === 1 ? "" : "s"} from ${file}`;
    if (found > 0 && skipped > 0) return `${file}: found ${found} value${found === 1 ? "" : "s"}, but those fields were already filled. Switch to "Overwrite existing" to replace them.`;
    return `No new values found in ${file}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 text-white p-2 rounded-lg"><Building2 size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">PEMB Spec Sheet Generator</h1>
              <p className="text-sm text-slate-500">Extract specs, build a Zoho Inquiry Building import, generate a PDF</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowSaved(true); refreshSaved(); }} className="flex items-center gap-1.5 text-sm bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50"><FolderOpen size={16} /> Saved</button>
            <button onClick={saveProject} className="flex items-center gap-1.5 text-sm bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50"><Save size={16} /> Save</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-medium text-slate-800">When a new document is scanned:</span>
          <div className="flex bg-slate-100 rounded-lg p-1 text-sm">
            <button onClick={() => chooseMergeMode("fillBlanks")} className={`px-3 py-1.5 rounded-md transition ${mergeMode === "fillBlanks" ? "bg-white shadow text-slate-800 font-medium" : "text-slate-500"}`}>Fill blanks only</button>
            <button onClick={() => chooseMergeMode("overwrite")} className={`px-3 py-1.5 rounded-md transition ${mergeMode === "overwrite" ? "bg-white shadow text-slate-800 font-medium" : "text-slate-500"}`}>Overwrite existing</button>
          </div>
        </div>

        <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 mb-4 text-center">
          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; handleFile(f); }} />
          {status === "extracting" || status === "reading" ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 className="animate-spin text-slate-700" size={28} />
              <p className="text-slate-700 font-medium">{status === "reading" ? "Reading file..." : "Extracting specs from " + fileName + "..."}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="text-slate-400" size={28} />
              <p className="text-slate-700 font-medium">{scannedFiles.length > 0 ? "Add another document, or drop one here" : "Drop a spec sheet here, or"}</p>
              <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700">{scannedFiles.length > 0 ? "Add Another Document" : "Choose PDF or Image"}</button>
              {status === "done" && (
                <p className={`text-xs flex items-center gap-1 mt-1 ${lastResult && lastResult.updated > 0 ? "text-green-600" : "text-amber-600"}`}><CheckCircle2 size={14} /> {resultMessage()}</p>
              )}
            </div>
          )}
        </div>

        {scannedFiles.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Files size={14} /> Source Documents ({scannedFiles.length})</p>
            <div className="flex flex-wrap gap-2">
              {scannedFiles.map((n, i) => (<span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1"><FileText size={12} /> {n}</span>))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 flex items-start gap-2 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div><p className="font-medium">Extraction failed</p><p>{errorMsg}</p><p className="mt-1 text-red-500">You can still fill the fields manually below.</p></div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm text-slate-500"><span className="font-semibold text-slate-700">{filledCount}</span> of {ALL_KEYS.length} fields filled{extractedKeys.size > 0 && <span className="ml-2 text-green-600">({extractedKeys.size} auto-extracted)</span>}</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={resetAll} className="flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200"><RefreshCw size={15} /> Clear</button>
            <button onClick={exportBuildingsCSV} className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-500"><Database size={15} /> Building CSV</button>
            <button onClick={exportSpecList} className="flex items-center gap-1.5 text-sm bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50"><FileText size={15} /> Spec List</button>
            <button onClick={generatePDF} className="flex items-center gap-1.5 text-sm bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"><Download size={16} /> PDF</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 mb-4">
          <button onClick={() => setShowGuide((s) => !s)} className="w-full flex items-center justify-between p-3 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2"><Database size={15} className="text-indigo-500" /> How to import into Zoho</span>
            {showGuide ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {showGuide && (
            <div className="px-4 pb-4 text-xs text-slate-600 space-y-2">
              <p>The <span className="font-semibold">Building CSV</span> uses the exact Zoho Buildings column headers, so Auto Map matches every spec field.</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Create and save the Inquiry in Zoho, then copy the long number at the end of its URL (the Inquiry record ID).</li>
                <li>Paste the Inquiry name and Inquiry Record ID here, and set a Building Name.</li>
                <li>Click Building CSV.</li>
                <li>In Zoho, open the Buildings module actions menu and choose Import.</li>
                <li>Upload, add new records, Auto Map, then map Inquiry.id to the Inquiry lookup and import.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {SCHEMA.map((g) => {
            const isLink = g.group === "Zoho Inquiry Link";
            return (
              <div key={g.group} className={`rounded-xl border p-4 ${isLink ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200"}`}>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1 flex items-center gap-2">{isLink ? <Database size={15} className="text-indigo-500" /> : <FileText size={15} className="text-slate-400" />} {g.group}</h2>
                {g.note && <p className="text-xs text-slate-500 mb-3">{g.note}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {g.fields.map((f) => {
                    const isExtracted = extractedKeys.has(f.key);
                    return (
                      <div key={f.key}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}{isExtracted && <span className="ml-1 text-green-500" title="Auto-extracted">●</span>}</label>
                        <input type="text" value={data[f.key]} onChange={(e) => setField(f.key, e.target.value)} className={`w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-slate-400 ${isExtracted ? "border-green-300 bg-green-50" : isLink ? "border-indigo-200 bg-white" : "border-slate-200 bg-white"}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-6 flex-wrap">
          <button onClick={exportBuildingsCSV} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-indigo-500"><Database size={18} /> Export Building CSV</button>
          <button onClick={exportSpecList} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-lg font-medium hover:bg-slate-50"><FileText size={18} /> Spec List</button>
          <button onClick={generatePDF} className="flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600"><Download size={18} /> Generate PDF</button>
        </div>
      </div>

      {showSaved && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50" onClick={() => setShowSaved(false)}>
          <div className="bg-white w-full max-w-sm h-full p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-800">Saved Projects</h3><button onClick={() => setShowSaved(false)} className="text-slate-400 hover:text-slate-700 text-xl">×</button></div>
            {savedList.length === 0 ? (<p className="text-sm text-slate-400">No saved projects yet.</p>) : (
              <div className="space-y-2">
                {savedList.map((item) => (
                  <div key={item.key} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0"><p className="font-medium text-sm text-slate-800 truncate">{item.name}</p><p className="text-xs text-slate-400">{new Date(item.savedAt).toLocaleString()}</p></div>
                    <div className="flex gap-1 shrink-0"><button onClick={() => loadProject(item)} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">Load</button><button onClick={() => deleteProject(item.key)} className="text-xs text-red-500 px-2 py-1 rounded hover:bg-red-50">Del</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (<div className={`fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm text-white shadow-lg z-50 ${toast.isErr ? "bg-red-600" : "bg-slate-800"}`}>{toast.msg}</div>)}
    </div>
  );
}
