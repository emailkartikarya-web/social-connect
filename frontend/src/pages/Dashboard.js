import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaBuilding,
  FaTools, FaImage, FaRupeeSign, FaTrophy,
  FaUserPlus, FaClipboardList, FaChartBar, FaCog,
} from "react-icons/fa";
import API from "../services/api";
import Layout from "../components/Layout";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    borderLeft: `4px solid ${color}`,
    display: "flex",
    alignItems: "center",
    gap: "16px",
  }}>
    <div style={{
      width: "52px", height: "52px", borderRadius: "14px",
      background: bg, display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon style={{ color, fontSize: "22px" }} />
    </div>
    <div>
      <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px", fontWeight: "500" }}>{label}</p>
      <h3 style={{ color: "#0f172a", fontWeight: "800", margin: 0, fontSize: "26px", letterSpacing: "-0.5px" }}>{value}</h3>
    </div>
  </div>
);

const SectionHeader = ({ title }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
  }}>
    <div style={{ width: "4px", height: "22px", background: "#10b981", borderRadius: "4px" }} />
    <h4 style={{ margin: 0, fontWeight: "800", color: "#0f172a", fontSize: "18px" }}>{title}</h4>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : {};

  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await API.get("/dashboard/stats");
      setStats(statsRes.data);
      if (statsRes.data.dashboardType === "admin") {
        const empRes = await API.get("/employees");
        setEmployees(empRes.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
      if (error.response?.data) setStats(error.response.data);
      else Swal.fire("Error", "Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString()}`;

  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const departmentCounts = employees.reduce((acc, emp) => {
    const dept = emp.department_name || "N/A";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentChartData = {
    labels: Object.keys(departmentCounts),
    datasets: [{
      label: "Employees",
      data: Object.values(departmentCounts),
      backgroundColor: ["#10b981","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#84CC16"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const salaryChartData = {
    labels: employees.map((emp) => emp.name),
    datasets: [{
      label: "Salary",
      data: employees.map((emp) => Number(emp.salary || 0)),
      backgroundColor: "#10b981",
      borderRadius: 8,
    }],
  };

  const chartOptions = { responsive: true, plugins: { legend: { position: "bottom" } } };
  const salaryChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#10b981" }}></div>
          <p className="text-muted mt-3">Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout title="Dashboard">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-5 text-center">
            <h3 className="fw-bold">No Dashboard Data</h3>
            <p className="text-muted mb-0">Please try refreshing the page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">

      {/* Welcome bar */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #134e4a)",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <h2 style={{ color: "white", fontWeight: "800", margin: "0 0 6px", fontSize: "24px" }}>
            Hey, {user.name} 👋
          </h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
            {stats.dashboardType === "admin"
              ? "Here's what's happening across Social Connect HRMS today."
              : stats.dashboardType === "unlinked_employee"
              ? "Your account is active but not linked to a profile yet."
              : "Here's your personal workspace overview."}
          </p>
        </div>
        <div style={{
          background: "rgba(16,185,129,0.15)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "10px",
          padding: "8px 18px",
          color: "#10b981",
          fontSize: "13px",
          fontWeight: "600",
        }}>
          {stats.dashboardType === "admin" ? "Admin View" : "Employee View"}
        </div>
      </div>

      {/* UNLINKED STATE */}
      {stats.dashboardType === "unlinked_employee" ? (
        <div style={{
          background: "white", borderRadius: "16px", padding: "60px",
          textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          borderLeft: "4px solid #10b981",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔗</div>
          <h3 style={{ fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Profile Not Linked</h3>
          <p className="text-muted mb-4">{stats.message}</p>
          <button
            onClick={() => navigate("/request-profile-link")}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white", border: "none", borderRadius: "10px",
              padding: "12px 28px", fontWeight: "700", fontSize: "14px",
              cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            }}
          >
            Request Profile Link →
          </button>
        </div>

      ) : stats.dashboardType === "employee" ? (
        <>
          <div className="row g-4 mb-4">
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaUsers} label="My Name" value={stats.profile?.name} color="#10b981" bg="rgba(16,185,129,0.1)" />
            </div>
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaBuilding} label="Department" value={stats.profile?.department_name || "N/A"} color="#3b82f6" bg="rgba(59,130,246,0.1)" />
            </div>
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaCog} label="Designation" value={stats.profile?.designation || "N/A"} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
            </div>
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaTools} label="My Skills" value={stats.skills?.length || 0} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
            </div>
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaImage} label="My Images" value={stats.imageCount || 0} color="#06b6d4" bg="rgba(6,182,212,0.1)" />
            </div>
            <div className="col-lg-4 col-md-6">
              <StatCard icon={FaChartBar} label="Profile Completion" value={`${stats.profileCompletion || 0}%`} color="#10b981" bg="rgba(16,185,129,0.1)" />
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>Profile Completion</span>
              <span style={{ color: "#10b981", fontWeight: "700" }}>{stats.profileCompletion || 0}%</span>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "10px", overflow: "hidden" }}>
              <div style={{
                width: `${stats.profileCompletion || 0}%`,
                height: "100%",
                background: "linear-gradient(90deg, #10b981, #059669)",
                borderRadius: "99px",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Profile details */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <SectionHeader title="My Profile Details" />
            <div className="row g-3">
              {[
                ["Email", stats.profile?.email],
                ["Phone", stats.profile?.phone || "N/A"],
                ["Salary", formatCurrency(stats.profile?.salary)],
                ["Address", stats.profile?.address || "N/A"],
              ].map(([label, val]) => (
                <div className="col-md-6" key={label}>
                  <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>{label}</p>
                  <p style={{ color: "#0f172a", fontWeight: "600", margin: 0 }}>{val}</p>
                </div>
              ))}
              <div className="col-md-6">
                <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Status</p>
                <span style={{
                  background: stats.profile?.status === "inactive" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                  color: stats.profile?.status === "inactive" ? "#ef4444" : "#10b981",
                  padding: "4px 12px", borderRadius: "99px", fontSize: "13px", fontWeight: "600",
                }}>
                  {stats.profile?.status === "inactive" ? "Inactive" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", marginBottom: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <SectionHeader title="My Skills" />
            {stats.skills?.length === 0 ? (
              <p className="text-muted">No skills assigned yet.</p>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {stats.skills.map((skill, i) => (
                  <span key={i} style={{
                    background: "rgba(16,185,129,0.1)", color: "#059669",
                    border: "1px solid rgba(16,185,129,0.2)",
                    padding: "6px 14px", borderRadius: "99px", fontSize: "13px", fontWeight: "600",
                  }}>{skill.skill_name}</span>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <SectionHeader title="My Uploaded Images" />
            {stats.images?.length === 0 ? (
              <p className="text-muted">No images uploaded yet.</p>
            ) : (
              <div className="row g-3">
                {stats.images.map((img) => (
                  <div className="col-md-3 col-6" key={img.id}>
                    <div
                      onClick={() => setSelectedImage(img.image_url || img.url)}
                      style={{
                        borderRadius: "12px", overflow: "hidden", height: "140px",
                        cursor: "pointer", border: "2px solid #e2e8f0",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                    >
                      <img src={img.image_url || img.url} alt="Employee" className="img-fluid w-100 h-100" style={{ objectFit: "cover" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>

      ) : (
        <>
          {/* ADMIN STATS */}
          <div className="row g-4 mb-5">
            <div className="col-lg-3 col-md-6"><StatCard icon={FaUsers} label="Total Employees" value={stats.employees} color="#10b981" bg="rgba(16,185,129,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaCheckCircle} label="Active Employees" value={stats.activeEmployees} color="#3b82f6" bg="rgba(59,130,246,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaTimesCircle} label="Inactive Employees" value={stats.inactiveEmployees} color="#ef4444" bg="rgba(239,68,68,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaBuilding} label="Departments" value={stats.departments} color="#8b5cf6" bg="rgba(139,92,246,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaTools} label="Skills" value={stats.skills} color="#f59e0b" bg="rgba(245,158,11,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaImage} label="Images" value={stats.images} color="#06b6d4" bg="rgba(6,182,212,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaRupeeSign} label="Average Salary" value={formatCurrency(stats.averageSalary)} color="#10b981" bg="rgba(16,185,129,0.1)" /></div>
            <div className="col-lg-3 col-md-6"><StatCard icon={FaTrophy} label="Highest Salary" value={formatCurrency(stats.highestSalary)} color="#f59e0b" bg="rgba(245,158,11,0.1)" /></div>
          </div>

          {/* ANALYTICS */}
          <div style={{ marginBottom: "32px" }}>
            <SectionHeader title="Analytics" />
            <div className="row g-4">
              <div className="col-lg-5">
                <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "100%" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "20px", fontSize: "15px" }}>Employees by Department</p>
                  {employees.length === 0
                    ? <p className="text-muted">No employee data available.</p>
                    : <Pie data={departmentChartData} options={chartOptions} />}
                </div>
              </div>
              <div className="col-lg-7">
                <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "100%" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "20px", fontSize: "15px" }}>Salary Distribution</p>
                  {employees.length === 0
                    ? <p className="text-muted">No salary data available.</p>
                    : <Bar data={salaryChartData} options={salaryChartOptions} />}
                </div>
              </div>
            </div>
          </div>

          {/* RECENT */}
          <div style={{ marginBottom: "32px" }}>
            <SectionHeader title="Recent Activity" />
            <div className="row g-4">
              <div className="col-lg-6">
                <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "100%" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "16px", fontSize: "15px" }}>Recent Employees</p>
                  {stats.recentEmployees?.length === 0 ? (
                    <p className="text-muted">No recent employees.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle" style={{ fontSize: "14px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                            {["Name", "Department", "Status", "Date"].map(h => (
                              <th key={h} style={{ color: "#94a3b8", fontWeight: "600", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", border: "none", paddingBottom: "12px" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentEmployees?.map((emp) => (
                            <tr key={emp.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                              <td style={{ border: "none", padding: "12px 8px" }}>
                                <div style={{ fontWeight: "600", color: "#0f172a" }}>{emp.name}</div>
                                <small style={{ color: "#94a3b8" }}>{emp.designation || "N/A"}</small>
                              </td>
                              <td style={{ border: "none", color: "#64748b" }}>{emp.department_name || "N/A"}</td>
                              <td style={{ border: "none" }}>
                                <span style={{
                                  background: emp.status === "inactive" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                                  color: emp.status === "inactive" ? "#ef4444" : "#10b981",
                                  padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600",
                                }}>
                                  {emp.status === "inactive" ? "Inactive" : "Active"}
                                </span>
                              </td>
                              <td style={{ border: "none", color: "#94a3b8", fontSize: "13px" }}>{formatDate(emp.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", height: "100%" }}>
                  <p style={{ fontWeight: "700", color: "#0f172a", marginBottom: "16px", fontSize: "15px" }}>Audit Log</p>
                  {stats.activityLogs?.length === 0 ? (
                    <p className="text-muted">No activity logs yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {stats.activityLogs?.map((log) => (
                        <div key={log.id} style={{
                          borderLeft: "3px solid #10b981",
                          paddingLeft: "14px",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                            <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{log.action}</span>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>{formatDate(log.created_at)}</span>
                          </div>
                          <p style={{ color: "#64748b", margin: "0 0 2px", fontSize: "13px" }}>{log.description}</p>
                          <small style={{ color: "#94a3b8" }}>By: {log.user_name || "System"}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <SectionHeader title="Quick Actions" />
            <div className="row g-4">
              {[
                { icon: FaBuilding, label: "Departments", desc: "Create and manage departments", path: "/departments", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
                { icon: FaTools, label: "Skills", desc: "Manage technical and soft skills", path: "/skills", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                { icon: FaUserPlus, label: "Create Employee", desc: "Add a new employee to the system", path: "/create-employee", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                { icon: FaClipboardList, label: "Employee List", desc: "View and manage all employees", path: "/employees", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                { icon: FaChartBar, label: "Reports", desc: "Generate and export reports", path: "/report", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
              ].map(({ icon: Icon, label, desc, path, color, bg }) => (
                <div className="col-lg-4 col-md-6" key={label}>
                  <div
                    onClick={() => navigate(path)}
                    style={{
                      background: "white", borderRadius: "16px", padding: "24px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                      borderTop: `3px solid ${color}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
                  >
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: bg, display: "flex", alignItems: "center",
                      justifyContent: "center", marginBottom: "16px",
                    }}>
                      <Icon style={{ color, fontSize: "20px" }} />
                    </div>
                    <h6 style={{ fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>{label}</h6>
                    <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 16px" }}>{desc}</p>
                    <span style={{
                      color, fontSize: "13px", fontWeight: "600",
                    }}>Open →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Image modal */}
      {selectedImage && (
        <div
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.8)" }}
          className="modal fade show"
          tabIndex="-1"
          onClick={() => setSelectedImage(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
              <div className="modal-header" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <h5 className="modal-title fw-bold">Image Preview</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedImage(null)}></button>
              </div>
              <div className="modal-body text-center p-4">
                <img src={selectedImage} alt="Preview" className="img-fluid rounded" style={{ maxHeight: "70vh", objectFit: "contain" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;