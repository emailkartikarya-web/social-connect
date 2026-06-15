import { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email: email.trim() });
      await Swal.fire({
        icon: "success",
        title: "Reset Link Sent",
        text: res.data.message,
      });
      setSent(true);
      setEmail("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* glow blobs */}
      <div style={{
        position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%)",
        top: "-80px", left: "-80px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        bottom: "-60px", right: "-40px", pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        position: "relative",
      }}>
        {/* SC wordmark above card */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "44px", height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "17px", fontWeight: "800", color: "white",
            boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            marginBottom: "8px",
          }}>SC</div>
          <p style={{ color: "#10b981", fontSize: "11px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            Social Connect HRMS
          </p>
        </div>

        <div style={{
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        }}>
          {/* teal top bar */}
          <div style={{ height: "4px", background: "linear-gradient(90deg, #10b981, #059669)" }} />

          <div style={{ padding: "40px 40px 44px" }}>
            {/* icon circle */}
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "rgba(16,185,129,0.1)",
              border: "1.5px solid rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px",
            }}>
              <FaEnvelope style={{ color: "#10b981", fontSize: "22px" }} />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
              Reset your password
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 32px", lineHeight: "1.6" }}>
              No worries — enter your work email and we'll send a reset link straight to your inbox.
            </p>

            {!sent ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block", fontSize: "13px",
                    fontWeight: "600", color: "#374151", marginBottom: "8px",
                  }}>
                    Work email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      borderRadius: "10px",
                      border: "1.5px solid #e2e8f0",
                      fontSize: "15px",
                      background: "white",
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: loading ? "#6ee7b7" : "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                    letterSpacing: "0.3px",
                  }}
                >
                  {loading ? "Sending..." : "Send reset link →"}
                </button>
              </form>
            ) : (
              <div style={{
                background: "rgba(16,185,129,0.06)",
                border: "1.5px solid rgba(16,185,129,0.2)",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📬</div>
                <p style={{ color: "#065f46", fontWeight: "600", fontSize: "14px", margin: "0 0 4px" }}>
                  Check your inbox
                </p>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  Reset link sent. It may take a minute to arrive.
                </p>
              </div>
            )}

            <Link
              to="/login"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", marginTop: "28px",
                color: "#64748b", fontSize: "14px",
                textDecoration: "none", fontWeight: "500",
              }}
            >
              <FaArrowLeft style={{ fontSize: "12px" }} />
              Back to sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", color: "#334155", fontSize: "12px" }}>
          © {new Date().getFullYear()} Social Connect HRMS
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;