import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./PaymentInDashboard.css";
import {
  BASE_URL,
  GET_TOTAL_PAYMENT_IN_AMOUNT,
  GET_ALL_PAYMENT_IN_TRANSACTIONS,
} from "../Constants";
import AddPaymentIn from "./AddPaymentIn";

const PaymentInDashboard = () => {
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

  const [paymentInTransactionsData, setPaymentInTransactionsData] = useState(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransactionActionsMenu, setShowTransactionActionsMenu] =
    useState(false);
  const [activeActionMenuRowId, setActiveActionMenuRowId] = useState(null);
  const transactionActionsRef = useRef(null);

  const [filterType, setFilterType] = useState("This Month");
  const [fromDate, setFromDate] = useState(initialDateRange.from);
  const [toDate, setToDate] = useState(initialDateRange.to);
  const [paymentInData, setPaymentInData] = useState({
    totalPaymentInAmount: 0,
    totalReceivedAmount: 0,
    percentageChange: 0,
  });
  const [transactions, setTransactions] = useState(paymentInTransactionsData);
  const [showAddPaymentInModal, setShowAddPaymentInModal] = useState(false);

  // Fetch payment in transaction data from API
  const fetchTotalPaymentInAmount = async () => {
    try {
      let url = `${BASE_URL}/${GET_TOTAL_PAYMENT_IN_AMOUNT}`;

      // Add date range params if filter is applied
      if (filterType !== "All Payments" && fromDate && toDate) {
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

      setPaymentInData({
        totalPaymentInAmount: data.data.totalPaymentInAmount || 0,
        totalReceivedAmount: data.data.totalReceivedAmount || 0,
        percentageChange: data.data.percentageChange || 0,
      });
      console.log("Payment In updated: ", paymentInData);
    } catch (error) {
      console.error("Error fetching total payment in amount:", error);
    }
  };

  // Fetch all estimate quotation transactions from API
  const fetchAllPaymentInTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${BASE_URL}/${GET_ALL_PAYMENT_IN_TRANSACTIONS}`;

      // Add date range params if filter is applied
      if (filterType !== "All Payments" && fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch all payment in transactions: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Payment In Transactions Response: ", data);

      // Assuming the API returns data in data.data or data array format
      const transactions = data.data || data || [];
      setPaymentInTransactionsData(transactions);
    } catch (error) {
      console.error("Error fetching estimate quotation transaction: ", error);
      setError(error.message);
      setPaymentInTransactionsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== "All Payments") {
      const dateRange = getDateRange(newFilterType);
      setFromDate(dateRange.from);
      setToDate(dateRange.to);
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  const handleTransactionActionsClick = (paymentInId, event) => {
    event.stopPropagation();
    setActiveActionMenuRowId(paymentInId);
    setShowTransactionActionsMenu(true);
  };

  const handleTransactionAction = (action, paymentInId) => {
    console.log(`${action} action for transaction:`, paymentInId);

    // Find the transaction data
    const transaction = paymentInData.find(
      (t) => t.paymentInId === paymentInId
    );

    switch (action) {
      case "view_edit":
        if (transaction) {
          console.log("View/Edit transaction:", transaction);
          navigate("/sales/payment-in/add", {
            state: { paymentInId: transaction.paymentInId },
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
          console.log("Delete transaction:", paymentInId);
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
    // fetchTotalPaymentInAmount();
    // fetchAllPaymentInTransaction();
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
    <div className="payment-in-dashboard-container">
      {/* Header Section */}
      <div className="payment-in-dashboard-header-section">
        <div className="payment-in-dashboard-header-section-left">
          <span className="payment-in-dashboard-label">
            Payment In Dashboard
          </span>
        </div>
        <div className="payment-in-dashboard-header-section-right">
          <button
            className="add-payment-in-btn"
            onClick={() => {
              navigate("/sales/payment-in/add");
            }}
          >
            + Add Payment
          </button>
        </div>
      </div>
      {/* Filter Section */}
      <div className="payment-in-dashboard-filter-box">
        <div className="payment-in-dashboard-filter-content">
          <label className="payment-in-dashboard-filter-label">
            Filter by:
          </label>
          <div className="payment-in-dashboard-filter-options">
            <select
              className="payment-in-dashboard-filter-dropdown"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Year">This Year</option>
              <option value="This Quarter">This Quarter</option>
              <option value="All Payments">All Payments</option>
              <option value="Custom">Custom</option>
            </select>
            {filterType !== "All Payments" && (
              <div className="payment-in-dashboard-date-range-inputs">
                <div className="payment-in-dashboard-date-input-group">
                  <label>From:</label>
                  <input
                    type="date"
                    className="payment-in-dashboard-date-input"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div className="payment-in-dashboard-date-input-group">
                  <label>To:</label>
                  <input
                    type="date"
                    className="payment-in-dashboard-date-input"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="payment-in-dashboard-total-payments-box">
        <div className="payment-in-dashboard-total-payments-inner">
          <div className="payment-in-dashboard-total-payments-amount-group">
            <span className="payment-in-dashboard-total-payments-label">
              Total Amount:
            </span>
            <span className="payment-in-dashboard-total-payments-amount">
              ₹{" "}
              {paymentInData.totalPaymentInAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <div className="payment-in-dashboard-percentage-group">
            <div
              className="payment-in-dashboard-percentage-box"
              style={{
                backgroundColor:
                  paymentInData.percentageChange < 0
                    ? "#ed2040"
                    : "transparent",
              }}
            >
              <span
                className="payment-in-dashboard-percentage-text"
                style={{
                  color:
                    paymentInData.percentageChange < 0 ? "#ffe5e8" : "#29c080",
                }}
              >
                {Math.abs(paymentInData.percentageChange).toFixed(0)}%
              </span>
              <span
                className={
                  paymentInData.percentageChange < 0
                    ? "payment-in-dashboard-percentage-arrow-down"
                    : "payment-in-dashboard-percentage-arrow-up "
                }
                style={{
                  color:
                    paymentInData.percentageChange < 0 ? "#ffe5e8" : "#29c080",
                }}
              >
                {paymentInData.percentageChange < 0 ? "↓" : "↑"}
              </span>
            </div>
            <span className="payment-in-dashboard-vs-last-month">
              {getComparisonText(filterType)}
            </span>
          </div>
          <div className="payment-in-dashboard-conversion-summary">
            <span className="payment-in-dashboard-converted-label">
              Received:{" "}
            </span>
            <span className="payment-in-dashboard-converted-amount">
              ₹{" "}
              {paymentInData.totalReceivedAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
        </div>
      </div>
      <div className="payment-in-dashboard-table-container">
        <div className="payment-in-dashboard-table-header-section">
          <div className="payment-in-dashboard-table-title">Transactions</div>
          <div className="payment-in-dashboard-table-actions">
            <span className="payment-in-dashboard-action-icon" title="Search">
              🔍
            </span>
            <span className="payment-in-dashboard-action-icon" title="Graph">
              📊
            </span>
            <span
              className="payment-in-dashboard-action-icon"
              title="Export to Excel"
            >
              📋
            </span>
            <span className="payment-in-dashboard-action-icon" title="Print">
              🖨️
            </span>
          </div>
        </div>
        {paymentInTransactionsData.length === 0 ? (
          <div className="payment-in-dashboard-table-content">
            <div className="payment-in-dashboard-empty-state">
              <p className="payment-in-dashboard-empty-message-primary">
                No Transactions to show
              </p>
              <p className="payment-in-dashboard-empty-message-secondary">
                You haven't added any transactions yet.
              </p>
              <button
                className="add-payment-in-btn payment-in-dashboard-empty-add-btn"
                onClick={() => {
                  setShowAddPaymentInModal(true);
                }}
              >
                + Add Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="payment-in-dashboard-transactions-table-wrapper">
            <table className="payment-in-dashboard-transactions-table">
              <thead>
                <tr>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Date</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Reference No</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Party Name</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Amount</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Balance</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Status</span>
                      <span className="payment-in-dashboard-transactions-filter-icon">
                        🔽
                      </span>
                    </div>
                  </th>
                  <th>
                    <div className="payment-in-dashboard-transactions-table-header">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="payment-in-dashboard-loading-row">
                    <td
                      colSpan="8"
                      className="payment-in-dashboard-loading-message"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr className="payment-in-dashboard-error-row">
                    <td
                      colSpan="8"
                      className="payment-in-dashboard-error-message"
                    >
                      Error: {error}
                    </td>
                  </tr>
                ) : (
                  paymentInTransactionsData.map((transaction, index) => (
                    <tr
                      key={transaction.id | index}
                      className="payment-in-dashboard-transaction-row"
                    >
                      <td>
                        {transaction.transactionDate
                          ? new Date(
                              transaction.transactionDate
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>
                        {transaction.paymentInNumber ||
                          transaction.paymentInNo ||
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
                          ? transaction.balanceAmount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </td>
                      <td>{transaction.status || "NA"}</td>
                      <td>
                        <div className="payment-in-dashboard-transactions-convert-actions">
                          <div
                            className="payment-in-dashboard-transaction-three-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionActionsClick(
                                transaction.paymentInId,
                                e
                              );
                            }}
                          >
                            ⋮
                          </div>
                          {/* Transaction Actions Menu - positioned relative to this transaction */}
                          {showTransactionActionsMenu &&
                            activeActionMenuRowId ===
                              transaction.paymentInId && (
                              <div
                                className="payment-in-dashboard-transaction-actions-menu"
                                ref={transactionActionsRef}
                              >
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_edit",
                                      transaction.paymentInId || transaction.id
                                    )
                                  }
                                >
                                  View/Edit
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "delete",
                                      transaction.paymentInId
                                    )
                                  }
                                >
                                  Delete
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "duplicate",
                                      transaction.paymentInId
                                    )
                                  }
                                >
                                  Duplicate
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "open_pdf",
                                      transaction.paymentInId
                                    )
                                  }
                                >
                                  Open PDF
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "preview",
                                      transaction.paymentInId
                                    )
                                  }
                                >
                                  Preview
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "print",
                                      transaction.paymentInId
                                    )
                                  }
                                >
                                  Print
                                </div>
                                <div
                                  className="payment-in-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_history",
                                      transaction.paymentInId
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
        )}
      </div>
      {/* Add Payment In Modal */}
      {showAddPaymentInModal && (
        <AddPaymentIn
          onClose={() => {
            console.log("Parent onClose called");
            setShowAddPaymentInModal(false);
          }}
        />
      )}
    </div>
  );
};
export default PaymentInDashboard;
