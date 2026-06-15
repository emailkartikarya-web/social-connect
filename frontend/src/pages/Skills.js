import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import { FiPlus, FiEdit2, FiTrash2, FiZap, FiCheck, FiX } from "react-icons/fi";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/skills");
      setSkills(res.data);
    } catch (error) {
      Swal.fire("Error", "Error loading skills", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    try {
      setAdding(true);
      await API.post("/skills", { skill_name: skillName });
      Swal.fire("Success", "Skill added successfully", "success");
      setSkillName("");
      fetchSkills();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error adding skill", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editingName.trim()) return;
    try {
      await API.put(`/skills/${id}`, { skill_name: editingName });
      Swal.fire("Updated", "Skill updated successfully", "success");
      setEditingId(null);
      fetchSkills();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error updating skill", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Skill?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await API.delete(`/skills/${id}`);
      Swal.fire("Deleted", "Skill deleted", "success");
      fetchSkills();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error deleting skill", "error");
    }
  };

  const tagColors = [
    { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    { bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe" },
    { bg: "#fdf4ff", color: "#a855f7", border: "#e9d5ff" },
    { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
    { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
    { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  ];

  return (
    <Layout title="Skills">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sc-skill-input { width:100%; padding:11px 16px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; color:#1e293b; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .sc-skill-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
        .sc-skill-input::placeholder { color:#94a3b8; }
        .sc-add-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:11px 22px; font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:background 0.15s,transform 0.12s; }
        .sc-add-btn:hover:not(:disabled) { background:#059669; transform:translateY(-1px); }
        .sc-add-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sc-skill-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:999px; font-size:12px; font-weight:700; border:1px solid; }
        .sc-skill-wrap { display:flex; flex-wrap:wrap; gap:10px; }
        .sc-skill-row { display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid #f1f5f9; gap:12px; }
        .sc-skill-row:last-child { border-bottom:none; }
        .sc-icon-btn { width:30px; height:30px; border-radius:8px; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s; flex-shrink:0; }
        .sc-btn-edit-sm { background:#eff6ff; color:#3b82f6; }
        .sc-btn-edit-sm:hover { background:#dbeafe; }
        .sc-btn-del-sm { background:#fef2f2; color:#ef4444; }
        .sc-btn-del-sm:hover { background:#fee2e2; }
        .sc-btn-ok { background:#ecfdf5; color:#10b981; }
        .sc-btn-ok:hover { background:#d1fae5; }
        .sc-btn-cancel { background:#f1f5f9; color:#64748b; }
        .sc-btn-cancel:hover { background:#e2e8f0; }
        .sc-edit-input { padding:5px 10px; border:1.5px solid #10b981; border-radius:8px; font-size:13px; font-weight:600; color:#0f172a; outline:none; background:#f0fdf4; min-width:0; flex:1; max-width:220px; }
        .sc-section-header { font-size:12px; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:6px; margin-bottom:14px; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:"#0f172a" }}>Skills</h2>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#94a3b8" }}>Manage employee technical and professional skills.</p>
      </div>

      {/* Add form */}
      <div style={{ background:"#fff", borderRadius:14, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)", marginBottom:20 }}>
        <div className="sc-section-header"><FiZap size={13}/> New Skill</div>
        <form onSubmit={handleSubmit} style={{ display:"flex", gap:12 }}>
          <input
            type="text"
            className="sc-skill-input"
            placeholder="e.g. React, Docker, Figma, PostgreSQL…"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          />
          <button type="submit" className="sc-add-btn" disabled={adding}>
            <FiPlus size={15}/> {adding ? "Adding…" : "Add Skill"}
          </button>
        </form>
      </div>

      {/* Skills list */}
      <div style={{ background:"#fff", borderRadius:14, padding:"20px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div className="sc-section-header" style={{ marginBottom:0 }}><FiZap size={13}/> All Skills</div>
          <span style={{ background:"#ecfdf5", color:"#059669", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>
            {skills.length} total
          </span>
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"48px 0", gap:14, flexDirection:"column" }}>
            <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTop:"3px solid #10b981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Loading skills…</span>
          </div>
        ) : skills.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#94a3b8" }}>
            <div style={{ fontSize:36, marginBottom:10, opacity:0.4 }}>⚡</div>
            <div style={{ fontWeight:600, color:"#475569", marginBottom:4 }}>No skills yet</div>
            <div style={{ fontSize:12 }}>Add your first skill above</div>
          </div>
        ) : (
          <div>
            {skills.map((skill, idx) => {
              const palette = tagColors[idx % tagColors.length];
              const isEditing = editingId === skill.id;
              return (
                <div className="sc-skill-row" key={skill.id}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", minWidth:28 }}>#{skill.id}</span>
                    {isEditing ? (
                      <input
                        className="sc-edit-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleEdit(skill.id); if (e.key === "Escape") setEditingId(null); }}
                      />
                    ) : (
                      <span
                        className="sc-skill-tag"
                        style={{ background: palette.bg, color: palette.color, borderColor: palette.border }}
                      >
                        {skill.skill_name}
                      </span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {isEditing ? (
                      <>
                        <button className="sc-icon-btn sc-btn-ok" title="Save" onClick={() => handleEdit(skill.id)}><FiCheck size={13}/></button>
                        <button className="sc-icon-btn sc-btn-cancel" title="Cancel" onClick={() => setEditingId(null)}><FiX size={13}/></button>
                      </>
                    ) : (
                      <>
                        <button className="sc-icon-btn sc-btn-edit-sm" title="Edit" onClick={() => { setEditingId(skill.id); setEditingName(skill.skill_name); }}><FiEdit2 size={13}/></button>
                        <button className="sc-icon-btn sc-btn-del-sm" title="Delete" onClick={() => handleDelete(skill.id)}><FiTrash2 size={13}/></button>
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

export default Skills;