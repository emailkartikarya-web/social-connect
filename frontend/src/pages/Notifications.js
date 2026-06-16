import React, { useState, useEffect } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Swal from "sweetalert2";
import { FaBell, FaCheckDouble, FaCheck, FaInbox } from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [pagination.page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications", {
        params: { page: pagination.page, limit: pagination.limit, unread_only: filter === "unread" },
      });
      setNotifications(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      Swal.fire("Error", "Failed to mark notification as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
      fetchUnreadCount();
      Swal.fire("Success", "All notifications marked as read", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to mark all as read", "error");
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <Layout title="Notifications">
      {/* Page header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #134e4a)",
        borderRadius: "16px", padding: "24px 32px",
        marginBottom: "28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FaBell style={{ color: "#10b981", fontSize: "18px" }} />
          </div>
          <div>
            <h2 style={{ color: "white", fontWeight: "800", margin: "0 0 2px", fontSize: "20px" }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: "10px", background: "#ef4444",
                  color: "white", fontSize: "12px", fontWeight: "700",
                  padding: "2px 8px", borderRadius: "99px",
                }}>{unreadCount}</span>
              )}
            </h2>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#10b981", borderRadius: "10px",
              padding: "8px 18px", fontSize: "13px",
              fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
            }}
          >
            <FaCheckDouble style={{ fontSize: "12px" }} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "20px",
      }}>
        {[
          { key: "all", label: "All notifications" },
          { key: "unread", label: `Unread (${unreadCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              padding: "8px 18px", borderRadius: "10px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              border: filter === key ? "none" : "1.5px solid #e2e8f0",
              background: filter === key ? "linear-gradient(135deg, #10b981, #059669)" : "white",
              color: filter === key ? "white" : "#64748b",
              boxShadow: filter === key ? "0 4px 12px rgba(16,185,129,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "760px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="spinner-border" style={{ color: "#10b981" }} role="status" />
            <p style={{ color: "#94a3b8", marginTop: "12px", fontSize: "14px" }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            background: "white", borderRadius: "16px",
            padding: "60px", textAlign: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              background: "rgba(16,185,129,0.08)",
              border: "1.5px solid rgba(16,185,129,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <FaInbox style={{ color: "#10b981", fontSize: "26px" }} />
            </div>
            <h5 style={{ color: "#0f172a", fontWeight: "700", margin: "0 0 6px" }}>No notifications</h5>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
              {filter === "unread" ? "No unread notifications." : "You're all caught up — nothing here yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  borderLeft: `4px solid ${!notif.is_read ? "#10b981" : "#e2e8f0"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "16px",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* left dot indicator */}
                <div style={{ flexShrink: 0, paddingTop: "4px" }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: !notif.is_read ? "#10b981" : "#e2e8f0",
                  }} />
                </div>

                {/* content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h6 style={{ fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "15px" }}>
                      {notif.title}
                    </h6>
                    {!notif.is_read && (
                      <span style={{
                        background: "rgba(16,185,129,0.1)", color: "#059669",
                        fontSize: "11px", fontWeight: "700",
                        padding: "2px 8px", borderRadius: "99px",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}>NEW</span>
                    )}
                  </div>
                  <p style={{ color: "#64748b", margin: "0 0 8px", fontSize: "14px", lineHeight: "1.5" }}>
                    {notif.message}
                  </p>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                    {formatTime(notif.created_at)}
                  </span>
                </div>

                {/* action */}
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    title="Mark as read"
                    style={{
                      flexShrink: 0,
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      color: "#10b981", borderRadius: "8px",
                      padding: "6px 12px", fontSize: "12px",
                      fontWeight: "600", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <FaCheck style={{ fontSize: "10px" }} /> Mark read
                  </button>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(p => ({ ...p, page }))}
                    style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      border: pagination.page === page ? "none" : "1.5px solid #e2e8f0",
                      background: pagination.page === page ? "linear-gradient(135deg, #10b981, #059669)" : "white",
                      color: pagination.page === page ? "white" : "#64748b",
                      fontWeight: "600", fontSize: "14px", cursor: "pointer",
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;