import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import {
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaHistory,
  FaClipboardList,
  FaEdit,
  FaFilter,
  FaUserSlash,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../services/api";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Table from "../components/Table";
import Modal from "../components/Modal";
import Loader from "../components/Loader";

function AttendanceManagement() {
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : {};
  const role = (user.role || "").toLowerCase();
  const isLinked = !!user.employee_profile_id;
  const canManage = ["admin", "hr", "manager"].includes(role);
  const canEdit = ["admin", "hr"].includes(role);

  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [activeTab, setActiveTab] = useState("my-attendance");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    from: monthStart,
    to: today,
    employee_id: "",
    status: "",
  });
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    employee_id: "",
    attendance_date: today,
    clock_in: "",
    clock_out: "",
    break_minutes: 0,
    status: "present",
    notes: "",
  });

  useEffect(() => {
    if (!isLinked && canManage) {
      setActiveTab("team-attendance");
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const requests = [];

      if (isLinked) {
        requests.push(api.get("/attendance/today"));
        requests.push(api.get("/attendance/my", { params: filters }));
      }

      if (canManage) {
        requests.push(api.get("/attendance", { params: filters }));
        requests.push(api.get("/attendance/summary", { params: filters }));
        requests.push(api.get("/employees"));
      }

      const responses = await Promise.all(requests);
      let index = 0;

      if (isLinked) {
        setTodayRecord(responses[index].data.record);
        index += 1;
        setMyRecords(responses[index].data.records || []);
        index += 1;
      }

      if (canManage) {
        setAllRecords(responses[index].data.records || []);
        index += 1;
        setSummary(responses[index].data.summary || []);
        index += 1;
        setEmployees(responses[index].data?.data ?? responses[index].data ?? []);
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not load attendance data", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshWithFilters = async () => {
    await loadData();
  };

  const handleClockIn = async () => {
    try {
      setActionLoading(true);
      await api.post("/attendance/clock-in", {});
      Swal.fire("Success", "Clocked in successfully", "success");
      loadData();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not clock in", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    const { value: breakMinutes } = await Swal.fire({
      title: "Clock Out",
      input: "number",
      inputLabel: "Break minutes",
      inputValue: 0,
      inputAttributes: { min: "0" },
      showCancelButton: true,
    });

    if (breakMinutes === undefined) return;

    try {
      setActionLoading(true);
      await api.post("/attendance/clock-out", {
        break_minutes: parseInt(breakMinutes || 0, 10),
      });
      Swal.fire("Success", "Clocked out successfully", "success");
      loadData();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not clock out", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/attendance/manual", {
        ...manualForm,
        employee_id: parseInt(manualForm.employee_id, 10),
        break_minutes: parseInt(manualForm.break_minutes || 0, 10),
      });
      Swal.fire("Saved", "Attendance record saved successfully", "success");
      setShowManualModal(false);
      setManualForm({
        employee_id: "",
        attendance_date: today,
        clock_in: "",
        clock_out: "",
        break_minutes: 0,
        status: "present",
        notes: "",
      });
      loadData();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Could not save attendance", "error");
    }
  };

  const openEditModal = (record = null) => {
    if (record) {
      setManualForm({
        employee_id: record.employee_id,
        attendance_date: toDateInput(record.attendance_date),
        clock_in: toDateTimeInput(record.clock_in),
        clock_out: toDateTimeInput(record.clock_out),
        break_minutes: record.break_minutes || 0,
        status: record.status || "present",
        notes: record.notes || "",
      });
    }
    setShowManualModal(true);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMinutes = (minutes) => {
    const total = parseInt(minutes || 0, 10);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${hours}h ${mins}m`;
  };

  const toDateInput = (value) => {
    if (!value) return today;
    return new Date(value).toISOString().split("T")[0];
  };

  const toDateTimeInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  // Pill-style status badge. `dark` renders a brighter variant for the
  // dark "Today" hero card; default renders a soft tint for table rows.
  const statusBadge = (status, dark = false) => {
    const map = {
      present: { color: "#10b981", label: "Present" },
      late: { color: "#f59e0b", label: "Late" },
      half_day: { color: "#3b82f6", label: "Half Day" },
      absent: { color: "#ef4444", label: "Absent" },
      leave: { color: "#8b5cf6", label: "Leave" },
      holiday: { color: "#64748b", label: "Holiday" },
    };
    const s = map[status] || { color: "#94a3b8", label: "Not marked" };
    return (
      <span
        className="sc-badge"
        style={{
          background: dark ? `${s.color}33` : `${s.color}1f`,
          color: dark ? "#ffffff" : s.color,
        }}
      >
        {s.label}
      </span>
    );
  };

  const renderAttendanceRow = (item) => (
    <tr key={item.id}>
      <td className="fw-semibold" style={{ color: "#0f172a" }}>
        {item.employee_name || "Me"}
      </td>
      <td>{formatDate(item.attendance_date)}</td>
      <td>{formatTime(item.clock_in)}</td>
      <td>{formatTime(item.clock_out)}</td>
      <td>{formatMinutes(item.work_minutes)}</td>
      <td>{formatMinutes(item.overtime_minutes)}</td>
      <td>{statusBadge(item.status)}</td>
      {canEdit && (
        <td>
          <button
            type="button"
            className="sc-icon-btn"
            onClick={() => openEditModal(item)}
            title="Edit this record"
          >
            <FaEdit size={13} />
          </button>
        </td>
      )}
    </tr>
  );

  if (loading) {
    return (
      <Layout title="Attendance">
        <Loader message="Loading attendance records..." />
      </Layout>
    );
  }

  return (
    <Layout title="Attendance">
      <div className="sc-attendance">
        <style>{`
          .sc-attendance .sc-intro {
            color: #64748b;
            max-width: 640px;
            margin-bottom: 1.5rem;
          }

          .sc-attendance .sc-tabs {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 4px;
            background: #f1f5f9;
            border-radius: 12px;
            padding: 4px;
          }

          .sc-attendance .sc-tab-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
            background: transparent;
            color: #64748b;
            font-weight: 600;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border-radius: 9px;
            transition: background 0.15s ease, color 0.15s ease;
          }

          .sc-attendance .sc-tab-btn.active {
            background: #10b981;
            color: #ffffff;
            box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);
          }

          .sc-attendance .sc-tab-btn:not(.active):hover {
            background: #e2e8f0;
            color: #0f172a;
          }

          .sc-attendance .sc-card {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
            padding: 1.5rem;
          }

          .sc-attendance .sc-card-header {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .sc-attendance .sc-card-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: #ecfdf5;
            color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .sc-attendance .sc-card-title {
            margin: 0;
            font-weight: 700;
            font-size: 1rem;
            color: #0f172a;
          }

          .sc-attendance .sc-card-subtitle {
            margin: 2px 0 0;
            font-size: 0.8rem;
            color: #94a3b8;
          }

          .sc-attendance .sc-today {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius: 16px;
            padding: 1.75rem;
            color: #ffffff;
          }

          .sc-attendance .sc-eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.7rem;
            font-weight: 700;
            color: #34d399;
            margin-bottom: 0.75rem;
          }

          .sc-attendance .sc-stat-label {
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.68rem;
            font-weight: 600;
            color: #94a3b8;
            margin-bottom: 4px;
          }

          .sc-attendance .sc-stat-value {
            font-size: 1.35rem;
            font-weight: 700;
            margin: 0;
            color: #ffffff;
          }

          .sc-attendance .sc-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
          }

          .sc-attendance .sc-icon-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: #ecfdf5;
            color: #10b981;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s ease, color 0.15s ease;
          }

          .sc-attendance .sc-icon-btn:hover {
            background: #10b981;
            color: #ffffff;
          }

          .sc-attendance .sc-filter-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 6px;
          }

          .sc-attendance .sc-go-btn {
            width: 100%;
            border: none;
            border-radius: 10px;
            background: #10b981;
            color: #ffffff;
            font-weight: 600;
            padding: 0.5rem 1rem;
            transition: background 0.15s ease;
          }

          .sc-attendance .sc-go-btn:hover {
            background: #0d9c6f;
            color: #ffffff;
          }

          .sc-attendance .sc-table-wrap table {
            margin-bottom: 0;
          }

          .sc-attendance .sc-table-wrap thead th {
            background: #f8fafc;
            color: #475569;
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 0.06em;
            font-weight: 700;
            border-bottom: 2px solid #e2e8f0;
            padding: 0.85rem 1rem;
            white-space: nowrap;
          }

          .sc-attendance .sc-table-wrap tbody td {
            padding: 0.8rem 1rem;
            vertical-align: middle;
            font-size: 0.9rem;
            border-bottom: 1px solid #f1f5f9;
          }

          .sc-attendance .sc-table-wrap tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          .sc-attendance .sc-table-wrap tbody tr:hover {
            background: #ecfdf5;
          }

          .sc-attendance .sc-empty-state {
            text-align: center;
            padding: 3rem 1rem;
          }

          .sc-attendance .sc-empty-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            background: #ecfdf5;
            color: #10b981;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
          }
        `}</style>

        <p className="sc-intro">
          Clock in and out, review your attendance history, and keep an eye on your team's
          time and overtime — all from one place.
        </p>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="sc-tabs">
            {isLinked && (
              <button
                type="button"
                className={`sc-tab-btn ${activeTab === "my-attendance" ? "active" : ""}`}
                onClick={() => setActiveTab("my-attendance")}
              >
                <FaHistory /> My Attendance
              </button>
            )}

            {canManage && (
              <>
                <button
                  type="button"
                  className={`sc-tab-btn ${activeTab === "team-attendance" ? "active" : ""}`}
                  onClick={() => setActiveTab("team-attendance")}
                >
                  <FaClipboardList /> Team Records
                </button>
                <button
                  type="button"
                  className={`sc-tab-btn ${activeTab === "summary" ? "active" : ""}`}
                  onClick={() => setActiveTab("summary")}
                >
                  <FaClock /> Summary
                </button>
              </>
            )}
          </div>

          {canEdit && (
            <Button variant="success" onClick={() => openEditModal()}>
              <FaEdit className="me-2" /> Add Manual Record
            </Button>
          )}
        </div>

        {activeTab === "my-attendance" && (
          <>
            {!isLinked ? (
              <div className="sc-card sc-empty-state">
                <div className="sc-empty-icon">
                  <FaUserSlash size={22} />
                </div>
                <h6 className="sc-card-title mb-2">No employee profile linked yet</h6>
                <p className="text-muted mb-0">
                  Link your account to an employee profile to start clocking in and viewing
                  your attendance history.
                </p>
              </div>
            ) : (
              <>
                <div className="sc-today mb-4">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">
                    <div>
                      <p className="sc-eyebrow mb-3">Today · {formatDate(today)}</p>
                      <div className="d-flex flex-wrap gap-4">
                        <div>
                          <p className="sc-stat-label">Status</p>
                          {statusBadge(todayRecord?.status, true)}
                        </div>
                        <div>
                          <p className="sc-stat-label">Clock In</p>
                          <p className="sc-stat-value">{formatTime(todayRecord?.clock_in)}</p>
                        </div>
                        <div>
                          <p className="sc-stat-label">Clock Out</p>
                          <p className="sc-stat-value">{formatTime(todayRecord?.clock_out)}</p>
                        </div>
                        <div>
                          <p className="sc-stat-label">Worked</p>
                          <p className="sc-stat-value" style={{ color: "#34d399" }}>
                            {formatMinutes(todayRecord?.work_minutes)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {!todayRecord?.clock_in ? (
                        <Button variant="success" onClick={handleClockIn} loading={actionLoading}>
                          <FaSignInAlt className="me-2" /> Clock In
                        </Button>
                      ) : !todayRecord?.clock_out ? (
                        <Button variant="danger" onClick={handleClockOut} loading={actionLoading}>
                          <FaSignOutAlt className="me-2" /> Clock Out
                        </Button>
                      ) : (
                        <span className="sc-badge" style={{ background: "#10b98133", color: "#34d399" }}>
                          <FaCheckCircle className="me-2" /> Completed for today
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sc-card">
                  <div className="sc-card-header">
                    <div className="sc-card-icon">
                      <FaHistory size={16} />
                    </div>
                    <div>
                      <h6 className="sc-card-title">My Attendance History</h6>
                      <p className="sc-card-subtitle">
                        Your clock-ins, hours worked and overtime for the selected period
                      </p>
                    </div>
                  </div>
                  <div className="sc-table-wrap">
                    <Table
                      headers={["Employee", "Date", "Clock In", "Clock Out", "Worked", "Overtime", "Status"]}
                      data={myRecords}
                      renderRow={renderAttendanceRow}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "team-attendance" && canManage && (
          <>
            <div className="sc-card mb-4">
              <div className="sc-card-header">
                <div className="sc-card-icon">
                  <FaFilter size={16} />
                </div>
                <div>
                  <h6 className="sc-card-title">Filter Records</h6>
                  <p className="sc-card-subtitle">
                    Narrow the team's attendance by date range, employee or status
                  </p>
                </div>
              </div>
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <div className="sc-filter-label">From</div>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <div className="sc-filter-label">To</div>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <div className="sc-filter-label">Employee</div>
                  <select
                    className="form-select"
                    value={filters.employee_id}
                    onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}
                  >
                    <option value="">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <div className="sc-filter-label">Status</div>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button type="button" className="sc-go-btn" onClick={refreshWithFilters}>
                    Go
                  </button>
                </div>
              </div>
            </div>

            <div className="sc-card">
              <div className="sc-card-header">
                <div className="sc-card-icon">
                  <FaClipboardList size={16} />
                </div>
                <div>
                  <h6 className="sc-card-title">Team Attendance Records</h6>
                  <p className="sc-card-subtitle">
                    Clock-ins, hours worked and status for everyone in the selected range
                  </p>
                </div>
              </div>
              {allRecords.length === 0 ? (
                <div className="sc-empty-state">
                  <div className="sc-empty-icon">
                    <FaClipboardList size={22} />
                  </div>
                  <h6 className="sc-card-title mb-2">No records found</h6>
                  <p className="text-muted mb-0">
                    Try widening the date range or clearing the employee and status filters.
                  </p>
                </div>
              ) : (
                <div className="sc-table-wrap">
                  <Table
                    headers={
                      canEdit
                        ? ["Employee", "Date", "Clock In", "Clock Out", "Worked", "Overtime", "Status", "Actions"]
                        : ["Employee", "Date", "Clock In", "Clock Out", "Worked", "Overtime", "Status"]
                    }
                    data={allRecords}
                    renderRow={renderAttendanceRow}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "summary" && canManage && (
          <div className="sc-card">
            <div className="sc-card-header">
              <div className="sc-card-icon">
                <FaClock size={16} />
              </div>
              <div>
                <h6 className="sc-card-title">Attendance Summary</h6>
                <p className="sc-card-subtitle">
                  Totals for present days, absences, lateness and hours for the selected range
                </p>
              </div>
            </div>
            {summary.length === 0 ? (
              <div className="sc-empty-state">
                <div className="sc-empty-icon">
                  <FaClock size={22} />
                </div>
                <h6 className="sc-card-title mb-2">No summary data yet</h6>
                <p className="text-muted mb-0">
                  Adjust the filters on Team Records and refresh to generate a summary.
                </p>
              </div>
            ) : (
              <div className="sc-table-wrap">
                <Table
                  headers={[
                    "Employee",
                    "Department",
                    "Records",
                    "Present",
                    "Half Days",
                    "Absent",
                    "Late",
                    "Worked",
                    "Overtime",
                  ]}
                  data={summary}
                  renderRow={(item) => (
                    <tr key={item.employee_id}>
                      <td className="fw-semibold" style={{ color: "#0f172a" }}>
                        {item.employee_name}
                      </td>
                      <td>{item.department_name || "-"}</td>
                      <td>{item.total_records}</td>
                      <td>{item.present_days}</td>
                      <td>{item.half_days}</td>
                      <td>{item.absent_days}</td>
                      <td>{item.late_days}</td>
                      <td>{formatMinutes(item.total_work_minutes)}</td>
                      <td>{formatMinutes(item.total_overtime_minutes)}</td>
                    </tr>
                  )}
                />
              </div>
            )}
          </div>
        )}

        <Modal show={showManualModal} onClose={() => setShowManualModal(false)} title="Manual Attendance Record">
          <form onSubmit={handleManualSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Employee</label>
              <select
                className="form-select"
                value={manualForm.employee_id}
                onChange={(e) => setManualForm({ ...manualForm, employee_id: e.target.value })}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={manualForm.attendance_date}
                  onChange={(e) => setManualForm({ ...manualForm, attendance_date: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className="form-select"
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                  required
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Clock In</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={manualForm.clock_in}
                  onChange={(e) => setManualForm({ ...manualForm, clock_in: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Clock Out</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={manualForm.clock_out}
                  onChange={(e) => setManualForm({ ...manualForm, clock_out: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Break Minutes</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={manualForm.break_minutes}
                onChange={(e) => setManualForm({ ...manualForm, break_minutes: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={manualForm.notes}
                onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowManualModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="success">
                Save Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default AttendanceManagement;