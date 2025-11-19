import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./EstimateQuotationDashboard.css";

const EstimateQuotationDashboard = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("This Month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== "All Sale Invoices") {
      const dateRange = getDateRange(newFilterType);
      setFromDate(dateRange.from);
      setToDate(dateRange.to);
    } else {
      setFromDate("");
      setToDate("");
    }
  };
  const getDateRange = (type) => {
    const today = new Date();
    let from = "";
    let to = "";
    switch (type) {
      case "This Month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "Last Month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          .toISOString()
          .split("T")[0];
        to = new Date(today.getFullYear(), today.getMonth(), 0)
          .toISOString()
          .split("T")[0];
        break;
      case "This Year":
        from = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      case "This Quarter":
        const currentQuarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), currentQuarter * 3, 1)
          .toISOString()
          .split("T")[0];
        to = today.toISOString().split("T")[0];
        break;
      default:
        from = "";
        to = "";
    }
  };
  return (
    <div className="estimate-quotation-dashboard-container">
      {/* Header Section */}
      <div className="estimate-quotation-dashboard-header-section">
        <div className="estimate-quotation-dashboard-header-section-left">
          <span className="estimate-quotation-dashboard-label">
            Estimate & Quotation Dashboard
          </span>
        </div>
        <div className="estimate-quotation-dashboard-header-section-right">
          <button
            className="add-estimate-quotation-btn"
            onClick={() => {
              navigate("/sales/estimate-quotation/add");
            }}
          >
            + Add Estimate
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="estimate-quotation-dashboard-filter-box">
        <div className="estimate-quotation-dashboard-filter-content">
          <label className="estimate-quotation-dashboard-filter-label">
            Filter by:
          </label>
          <div className="estimate-quotation-dashboard-filter-options">
            <select
              className="estimate-quotation-dashboard-filter-dropdown"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
              <option value="This Quarter">This Quarter</option>
              <option value="All Estimates">All Estimates</option>
              <option value="Custom">Custom</option>
            </select>
            {filterType !== "All Estimates" && (
              <div className="estimate-quotation-dashboard-date-range-inputs">
                <div className="estimate-quotation-dashboard-date-input-group">
                  <label>From:</label>
                  <input
                    type="date"
                    className="estimate-quotation-dashboard-date-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="estimate-quotation-dashboard-date-input-group">
                  <label>To:</label>
                  <input
                    type="date"
                    className="estimate-quotation-dashboard-date-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="estimate-quotation-dashboard-total-estimates-box">
        <div className="estimate-quotation-dashboard-total-estimates-inner">
          <div className="estimate-quotation-dashboard-total-estimates-amount-group">
            <span className="estimate-quotation-dashboard-total-estimates-label">
              Total Estimates:
            </span>
            <span className="estimate-quotation-dashboard-total-estimates-amount">
              ₹ 0.00
            </span>
          </div>
          <div className="estimate-quotation-dashboard-percentage-group">
            <div className="estimate-quotation-dashboard-percentage-box">
              <span className="estimate-quotation-dashboard-percentage-text">
                100%
              </span>
              <span className="estimate-quotation-dashboard-percentage-arrow-up">
                ↑
              </span>
            </div>
            <span className="estimate-quotation-dashboard-vs-last-month">
              vs Last Month
            </span>
          </div>
          <div className="estimate-quotation-dashboard-conversion-summary">
            <span className="estimate-quotation-dashboard-converted-label">
              Converted:{" "}
            </span>
            <span className="estimate-quotation-dashboard-converted-amount">
              ₹ 0.00
            </span>
            <span className="estimate-quotation-dashboard-separator">|</span>
            <span className="estimate-quotation-dashboard-open-label">
              Open:{" "}
            </span>
            <span className="estimate-quotation-dashboard-open-amount">
              ₹ 0.00
            </span>
          </div>
        </div>
      </div>
      <div className="estimate-quotation-dashboard-table-container">
        <div className="estimate-quotation-dashboard-table-header-section">
          <div className="estimate-quotation-dashboard-table-title">
            Transactions
          </div>
          <div className="estimate-quotation-dashboard-table-actions">
            <span
              className="estimate-quotation-dashboard-action-icon"
              title="Search"
            >
              🔍
            </span>
          </div>
        </div>
        <div className="estimate-quotation-dashboard-table-content">
          <div className="estimate-quotation-dashboard-empty-state">
            <p className="estimate-quotation-dashboard-empty-message-primary">
              No Transactions to show
            </p>
            <p className="estimate-quotation-dashboard-empty-message-secondary">
              You haven't added any transactions yet.
            </p>
            <button
              className="add-estimate-quotation-btn estimate-quotation-dashboard-empty-add-btn"
              onClick={() => {
                navigate("/sales/estimate-quotation/add");
              }}
            >
              + Add Estimate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EstimateQuotationDashboard;
