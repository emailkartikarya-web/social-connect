import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import {
  FiUsers, FiUserCheck, FiUserX, FiDollarSign,
  FiSearch, FiFilter, FiPlus, FiEye, FiEdit2,
  FiTrash2, FiToggleLeft, FiToggleRight, FiTool, FiImage,
  FiChevronLeft, FiChevronRight
} from "react-icons/fi";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (error) {
      Swal.fire("Error", "Error loading employees", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, departmentFilter, statusFilter, sortBy]);

  const departments = [...new Set(employees.map((e) => e.department_name).filter(Boolean))];

  const filteredEmployees = employees
    .filter((emp) => {
      const kw = search.toLowerCase();
      const matchesSearch =
        emp.name?.toLowerCase().includes(kw) ||
        emp.email?.toLowerCase().includes(kw) ||
        emp.department_name?.toLowerCase().includes(kw) ||
        emp.designation?.toLowerCase().includes(kw);
      const matchesDept = departmentFilter === "" || emp.department_name === departmentFilter;
      const matchesStatus = statusFilter === "" || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nameAsc": return a.name.localeCompare(b.name);
        case "nameDesc": return b.name.localeCompare(a.name);
        case "salaryAsc": return Number(a.salary || 0) - Number(b.salary || 0);
        case "salaryDesc": return Number(b.salary || 0) - Number(a.salary || 0);
        default: return 0;
      }
    });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length;
  const averageSalary = employees.length > 0
    ? Math.round(employees.reduce((t, e) => t + Number(e.salary || 0), 0) / employees.length) : 0;

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await Swal.fire({
      title: "Change Status?",
      text: `Mark this employee as ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
    });
    if (!result.isConfirmed) return;
    try {
      await API.patch(`/employees/${id}/status`, { status: newStatus });
      Swal.fire("Updated", "Status updated successfully", "success");
      fetchEmployees();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error updating status", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Employee?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await API.delete(`/employees/${id}`);
      Swal.fire("Deleted", res.data.message, "success");
      fetchEmployees();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error deleting employee", "error");
    }
  };

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLast = currentPage * employeesPerPage;
  const indexOfFirst = indexOfLast - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const getInitials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  const statCards = [
    { icon: <FiUsers size={18}/>, label: "Total Employees", value: totalEmployees, color: "#6366f1", bg: "#eef2ff" },
    { icon: <FiUserCheck size={18}/>, label: "Active", value: activeEmployees, color: "#10b981", bg: "#ecfdf5" },
    { icon: <FiUserX size={18}/>, label: "Inactive", value: inactiveEmployees, color: "#ef4444", bg: "#fef2f2" },
    { icon: <FiDollarSign size={18}/>, label: "Avg. Salary", value: `₹${averageSalary.toLocaleString("en-IN")}`, color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <Layout title="Employee List">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .sc-stat { background:#fff; border-radius:14px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); display:flex; align-items:center; gap:16px; }
        .sc-stat-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sc-stat-label { font-size:12px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px; }
        .sc-stat-val { font-size:22px; font-weight:700; color:#0f172a; }
        .sc-toolbar { background:#fff; border-radius:14px; padding:16px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); margin-bottom:16px; display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
        .sc-search-wrap { position:relative; flex:1; min-width:200px; }
        .sc-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8; display:flex; }
        .sc-search { width:100%; padding:9px 12px 9px 36px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; color:#1e293b; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .sc-search:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
        .sc-select { padding:9px 12px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; color:#1e293b; outline:none; background:#fff; cursor:pointer; transition:border-color 0.15s; appearance:none; -webkit-appearance:none; padding-right:28px; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; }
        .sc-select:focus { border-color:#10b981; }
        .sc-table-wrap { background:#fff; border-radius:14px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); overflow:hidden; }
        .sc-table { width:100%; border-collapse:collapse; font-size:13px; }
        .sc-table thead tr { background:#f8fafc; border-bottom:1.5px solid #e2e8f0; }
        .sc-table th { padding:12px 16px; text-align:left; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; white-space:nowrap; }
        .sc-table tbody tr { border-bottom:1px solid #f1f5f9; transition:background 0.1s; }
        .sc-table tbody tr:last-child { border-bottom:none; }
        .sc-table tbody tr:hover { background:#f8fafc; }
        .sc-table td { padding:14px 16px; color:#334155; vertical-align:middle; }
        .sc-avatar-sm { width:34px; height:34px; border-radius:9px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sc-emp-name { font-weight:600; color:#0f172a; font-size:13px; }
        .sc-emp-sub { font-size:11px; color:#94a3b8; margin-top:1px; }
        .sc-dept-badge { display:inline-block; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:600; background:#ede9fe; color:#7c3aed; }
        .sc-status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; }
        .sc-status-active { background:#dcfce7; color:#166534; }
        .sc-status-inactive { background:#fee2e2; color:#991b1b; }
        .sc-action-btn { width:30px; height:30px; border-radius:8px; border:none; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:background 0.15s,transform 0.1s; font-size:14px; }
        .sc-action-btn:hover { transform:translateY(-1px); }
        .sc-btn-view { background:#f0fdf4; color:#10b981; }
        .sc-btn-view:hover { background:#dcfce7; }
        .sc-btn-edit { background:#eff6ff; color:#3b82f6; }
        .sc-btn-edit:hover { background:#dbeafe; }
        .sc-btn-skill { background:#fef3c7; color:#d97706; }
        .sc-btn-skill:hover { background:#fde68a; }
        .sc-btn-toggle-on { background:#f0fdf4; color:#10b981; }
        .sc-btn-toggle-on:hover { background:#dcfce7; }
        .sc-btn-toggle-off { background:#fff7ed; color:#ea580c; }
        .sc-btn-toggle-off:hover { background:#ffedd5; }
        .sc-btn-del { background:#fef2f2; color:#ef4444; }
        .sc-btn-del:hover { background:#fee2e2; }
        .sc-pagination { display:flex; align-items:center; gap:6px; }
        .sc-page-btn { width:32px; height:32px; border-radius:8px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
        .sc-page-btn:hover:not(:disabled) { border-color:#10b981; color:#10b981; }
        .sc-page-btn.active { background:#10b981; border-color:#10b981; color:#fff; font-weight:700; }
        .sc-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .sc-add-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s,transform 0.12s; white-space:nowrap; }
        .sc-add-btn:hover { background:#059669; transform:translateY(-1px); }
        .sc-empty { padding:56px 20px; text-align:center; color:#94a3b8; }
        .sc-empty-icon { font-size:40px; margin-bottom:12px; opacity:0.4; }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:"#0f172a" }}>Employees</h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#94a3b8" }}>Search, filter, sort and manage employee profiles.</p>
        </div>
        <button className="sc-add-btn" onClick={() => navigate("/create-employee")}>
          <FiPlus size={15}/> Add Employee
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {statCards.map(({ icon, label, value, color, bg }) => (
          <div className="sc-stat" key={label}>
            <div className="sc-stat-icon" style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="sc-stat-label">{label}</div>
              <div className="sc-stat-val">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="sc-toolbar">
        <div className="sc-search-wrap">
          <span className="sc-search-icon"><FiSearch size={14}/></span>
          <input
            type="text"
            className="sc-search"
            placeholder="Search name, email, department, designation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="sc-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="sc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="sc-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Default Sorting</option>
          <option value="nameAsc">Name A–Z</option>
          <option value="nameDesc">Name Z–A</option>
          <option value="salaryAsc">Salary Low–High</option>
          <option value="salaryDesc">Salary High–Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="sc-table-wrap">
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 0", gap:14 }}>
            <div style={{ width:32, height:32, border:"3px solid #e2e8f0", borderTop:"3px solid #10b981", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}></div>
            <span style={{ color:"#94a3b8", fontSize:13 }}>Loading employees…</span>
          </div>
        ) : (
          <>
            <div style={{ overflowX:"auto" }}>
              <table className="sc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th style={{ textAlign:"center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9">
                        <div className="sc-empty">
                          <div className="sc-empty-icon">👥</div>
                          <div style={{ fontWeight:600, color:"#475569", marginBottom:4 }}>No employees found</div>
                          <div style={{ fontSize:12 }}>Try adjusting your search or filters</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td style={{ color:"#94a3b8", fontWeight:600, fontSize:12 }}>{emp.id}</td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div className="sc-avatar-sm">{getInitials(emp.name)}</div>
                            <div>
                              <div className="sc-emp-name">{emp.name}</div>
                              <div className="sc-emp-sub">ID #{emp.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color:"#64748b" }}>{emp.email}</td>
                        <td><span className="sc-dept-badge">{emp.department_name || "N/A"}</span></td>
                        <td style={{ color:"#64748b" }}>{emp.phone}</td>
                        <td style={{ color:"#475569", fontWeight:500 }}>{emp.designation}</td>
                        <td style={{ fontWeight:700, color:"#0f172a" }}>₹{Number(emp.salary || 0).toLocaleString("en-IN")}</td>
                        <td>
                          <span className={`sc-status-badge ${emp.status === "active" ? "sc-status-active" : "sc-status-inactive"}`}>
                            <span style={{ width:5, height:5, borderRadius:"50%", background: emp.status === "active" ? "#16a34a" : "#dc2626", display:"inline-block" }}></span>
                            {emp.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                            <button className="sc-action-btn sc-btn-view" title="View Profile" onClick={() => navigate(`/employees/${emp.id}`)}>
                              <FiEye size={13}/>
                            </button>
                            <button className="sc-action-btn sc-btn-edit" title="Edit Employee" onClick={() => navigate(`/edit-employee/${emp.id}`)}>
                              <FiEdit2 size={13}/>
                            </button>
                            <button className="sc-action-btn sc-btn-skill" title="Assign Skills" onClick={() => navigate(`/assign-skills/${emp.id}`)}>
                              <FiTool size={13}/>
                            </button>
                            <button
                              className={`sc-action-btn ${emp.status === "active" ? "sc-btn-toggle-off" : "sc-btn-toggle-on"}`}
                              title={emp.status === "active" ? "Deactivate" : "Activate"}
                              onClick={() => handleStatusChange(emp.id, emp.status)}
                            >
                              {emp.status === "active" ? <FiToggleRight size={14}/> : <FiToggleLeft size={14}/>}
                            </button>
                            <button className="sc-action-btn sc-btn-del" title="Delete" onClick={() => handleDelete(emp.id)}>
                              <FiTrash2 size={13}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredEmployees.length > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:"1px solid #f1f5f9", flexWrap:"wrap", gap:12 }}>
                <span style={{ fontSize:12, color:"#94a3b8" }}>
                  Showing <b style={{color:"#475569"}}>{indexOfFirst + 1}–{Math.min(indexOfLast, filteredEmployees.length)}</b> of <b style={{color:"#475569"}}>{filteredEmployees.length}</b> employees
                </span>
                <div className="sc-pagination">
                  <button className="sc-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <FiChevronLeft size={14}/>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i+1} className={`sc-page-btn ${currentPage === i+1 ? "active" : ""}`} onClick={() => setCurrentPage(i+1)}>
                      {i+1}
                    </button>
                  ))}
                  <button className="sc-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <FiChevronRight size={14}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default EmployeeList;