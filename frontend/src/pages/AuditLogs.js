/**
 * Audit Logs Page
 * Admin-only view of all data changes in the system
 */

import React, { useState, useEffect } from "react";
import { FaFilter, FaHistory, FaEye, FaTimes } from "react-icons/fa";
import api from "../services/api";
import Layout from "../components/Layout";
import FormTable from "../components/FormTable";
import FormSelect from "../components/FormSelect";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import Swal from "sweetalert2";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    table_name: "",
    action_type: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.page, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await api.get("/audit-logs", { params });
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to fetch audit logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Soft pill badge for CREATE / UPDATE / DELETE
  const actionBadge = (val) => {
    const map = {
      CREATE: { color: "#10b981", label: "Create" },
      UPDATE: { color: "#3b82f6", label: "Update" },
      DELETE: { color: "#ef4444", label: "Delete" },
    };
    const s = map[val] || { color: "#64748b", label: val };
    return (
      <span className="sc-badge" style={{ background: `${s.color}1f`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const columns = [
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (val) => new Date(val).toLocaleString(),
    },
    { key: "table_name", label: "Table", sortable: true },
    {
      key: "action_type",
      label: "Action",
      render: (val) => actionBadge(val),
    },
    { key: "record_id", label: "Record ID" },
    { key: "performed_by_name", label: "Changed By" },
  ];

  const actions = [
    {
      label: (
        <>
          <FaEye className="me-1" /> View
        </>
      ),
      className: "sc-act-view",
      onClick: (row) => handleViewDetails(row),
    },
  ];

  return (
    <Layout title="Audit Logs">
      <div className="sc-audit">
        <style>{`
          .sc-audit .sc-page-header {
            margin-bottom: 1.5rem;
          }

          .sc-audit .sc-page-title {
            margin: 0;
            font-weight: 800;
            font-size: 1.5rem;
            color: #0f172a;
          }

          .sc-audit .sc-page-subtitle {
            margin: 6px 0 0;
            color: #64748b;
            max-width: 620px;
          }

          .sc-audit .sc-card {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .sc-audit .sc-card-header {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .sc-audit .sc-card-icon {
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

          .sc-audit .sc-card-title {
            margin: 0;
            font-weight: 700;
            font-size: 1rem;
            color: #0f172a;
          }

          .sc-audit .sc-card-subtitle {
            margin: 2px 0 0;
            font-size: 0.8rem;
            color: #94a3b8;
          }

          .sc-audit .sc-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: capitalize;
          }

          .sc-audit .sc-clear-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #64748b;
            font-weight: 600;
            font-size: 0.85rem;
            border-radius: 10px;
            padding: 0.5rem 1rem;
            transition: all 0.15s ease;
          }

          .sc-audit .sc-clear-btn:hover {
            border-color: #10b981;
            color: #10b981;
          }

          /* Table polish (overrides default dark/blue Bootstrap table) */
          .sc-audit table thead,
          .sc-audit table thead tr,
          .sc-audit table thead th {
            background-color: #f8fafc !important;
            color: #475569 !important;
            border-bottom: 2px solid #e2e8f0 !important;
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 0.06em;
            font-weight: 700;
            box-shadow: none !important;
          }

          .sc-audit table tbody td,
          .sc-audit table thead th {
            padding: 0.85rem 1rem;
            vertical-align: middle;
          }

          .sc-audit table tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }

          .sc-audit table tbody tr:hover {
            background-color: #ecfdf5;
          }

          /* Pagination */
          .sc-audit .pagination .page-link {
            color: #10b981;
            border-color: #e2e8f0;
          }

          .sc-audit .pagination .page-item.active .page-link {
            background-color: #10b981 !important;
            border-color: #10b981 !important;
            color: #ffffff !important;
          }

          .sc-audit .pagination .page-item.disabled .page-link {
            color: #cbd5e1;
          }

          /* Row action pill */
          .sc-audit .btn.sc-act-view {
            border: none !important;
            border-radius: 999px !important;
            background: #eef2ff !important;
            color: #4f46e5 !important;
            font-size: 0.78rem !important;
            font-weight: 600 !important;
            padding: 0.35rem 0.9rem !important;
            display: inline-flex;
            align-items: center;
            transition: opacity 0.15s ease;
          }

          .sc-audit .btn.sc-act-view:hover {
            opacity: 0.75;
          }

          /* Detail modal */
          .sc-audit .sc-code-block {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.85rem 1rem;
            font-size: 0.8rem;
            color: #334155;
            max-height: 220px;
            overflow: auto;
          }

          .sc-audit .sc-info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem 1.5rem;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 1rem 1.25rem;
          }

          .sc-audit .sc-info-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-bottom: 2px;
          }

          .sc-audit .sc-info-value {
            font-weight: 600;
            color: #0f172a;
            margin: 0;
          }
        `}</style>

        <div className="sc-page-header">
          <h2 className="sc-page-title">Audit Trail</h2>
          <p className="sc-page-subtitle">
            A complete, read-only record of every create, update and delete made across Social
            Connect — who changed what, and when.
          </p>
        </div>

        <div className="sc-card">
          <div className="sc-card-header">
            <div className="sc-card-icon">
              <FaFilter size={16} />
            </div>
            <div>
              <h6 className="sc-card-title">Filter Logs</h6>
              <p className="sc-card-subtitle">Narrow the trail by table, action type or date range</p>
            </div>
          </div>
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <FormSelect
                label="Table"
                name="table_name"
                value={filters.table_name}
                onChange={(e) => setFilters({ ...filters, table_name: e.target.value })}
                options={[
                  { value: "employee_profiles", label: "Employees" },
                  { value: "assets", label: "Assets" },
                  { value: "leave_applications", label: "Leaves" },
                  { value: "users", label: "Users" },
                ]}
              />
            </div>
            <div className="col-md-2">
              <FormSelect
                label="Action"
                name="action_type"
                value={filters.action_type}
                onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
                options={[
                  { value: "CREATE", label: "Create" },
                  { value: "UPDATE", label: "Update" },
                  { value: "DELETE", label: "Delete" },
                ]}
              />
            </div>
            <div className="col-md-2">
              <FormInput
                label="From Date"
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <FormInput
                label="To Date"
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="sc-clear-btn"
                onClick={() =>
                  setFilters({
                    table_name: "",
                    action_type: "",
                    dateFrom: "",
                    dateTo: "",
                  })
                }
              >
                <FaTimes /> Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="sc-card">
          <div className="sc-card-header">
            <div className="sc-card-icon">
              <FaHistory size={16} />
            </div>
            <div>
              <h6 className="sc-card-title">Activity Log</h6>
              <p className="sc-card-subtitle">Every recorded change, most recent first</p>
            </div>
          </div>
          <FormTable
            columns={columns}
            data={logs}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            actions={actions}
            loading={loading}
          />
        </div>

        {/* Detail Modal */}
        <Modal isOpen={showDetailModal} title="Audit Log Details" onClose={() => setShowDetailModal(false)}>
          {selectedLog && (
            <div>
              <div className="mb-3">
                <h6 className="sc-card-title mb-2">Old Data</h6>
                <pre className="sc-code-block mb-0">
                  {JSON.stringify(selectedLog.old_data, null, 2) || "No changes"}
                </pre>
              </div>
              <div className="mb-3">
                <h6 className="sc-card-title mb-2">New Data</h6>
                <pre className="sc-code-block mb-0">
                  {JSON.stringify(selectedLog.new_data, null, 2) || "No changes"}
                </pre>
              </div>
              <div className="sc-info-grid">
                <div>
                  <p className="sc-info-label">IP Address</p>
                  <p className="sc-info-value">{selectedLog.ip_address || "N/A"}</p>
                </div>
                <div>
                  <p className="sc-info-label">Timestamp</p>
                  <p className="sc-info-value">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AuditLogs;