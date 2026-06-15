import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import { FiArrowLeft, FiSearch, FiZap, FiUser, FiCheck, FiSave, FiX } from "react-icons/fi";

function AssignSkills() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const empRes = await API.get(`/employees/${employeeId}`);
        setEmployee(empRes.data);
        const skillsRes = await API.get("/skills");
        setSkills(skillsRes.data);
        const assignedRes = await API.get(`/employee-skills/${employeeId}`);
        setSelectedSkills(assignedRes.data.map((s) => s.id));
      } catch (error) {
        Swal.fire("Error", "Error loading skills", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleChange = (e) => {
    const value = Number(e.target.value);
    if (e.target.checked) setSelectedSkills([...selectedSkills, value]);
    else setSelectedSkills(selectedSkills.filter((id) => id !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await API.post(`/employee-skills/${employeeId}`, { skills: selectedSkills });
      await Swal.fire("Saved", res.data.message, "success");
      navigate(`/employees/${employeeId}`);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error assigning skills", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = skills.filter((s) =>
    s.skill_name?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = employee?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const tagColors = [
    { bg:"#ecfdf5", color:"#059669", border:"#a7f3d0" },
    { bg:"#eff6ff", color:"#3b82f6", border:"#bfdbfe" },
    { bg:"#fdf4ff", color:"#a855f7", border:"#e9d5ff" },
    { bg:"#fff7ed", color:"#ea580c", border:"#fed7aa" },
    { bg:"#fefce8", color:"#ca8a04", border:"#fde68a" },
    { bg:"#f0f9ff", color:"#0284c7", border:"#bae6fd" },
    { bg:"#fff1f2", color:"#e11d48", border:"#fecdd3" },
    { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  ];

  return (
    <Layout title="Assign Skills">
      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        .sc-skill-chip { display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:10px; border:1.5px solid; cursor:pointer; transition:all 0.15s; user-select:none; font-size:13px; font-weight:600; position:relative; }
        .sc-skill-chip input[type=checkbox] { position:absolute; opacity:0; width:0; height:0; }
        .sc-skill-chip:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
        .sc-skill-chip.selected { box-shadow:0 0 0 2px #10b981; }
        .sc-check-dot { width:16px; height:16px; border-radius:50%; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; flex-shrink:0; opacity:0.4; transition:opacity 0.15s,background 0.15s; }
        .sc-skill-chip.selected .sc-check-dot { opacity:1; background:currentColor; }
        .sc-skill-chip.selected .sc-check-dot svg { color:#fff; }
        .sc-search { width:100%; padding:10px 14px 10px 38px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; color:#1e293b; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .sc-search:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
        .sc-search::placeholder { color:#94a3b8; }
        .sc-ghost-btn { display:inline-flex; align-items:center; gap:6px; background:transparent; border:1.5px solid #e2e8f0; border-radius:8px; padding:8px 14px; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; transition:all 0.15s; }
        .sc-ghost-btn:hover:not(:disabled) { border-color:#10b981; color:#10b981; }
        .sc-ghost-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .sc-save-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.15s,transform 0.12s; }
        .sc-save-btn:hover:not(:disabled) { background:#059669; transform:translateY(-1px); }
        .sc-save-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sc-cancel-btn { display:inline-flex; align-items:center; gap:7px; background:transparent; color:#64748b; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px 20px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.15s; }
        .sc-cancel-btn:hover { border-color:#94a3b8; color:#1e293b; }
        .sc-preview-tag { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid; }
      `}</style>

      {/* Back */}
      <button style={{ display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", color:"#64748b", fontSize:13, cursor:"pointer", padding:"0 0 16px 0", fontWeight:500 }} onClick={() => navigate(`/employees/${employeeId}`)}>
        <FiArrowLeft size={15}/> Back to Employee
      </button>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontWeight:700, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:"#0f172a" }}>Assign Skills</h2>
          <p style={{ margin:"3px 0 0", fontSize:13, color:"#94a3b8" }}>
            Selecting skills for <span style={{ color:"#10b981", fontWeight:600 }}>{employee?.name || "this employee"}</span>
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[
          { icon:<FiUser size={16}/>, label:"Employee", val: employee?.name || "N/A", color:"#6366f1", bg:"#eef2ff" },
          { icon:<FiZap size={16}/>, label:"Selected", val: selectedSkills.length, color:"#10b981", bg:"#ecfdf5" },
          { icon:<FiZap size={16}/>, label:"Available", val: skills.length, color:"#f59e0b", bg:"#fffbeb" },
        ].map(({ icon, label, val, color, bg }) => (
          <div key={label} style={{ background:"#fff", borderRadius:14, padding:"16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#0f172a" }}>{val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:14 }}>
            <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTop:"3px solid #10b981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Loading skills…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Toolbar */}
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:180 }}>
                <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", display:"flex" }}><FiSearch size={14}/></span>
                <input
                  type="text"
                  className="sc-search"
                  placeholder="Search skills…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="sc-ghost-btn" onClick={() => setSelectedSkills(skills.map(s => s.id))} disabled={skills.length === 0}>
                <FiCheck size={13}/> Select All
              </button>
              <button type="button" className="sc-ghost-btn" onClick={() => setSelectedSkills([])} disabled={selectedSkills.length === 0}>
                <FiX size={13}/> Clear All
              </button>
            </div>

            {/* Skill chips */}
            {skills.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#94a3b8" }}>
                <div style={{ fontSize:32, marginBottom:10, opacity:0.4 }}>⚡</div>
                <div style={{ fontWeight:600, color:"#475569" }}>No skills available</div>
                <div style={{ fontSize:12, marginTop:4 }}>Add skills from the Skills page first</div>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8", fontSize:13 }}>No skills match your search</div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:24 }}>
                {filteredSkills.map((skill, idx) => {
                  const palette = tagColors[idx % tagColors.length];
                  const selected = selectedSkills.includes(skill.id);
                  return (
                    <label
                      key={skill.id}
                      className={`sc-skill-chip${selected ? " selected" : ""}`}
                      style={{ background: selected ? palette.bg : "#f8fafc", color: palette.color, borderColor: selected ? palette.border : "#e2e8f0" }}
                    >
                      <input type="checkbox" value={skill.id} checked={selected} onChange={handleChange}/>
                      <span className="sc-check-dot">
                        {selected && <FiCheck size={9} strokeWidth={3}/>}
                      </span>
                      {skill.skill_name}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Preview */}
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Selected Preview</div>
              {selectedSkills.length === 0 ? (
                <span style={{ fontSize:13, color:"#cbd5e1" }}>No skills selected yet</span>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {skills.filter(s => selectedSkills.includes(s.id)).map((skill, idx) => {
                    const palette = tagColors[idx % tagColors.length];
                    return (
                      <span key={skill.id} className="sc-preview-tag" style={{ background:palette.bg, color:palette.color, borderColor:palette.border }}>
                        {skill.skill_name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, paddingTop:4 }}>
              <button type="submit" className="sc-save-btn" disabled={saving}>
                <FiSave size={14}/> {saving ? "Saving…" : "Save Skills"}
              </button>
              <button type="button" className="sc-cancel-btn" onClick={() => navigate(`/employees/${employeeId}`)}>
                <FiArrowLeft size={14}/> Discard
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default AssignSkills;