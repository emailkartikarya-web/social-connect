import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (form.password.length < 6) {
      Swal.fire("Weak Password", "Password must be at least 6 characters", "warning");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Swal.fire("Password Mismatch", "Passwords do not match", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const res = await API.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await Swal.fire({
        icon: "success",
        title: "Account Created",
        text: res.data.message || "Registration successful. Please verify your email.",
      });
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || "Unable to create account",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "15px",
    background: "white",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
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
      {/* background glow blobs */}
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        top: "-100px", right: "-100px", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "350px", height: "350px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
        bottom: "-80px", left: "-60px", pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "white",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        {/* teal top accent bar */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg, #10b981, #059669)",
        }} />

        <div style={{ padding: "40px 44px 44px" }}>
          {/* header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              width: "44px", height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "17px", fontWeight: "800", color: "white",
              marginBottom: "20px",
              boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            }}>
              SC
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Create your account
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
              Join Social Connect HRMS — free to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                className="form-control form-control-lg"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Work Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                className="form-control form-control-lg"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* two password fields side by side */}
            <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Password</label>
                <div className="input-group input-group-lg">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 6 chars"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, borderRadius: "10px 0 0 10px", borderRight: "none" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      border: "1.5px solid #e2e8f0", borderLeft: "none",
                      background: "white", borderRadius: "0 10px 10px 0",
                      padding: "0 12px", color: "#94a3b8", cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Confirm</label>
                <div className="input-group input-group-lg">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat it"
                    className="form-control"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, borderRadius: "10px 0 0 10px", borderRight: "none" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      border: "1.5px solid #e2e8f0", borderLeft: "none",
                      background: "white", borderRadius: "0 10px 10px 0",
                      padding: "0 12px", color: "#94a3b8", cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
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
                letterSpacing: "0.3px",
                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
              }}
            >
              {loading ? "Creating account..." : "Get started →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b", fontSize: "14px", marginBottom: 0 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#10b981", fontWeight: "600", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p style={{
        position: "absolute", bottom: "20px",
        color: "#334155", fontSize: "12px", textAlign: "center", width: "100%",
      }}>
        © {new Date().getFullYear()} Social Connect HRMS
      </p>
    </div>
  );
}

export default Signup;