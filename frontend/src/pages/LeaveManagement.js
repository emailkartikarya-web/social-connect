import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { FaCalendarPlus, FaHistory, FaCheckDouble, FaChartBar, FaClock } from "react-icons/fa";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp, FiUsers, FiBarChart2, FiX } from "react-icons/fi";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import useLeave from "../hooks/useLeave";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Loader from "../components/Loader";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function LeaveManagement() {
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : {};
  const role = user.role ? user.role.toLowerCase() : "";
  const isLinked = !!user.employee_profile_id;
  const leaveAPI = useLeave();

  const [activeTab, setActiveTab] = useState("my-leaves");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [managerPending, setManagerPending] = useState([]);
  const [hrPending, setHrPending] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ leave_type_id: "", from_date: "", to_date: "", reason: "" });
  const [submittingApply, setSubmittingApply] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ id: null, level: "", status: "", remarks: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (role === "manager") setActiveTab("manager-approvals");
    else if (role === "hr") setActiveTab("hr-approvals");
    else setActiveTab("my-leaves");
    loadInitialData();
  }, [role]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const types = await leaveAPI.getLeaveTypes();
      setLeaveTypes(types);
      if (isLinked) {
        const bal = await leaveAPI.getLeaveBalances();
        setBalances(bal);
        const hist = await leaveAPI.getLeaveHistory();
        setHistory(hist);
      }
      if (role === "manager" || role === "admin") {
        const mPending = await leaveAPI.getPendingForManager();
        setManagerPending(mPending);
      }
      if (role === "hr" || role === "admin") {
        const hPending = await leaveAPI.getPendingForHR();
        setHrPending(hPending);
        const rep = await leaveAPI.getLeaveReports();
        setReportsData(rep);
      }
    } catch (error) {
      Swal.fire("Error", "Could not load leave records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.leave_type_id || !applyForm.from_date || !applyForm.to_date)
      return Swal.fire("Validation", "Please fill in all required fields", "warning");
    try {
      setSubmittingApply(true);
      await leaveAPI.applyLeave(applyForm);
      Swal.fire("Success", "Leave request submitted successfully", "success");
      setShowApplyModal(false);
      setApplyForm({ leave_type_id: "", from_date: "", to_date: "", reason: "" });
      loadInitialData();
    } catch (error) {
      Swal.fire("Failed", error.response?.data?.message || "Could not apply for leave", "error");
    } finally {
      setSubmittingApply(false);
    }
  };

  const openReviewDialog = (id, level, status) => {
    setReviewForm({ id, level, status, remarks: "" });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      if (reviewForm.level === "manager") await leaveAPI.reviewByManager(reviewForm.id, reviewForm.status, reviewForm.remarks);
      else await leaveAPI.reviewByHR(reviewForm.id, reviewForm.status, reviewForm.remarks);
      Swal.fire("Processed", `Leave request has been ${reviewForm.status}`, "success");
      setShowReviewModal(false);
      loadInitialData();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to process review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved": return { bg:"#dcfce7", color:"#166534" };
      case "rejected": return { bg:"#fee2e2", color:"#991b1b" };
      case "pending_manager": return { bg:"#fef9c3", color:"#854d0e" };
      case "pending_hr": return { bg:"#e0f2fe", color:"#075985" };
      default: return { bg:"#f1f5f9", color:"#475569" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "pending_manager": return "Pending Manager";
      case "pending_hr": return "Pending HR";
      default: return status;
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  const deptChartData = reportsData ? {
    labels: reportsData.departmentLeaves.map(d => d.department_name),
    datasets: [{ label:"Total Leave Days", data: reportsData.departmentLeaves.map(d => parseInt(d.total_days||0)), backgroundColor:["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6"], borderWidth:0 }]
  } : null;

  const trendChartData = reportsData ? {
    labels: reportsData.monthlyTrends.map(t => t.month_year),
    datasets: [{ label:"Approved Requests", data: reportsData.monthlyTrends.map(t => parseInt(t.leave_count||0)), backgroundColor:"#10b981", borderRadius:6 }]
  } : null;

  const tabs = [
    ...(isLinked ? [{ key:"my-leaves", label:"My Leaves", icon:<FaHistory size={13}/>, count:null }] : []),
    ...((role==="manager"||role==="admin") ? [{ key:"manager-approvals", label:"Manager Reviews", icon:<FaClock size={13}/>, count:managerPending.length }] : []),
    ...((role==="hr"||role==="admin") ? [
      { key:"hr-approvals", label:"HR Approvals", icon:<FaCheckDouble size={13}/>, count:hrPending.length },
      { key:"reports", label:"Analytics", icon:<FaChartBar size={13}/>, count:null },
    ] : []),
  ];

  if (loading) return <Layout title="Leave Management"><Loader message="Fetching leave configurations and records..." /></Layout>;

  return (
    <Layout title="Leave Management">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .sc-tab-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .sc-tab-btn:hover { border-color:#10b981; color:#10b981; }
        .sc-tab-btn.active { background:#10b981; border-color:#10b981; color:#fff; }
        .sc-tab-badge { background:rgba(255,255,255,0.25); color:inherit; border-radius:999px; padding:1px 7px; font-size:11px; font-weight:700; }
        .sc-tab-btn:not(.active) .sc-tab-badge { background:#f1f5f9; color:#64748b; }
        .sc-apply-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s,transform 0.12s; }
        .sc-apply-btn:hover { background:#059669; transform:translateY(-1px); }
        .sc-bal-card { background:#fff; border-radius:14px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); display:flex; flex-direction:column; gap:6px; border-left:4px solid #10b981; }
        .sc-stat-card { background:#fff; border-radius:14px; padding:18px 20px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); }
        .sc-table { width:100%; border-collapse:collapse; font-size:13px; }
        .sc-table thead tr { background:#f8fafc; border-bottom:1.5px solid #e2e8f0; }
        .sc-table th { padding:11px 14px; text-align:left; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; white-space:nowrap; }
        .sc-table tbody tr { border-bottom:1px solid #f1f5f9; transition:background 0.1s; }
        .sc-table tbody tr:hover { background:#f8fafc; }
        .sc-table td { padding:12px 14px; color:#334155; vertical-align:middle; }
        .sc-status-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; }
        .sc-approve-btn { display:inline-flex; align-items:center; gap:5px; background:#ecfdf5; color:#059669; border:none; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .sc-approve-btn:hover { background:#d1fae5; }
        .sc-reject-btn { display:inline-flex; align-items:center; gap:5px; background:#fef2f2; color:#dc2626; border:none; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .sc-reject-btn:hover { background:#fee2e2; }
        .sc-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); animation:fadeIn 0.15s; }
        .sc-modal { background:#fff; border-radius:16px; padding:28px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
        .sc-modal-title { font-size:17px; font-weight:700; color:#0f172a; margin:0 0 20px; display:flex; align-items:center; justify-content:space-between; }
        .sc-modal-close { background:none; border:none; color:#94a3b8; cursor:pointer; padding:4px; border-radius:6px; display:flex; }
        .sc-modal-close:hover { color:#475569; background:#f1f5f9; }
        .sc-form-label { display:block; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px; }
        .sc-form-input { width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; color:#1e293b; outline:none; transition:border-color 0.15s,box-shadow 0.15s; box-sizing:border-box; }
        .sc-form-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
        .sc-submit-btn { display:inline-flex; align-items:center; gap:7px; background:#10b981; color:#fff; border:none; border-radius:10px; padding:11px 24px; font-size:13px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .sc-submit-btn:hover:not(:disabled) { background:#059669; }
        .sc-submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sc-submit-danger { background:#ef4444; }
        .sc-submit-danger:hover:not(:disabled) { background:#dc2626; }
        .sc-cancel-btn { display:inline-flex; align-items:center; background:transparent; color:#64748b; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 18px; font-size:13px; font-weight:500; cursor:pointer; }
        .sc-cancel-btn:hover { border-color:#94a3b8; color:#1e293b; }
        .sc-section-label { font-size:12px; font-weight:700; color:#10b981; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px; }
        .sc-card { background:#fff; border-radius:14px; padding:20px 24px; box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04); }
        .sc-empty { text-align:center; padding:48px 0; color:#94a3b8; }
      `}</style>

      {/* Top bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabs.map(t => (
            <button key={t.key} className={`sc-tab-btn${activeTab===t.key?" active":""}`} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
              {t.count !== null && <span className="sc-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>
        {activeTab === "my-leaves" && isLinked && (
          <button className="sc-apply-btn" onClick={() => setShowApplyModal(true)}>
            <FaCalendarPlus size={13}/> Apply for Leave
          </button>
        )}
      </div>

      {/* MY LEAVES */}
      {activeTab === "my-leaves" && (
        !isLinked ? (
          <div className="sc-card" style={{ textAlign:"center", padding:"56px 24px" }}>
            <div style={{ fontSize:40, marginBottom:14, opacity:0.3 }}>🔗</div>
            <h4 style={{ fontWeight:700, color:"#0f172a", marginBottom:8 }}>No Employee Profile Linked</h4>
            <p style={{ color:"#94a3b8", fontSize:13, maxWidth:440, margin:"0 auto" }}>
              You can't view leave balances or apply for leaves until an admin links your account to an employee profile.
            </p>
          </div>
        ) : (
          <>
            <div className="sc-section-label">Leave Balances</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
              {balances.map((bal) => (
                <div className="sc-bal-card" key={bal.id}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{bal.leave_name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
                    <span style={{ fontSize:28, fontWeight:800, color:"#10b981" }}>{bal.available_days}</span>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>/ {bal.max_days} days</span>
                  </div>
                  <div style={{ height:4, background:"#e2e8f0", borderRadius:999, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(100,(bal.available_days/bal.max_days)*100)}%`, height:"100%", background:"#10b981", borderRadius:999 }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sc-card">
              <div className="sc-section-label">Leave History</div>
              {history.length === 0 ? (
                <div className="sc-empty"><div style={{fontSize:32,marginBottom:8,opacity:0.3}}>📅</div>No leave history yet</div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table className="sc-table">
                    <thead><tr>
                      <th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied On</th>
                    </tr></thead>
                    <tbody>
                      {history.map(item => {
                        const s = getStatusStyle(item.status);
                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight:600, color:"#0f172a" }}>{item.leave_name}</td>
                            <td>{formatDate(item.from_date)}</td>
                            <td>{formatDate(item.to_date)}</td>
                            <td><span style={{ background:"#f1f5f9", borderRadius:6, padding:"2px 8px", fontWeight:700, fontSize:12 }}>{item.total_days}d</span></td>
                            <td style={{ maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.reason || <span style={{color:"#94a3b8"}}>—</span>}</td>
                            <td><span className="sc-status-pill" style={{ background:s.bg, color:s.color }}>{getStatusText(item.status)}</span></td>
                            <td style={{ color:"#94a3b8" }}>{formatDate(item.created_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )
      )}

      {/* MANAGER APPROVALS */}
      {activeTab === "manager-approvals" && (
        <div className="sc-card">
          <div className="sc-section-label">Pending Manager Reviews</div>
          {managerPending.length === 0 ? (
            <div className="sc-empty"><div style={{fontSize:32,marginBottom:8,opacity:0.3}}>✅</div>No pending reviews</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="sc-table">
                <thead><tr><th>Employee</th><th>Designation</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Actions</th></tr></thead>
                <tbody>
                  {managerPending.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight:700, color:"#0f172a" }}>{item.employee_name}</td>
                      <td style={{ color:"#64748b" }}>{item.designation||"N/A"}</td>
                      <td style={{ fontWeight:600 }}>{item.leave_name}</td>
                      <td>{formatDate(item.from_date)}</td>
                      <td>{formatDate(item.to_date)}</td>
                      <td>{item.total_days}d</td>
                      <td style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.reason}</td>
                      <td>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="sc-approve-btn" onClick={() => openReviewDialog(item.id,"manager","approved")}><FiCheckCircle size={12}/> Approve</button>
                          <button className="sc-reject-btn" onClick={() => openReviewDialog(item.id,"manager","rejected")}><FiXCircle size={12}/> Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HR APPROVALS */}
      {activeTab === "hr-approvals" && (
        <div className="sc-card">
          <div className="sc-section-label">HR Final Approvals</div>
          {hrPending.length === 0 ? (
            <div className="sc-empty"><div style={{fontSize:32,marginBottom:8,opacity:0.3}}>✅</div>No pending HR approvals</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="sc-table">
                <thead><tr><th>Employee</th><th>Designation</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Actions</th></tr></thead>
                <tbody>
                  {hrPending.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight:700, color:"#0f172a" }}>{item.employee_name}</td>
                      <td style={{ color:"#64748b" }}>{item.designation||"N/A"}</td>
                      <td style={{ fontWeight:600 }}>{item.leave_name}</td>
                      <td>{formatDate(item.from_date)}</td>
                      <td>{formatDate(item.to_date)}</td>
                      <td>{item.total_days}d</td>
                      <td style={{ maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.reason}</td>
                      <td>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="sc-approve-btn" onClick={() => openReviewDialog(item.id,"hr","approved")}><FiCheckCircle size={12}/> Approve</button>
                          <button className="sc-reject-btn" onClick={() => openReviewDialog(item.id,"hr","rejected")}><FiXCircle size={12}/> Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "reports" && reportsData && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            {[
              { label:"Total Requests", val:reportsData.stats.total, color:"#6366f1", bg:"#eef2ff", icon:<FiCalendar size={16}/> },
              { label:"Pending Manager", val:reportsData.stats.pendingManager, color:"#f59e0b", bg:"#fffbeb", icon:<FiClock size={16}/> },
              { label:"Pending HR", val:reportsData.stats.pendingHR, color:"#0284c7", bg:"#f0f9ff", icon:<FiAlertCircle size={16}/> },
              { label:"Approved", val:reportsData.stats.approved, color:"#10b981", bg:"#ecfdf5", icon:<FiCheckCircle size={16}/> },
            ].map(({ label, val, color, bg, icon }) => (
              <div className="sc-stat-card" key={label} style={{ borderLeft:`4px solid ${color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:bg, color, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:"#0f172a" }}>{val}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div className="sc-card">
              <div className="sc-section-label"><FiUsers size={12} style={{marginRight:5}}/>Leaves by Department</div>
              {reportsData.departmentLeaves.length === 0 ? <p style={{color:"#94a3b8",fontSize:13}}>No data</p> :
                <div style={{ display:"flex", justifyContent:"center", maxHeight:260 }}><Pie data={deptChartData} options={{ responsive:true, plugins:{ legend:{ position:"bottom" } } }}/></div>}
            </div>
            <div className="sc-card">
              <div className="sc-section-label"><FiTrendingUp size={12} style={{marginRight:5}}/>Monthly Trend</div>
              {reportsData.monthlyTrends.length === 0 ? <p style={{color:"#94a3b8",fontSize:13}}>No data</p> :
                <Bar data={trendChartData} options={{ responsive:true, plugins:{ legend:{ display:false } } }}/>}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div className="sc-card">
              <div className="sc-section-label">Most Absent (Top 10)</div>
              <table className="sc-table">
                <thead><tr><th>Rank</th><th>Employee</th><th>Requests</th><th>Days</th></tr></thead>
                <tbody>
                  {reportsData.mostAbsent.map((item, idx) => (
                    <tr key={idx}>
                      <td><span style={{ fontWeight:800, color:"#10b981" }}>#{item.absence_rank}</span></td>
                      <td style={{ fontWeight:700 }}>{item.employee_name}</td>
                      <td>{item.approved_leaves_count}</td>
                      <td><span style={{ background:"#fef2f2", color:"#dc2626", borderRadius:6, padding:"2px 8px", fontWeight:700, fontSize:12 }}>{item.total_absent_days}d</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sc-card">
              <div className="sc-section-label">Leave Balance Report</div>
              <table className="sc-table">
                <thead><tr><th>Employee</th><th>Leave Type</th><th>Available</th><th>Allocated</th></tr></thead>
                <tbody>
                  {reportsData.balanceReport.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight:700 }}>{item.employee_name}</td>
                      <td>{item.leave_name}</td>
                      <td><span style={{ fontWeight:700, color: item.available_days < 3 ? "#dc2626" : "#10b981" }}>{item.available_days}</span></td>
                      <td style={{ color:"#64748b" }}>{item.total_allocated}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="sc-modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-title">
              Apply for Leave
              <button className="sc-modal-close" onClick={() => setShowApplyModal(false)}><FiX size={18}/></button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div style={{ marginBottom:16 }}>
                <label className="sc-form-label">Leave Type <span style={{color:"#ef4444"}}>*</span></label>
                <select className="sc-form-input" value={applyForm.leave_type_id} onChange={e => setApplyForm({...applyForm, leave_type_id:e.target.value})} required>
                  <option value="">Select leave type</option>
                  {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.leave_name} (Max {t.total_days} days)</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <div>
                  <label className="sc-form-label">From Date <span style={{color:"#ef4444"}}>*</span></label>
                  <input type="date" className="sc-form-input" value={applyForm.from_date} onChange={e => setApplyForm({...applyForm, from_date:e.target.value})} required/>
                </div>
                <div>
                  <label className="sc-form-label">To Date <span style={{color:"#ef4444"}}>*</span></label>
                  <input type="date" className="sc-form-input" value={applyForm.to_date} onChange={e => setApplyForm({...applyForm, to_date:e.target.value})} required/>
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label className="sc-form-label">Reason</label>
                <textarea className="sc-form-input" rows={3} placeholder="Context for approvers…" value={applyForm.reason} onChange={e => setApplyForm({...applyForm, reason:e.target.value})} style={{resize:"vertical"}}/>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                <button type="button" className="sc-cancel-btn" onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className="sc-submit-btn" disabled={submittingApply}>{submittingApply ? "Submitting…" : "Submit Request"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="sc-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="sc-modal" onClick={e => e.stopPropagation()}>
            <div className="sc-modal-title">
              Review Remarks
              <button className="sc-modal-close" onClick={() => setShowReviewModal(false)}><FiX size={18}/></button>
            </div>
            <div style={{ background: reviewForm.status==="approved" ? "#ecfdf5" : "#fef2f2", borderRadius:10, padding:"12px 16px", marginBottom:20, textAlign:"center", fontSize:13, fontWeight:600, color: reviewForm.status==="approved" ? "#059669" : "#dc2626" }}>
              {reviewForm.status === "approved" ? <FiCheckCircle size={15} style={{marginRight:6}}/> : <FiXCircle size={15} style={{marginRight:6}}/>}
              You are about to <strong>{reviewForm.status.toUpperCase()}</strong> this request
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom:20 }}>
                <label className="sc-form-label">Remarks (optional)</label>
                <textarea className="sc-form-input" rows={3} placeholder="Add feedback for the employee…" value={reviewForm.remarks} onChange={e => setReviewForm({...reviewForm, remarks:e.target.value})} style={{resize:"vertical"}}/>
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                <button type="button" className="sc-cancel-btn" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className={`sc-submit-btn${reviewForm.status==="rejected"?" sc-submit-danger":""}`} disabled={submittingReview}>
                  {submittingReview ? "Processing…" : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default LeaveManagement;