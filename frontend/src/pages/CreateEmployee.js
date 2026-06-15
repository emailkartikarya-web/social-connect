import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import { FaUser, FaBuilding, FaRupeeSign, FaMapMarkerAlt } from "react-icons/fa";

function CreateEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", department_id: "", phone: "",
    address: "", designation: "", salary: "", status: "active",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await API.get("/departments");
        setDepartments(res.data);
      } catch (error) {
        Swal.fire("Error", "Error loading departments", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) setForm({ ...form, phone: numbersOnly });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    if (!form.name.trim()) { Swal.fire("Invalid Name", "Employee name is required", "warning"); return false; }
    if (!emailRegex.test(form.email.trim())) { Swal.fire("Invalid Email", "Please enter a valid email address", "warning"); return false; }
    if (!form.department_id) { Swal.fire("Invalid Department", "Please select a department", "warning"); return false; }
    if (!phoneRegex.test(form.phone)) { Swal.fire("Invalid Phone", "Phone number must be exactly 10 digits", "warning"); return false; }
    if (!form.designation.trim()) { Swal.fire("Invalid Designation", "Designation is required", "warning"); return false; }
    if (Number(form.salary) <= 0) { Swal.fire("Invalid Salary", "Salary must be greater than 0", "warning"); return false; }
    if (!form.address.trim()) { Swal.fire("Invalid Address", "Address is required", "warning"); return false; }
    if (!["active", "inactive"].includes(form.status)) { Swal.fire("Invalid Status", "Please select valid status", "warning"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSaving(true);
      const res = await API.post("/employees", {
        name: form.name.trim(), email: form.email.trim(),
        department_id: form.department_id, phone: form.phone,
        address: form.address.trim(), designation: form.designation.trim(),
        salary: form.salary, status: form.status,
      });
      await Swal.fire("Success", res.data.message, "success");
      navigate("/employees");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error creating employee profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Create Employee">
        <div className="text-center mt-5">
          <div className="spinner-border" style={{ color: "#10b981" }}></div>
          <p className="text-muted mt-3">Loading departments...</p>
        </div>
      </Layout>
    );
  }

  const inputStyle = {
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    background: "white",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "13px", fontWeight: "600",
    color: "#374151", marginBottom: "6px", display: "block",
  };

  const sectionCard = (icon, title, color, bg, children) => (
    <div style={{
      background: "white", borderRadius: "16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      overflow: "hidden", marginBottom: "20px",
    }}>
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{title}</span>
      </div>
      <div style={{ padding: "24px" }}>
        {children}
      </div>
    </div>
  );

  return (
    <Layout title="Create Employee">
      {/* Page header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #134e4a)",
        borderRadius: "16px", padding: "24px 32px",
        marginBottom: "28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ color: "white", fontWeight: "800", margin: "0 0 4px", fontSize: "22px" }}>
            Create Employee Profile
          </h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
            Fill in the details below to onboard a new team member.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/employees")}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8", borderRadius: "10px", padding: "8px 18px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}
        >
          ← Back to Employees
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1 — Personal Info */}
        {sectionCard(
          <FaUser style={{ color: "#10b981", fontSize: "16px" }} />,
          "Personal Information",
          "#10b981", "rgba(16,185,129,0.1)",
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" name="name"
                className="form-control form-control-lg"
                placeholder="e.g. Ravi Kumar"
                value={form.name} onChange={handleChange} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Email Address</label>
              <input
                type="email" name="email"
                className="form-control form-control-lg"
                placeholder="e.g. ravi@company.com"
                value={form.email} onChange={handleChange} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Phone Number</label>
              <input
                type="text" name="phone"
                className="form-control form-control-lg"
                placeholder="10-digit mobile number"
                value={form.phone} onChange={handleChange}
                maxLength="10" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Designation</label>
              <input
                type="text" name="designation"
                className="form-control form-control-lg"
                placeholder="e.g. Software Engineer"
                value={form.designation} onChange={handleChange} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>
        )}

        {/* Section 2 — Department & Status */}
        {sectionCard(
          <FaBuilding style={{ color: "#8b5cf6", fontSize: "16px" }} />,
          "Department & Status",
          "#8b5cf6", "rgba(139,92,246,0.1)",
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Department</label>
              <select
                name="department_id"
                className="form-select form-select-lg"
                value={form.department_id} onChange={handleChange} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label style={labelStyle}>Employment Status</label>
              <select
                name="status"
                className="form-select form-select-lg"
                value={form.status} onChange={handleChange} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 3 — Salary */}
        {sectionCard(
          <FaRupeeSign style={{ color: "#f59e0b", fontSize: "16px" }} />,
          "Compensation",
          "#f59e0b", "rgba(245,158,11,0.1)",
          <div className="row g-3">
            <div className="col-md-6">
              <label style={labelStyle}>Monthly Salary (₹)</label>
              <input
                type="number" name="salary"
                className="form-control form-control-lg"
                placeholder="e.g. 50000"
                value={form.salary} onChange={handleChange}
                min="1" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#10b981"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>
        )}

        {/* Section 4 — Address */}
        {sectionCard(
          <FaMapMarkerAlt style={{ color: "#3b82f6", fontSize: "16px" }} />,
          "Address",
          "#3b82f6", "rgba(59,130,246,0.1)",
          <div>
            <label style={labelStyle}>Full Address</label>
            <textarea
              rows="3" name="address"
              className="form-control"
              placeholder="Enter employee's residential address"
              value={form.address} onChange={handleChange} required
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "#10b981"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate("/employees")}
            style={{
              background: "white", border: "1.5px solid #e2e8f0",
              color: "#64748b", borderRadius: "10px",
              padding: "12px 24px", fontSize: "14px",
              fontWeight: "600", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "#6ee7b7" : "linear-gradient(135deg, #10b981, #059669)",
              color: "white", border: "none", borderRadius: "10px",
              padding: "12px 32px", fontSize: "14px",
              fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
              letterSpacing: "0.3px",
            }}
          >
            {saving ? "Creating..." : "Create Employee →"}
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default CreateEmployee;