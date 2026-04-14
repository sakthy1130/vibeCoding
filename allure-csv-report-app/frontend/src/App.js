import React, { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setReportUrl(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("http://localhost:5001/upload", formData);
      setReportUrl(res.data.reportUrl);
    } catch (err) {
      setError(err.response?.data || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-header-logo">
            <img src="/almosafer-logo.svg" alt="Almosafer" className="logo-img" />
          </div>
          <div className="app-header-title">
            <h1>Allure Report Viewer</h1>
          </div>
        </div>
        <div className="app-header-right">
          <button className="settings-btn" title="Settings">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-container">

        {/* Upload Card */}
        <div className="upload-card">
          <h2>Generate Allure Report</h2>
          <p>Upload your CSV test results file to generate an interactive Allure report.</p>

          <form onSubmit={handleUpload}>
            <div className={`upload-zone ${file ? "has-file" : ""}`}>
              <div className="upload-zone-icon">&#128196;</div>
              <div className="upload-zone-text">
                Drag & drop your CSV file here, or <strong>browse</strong>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setReportUrl(null);
                  setError(null);
                }}
              />
            </div>

            {file && (
              <div className="file-info">
                <span className="file-info-icon">&#128206;</span>
                <span className="file-info-name">{file.name}</span>
                <span style={{ color: "#999", fontSize: "13px" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  className="file-info-remove"
                  onClick={() => setFile(null)}
                >
                  &times;
                </button>
              </div>
            )}

            <button
              type="submit"
              className={`upload-btn ${loading ? "loading" : ""}`}
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating Report...
                </>
              ) : (
                "Upload & Generate Report"
              )}
            </button>
          </form>

          {error && <div className="error-msg">{error}</div>}
        </div>

        {reportUrl && (
          <div className="report-card">
            <div className="success-icon">&#9989;</div>
            <h3>Report Generated Successfully</h3>
            <p>Your Allure report is ready to view.</p>
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="report-link"
            >
              View Allure Report &rarr;
            </a>
          </div>
        )}
      </main>

      <footer className="app-footer">
        &copy; 2026 Almosafer Quality &middot; CSV to Allure Report Generator
      </footer>
    </div>
  );
}