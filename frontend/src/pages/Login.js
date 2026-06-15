import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid email or password",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Manage employees, departments & assets in one place",
    "Role-based access for admins and employees",
    "Live attendance, leave tracking & audit logs",
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "inherit" }}>

      {/* LEFT — dark hero panel */}
      <div
        style={{
          width: "52%",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
          position: "relative",
          overflow: "hidden",
        }}
        className="d-none d-lg-flex"
      >
        {/* subtle teal glow blob */}
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
          top: "-80px",
          right: "-80px",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          bottom: "-60px",
          left: "40px",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "-0.5px",
            marginBottom: "32px",
            boxShadow: "0 0 0 1px rgba(16,185,129,0.3), 0 8px 24px rgba(16,185,129,0.2)",
          }}>
            SC
          </div>
          <p style={{ color: "#10b981", fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px" }}>
            Social Connect HRMS
          </p>
          <h1 style={{
            color: "white",
            fontSize: "42px",
            fontWeight: "800",
            lineHeight: "1.15",
            margin: "0 0 20px",
            letterSpacing: "-1px",
          }}>
            Built for teams<br />
            that <span style={{ color: "#10b981" }}>move fast.</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: "1.7", margin: "0 0 40px", maxWidth: "360px" }}>
            Everything your HR team needs — from onboarding to offboarding — without the bloat.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "56px" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <FaCheckCircle style={{ color: "#10b981", marginTop: "3px", flexShrink: 0, fontSize: "15px" }} />
              <span style={{ color: "#cbd5e1", fontSize: "15px", lineHeight: "1.5" }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[["500+", "Companies"], ["99.9%", "Uptime"], ["Real-time", "Sync"]].map(([val, label]) => (
            <div key={label} style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "10px",
              padding: "10px 18px",
              textAlign: "center",
            }}>
              <div style={{ color: "#10b981", fontWeight: "700", fontSize: "16px" }}>{val}</div>
              <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        flex: 1,
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
        }}>
          {/* Mobile-only logo */}
          <div className="d-lg-none" style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "800",
              color: "white",
              marginBottom: "8px",
            }}>SC</div>
            <p style={{ color: "#10b981", fontSize: "12px", fontWeight: "600", letterSpacing: "1.5px", textTransform: "uppercase", margin: 0 }}>
              Social Connect HRMS
            </p>
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Welcome back
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 36px" }}>
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Work email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                className="form-control form-control-lg"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "15px",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", margin: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: "13px", color: "#10b981", textDecoration: "none", fontWeight: "500" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="input-group input-group-lg">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "10px 0 0 10px",
                    border: "1.5px solid #e2e8f0",
                    borderRight: "none",
                    fontSize: "15px",
                    background: "white",
                  }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    border: "1.5px solid #e2e8f0",
                    borderLeft: "none",
                    background: "white",
                    borderRadius: "0 10px 10px 0",
                    padding: "0 16px",
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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
                marginTop: "24px",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "28px", color: "#64748b", fontSize: "14px" }}>
            New to Social Connect?{" "}
            <Link to="/signup" style={{ color: "#10b981", fontWeight: "600", textDecoration: "none" }}>
              Create an account
            </Link>
          </p>

          <p style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8", fontSize: "12px" }}>
            © {new Date().getFullYear()} Social Connect HRMS
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;