import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axios.js";

export default function Scanner() {
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    return () => {
      // Clean up camera on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  async function startScanning() {
    setScanning(true);
    setResult(null);
    const qr = new Html5Qrcode("qr-reader");
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          if (isProcessing.current) return; // avoid double-scanning the same frame
          isProcessing.current = true;
          await handleScanResult(decodedText);
          setTimeout(() => { isProcessing.current = false; }, 2000); // cooldown
        },
        () => {} // ignore per-frame scan failures
      );
    } catch (err) {
      setResult({ type: "error", message: "Could not access camera. Please allow camera permission." });
      setScanning(false);
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
    }
    setScanning(false);
  }

  async function handleScanResult(qrCode) {
    try {
      const { data } = await api.post("/attendance/scan", { qrCode });
      setResult({
        type: data.alreadyMarked ? "warning" : "success",
        message: data.message,
      });
    } catch (err) {
      setResult({
        type: "error",
        message: err.response?.data?.message || "Failed to mark attendance",
      });
    }
  }

  return (
    <div>
      <div className="top-bar">
        <h1>QR Attendance Scanner</h1>
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          Point the camera at a student's QR code to mark them present.
        </p>

        <div id="qr-reader"></div>

        <div style={{ marginTop: 16 }}>
          {!scanning ? (
            <button className="btn" onClick={startScanning}>Start Scanner</button>
          ) : (
            <button className="btn btn-danger" onClick={stopScanning}>Stop Scanner</button>
          )}
        </div>

        {result && (
          <div
            className={
              result.type === "success" ? "success-msg" : result.type === "warning" ? "error-msg" : "error-msg"
            }
            style={{ marginTop: 16, maxWidth: 420, marginLeft: "auto", marginRight: "auto",fontSize:"20px" }}
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}