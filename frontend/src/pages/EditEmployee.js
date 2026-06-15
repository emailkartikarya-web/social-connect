import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiLayers,
  FiToggleRight,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
    status: "active",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const deptRes = await API.get("/departments");
        setDepartments(deptRes.data);

        const empRes = await API.get(`/employees/${id}`);
        setForm({
          name: empRes.data.name || "",
          email: empRes.data.email || "",
          department_id: empRes.data.department_id || "",
          phone: empRes.data.phone || "",
          address: empRes.data.address || "",
          designation: empRes.data.designation || "",
          salary: empRes.data.salary || "",
          status: empRes.data.status || "active",
        });
      } catch (error) {
        Swal.fire("Error", "Error loading employee", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) {
        setForm({ ...form, phone: numbersOnly });
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!form.name.trim()) {
      Swal.fire("Invalid Name", "Employee name is required", "warning");
      return false;
    }
    if (!emailRegex.test(form.email.trim())) {
      Swal.fire("Invalid Email", "Please enter a valid email address", "warning");
      return false;
    }
    if (!form.department_id) {
      Swal.fire("Invalid Department", "Please select a department", "warning");
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      Swal.fire("Invalid Phone", "Phone number must be exactly 10 digits", "warning");
      return false;
    }
    if (!form.designation.trim()) {
      Swal.fire("Invalid Designation", "Designation is required", "warning");
      return false;
    }
    if (Number(form.salary) <= 0) {
      Swal.fire("Invalid Salary", "Salary must be greater than 0", "warning");
      return false;
    }
    if (!form.address.trim()) {
      Swal.fire("Invalid Address", "Address is required", "warning");
      return false;
    }
    if (!["active", "inactive"].includes(form.status)) {
      Swal.fire("Invalid Status", "Please select valid status", "warning");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const res = await API.put(`/employees/${id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        department_id: form.department_id,
        phone: form.phone,
        address: form.address.trim(),
        designation: form.designation.trim(),
        salary: form.salary,
        status: form.status,
      });
      await Swal.fire("Updated", res.data.message, "success");
      navigate("/employees");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Error updating employee",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Employee">
        <div style={styles.loadingWrap}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Fetching employee details…</p>
        </div>
      </Layout>
    );
  }

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <Layout title="Edit Employee">
      <style>{`
        .sc-field-group { position: relative; }
        .sc-field-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .sc-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #fff;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
          box-sizing: border-box;
        }
        .sc-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .sc-input::placeholder { color: #94a3b8; }
        .sc-textarea {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #fff;
          resize: vertical;
          min-height: 90px;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
          box-sizing: border-box;
        }
        .sc-textarea:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .sc-select {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #fff;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .sc-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }
        .sc-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .sc-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
        }
        .sc-btn-save:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }
        .sc-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
        .sc-btn-cancel {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s;
        }
        .sc-btn-cancel:hover { border-color: #94a3b8; color: #1e293b; }
        .sc-section-label {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0fdf4;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sc-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .sc-status-active { background: #d1fae5; color: #065f46; }
        .sc-status-inactive { background: #fee2e2; color: #991b1b; }
      `}</style>

      {/* Page header */}
      <div style={styles.pageHeader}>
        <button style={styles.backBtn} onClick={() => navigate("/employees")}>
          <FiArrowLeft size={16} />
          Back to Employees
        </button>
        <div style={styles.headerMeta}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <h2 style={styles.pageTitle}>{form.name || "Edit Employee"}</h2>
            <p style={styles.pageSubtitle}>
              Update personal, department, salary and contact details
            </p>
          </div>
          <span className={`sc-status-pill ${form.status === "active" ? "sc-status-active" : "sc-status-inactive"}`}>
            <span style={{width:6,height:6,borderRadius:'50%',background: form.status === "active" ? "#10b981" : "#ef4444",display:'inline-block'}}></span>
            {form.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Two-column layout: form left, summary card right */}
      <div style={styles.body}>
        {/* FORM */}
        <form onSubmit={handleSubmit} style={styles.formCard}>

          {/* Section: Identity */}
          <div style={styles.section}>
            <div className="sc-section-label"><FiUser size={13} /> Identity</div>
            <div style={styles.grid2}>
              <div>
                <label className="sc-label">Full Name</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiUser size={15} /></span>
                  <input
                    type="text"
                    name="name"
                    className="sc-input"
                    placeholder="e.g. Aryan Sharma"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="sc-label">Email Address</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiMail size={15} /></span>
                  <input
                    type="email"
                    name="email"
                    className="sc-input"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Role */}
          <div style={styles.section}>
            <div className="sc-section-label"><FiBriefcase size={13} /> Role & Department</div>
            <div style={styles.grid2}>
              <div>
                <label className="sc-label">Designation</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiBriefcase size={15} /></span>
                  <input
                    type="text"
                    name="designation"
                    className="sc-input"
                    placeholder="e.g. Senior Engineer"
                    value={form.designation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="sc-label">Department</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiLayers size={15} /></span>
                  <select
                    name="department_id"
                    className="sc-select"
                    value={form.department_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Contact */}
          <div style={styles.section}>
            <div className="sc-section-label"><FiPhone size={13} /> Contact</div>
            <div style={styles.grid2}>
              <div>
                <label className="sc-label">Phone Number</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiPhone size={15} /></span>
                  <input
                    type="text"
                    name="phone"
                    className="sc-input"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength="10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="sc-label">Salary (₹)</label>
                <div className="sc-field-group">
                  <span className="sc-field-icon"><FiDollarSign size={15} /></span>
                  <input
                    type="number"
                    name="salary"
                    className="sc-input"
                    placeholder="e.g. 55000"
                    value={form.salary}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="sc-label">Address</label>
              <div className="sc-field-group">
                <span className="sc-field-icon" style={{top:18,transform:'none'}}><FiMapPin size={15} /></span>
                <textarea
                  name="address"
                  className="sc-textarea"
                  placeholder="Street, City, State…"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div style={styles.section}>
            <div className="sc-section-label"><FiToggleRight size={13} /> Employment Status</div>
            <div style={{ maxWidth: 280 }}>
              <label className="sc-label">Status</label>
              <div className="sc-field-group">
                <span className="sc-field-icon"><FiToggleRight size={15} /></span>
                <select
                  name="status"
                  className="sc-select"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="submit" className="sc-btn-save" disabled={saving}>
              <FiSave size={15} />
              {saving ? "Saving changes…" : "Save Changes"}
            </button>
            <button
              type="button"
              className="sc-btn-cancel"
              onClick={() => navigate("/employees")}
            >
              <FiArrowLeft size={14} />
              Discard
            </button>
          </div>
        </form>

        {/* Sidebar summary card */}
        <div style={styles.sidebar}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryAvatar}>{initials}</div>
            <div style={styles.summaryName}>{form.name || "—"}</div>
            <div style={styles.summaryRole}>{form.designation || "No designation"}</div>
            <div style={styles.summaryDivider}></div>
            <div style={styles.summaryRows}>
              {[
                { icon: <FiMail size={13} />, label: "Email", val: form.email || "—" },
                { icon: <FiPhone size={13} />, label: "Phone", val: form.phone || "—" },
                {
                  icon: <FiLayers size={13} />,
                  label: "Dept",
                  val: departments.find((d) => String(d.id) === String(form.department_id))?.department_name || "—",
                },
                {
                  icon: <FiDollarSign size={13} />,
                  label: "Salary",
                  val: form.salary ? `₹${Number(form.salary).toLocaleString("en-IN")}` : "—",
                },
              ].map(({ icon, label, val }) => (
                <div key={label} style={styles.summaryRow}>
                  <span style={styles.summaryRowIcon}>{icon}</span>
                  <span style={styles.summaryRowLabel}>{label}</span>
                  <span style={styles.summaryRowVal}>{val}</span>
                </div>
              ))}
            </div>
            <div style={styles.summaryDivider}></div>
            <div style={{ textAlign: "center" }}>
              <span className={`sc-status-pill ${form.status === "active" ? "sc-status-active" : "sc-status-inactive"}`}>
                <span style={{width:6,height:6,borderRadius:'50%',background: form.status === "active" ? "#10b981" : "#ef4444",display:'inline-block'}}></span>
                {form.status === "active" ? "Active Employee" : "Inactive Employee"}
              </span>
            </div>
            <p style={styles.summaryHint}>Preview updates as you type</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    gap: 16,
  },
  loadingSpinner: {
    width: 36,
    height: 36,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #10b981",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: 14, margin: 0 },
  pageHeader: {
    marginBottom: 24,
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 13,
    cursor: "pointer",
    padding: "0 0 12px 0",
    fontWeight: 500,
  },
  headerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pageTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  pageSubtitle: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#94a3b8",
  },
  body: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
  },
  formCard: {
    flex: 1,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    padding: 28,
    minWidth: 0,
  },
  section: {
    marginBottom: 28,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  actions: {
    display: "flex",
    gap: 10,
    paddingTop: 8,
    borderTop: "1px solid #f1f5f9",
    marginTop: 4,
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
  },
  summaryCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    padding: 24,
    textAlign: "center",
    position: "sticky",
    top: 20,
  },
  summaryAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  summaryName: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 2,
    wordBreak: "break-word",
  },
  summaryRole: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: 600,
    marginBottom: 0,
  },
  summaryDivider: {
    height: 1,
    background: "#f1f5f9",
    margin: "16px 0",
  },
  summaryRows: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
  },
  summaryRowIcon: { color: "#10b981", flexShrink: 0 },
  summaryRowLabel: { color: "#94a3b8", fontWeight: 600, minWidth: 36 },
  summaryRowVal: { color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  summaryHint: {
    fontSize: 11,
    color: "#cbd5e1",
    marginTop: 12,
    marginBottom: 0,
  },
};

export default EditEmployee;