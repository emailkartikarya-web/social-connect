import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../services/api";
import Layout from "../components/Layout";
import { FaLink, FaCheck, FaTimes, FaInbox, FaUser, FaIdCard } from "react-icons/fa";

function ProfileLinkRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profile-link-requests");
      setRequests(res.data);
    } catch (error) {
      Swal.fire("Error", "Error loading link requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    const result = await Swal.fire({
      title: "Approve Request?",
      text: "This will link the user account with the employee profile.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#10b981",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await API.put(`/profile-link-requests/${id}/approve`);
      Swal.fire("Approved", res.data.message, "success");
      fetchRequests();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error approving request", "error");
    }
  };

  const rejectRequest = async (id) => {
    const result = await Swal.fire({
      title: "Reject Request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await API.put(`/profile-link-requests/${id}/reject`);
      Swal.fire("Rejected", res.data.message, "success");
      fetchRequests();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Error rejecting request", "error");
    }
  };

  const pending = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  const StatusBadge = ({ status }) => {
    const map = {
      approved: { bg: "rgba(16,185,129,0.1)", color: "#059669", border: "rgba(16,185,129,0.2)", label: "Approved" },
      rejected: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.2)", label: "Rejected" },
      pending:  { bg: "rgba(245,158,11,0.1)", color: "#d97706", border: "rgba(245,158,11,0.2)", label: "Pending" },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        padding: "3px 10px", borderRadius: "99px",
        fontSize: "12px", fontWeight: "700",
      }}>{s.label}</span>
    );
  };

  const RequestCard = ({ req }) => (
    <div style={{
      background: "white", borderRadius: "14px",
      padding: "20px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      borderLeft: `4px solid ${req.status === "pending" ? "#f59e0b" : req.status === "approved" ? "#10b981" : "#ef4444"}`,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap", gap: "16px",
    }}>
      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "180px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(59,130,246,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <FaUser style={{ color: "#3b82f6", fontSize: "16px" }} />
        </div>
        <div>
          <p style={{ fontWeight: "700", color: "#0f172a", margin: "0 0 2px", fontSize: "14px" }}>{req.user_name}</p>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px" }}>{req.user_email}</p>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: "#cbd5e1", fontSize: "18px", flexShrink: 0 }}>→</div>

      {/* Requested profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "180px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "rgba(16,185,129,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <FaIdCard style={{ color: "#10b981", fontSize: "16px" }} />
        </div>
        <div>
          <p style={{ fontWeight: "700", color: "#0f172a", margin: "0 0 2px", fontSize: "14px" }}>{req.employee_name}</p>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "12px" }}>{req.employee_email}</p>
        </div>
      </div>

      {/* Message */}
      <div style={{ flex: 1, minWidth: "120px" }}>
        <p style={{ color: "#64748b", margin: 0, fontSize: "13px", fontStyle: req.message ? "normal" : "italic" }}>
          {req.message || "No message provided"}
        </p>
      </div>

      {/* Status + Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <StatusBadge status={req.status} />
        {req.status === "pending" && (
          <>
            <button
              onClick={() => approveRequest(req.id)}
              style={{
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                color: "#059669", borderRadius: "8px",
                padding: "6px 14px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <FaCheck style={{ fontSize: "11px" }} /> Approve
            </button>
            <button
              onClick={() => rejectRequest(req.id)}
              style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444", borderRadius: "8px",
                padding: "6px 14px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <FaTimes style={{ fontSize: "11px" }} /> Reject
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Layout title="Profile Link Requests">
      {/* Page header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #134e4a)",
        borderRadius: "16px", padding: "24px 32px",
        marginBottom: "28px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "rgba(16,185,129,0.15)",
          border: "1px solid rgba(16,185,129,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <FaLink style={{ color: "#10b981", fontSize: "18px" }} />
        </div>
        <div>
          <h2 style={{ color: "white", fontWeight: "800", margin: "0 0 2px", fontSize: "20px" }}>
            Profile Link Requests
            {pending.length > 0 && (
              <span style={{
                marginLeft: "10px", background: "#f59e0b",
                color: "white", fontSize: "12px", fontWeight: "700",
                padding: "2px 8px", borderRadius: "99px",
              }}>{pending.length} pending</span>
            )}
          </h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
            Review and manage employee profile linking requests.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner-border" style={{ color: "#10b981" }} />
          <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "14px" }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{
          background: "white", borderRadius: "16px", padding: "60px",
          textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "rgba(16,185,129,0.08)", border: "1.5px solid rgba(16,185,129,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <FaInbox style={{ color: "#10b981", fontSize: "26px" }} />
          </div>
          <h5 style={{ color: "#0f172a", fontWeight: "700", margin: "0 0 6px" }}>No requests found</h5>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
            All clear — no profile link requests at the moment.
          </p>
        </div>
      ) : (
        <>
          {/* Pending section */}
          {pending.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "4px", height: "20px", background: "#f59e0b", borderRadius: "4px" }} />
                <h5 style={{ margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "16px" }}>
                  Pending Review
                </h5>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pending.map(req => <RequestCard key={req.id} req={req} />)}
              </div>
            </div>
          )}

          {/* Resolved section */}
          {resolved.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "4px", height: "20px", background: "#10b981", borderRadius: "4px" }} />
                <h5 style={{ margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "16px" }}>
                  Resolved
                </h5>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {resolved.map(req => <RequestCard key={req.id} req={req} />)}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default ProfileLinkRequestsAdmin;