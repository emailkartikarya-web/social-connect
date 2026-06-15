import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiCheck, FiX } from "react-icons/fi";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [adding, setAdding] = useState(false);

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

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) return;
    try {
      setAdding(true);
      await API.post("/departments", { department_name: departmentName });
      Swal.fire("Success", "Department added successfully", "success");
      setDepartmentName("");
      fetchDepartments();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error adding department", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await API.put(`/departments/${id}`, { department_name: editingName });
      Swal.fire("Updated", "Department updated successfully", "success");
      setEditingId(null);
      fetchDepartments();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error updating department", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Department?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/departments/${id}`);
      Swal.fire("Deleted", "Department deleted", "success");
      fetchDepartments();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error deleting department", "error");
    }
  };

  const colorPalette = [
    { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    { bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe" },
    { bg: "#fdf4ff", color: "#a855f7", border: "#e9d5ff" },
    { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  ];

  return (
    <Layout title="Departments">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sc-dept-input { width:100%; padding:11px 16px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; color:#1e293b; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .sc-dept-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
        .sc-dept-input::placeholder { color:#94a3b8; }
        .sc-add-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:11px 22px; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:background 0.15s,transform 0.12s; }
        .sc-add-btn:hover:not(:disabled) { background:#059669; transform:translateY(-1px); }
        .sc-add-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sc-dept-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
        .sc-dept-card { background:#fff; border-radius:14px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); display:flex; align-items:center; gap:14px; transition:box-shadow 0.15s,transform 0.12s; }
        .sc-dept-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.1); transform:translateY(-1px); }
        .sc-dept-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:700; font-size:15px; }
        .sc-dept-info { flex:1; min-width:0; }
        .sc-dept-id { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:2px; }
        .sc-dept-name { font-size:14px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sc-icon-btn { width:30px; height:30px; border-radius:8px; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s; flex-shrink:0; }
        .sc-btn-edit-sm { background:#eff6ff; color:#3b82f6; }
        .sc-btn-edit-sm:hover { background:#dbeafe; }
        .sc-btn-del-sm { background:#fef2f2; color:#ef4444; }
        .sc-btn-del-sm:hover { background:#fee2e2; }
        .sc-btn-ok { background:#ecfdf5; color:#10b981; }
        .sc-btn-ok:hover { background:#d1fae5; }
        .sc-btn-cancel { background:#f1f5f9; color:#64748b; }
        .sc-btn-cancel:hover { background:#e2e8f0; }
        .sc-edit-input { flex:1; padding:6px 10px; border:1.5px solid #10b981; border-radius:8px; font-size:13px; font-weight:600; color:#0f172a; outline:none; background:#f0fdf4; min-width:0; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:"#0f172a" }}>Departments</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#94a3b8" }}>Create and manage company departments.</p>
      </div>

      {/* Add form */}
      <div style={{ background:"#fff", borderRadius:14, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)", marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#10b981", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14, display:"flex", alignItems:"center", gap:6 }}>
          <FiLayers size={13}/> New Department
        </div>
        <form onSubmit={handleSubmit} style={{ display:"flex", gap:12 }}>
          <input
            type="text"
            className="sc-dept-input"
            placeholder="e.g. Product Design, Engineering, Finance…"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
          />
          <button type="submit" className="sc-add-btn" disabled={adding}>
            <FiPlus size={15}/> {adding ? "Adding…" : "Add Department"}
          </button>
        </form>
      </div>

      {/* List */}
      <div style={{ background:"#fff", borderRadius:14, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#10b981", textTransform:"uppercase", letterSpacing:"0.08em", display:"flex", alignItems:"center", gap:6 }}>
            <FiLayers size={13}/> All Departments
          </div>
          <span style={{ background:"#ecfdf5", color:"#059669", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>
            {departments.length} total
          </span>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"48px 0", gap:14, flexDirection:"column" }}>
            <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTop:"3px solid #10b981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Loading departments…</span>
          </div>
        ) : departments.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#94a3b8" }}>
            <div style={{ fontSize:36, marginBottom:10, opacity:0.4 }}>🏢</div>
            <div style={{ fontWeight:600, color:"#475569", marginBottom:4 }}>No departments yet</div>
            <div style={{ fontSize:12 }}>Add your first department above</div>
          </div>
        ) : (
          <div className="sc-dept-grid">
            {departments.map((dept, idx) => {
              const palette = colorPalette[idx % colorPalette.length];
              const isEditing = editingId === dept.id;
              return (
                <div className="sc-dept-card" key={dept.id} style={{ border:`1px solid ${palette.border}` }}>
                  <div className="sc-dept-icon" style={{ background: palette.bg, color: palette.color }}>
                    {dept.department_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="sc-dept-info">
                    <div className="sc-dept-id">Dept #{dept.id}</div>
                    {isEditing ? (
                      <input
                        className="sc-edit-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleEdit(dept.id); if (e.key === "Escape") setEditingId(null); }}
                      />
                    ) : (
                      <div className="sc-dept-name">{dept.department_name}</div>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {isEditing ? (
                      <>
                        <button className="sc-icon-btn sc-btn-ok" title="Save" onClick={() => handleEdit(dept.id)}><FiCheck size={13}/></button>
                        <button className="sc-icon-btn sc-btn-cancel" title="Cancel" onClick={() => setEditingId(null)}><FiX size={13}/></button>
                      </>
                    ) : (
                      <>
                        <button className="sc-icon-btn sc-btn-edit-sm" title="Edit" onClick={() => { setEditingId(dept.id); setEditingName(dept.department_name); }}><FiEdit2 size={13}/></button>
                        <button className="sc-icon-btn sc-btn-del-sm" title="Delete" onClick={() => handleDelete(dept.id)}><FiTrash2 size={13}/></button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Departments;