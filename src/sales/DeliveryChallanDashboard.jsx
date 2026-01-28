import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./DeliveryChallanDashboard.css";
import {
  BASE_URL,
  GET_TOTAL_DELIVERY_CHALLAN_AMOUNT,
  GET_ALL_DELIVERY_CHALLAN_TRANSACTIONS,
} from "../Constants";

const DeliveryChallanDashboard = () => {
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

  const [deliveryChallanTransactionsData, setDeliveryChallanTransactionsData] =
    useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransactionActionsMenu, setShowTransactionActionsMenu] =
    useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState(null);
  const transactionActionsRef = useRef(null);

  const [filterType, setFilterType] = useState("This Month");
  const [fromDate, setFromDate] = useState(initialDateRange.from);
  const [toDate, setToDate] = useState(initialDateRange.to);
  const [deliveryChallanData, setDeliveryChallanData] = useState({
    totalDeliveryChallanAmount: 0,
    totalConvertedAmount: 0,
    totalOpenAmount: 0,
    percentageChange: 0,
  });
  const [transactions, setTransactions] = useState(
    deliveryChallanTransactionsData
  );
  const [convertToSaleType, setConvertToSaleType] = useState({});

  // Fetch proforma invoice transaction data from API
  const fetchTotalDeliveryChallanAmount = async () => {
    try {
      let url = `${BASE_URL}/${GET_TOTAL_DELIVERY_CHALLAN_AMOUNT}`;

      // Add date range params if filter is applied
      if (filterType !== "All Delivery Challans" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        console.error(
          "Failed to fetch total delivery challan amount:",
          response.status
        );
        return;
      }

      const data = await response.json();
      console.log("Response JSON: ", data);

      setDeliveryChallanData({
        totalDeliveryChallanAmount: data.data.totalDeliveryChallanAmount || 0,
        totalConvertedAmount: data.data.totalConvertedAmount || 0,
        totalOpenAmount: data.data.totalOpenAmount || 0,
        percentageChange: data.data.percentageChange || 0,
      });
      console.log("Delivery Challan updated: ", deliveryChallanData);
    } catch (error) {
      console.error("Error fetching total delivery challan amount:", error);
    }
  };

  // Fetch all estimate quotation transactions from API
  const fetchAllDeliveryChallanTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${BASE_URL}/${GET_ALL_DELIVERY_CHALLAN_TRANSACTIONS}`;

      // Add date range params if filter is applied
      if (filterType !== "All Delivery Challans" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch all delivery challan transactions: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Delivery Challan Transactions Response: ", data);

      // Assuming the API returns data in data.data or data array format
      const transactions = data.data || data || [];
      setDeliveryChallanTransactionsData(transactions);
    } catch (error) {
      console.error("Error fetching estimate quotation transaction: ", error);
      setError(error.message);
      setDeliveryChallanTransactionsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== "All Delivery Challans") {
      const dateRange = getDateRange(newFilterType);
      setFromDate(dateRange.from);
      setToDate(dateRange.to);
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const handleConvertToSaleType = (saleType, deliveryChallanId, e) => {
    e.stopPropagation();
    setConvertToSaleType((prev) => ({
      ...prev,
      [deliveryChallanId]: saleType,
    }));
    console.log(`${saleType} for transaction: `, deliveryChallanId);
  };

  const handleTransactionActionsClick = (deliveryChallanId, event) => {
    event.stopPropagation();
    setActiveActionMenuRowId(deliveryChallanId);
    setShowTransactionActionsMenu(true);
  };

  // Handle transaction action selection
  const handleTransactionAction = (action, deliveryChallanId) => {
    console.log(`${action} action for transaction:`, deliveryChallanId);

    // Find the transaction data
    const transaction = deliveryChallanData.find(
      (t) => t.deliveryChallanId === deliveryChallanId
    );

    switch (action) {
      case "view_edit":
        if (transaction) {
          console.log("View/Edit transaction:", transaction);
          navigate("/sales/deliverychallan/add", {
            state: { deliveryChallanId: transaction.deliveryChallanId },
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
          console.log("Delete transaction:", deliveryChallanId);
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
    fetchTotalDeliveryChallanAmount();
    fetchAllDeliveryChallanTransaction();
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
        setActiveActionMenuRowId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="delivery-challan-dashboard-container">
      {/* Header Section */}
      <div className="delivery-challan-dashboard-header-section">
        <div className="delivery-challan-dashboard-header-section-left">
          <span className="delivery-challan-dashboard-label">
            Delivery Challan Dashboard
          </span>
        </div>
        <div className="delivery-challan-dashboard-header-section-right">
          <button
            className="add-delivery-challan-btn"
            onClick={() => {
              navigate("/sales/deliverychallan/add");
            }}
          >
            + Add Delivery Challan
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="delivery-challan-dashboard-filter-box">
        <div className="delivery-challan-dashboard-filter-content">
          <label className="delivery-challan-dashboard-filter-label">
            Filter by:
          </label>
          <div className="delivery-challan-dashboard-filter-options">
            <select
              className="delivery-challan-dashboard-filter-dropdown"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
              <option value="This Quarter">This Quarter</option>
              <option value="All Delivery Challans">All Delivery Challans</option>
              <option value="Custom">Custom</option>
            </select>
            {filterType !== "All Delivery Challans" && (
              <div className="delivery-challan-dashboard-date-range-inputs">
                <div className="delivery-challan-dashboard-date-input-group">
                  <label>From:</label>
                  <input
                    type="date"
                    className="delivery-challan-dashboard-date-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="delivery-challan-dashboard-date-input-group">
                  <label>To:</label>
                  <input
                    type="date"
                    className="delivery-challan-dashboard-date-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="delivery-challan-dashboard-total-estimates-box">
        <div className="delivery-challan-dashboard-total-estimates-inner">
          <div className="delivery-challan-dashboard-total-estimates-amount-group">
            <span className="delivery-challan-dashboard-total-estimates-label">
              Total Delivery Challan Amount:
            </span>
            <span className="delivery-challan-dashboard-total-estimates-amount">
              ₹{" "}
              {deliveryChallanData.totalDeliveryChallanAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
          </div>
          <div className="delivery-challan-dashboard-percentage-group">
            <div
              className="delivery-challan-dashboard-percentage-box"
              style={{
                backgroundColor:
                  deliveryChallanData.percentageChange < 0
                    ? "#ed2040"
                    : "transparent",
              }}
            >
              <span
                className="delivery-challan-dashboard-percentage-text"
                style={{
                  color:
                    deliveryChallanData.percentageChange < 0
                      ? "#ffe5e8"
                      : "#29c080",
                }}
              >
                {Math.abs(deliveryChallanData.percentageChange).toFixed(0)}%
              </span>
              <span
                className={
                  deliveryChallanData.percentageChange < 0
                    ? "delivery-challan-dashboard-percentage-arrow-down"
                    : "delivery-challan-dashboard-percentage-arrow-up "
                }
                style={{
                  color:
                    deliveryChallanData.percentageChange < 0
                      ? "#ffe5e8"
                      : "#29c080",
                }}
              >
                {deliveryChallanData.percentageChange < 0 ? "↓" : "↑"}
              </span>
            </div>
            <span className="delivery-challan-dashboard-vs-last-month">
              {getComparisonText(filterType)}
            </span>
          </div>
          <div className="delivery-challan-dashboard-conversion-summary">
            <span className="delivery-challan-dashboard-converted-label">
              Converted:{" "}
            </span>
            <span className="delivery-challan-dashboard-converted-amount">
              ₹{" "}
              {deliveryChallanData.totalConvertedAmount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </span>
            <span className="delivery-challan-dashboard-separator">|</span>
            <span className="delivery-challan-dashboard-open-label">
              Open:{" "}
            </span>
            <span className="delivery-challan-dashboard-open-amount">
              ₹{" "}
              {deliveryChallanData.totalOpenAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="delivery-challan-dashboard-table-container">
        <div className="delivery-challan-dashboard-table-header-section">
          <div className="delivery-challan-dashboard-table-title">
            Transactions
          </div>
          <div className="delivery-challan-dashboard-table-actions">
            <span
              className="delivery-challan-dashboard-action-icon"
              title="Search"
            >
              🔍
            </span>
            <span
              className="delivery-challan-dashboard-action-icon"
              title="Graph"
            >
              📊
            </span>
            <span
              className="delivery-challan-dashboard-action-icon"
              title="Export to Excel"
            >
              📋
            </span>
            <span
              className="delivery-challan-dashboard-action-icon"
              title="Print"
            >
              🖨️
            </span>
          </div>
        </div>
        {deliveryChallanTransactionsData.length === 0 ? (
          <div className="delivery-challan-dashboard-table-content">
            <div className="delivery-challan-dashboard-empty-state">
              <p className="delivery-challan-dashboard-empty-message-primary">
                No Transactions to show
              </p>
              <p className="delivery-challan-dashboard-empty-message-secondary">
                You haven't added any transactions yet.
              </p>
              <button
                className="add-delivery-challan-btn delivery-challan-dashboard-empty-add-btn"
                onClick={() => {
                  navigate("/sales/deliverychallan/add");
                }}
              >
                + Add Delivery Challan
              </button>
            </div>
          </div>
        ) : (
          <div className="delivery-challan-dashboard-transactions-table-wrapper">
            <table className="delivery-challan-dashboard-transactions-table">
              <thead>
                <tr>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Date</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Party Name</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Challan No</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Due Date</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Total Amount</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Status</span>
                      <span className="delivery-challan-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="delivery-challan-dashboard-transactions-table-header">
                      <span>Actions</span>
                    </div>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="delivery-challan-dashboard-loading-row">
                    <td
                      colSpan="8"
                      className="delivery-challan-dashboard-loading-message"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr className="delivery-challan-dashboard-error-row">
                    <td
                      colSpan="8"
                      className="delivery-challan-dashboard-error-message"
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : (
                  deliveryChallanTransactionsData.map(
                    (transaction, index) => (
                      <tr
                        key={transaction.id | index}
                        className="delivery-challan-dashboard-transaction-row"
                      >
                        <td>
                          {transaction.transactionDate
                            ? new Date(
                              transaction.transactionDate
                            ).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                        <td>
                          {transaction.partyName || transaction.party || "NA"}
                        </td>
                        <td>
                          {transaction.deliveryChallanNumber ||
                            transaction.deliveryChallanNo ||
                            "-"}
                        </td>
                        <td>
                          <td>
                            {transaction.deliveryChallanDueDate
                              ? new Date(
                                transaction.deliveryChallanDueDate
                              ).toLocaleDateString("en-IN")
                              : "-"}
                          </td>
                        </td>
                        <td>
                          ₹{" "}
                          {transaction.totalAmount
                            ? transaction.totalAmount.toLocaleString(
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
                          <div className="delivery-challan-dashboard-transactions-convert-actions">
                            <button
                              className="delivery-challan-dashboard-transactions-convert-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConvertToSaleType(
                                  "Convert To Sale",
                                  transaction.deliveryChallanId,
                                  e
                                );
                              }}
                            >
                              CONVERT TO SALE
                            </button>
                          </div>
                        </td>
                        <td>
                          <div
                            className="delivery-challan-dashboard-transaction-three-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionActionsClick(
                                transaction.deliveryChallanId,
                                e
                              );
                            }}
                          >
                            ⋮
                          </div>
                          {/* Transaction Actions Menu - positioned relative to this transaction */}
                          {showTransactionActionsMenu &&
                            activeActionMenuRowId ===
                            transaction.deliveryChallanId && (
                              <div
                                className="delivery-challan-dashboard-transaction-actions-menu"
                                ref={transactionActionsRef}
                              >
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_edit",
                                      transaction.deliveryChallanId ||
                                      transaction.id
                                    )
                                  }
                                >
                                  View/Edit
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "delete",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  Delete
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "duplicate",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  Duplicate
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "open_pdf",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  Open PDF
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "preview",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  Preview
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "print",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  Print
                                </div>
                                <div
                                  className="delivery-challan-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_history",
                                      transaction.deliveryChallanId
                                    )
                                  }
                                >
                                  View History
                                </div>
                              </div>
                            )}
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

export default DeliveryChallanDashboard;
