import "./SalesDashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { BASE_URL, GET_SALES_TOTALS, GET_ALL_SALES_TRANSACTIONS } from "../Constants";

const SalesDashboard = () => {
  const navigate = useNavigate();

  // Helper function to get date range
  const getDateRangeHelper = (filter) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // zero-based

    switch (filter) {
      case "This Month": {
        const thisMonthStart = new Date(currentYear, currentMonth, 1);
        const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0);
        return {
          from: thisMonthStart.toLocaleDateString("en-CA"),
          to: thisMonthEnd.toLocaleDateString("en-CA"),
        };
      }

      case "Last Month": {
        const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEnd = new Date(currentYear, currentMonth, 0);
        return {
          from: lastMonthStart.toLocaleDateString("en-CA"),
          to: lastMonthEnd.toLocaleDateString("en-CA"),
        };
      }

      case "This Quarter": {
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
          from: quarterStart.toLocaleDateString("en-CA"),
          to: quarterEnd.toLocaleDateString("en-CA"),
        };
      }

      case "This Year": {
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        return {
          from: yearStart.toLocaleDateString("en-CA"),
          to: yearEnd.toLocaleDateString("en-CA"),
        };
      }

      default:
        return { from: "", to: "" };
    }
  };

  // Initialize with "This Month" date range
  const initialDateRange = getDateRangeHelper("This Month");

  const [filterType, setFilterType] = useState("This Month");
  const [fromDate, setFromDate] = useState(initialDateRange.from);
  const [toDate, setToDate] = useState(initialDateRange.to);
  const [isMobile, setIsMobile] = useState(false);
  const [salesData, setSalesData] = useState({
    totalSalesAmount: 0,
    totalReceivedAmount: 0,
    totalBalanceAmount: 0,
    percentageChange: 0,
  });
  const [salesTransactions, setSalesTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transaction actions menu state
  const [showTransactionActionsMenu, setShowTransactionActionsMenu] =
    useState(false);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const transactionActionsRef = useRef(null);

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

  // Fetch sales totals from API
  const fetchSalesTotals = async () => {
    try {
      let url = `${BASE_URL}/${GET_SALES_TOTALS}`;

      // Add date range params if filter is applied
      if (filterType !== "All Sale Invoices" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.error("Failed to fetch sales totals:", response.status);
        return;
      }

      const data = await response.json();
      console.log("Response JSON: ", data);
      setSalesData({
        totalSalesAmount: data.data.totalSalesAmount || 0,
        totalReceivedAmount: data.data.totalReceivedAmount || 0,
        totalBalanceAmount: data.data.totalBalanceAmount || 0,
        percentageChange: data.data.percentageChange || 0,
      });
      console.log("Sales Data updated: ", salesData);
    } catch (error) {
      console.error("Error fetching sales totals:", error);
    }
  };

  // Fetch sales reports/transactions from API
  const fetchSalesReports = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${BASE_URL}/${GET_ALL_SALES_TRANSACTIONS}`;

      // Add date range params if filter is applied
      if (filterType !== "All Sale Invoices" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch sales reports: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sales Reports Response: ", data);

      // Assuming the API returns data in data.data or data array format
      const transactions = data.data || data || [];
      setSalesTransactions(transactions);

    } catch (error) {
      console.error("Error fetching sales reports:", error);
      setError(error.message);
      setSalesTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales totals and reports when component mounts or filter changes
  useEffect(() => {
    fetchSalesTotals();
    fetchSalesReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, fromDate, toDate]);

  // Handle clicks outside transaction actions menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        transactionActionsRef.current &&
        !transactionActionsRef.current.contains(event.target)
      ) {
        setShowTransactionActionsMenu(false);
        setActiveTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDateRange = (filter) => {
    if (filter === "Custom") {
      return { from: fromDate, to: toDate };
    }
    return getDateRangeHelper(filter);
  };

  // Function to get comparison text based on filter
  const getComparisonText = (filter) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (filter) {
      case "This Month":
        return "vs last month";

      case "Last Month":
        const lastMonthStart = new Date(currentYear, currentMonth - 2, 1);
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const previousMonthName = monthNames[lastMonthStart.getMonth()];
        return `vs ${previousMonthName}`;

      case "This Year":
        return "vs last year";

      case "This Quarter":
        return "vs last quarter";

      default:
        return "vs last month";
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

  // Handle transaction actions click
  const handleTransactionActionsClick = (transactionId, event) => {
    event.stopPropagation();
    setActiveTransactionId(transactionId);
    setShowTransactionActionsMenu(true);
  };

  // Handle transaction action selection
  const handleTransactionAction = (action, transactionId) => {
    console.log(`${action} action for transaction:`, transactionId);

    // Find the transaction data
    const transaction = salesTransactions.find(
      (t) => t.transactionId === transactionId
    );

    switch (action) {
      case "view_edit":
        if (transaction) {
          console.log("View/Edit transaction:", transaction);
          navigate("/sales/new", { state: { invoiceId: transaction.invoiceId } });
        }
        break;
      case "convert_to_return":
        if (transaction) {
          console.log("Convert To Return transaction:", transaction);
          // TODO: Implement convert to return functionality
          // This might open a modal or navigate to a return creation page
        }
        break;
      case "preview_delivery_challan":
        if (transaction) {
          console.log("Preview Delivery Challan for transaction:", transaction);
          // TODO: Implement delivery challan preview functionality
          // This might open a preview modal or navigate to a delivery challan page
        }
        break;
      case "cancel_invoice":
        if (transaction) {
          console.log("Cancel Invoice transaction:", transaction);
          // Show cancellation confirmation
          if (
            window.confirm(
              "Are you sure you want to cancel this invoice? This action cannot be undone."
            )
          ) {
            // TODO: Implement cancel invoice API call
            console.log("Cancelling invoice:", transactionId);
          }
        }
        break;
      case "delete":
        // Show delete confirmation
        if (
          window.confirm(
            "Are you sure you want to delete this transaction? This action cannot be undone."
          )
        ) {
          console.log("Delete transaction:", transactionId);
          // TODO: Implement delete API call
        }
        break;
      case "duplicate":
        if (transaction) {
          console.log("Duplicate transaction:", transaction);
          // TODO: Implement duplicate functionality
          // This might navigate to a new sale form with pre-filled data
        }
        break;
      case "open_pdf":
        if (transaction) {
          console.log("Open PDF for transaction:", transaction);
          // TODO: Implement PDF opening functionality
          // This might open the invoice PDF in a new tab or download it
        }
        break;
      case "preview":
        if (transaction) {
          console.log("Preview transaction:", transaction);
          // TODO: Implement preview functionality
          // This might open a preview modal or navigate to a preview page
        }
        break;
      case "print":
        if (transaction) {
          console.log("Print transaction:", transaction);
          // TODO: Implement print functionality
          // This might trigger browser print dialog or open print preview
        }
        break;
      case "view_history":
        if (transaction) {
          console.log("View History for transaction:", transaction);
          // TODO: Implement view history functionality
          // This might navigate to a history page or open a history modal
        }
        break;
      default:
        console.log("Unknown action:", action);
    }

    // Close the menu
    setShowTransactionActionsMenu(false);
    setActiveTransactionId(null);
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
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
              <option value="This Quarter">This Quarter</option>
              <option value="All Sale Invoices">All Sale Invoices</option>
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
            <span className="sales-amount">
              ₹{" "}
              {salesData.totalSalesAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="percentage-group">
            <div
              className="sales-percentage-box"
              style={{
                backgroundColor:
                  salesData.percentageChange < 0 ? "#ed2040" : "transparent",
              }}
            >
              <span
                className="percentage-text"
                style={{
                  color: salesData.percentageChange < 0 ? "#ffe5e8" : "#29c080",
                }}
              >
                {Math.abs(salesData.percentageChange).toFixed(0)}%
              </span>
              <span
                className={
                  salesData.percentageChange < 0 ? "arrow-down" : "arrow-up"
                }
                style={{
                  color: salesData.percentageChange < 0 ? "#ffe5e8" : "#29c080",
                }}
              >
                {salesData.percentageChange < 0 ? "↓" : "↑"}
              </span>
            </div>
            <span className="vs-last-month">
              {getComparisonText(filterType)}
            </span>
          </div>
          <div className="payment-summary">
            <span className="received-label">Received:</span>
            <span className="received-amount">
              ₹{" "}
              {salesData.totalReceivedAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="separator">|</span>
            <span className="balance-label">Balance:</span>
            <span className="sales-dashboard-balance-amount">
              ₹{" "}
              {salesData.totalBalanceAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="sales-transactions-table-container">
        <div className="table-header-section">
          <div className="table-title">Transactions</div>
          <div className="table-actions">
            <span className="action-icon" title="Search">
              🔍
            </span>
            <span className="action-icon" title="Graph">
              📊
            </span>
            <span className="action-icon" title="Export to Excel">
              📋
            </span>
            <span className="action-icon" title="Print">
              🖨️
            </span>
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
              {loading ? (
                <tr className="loading-row">
                  <td colSpan="8" className="loading-message">
                    Loading transactions...
                  </td>
                </tr>
              ) : error ? (
                <tr className="error-row">
                  <td colSpan="8" className="error-message">
                    Error: {error}
                  </td>
                </tr>
              ) : salesTransactions.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="8" className="no-data-message">
                    No Sales Transaction
                  </td>
                </tr>
              ) : (
                salesTransactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className="transaction-row">
                    <td>
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td>
                      {transaction.invoiceNumber ||
                        transaction.invoiceNo ||
                        "-"}
                    </td>
                    <td>
                      {transaction.customerName || transaction.partyName || "-"}
                    </td>
                    <td>
                      {transaction.transactionType ||
                        transaction.transaction ||
                        "Sale"}
                    </td>
                    <td>
                      {transaction.paymentType ||
                        transaction.paymentMode ||
                        "-"}
                    </td>
                    <td>
                      ₹{" "}
                      {transaction.netAmount
                        ? transaction.netAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                    </td>
                    <td>
                      ₹{" "}
                      {transaction.balanceAmount
                        ? transaction.balanceAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                    </td>
                    <td>
                      <div className="sales-dashboard-transaction-actions">
                        <div
                          className="transaction-three-dots"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransactionActionsClick(transaction.transactionId, e);
                          }}
                        >
                          ⋮
                        </div>

                        {/* Transaction Actions Menu - positioned relative to this transaction */}
                        {showTransactionActionsMenu &&
                          activeTransactionId === transaction.transactionId && (
                            <div
                              className="sales-dashboard-transaction-actions-menu"
                              ref={transactionActionsRef}
                            >
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "view_edit",
                                     transaction.transactionId || transaction.id
                                   )
                                 }
                               >
                                 View/Edit
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "convert_to_return",
                                     transaction.id
                                   )
                                 }
                               >
                                 Convert To Return
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "preview_delivery_challan",
                                     transaction.id
                                   )
                                 }
                               >
                                 Preview Delivery Challan
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "cancel_invoice",
                                     transaction.id
                                   )
                                 }
                               >
                                 Cancel Invoice
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "delete",
                                     transaction.id
                                   )
                                 }
                               >
                                 Delete
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "duplicate",
                                     transaction.id
                                   )
                                 }
                               >
                                 Duplicate
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "open_pdf",
                                     transaction.id
                                   )
                                 }
                               >
                                 Open PDF
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "preview",
                                     transaction.id
                                   )
                                 }
                               >
                                 Preview
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "print",
                                     transaction.id
                                   )
                                 }
                               >
                                 Print
                               </div>
                               <div
                                 className="sales-dashboard-transaction-action-item"
                                 onClick={() =>
                                   handleTransactionAction(
                                     "view_history",
                                     transaction.id
                                   )
                                 }
                               >
                                 View History
                               </div>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
