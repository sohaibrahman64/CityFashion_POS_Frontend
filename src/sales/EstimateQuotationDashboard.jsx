import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./EstimateQuotationDashboard.css";
import {
  BASE_URL,
  GET_TOTAL_ESTIMATE_QUOTATION_AMOUNT,
  GET_ALL_ESTIMATE_QUOTATION_TRANSACTIONS,
} from "../Constants";

const EstimateQuotationDashboard = () => {
  const navigate = useNavigate();

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
  const [
    estimateQuotationTransactionsData,
    setEstimateQuotationTransactionsData,
  ] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransactionActionsMenu, setShowTransactionActionsMenu] =
    useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState(null);
  const transactionActionsRef = useRef(null);

  const [filterType, setFilterType] = useState("This Month");
  const [fromDate, setFromDate] = useState(initialDateRange.from);
  const [toDate, setToDate] = useState(initialDateRange.to);
  const [estimateQuotationData, setEstimateQuotationData] = useState({
    totalEstimateQuotationAmount: 0,
    totalConvertedAmount: 0,
    totalOpenAmount: 0,
    percentageChange: 0,
  });
  const [transactions, setTransactions] = useState(
    estimateQuotationTransactionsData
  );
  const [convertToSaleType, setConvertToSaleType] = useState({});

  // Fetch estimate quotation transaction data from API
  const fetchTotalEstimateQuotationAmount = async () => {
    try {
      let url = `${BASE_URL}/${GET_TOTAL_ESTIMATE_QUOTATION_AMOUNT}`;

      // Add date range params if filter is applied
      if (filterType !== "All Estimates" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          "Failed to fetch total estimate quotation amount:",
          response.status
        );
        return;
      }

      const data = await response.json();
      console.log("Response JSON: ", data);

      setEstimateQuotationData({
        totalEstimateQuotationAmount:
          data.data.totalEstimateQuotationAmount || 0,
        totalConvertedAmount: data.data.totalConvertedAmount || 0,
        totalOpenAmount: data.data.totalOpenAmount || 0,
        percentageChange: data.data.percentageChange || 0,
      });
      console.log("Estimate Quotation updated: ", estimateQuotationData);
    } catch (error) {
      console.error("Error fetching total estimate quotation amount:", error);
    }
  };

  // Fetch all estimate quotation transactions from API
  const fetchAllEstimateQuotationTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${BASE_URL}/${GET_ALL_ESTIMATE_QUOTATION_TRANSACTIONS}`;

      // Add date range params if filter is applied
      if (filterType !== "All Estimates" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch all estimate quotation transactions: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Estimate Quotation Transactions Response: ", data);

      // Assuming the API returns data in data.data or data array format
      const transactions = data.data || data || [];
      setEstimateQuotationTransactionsData(transactions);
    } catch (error) {
      console.error("Error fetching estimate quotation transaction: ", error);
      setError(error.message);
      setEstimateQuotationTransactionsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== "All Estimates") {
      const dateRange = getDateRange(newFilterType);
      setFromDate(dateRange.from);
      setToDate(dateRange.to);
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const handleConvertToSaleType = (saleType, estimateQuotationId, e) => {
    e.stopPropagation();
    setConvertToSaleType((prev) => ({
      ...prev,
      [estimateQuotationId]: saleType,
    }));
    console.log(`${saleType} for transaction: `, estimateQuotationId);
  };

  const handleTransactionActionsClick = (estimateQuotationId, event) => {
    event.stopPropagation();
    setActiveActionMenuRowId(estimateQuotationId);
    setShowTransactionActionsMenu(true);
  };

  // Handle transaction action selection
  const handleTransactionAction = (action, estimateQuotationId) => {
    console.log(`${action} action for transaction:`, estimateQuotationId);

    // Find the transaction data
    const transaction = estimateQuotationTransactionsData.find(
      (t) => t.estimateQuotationId === estimateQuotationId
    );

    switch (action) {
      case "view_edit":
        if (transaction) {
          console.log("View/Edit transaction:", transaction);
          navigate("/sales/estimate-quotation/add", {
            state: { estimateQuotationId: transaction.estimateQuotationId },
          });
        }
        break;
      case "delete":
        // Show delete confirmation
        if (
          window.confirm(
            "Are you sure you want to delete this transaction? This action cannot be undone."
          )
        ) {
          console.log("Delete transaction:", estimateQuotationId);
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
    setActiveActionMenuRowId(null);
  };

  // Helper function to get data range
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

  useEffect(() => {
    fetchTotalEstimateQuotationAmount();
    fetchAllEstimateQuotationTransaction();
  }, [filterType, fromDate, toDate]);

  // Handle clicks outside transaction actions menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        transactionActionsRef.current &&
        !transactionActionsRef.current.contains(event.target)
      ) {
        setShowTransactionActionsMenu(false);
        setActiveActionMenuRowId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              ₹{" "}
              {estimateQuotationData.totalEstimateQuotationAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>
          <div className="estimate-quotation-dashboard-percentage-group">
            <div
              className="estimate-quotation-dashboard-percentage-box"
              style={{
                backgroundColor:
                  estimateQuotationData.percentageChange < 0
                    ? "#ed2040"
                    : "transparent",
              }}
            >
              <span
                className="estimate-quotation-dashboard-percentage-text"
                style={{
                  color:
                    estimateQuotationData.percentageChange < 0
                      ? "#ffe5e8"
                      : "#29c080",
                }}
              >
                {Math.abs(estimateQuotationData.percentageChange).toFixed(0)}%
              </span>
              <span
                className={
                  estimateQuotationData.percentageChange < 0
                    ? "estimate-quotation-dashboard-percentage-arrow-down"
                    : "estimate-quotation-dashboard-percentage-arrow-up "
                }
                style={{
                  color:
                    estimateQuotationData.percentageChange < 0
                      ? "#ffe5e8"
                      : "#29c080",
                }}
              >
                {estimateQuotationData.percentageChange < 0 ? "↓" : "↑"}
              </span>
            </div>
            <span className="estimate-quotation-dashboard-vs-last-month">
              {getComparisonText(filterType)}
            </span>
          </div>
          <div className="estimate-quotation-dashboard-conversion-summary">
            <span className="estimate-quotation-dashboard-converted-label">
              Converted:{" "}
            </span>
            <span className="estimate-quotation-dashboard-converted-amount">
              ₹{" "}
              {estimateQuotationData.totalConvertedAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
            <span className="estimate-quotation-dashboard-separator">|</span>
            <span className="estimate-quotation-dashboard-open-label">
              Open:{" "}
            </span>
            <span className="estimate-quotation-dashboard-open-amount">
              ₹{" "}
              {estimateQuotationData.totalOpenAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
            <span
              className="estimate-quotation-dashboard-action-icon"
              title="Graph"
            >
              📊
            </span>
            <span
              className="estimate-quotation-dashboard-action-icon"
              title="Export to Excel"
            >
              📋
            </span>
            <span
              className="estimate-quotation-dashboard-action-icon"
              title="Print"
            >
              🖨️
            </span>
          </div>
        </div>
        {estimateQuotationTransactionsData.length === 0 ? (
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
        ) : (
          <div className="estimate-quotation-dashboard-transactions-table-wrapper">
            <table className="estimate-quotation-dashboard-transactions-table">
              <thead>
                <tr>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Date</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Reference No</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Party Name</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Amount</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Balance</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Status</span>
                      <span className="estimate-quotation-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="estimate-quotation-dashboard-transactions-table-header">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="estimate-quotation-dashboard-loading-row">
                    <td
                      colSpan="8"
                      className="estimate-quotation-dashboard-loading-message"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr className="estimate-quotation-dashboard-error-row">
                    <td
                      colSpan="8"
                      className="estimate-quotation-dashboard-error-message"
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : (
                  estimateQuotationTransactionsData.map(
                    (transaction, index) => (
                      <tr
                        key={transaction.id | index}
                        className="estimate-quotation-dashboard-transaction-row"
                      >
                        <td>
                          {transaction.transactionDate
                            ? new Date(
                                transaction.transactionDate
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td>
                          {transaction.estimateQuotationNumber ||
                            transaction.estimateQuotationNo ||
                            "-"}
                        </td>
                        <td>
                          {transaction.partyName || transaction.party || "NA"}
                        </td>
                        <td>
                          ₹{" "}
                          {transaction.totalAmount
                            ? transaction.totalAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : "0.00"}
                        </td>
                        <td>
                          ₹{" "}
                          {transaction.balanceAmount
                            ? transaction.balanceAmount.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                            : "0.00"}
                        </td>
                        <td>{transaction.status || "NA"}</td>
                        <td>
                          <div className="estimate-quotation-dashboard-transactions-convert-actions">
                            <select
                              className="estimate-quotation-dashboard-transactions-convert-select"
                              value={
                                convertToSaleType[
                                  transaction.estimateQuotationId
                                ]
                              }
                              onChange={(e) => {
                                e.stopPropagation();
                                handleConvertToSaleType(
                                  e.target.value,
                                  transaction.estimateQuotationId,
                                  e
                                );
                              }}
                            >
                              <option value="Convert...">Convert...</option>
                              <option value="Convert To Sale">
                                Convert To Sale
                              </option>
                              <option value="Convert To Sale Order">
                                Convert To Sale Order
                              </option>
                            </select>
                            <div
                              className="estimate-quotation-dashboard-transaction-three-dots"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransactionActionsClick(
                                  transaction.estimateQuotationId,
                                  e
                                );
                              }}
                            >
                              ⋮
                            </div>
                            {/* Transaction Actions Menu - positioned relative to this transaction */}
                            {showTransactionActionsMenu &&
                              activeActionMenuRowId ===
                                transaction.estimateQuotationId && (
                                <div
                                  className="estimate-quotation-dashboard-transaction-actions-menu"
                                  ref={transactionActionsRef}
                                >
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "view_edit",
                                        transaction.estimateQuotationId ||
                                          transaction.id
                                      )
                                    }
                                  >
                                    View/Edit
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "delete",
                                        transaction.estimateQuotationId
                                      )
                                    }
                                  >
                                    Delete
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "duplicate",
                                        transaction.estimateQuotationId
                                      )
                                    }
                                  >
                                    Duplicate
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "open_pdf",
                                        transaction.estimateQuotationId
                                      )
                                    }
                                  >
                                    Open PDF
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "preview",
                                        transaction.estimateQuotationId
                                      )
                                    }
                                  >
                                    Preview
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "print",
                                        transaction.estimateQuotationId
                                      )
                                    }
                                  >
                                    Print
                                  </div>
                                  <div
                                    className="estimate-quotation-dashboard-transaction-action-item"
                                    onClick={() =>
                                      handleTransactionAction(
                                        "view_history",
                                        transaction.estimateQuotationId
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
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default EstimateQuotationDashboard;
