/**
 * AssetManagement Page
 * Manage company assets: create, allocate, return, view history
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaShareSquare,
  FaTrashAlt,
  FaUndo,
  FaFilter,
  FaBoxOpen,
} from "react-icons/fa";
import api from "../services/api";
import FormTable from "../components/FormTable";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Modal from "../components/Modal";
import Layout from "../components/Layout";
import Swal from "sweetalert2";

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ status: "", asset_type: "" });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    asset_type: "",
    purchase_date: "",
    purchase_cost: "",
  });

  const [allocateData, setAllocateData] = useState({
    employee_id: "",
    allocated_date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, [pagination.page, filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      const response = await api.get("/assets", { params });
      setAssets(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to fetch assets", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      // Support both API shapes: either `res.data` is array or `{ data: [...] }`
      setEmployees(response.data?.data ?? response.data ?? []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleCreateAsset = async () => {
    try {
      await api.post("/assets", formData);
      Swal.fire("Success", "Asset created successfully", "success");
      setShowCreateModal(false);
      setFormData({
        asset_code: "",
        asset_name: "",
        asset_type: "",
        purchase_date: "",
        purchase_cost: "",
      });
      fetchAssets();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to create asset", "error");
    }
  };

  const handleAllocateAsset = async () => {
    try {
      await api.post(`/assets/${currentAsset.id}/allocate`, allocateData);
      Swal.fire("Success", "Asset allocated successfully", "success");
      setShowAllocateModal(false);
      setAllocateData({ employee_id: "", allocated_date: new Date().toISOString().split("T")[0], remarks: "" });
      fetchAssets();
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to allocate asset", "error");
    }
  };

  const handleReturnAsset = async (allocationId) => {
    const { value: returnDate } = await Swal.fire({
      title: "Return Asset",
      input: "date",
      inputLabel: "Return Date",
      inputValue: new Date().toISOString().split("T")[0],
      showCancelButton: true,
    });

    if (returnDate) {
      try {
        await api.post(`/assets/${allocationId}/return`, { return_date: returnDate });
        Swal.fire("Success", "Asset returned successfully", "success");
        fetchAssets();
      } catch (error) {
        Swal.fire("Error", error.response?.data?.message || "Failed to return asset", "error");
      }
    }
  };

  const handleViewHistory = async (asset) => {
    try {
      const response = await api.get(`/assets/${asset.id}`);
      setCurrentAsset(response.data.asset);
      setAllocation(response.data.allocations[0]);
      setHistory(response.data.history);
      setShowHistoryModal(true);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch asset history", "error");
    }
  };

  // Soft pill badge for asset status (available / allocated / returned / damaged / lost)
  const statusBadge = (val) => {
    const map = {
      available: { color: "#10b981", label: "Available" },
      allocated: { color: "#3b82f6", label: "Allocated" },
      returned: { color: "#8b5cf6", label: "Returned" },
      damaged: { color: "#f59e0b", label: "Damaged" },
      lost: { color: "#ef4444", label: "Lost" },
    };
    const s = map[val] || { color: "#64748b", label: val || "Unknown" };
    return (
      <span className="sc-badge" style={{ background: `${s.color}1f`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const columns = [
    { key: "asset_code", label: "Code", sortable: true },
    { key: "asset_name", label: "Name", sortable: true },
    { key: "asset_type", label: "Type" },
    {
      key: "purchase_cost",
      label: "Cost",
      render: (val) => (val ? `$${Number(val).toLocaleString()}` : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => statusBadge(val),
    },
  ];

  const actions = [
    {
      label: (
        <>
          <FaEye className="me-1" /> View
        </>
      ),
      className: "sc-act-view",
      onClick: (row) => handleViewHistory(row),
    },
    {
      label: (
        <>
          <FaShareSquare className="me-1" /> Allocate
        </>
      ),
      className: "sc-act-allocate",
      onClick: (row) => {
        setCurrentAsset(row);
        setShowAllocateModal(true);
      },
    },
    {
      label: (
        <>
          <FaTrashAlt className="me-1" /> Delete
        </>
      ),
      className: "sc-act-delete",
      onClick: (row) => {
        Swal.fire({
          title: "Delete Asset?",
          text: "This cannot be undone",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#64748b",
          confirmButtonText: "Delete",
        }).then((result) => {
          if (result.isConfirmed) {
            api.delete(`/assets/${row.id}`).then(() => {
              Swal.fire("Deleted", "Asset deleted", "success");
              fetchAssets();
            });
          }
        });
      },
    },
  ];

  return (
    <Layout title="Asset Management">
      <div className="sc-assets">
        <style>{`
          .sc-assets .sc-page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .sc-assets .sc-page-title {
            margin: 0;
            font-weight: 800;
            font-size: 1.5rem;
            color: #0f172a;
          }

          .sc-assets .sc-page-subtitle {
            margin: 6px 0 0;
            color: #64748b;
            max-width: 560px;
          }

          .sc-assets .sc-primary-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border: none;
            border-radius: 10px;
            background: #10b981;
            color: #ffffff;
            font-weight: 600;
            font-size: 0.9rem;
            padding: 0.6rem 1.25rem;
            transition: background 0.15s ease;
          }

          .sc-assets .sc-primary-btn:hover {
            background: #0d9c6f;
            color: #ffffff;
          }

          .sc-assets .sc-card {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .sc-assets .sc-card-header {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }

          .sc-assets .sc-card-icon {
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

          .sc-assets .sc-card-title {
            margin: 0;
            font-weight: 700;
            font-size: 1rem;
            color: #0f172a;
          }

          .sc-assets .sc-card-subtitle {
            margin: 2px 0 0;
            font-size: 0.8rem;
            color: #94a3b8;
          }

          .sc-assets .sc-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: capitalize;
          }

          /* Table polish (overrides default dark/blue Bootstrap table) */
          .sc-assets table thead,
          .sc-assets table thead tr,
          .sc-assets table thead th {
            background-color: #f8fafc !important;
            color: #475569 !important;
            border-bottom: 2px solid #e2e8f0 !important;
            text-transform: uppercase;
            font-size: 0.7rem;
            letter-spacing: 0.06em;
            font-weight: 700;
            box-shadow: none !important;
          }

          .sc-assets table tbody td,
          .sc-assets table thead th {
            padding: 0.85rem 1rem;
            vertical-align: middle;
          }

          .sc-assets table tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }

          .sc-assets table tbody tr:hover {
            background-color: #ecfdf5;
          }

          /* Pagination */
          .sc-assets .pagination .page-link {
            color: #10b981;
            border-color: #e2e8f0;
          }

          .sc-assets .pagination .page-item.active .page-link {
            background-color: #10b981 !important;
            border-color: #10b981 !important;
            color: #ffffff !important;
          }

          .sc-assets .pagination .page-item.disabled .page-link {
            color: #cbd5e1;
          }

          /* Row action pills */
          .sc-assets .btn.sc-act-view,
          .sc-assets .btn.sc-act-allocate,
          .sc-assets .btn.sc-act-delete {
            border: none !important;
            border-radius: 999px !important;
            font-size: 0.78rem !important;
            font-weight: 600 !important;
            padding: 0.35rem 0.9rem !important;
            margin: 2px !important;
            display: inline-flex;
            align-items: center;
            transition: opacity 0.15s ease;
          }

          .sc-assets .btn.sc-act-view {
            background: #eef2ff !important;
            color: #4f46e5 !important;
          }

          .sc-assets .btn.sc-act-allocate {
            background: #ecfdf5 !important;
            color: #10b981 !important;
          }

          .sc-assets .btn.sc-act-delete {
            background: #fef2f2 !important;
            color: #ef4444 !important;
          }

          .sc-assets .btn.sc-act-view:hover,
          .sc-assets .btn.sc-act-allocate:hover,
          .sc-assets .btn.sc-act-delete:hover {
            opacity: 0.75;
          }

          /* Modal helpers */
          .sc-assets .sc-modal-btn {
            border: none;
            border-radius: 10px;
            background: #10b981;
            color: #ffffff;
            font-weight: 600;
            padding: 0.55rem 1.25rem;
            margin-top: 0.5rem;
            transition: background 0.15s ease;
          }

          .sc-assets .sc-modal-btn:hover {
            background: #0d9c6f;
            color: #ffffff;
          }

          .sc-assets .sc-return-btn {
            border: none;
            border-radius: 999px;
            background: #fffbeb;
            color: #b45309;
            font-weight: 600;
            font-size: 0.8rem;
            padding: 0.35rem 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .sc-assets .sc-info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem 1.5rem;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 1rem 1.25rem;
            margin-bottom: 1rem;
          }

          .sc-assets .sc-info-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-bottom: 2px;
          }

          .sc-assets .sc-info-value {
            font-weight: 600;
            color: #0f172a;
            margin: 0;
          }

          .sc-assets .sc-history-item {
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            background: #ffffff;
          }

          .sc-assets .sc-history-item .fw-bold {
            color: #0f172a;
          }
        `}</style>

        <div className="sc-page-header">
          <div>
            <h2 className="sc-page-title">Asset Management</h2>
            <p className="sc-page-subtitle">
              Track every laptop, badge and piece of equipment your team relies on — create new
              assets, hand them off, and keep a full history of who had what and when.
            </p>
          </div>
          <button type="button" className="sc-primary-btn" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create Asset
          </button>
        </div>

        <div className="sc-card">
          <div className="sc-card-header">
            <div className="sc-card-icon">
              <FaFilter size={16} />
            </div>
            <div>
              <h6 className="sc-card-title">Filter Assets</h6>
              <p className="sc-card-subtitle">Narrow the list down by current status</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <FormSelect
                label="Status"
                name="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={[
                  { value: "available", label: "Available" },
                  { value: "allocated", label: "Allocated" },
                  { value: "returned", label: "Returned" },
                  { value: "damaged", label: "Damaged" },
                  { value: "lost", label: "Lost" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="sc-card">
          <div className="sc-card-header">
            <div className="sc-card-icon">
              <FaBoxOpen size={16} />
            </div>
            <div>
              <h6 className="sc-card-title">All Assets</h6>
              <p className="sc-card-subtitle">Company-owned equipment and its current status</p>
            </div>
          </div>
          <FormTable
            columns={columns}
            data={assets}
            pagination={pagination}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            actions={actions}
            loading={loading}
          />
        </div>

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} title="Create New Asset" onClose={() => setShowCreateModal(false)}>
          <FormInput
            label="Asset Code"
            name="asset_code"
            value={formData.asset_code}
            onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
            required
          />
          <FormInput
            label="Asset Name"
            name="asset_name"
            value={formData.asset_name}
            onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
            required
          />
          <FormInput
            label="Asset Type"
            name="asset_type"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
            required
          />
          <FormInput
            label="Purchase Date"
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            required
          />
          <FormInput
            label="Purchase Cost"
            type="number"
            name="purchase_cost"
            value={formData.purchase_cost}
            onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
            required
          />
          <button type="button" className="sc-modal-btn" onClick={handleCreateAsset}>
            Create Asset
          </button>
        </Modal>

        {/* Allocate Modal */}
        <Modal
          isOpen={showAllocateModal}
          title={`Allocate ${currentAsset?.asset_name}`}
          onClose={() => setShowAllocateModal(false)}
        >
          <FormSelect
            label="Employee"
            name="employee_id"
            value={allocateData.employee_id}
            onChange={(e) => setAllocateData({ ...allocateData, employee_id: parseInt(e.target.value) })}
            options={employees.map((emp) => ({ value: emp.id, label: emp.name }))}
            required
          />
          <FormInput
            label="Allocation Date"
            type="date"
            name="allocated_date"
            value={allocateData.allocated_date}
            onChange={(e) => setAllocateData({ ...allocateData, allocated_date: e.target.value })}
            required
          />
          <FormInput
            label="Remarks"
            name="remarks"
            value={allocateData.remarks}
            onChange={(e) => setAllocateData({ ...allocateData, remarks: e.target.value })}
          />
          <button type="button" className="sc-modal-btn" onClick={handleAllocateAsset}>
            Allocate Asset
          </button>
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={showHistoryModal}
          title={`Asset History: ${currentAsset?.asset_name}`}
          onClose={() => setShowHistoryModal(false)}
        >
          {allocation && (
            <div className="mb-4">
              <h6 className="sc-card-title mb-2">Current Allocation</h6>
              <div className="sc-info-grid">
                <div>
                  <p className="sc-info-label">Status</p>
                  {statusBadge(allocation.status)}
                </div>
                <div>
                  <p className="sc-info-label">Allocated Date</p>
                  <p className="sc-info-value">{new Date(allocation.allocated_date).toLocaleDateString()}</p>
                </div>
              </div>
              {allocation.status === "allocated" && (
                <button
                  type="button"
                  className="sc-return-btn"
                  onClick={() => {
                    setShowHistoryModal(false);
                    handleReturnAsset(allocation.id);
                  }}
                >
                  <FaUndo size={12} /> Return Asset
                </button>
              )}
            </div>
          )}
          <h6 className="sc-card-title mb-2">History</h6>
          {history.length === 0 ? (
            <p className="text-muted mb-0">No history recorded for this asset yet.</p>
          ) : (
            <div>
              {history.map((h) => (
                <div key={h.id} className="sc-history-item">
                  <div className="fw-bold">{h.action}</div>
                  <small className="text-muted">{new Date(h.created_at).toLocaleString()}</small>
                  <p className="mb-0 mt-1">{h.remarks}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AssetManagement;