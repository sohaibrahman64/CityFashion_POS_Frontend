import "./SalesDashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("All Sale Invoices");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getDateRange = (filter) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (filter) {
      case "This Month":
        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
        return {
          from: thisMonthStart.toISOString().split("T")[0],
          to: thisMonthEnd.toISOString().split("T")[0],
        };

      case "Last Month":
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0);
        return {
          from: lastMonthStart.toISOString().split("T")[0],
          to: lastMonthEnd.toISOString().split("T")[0],
        };

      case "This Quarter":
        const quarterStart = new Date(
          currentYear,
          Math.floor(currentMonth / 3) * 3,
          1
        );
        const quarterEnd = new Date(
          currentYear,
          Math.floor(currentMonth / 3) * 3 + 3,
          0
        );
        return {
          from: quarterStart.toISOString().split("T")[0],
          to: quarterEnd.toISOString().split("T")[0],
        };

      case "This Year":
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        return {
          from: yearStart.toISOString().split("T")[0],
          to: yearEnd.toISOString().split("T")[0],
        };

      case "Custom":
        return { from: fromDate, to: toDate };

      default:
        return { from: "", to: "" };
    }
  };

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

  // Show mobile message if on mobile device
  if (isMobile) {
    return (
      <div className="desktop-only-message">
        <h2>Desktop Only Application</h2>
        <p>
          This application is designed for desktop use only. Please access it
          from a computer or laptop.
        </p>
        <p>Minimum screen width required: 769px</p>
      </div>
    );
  }

  return (
    <div className="sales-dashboard-container">
      {/* Header Section */}
      <div className="sales-dashboard-header-section">
        <div className="sales-dashboard-header-left">
          <span className="sales-dashboard-label">Sales Dashboard</span>
        </div>
        <div className="sales-dashboard-header-right">
          <button
            className="add-sale-btn"
            onClick={() => navigate("/sales/new")}
            title="Create a new sale"
          >
            + Add Sale
          </button>
        </div>
      </div>

      <div className="sales-dashboard-filter-box">
        <div className="filter-content">
          <label className="filter-label">Filter by</label>
          <div className="filter-options">
            <select
              className="filter-dropdown"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="All Sale Invoices">All Sale Invoices</option>
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
              <option value="Custom">Custom</option>
            </select>
            {filterType !== "All Sale Invoices" && (
              <div className="date-range-inputs">
                <div className="date-input-group">
                  <label>From:</label>
                  <input
                    type="date"
                    className="date-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label>To:</label>
                  <input
                    type="date"
                    className="date-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
             </div>

       <div className="sales-dashboard-total-sales">
         <div className="total-sales-inner">
           <div className="sales-amount-group">
             <span className="total-sales-label">Total Sales Amount</span>
             <span className="sales-amount">₹ 840</span>
           </div>
           <div className="percentage-group">
             <div className="sales-percentage-box">
               <span className="percentage-text">100%</span>
               <span className="arrow-up">↑</span>
             </div>
             <span className="vs-last-month">vs last month</span>
           </div>
           <div className="payment-summary">
             <span className="received-label">Received:</span>
             <span className="received-amount">₹ 840</span>
             <span className="separator">|</span>
             <span className="balance-label">Balance:</span>
             <span className="balance-amount">₹ 0</span>
           </div>
         </div>
       </div>

       <div className="sales-transactions-table-container">
         <div className="table-header-section">
           <div className="table-title">Transactions</div>
           <div className="table-actions">
             <span className="action-icon" title="Search">🔍</span>
             <span className="action-icon" title="Graph">📊</span>
             <span className="action-icon" title="Export to Excel">📋</span>
             <span className="action-icon" title="Print">🖨️</span>
           </div>
         </div>
         <div className="transactions-table-wrapper">
           <table className="sales-transactions-table">
             <thead>
               <tr>
                 <th>
                   <div className="table-header">
                     <span>Date</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Invoice No</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Party Name</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Transaction</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Payment Type</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Amount</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Balance</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
                 <th>
                   <div className="table-header">
                     <span>Actions</span>
                     <span className="filter-icon">🔽</span>
                   </div>
                 </th>
               </tr>
             </thead>
             <tbody>
               <tr className="no-data-row">
                 <td colSpan="8" className="no-data-message">
                   No Sales Transaction
                 </td>
               </tr>
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

export default SalesDashboard;
