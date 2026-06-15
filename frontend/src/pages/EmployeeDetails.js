import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  FiArrowLeft, FiEdit2, FiUser, FiMail, FiPhone,
  FiBriefcase, FiLayers, FiDollarSign, FiMapPin, FiToggleRight
} from "react-icons/fi";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEmployee(); }, []);

  const fetchEmployee = async () => {
    try {
      const res = await API.get(`/employees/${id}`);
      setEmployee(res.data);
    } catch (error) {
      Swal.fire("Error", "Employee not found", "error");
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Employee Details">
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:320, gap:16 }}>
          <div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTop:"3px solid #10b981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
          <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>Loading employee…</p>
        </div>
      </Layout>
    );
  }

  const initials = employee.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "??";
  const isActive = employee.status === "active";

  const fields = [
    { icon: <FiMail size={15}/>, label:"Email", value: employee.email },
    { icon: <FiLayers size={15}/>, label:"Department", value: employee.department_name },
    { icon: <FiPhone size={15}/>, label:"Phone", value: employee.phone },
    { icon: <FiBriefcase size={15}/>, label:"Designation", value: employee.designation },
    { icon: <FiDollarSign size={15}/>, label:"Salary", value: `₹${Number(employee.salary || 0).toLocaleString("en-IN")}` },
    { icon: <FiToggleRight size={15}/>, label:"Status", value: employee.status, isStatus: true },
  ];

  return (
    <Layout title="Employee Details">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sc-detail-card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04); overflow:hidden; }
        .sc-hero { background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:36px 32px 80px; position:relative; }
        .sc-hero-avatar { width:80px; height:80px; border-radius:20px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:26px; font-weight:700; display:flex; align-items:center; justify-content:center; border:3px solid rgba(255,255,255,0.15); }
        .sc-hero-name { color:#fff; font-size:22px; font-weight:700; margin:14px 0 2px; }
        .sc-hero-role { color:#10b981; font-size:13px; font-weight:600; }
        .sc-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; }
        .sc-pill-active { background:rgba(16,185,129,0.2); color:#6ee7b7; }
        .sc-pill-inactive { background:rgba(239,68,68,0.2); color:#fca5a5; }
        .sc-body { padding:0 32px 32px; margin-top:-44px; }
        .sc-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .sc-field { background:#f8fafc; border-radius:12px; padding:16px 18px; display:flex; align-items:flex-start; gap:12px; }
        .sc-field-icon { width:32px; height:32px; border-radius:8px; background:#ecfdf5; color:#10b981; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
        .sc-field-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:4px; }
        .sc-field-val { font-size:14px; font-weight:600; color:#1e293b; }
        .sc-address { grid-column:1/-1; }
        .sc-actions { display:flex; gap:10px; padding-top:24px; border-top:1px solid #f1f5f9; }
        .sc-btn-edit { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:11px 24px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s,transform 0.12s; }
        .sc-btn-edit:hover { background:#059669; transform:translateY(-1px); }
        .sc-btn-back { display:inline-flex; align-items:center; gap:7px; background:transparent; color:#64748b; border:1.5px solid #e2e8f0; border-radius:10px; padding:11px 20px; font-size:13px; font-weight:500; cursor:pointer; transition:border-color 0.15s,color 0.15s; }
        .sc-btn-back:hover { border-color:#94a3b8; color:#1e293b; }
      `}</style>

      <button className="sc-btn-back" style={{marginBottom:20}} onClick={() => navigate("/employees")}>
        <FiArrowLeft size={15}/> Back to Employees
      </button>

      <div className="sc-detail-card">
        {/* Hero banner */}
        <div className="sc-hero">
          <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
            <div>
              <div className="sc-hero-avatar">{initials}</div>
              <div className="sc-hero-name">{employee.name}</div>
              <div className="sc-hero-role">{employee.designation}</div>
            </div>
            <span className={`sc-pill ${isActive ? "sc-pill-active" : "sc-pill-inactive"}`} style={{marginTop:4}}>
              <span style={{width:6,height:6,borderRadius:"50%",background: isActive ? "#10b981":"#ef4444",display:"inline-block"}}></span>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="sc-body">
          <div className="sc-grid">
            {fields.filter(f => !f.isStatus).map(({icon, label, value}) => (
              <div className="sc-field" key={label}>
                <div className="sc-field-icon">{icon}</div>
                <div>
                  <div className="sc-field-label">{label}</div>
                  <div className="sc-field-val">{value || "—"}</div>
                </div>
              </div>
            ))}
            <div className="sc-field sc-address">
              <div className="sc-field-icon"><FiMapPin size={15}/></div>
              <div>
                <div className="sc-field-label">Address</div>
                <div className="sc-field-val" style={{fontWeight:400,color:"#475569",lineHeight:1.6}}>{employee.address || "—"}</div>
              </div>
            </div>
          </div>

          <div className="sc-actions">
            <button className="sc-btn-edit" onClick={() => navigate(`/employees/edit/${id}`)}>
              <FiEdit2 size={14}/> Edit Employee
            </button>
            <button className="sc-btn-back" onClick={() => navigate("/employees")}>
              <FiArrowLeft size={14}/> Discard
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default EmployeeDetails;