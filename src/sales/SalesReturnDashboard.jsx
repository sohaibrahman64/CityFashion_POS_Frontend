import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./SalesReturnDashboard.css";
import {
    BASE_URL,
    GET_TOTAL_SALES_RETURN_AMOUNT,
    GET_ALL_SALES_RETURN_TRANSACTIONS,
} from "../Constants";

const SalesReturnDashboard = () => {
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

    const [salesReturnTransactionsData, setSalesReturnTransactionsData] =
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
    const [salesReturnData, setSalesReturnData] = useState({
        totalSalesReturnAmount: 0,
        totalPaidAmount: 0,
        totalBalanceAmount: 0,
        percentageChange: 0,
    });
    const [transactions, setTransactions] = useState(
        salesReturnTransactionsData
    );
    const [convertToSaleType, setConvertToSaleType] = useState({});

    // Fetch sales order transaction data from API
    const fetchTotalSalesReturnAmount = async () => {
        try {
            let url = `${BASE_URL}/${GET_TOTAL_SALES_RETURN_AMOUNT}`;

            // Add date range params if filter is applied
            if (filterType !== "All Returns" && fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                console.error(
                    "Failed to fetch total sales return amount:",
                    response.status
                );
                return;
            }

            const data = await response.json();
            console.log("Response JSON: ", data);

            setSalesReturnData({
                totalSalesReturnAmount: data.data.totalSalesReturnAmount || 0,
                totalPaidAmount: data.data.totalPaidAmount || 0,
                totalBalanceAmount: data.data.totalBalanceAmount || 0,
                percentageChange: data.data.percentageChange || 0,
            });
            console.log("Sales Return updated: ", salesReturnData);
        } catch (error) {
            console.error("Error fetching total sales return amount:", error);
        }
    };

    // Fetch all sales return transactions from API
    const fetchAllSalesReturnTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = `${BASE_URL}/${GET_ALL_SALES_RETURN_TRANSACTIONS}`;

            // Add date range params if filter is applied
            if (filterType !== "All Returns" && fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch all sales return transactions: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Sales Return Transactions Response: ", data);

            // Assuming the API returns data in data.data or data array format
            const transactions = data.data || data || [];
            setSalesReturnTransactionsData(transactions);
        } catch (error) {
            console.error("Error fetching sales return transactions: ", error);
            setError(error.message);
            setSalesReturnTransactionsData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilterType) => {
        setFilterType(newFilterType);
        if (newFilterType !== "All Returns") {
            const dateRange = getDateRange(newFilterType);
            setFromDate(dateRange.from);
            setToDate(dateRange.to);
        } else {
            setFromDate("");
            setToDate("");
        }
    };

    const handleConvertToSaleType = (saleType, salesReturnId, e) => {
        e.stopPropagation();
        setConvertToSaleType((prev) => ({
            ...prev,
            [salesReturnId]: saleType,
        }));
        console.log(`${saleType} for transaction: `, salesReturnId);
    };

    const handleTransactionActionsClick = (salesReturnId, event) => {
        event.stopPropagation();
        setActiveActionMenuRowId(salesReturnId);
        setShowTransactionActionsMenu(true);
    };

    // Handle transaction action selection
    const handleTransactionAction = (action, salesReturnId) => {
        console.log(`${action} action for transaction:`, salesReturnId);

        // Find the transaction data
        const transaction = salesReturnData.find(
            (t) => t.salesReturnId === salesReturnId
        );

        switch (action) {
            case "view_edit":
                if (transaction) {
                    console.log("View/Edit transaction:", transaction);
                    navigate("/sales/return/add", {
                        state: { salesReturnId: transaction.salesReturnId },
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
                    console.log("Delete transaction:", salesReturnId);
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
        fetchTotalSalesReturnAmount();
        fetchAllSalesReturnTransaction();
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
        <div className="sales-return-dashboard-container">
            {/* Header Section */}
            <div className="sales-return-dashboard-header-section">
                <div className="sales-return-dashboard-header-section-left">
                    <span className="sales-return-dashboard-label">
                        Sales Return Dashboard
                    </span>
                </div>
                <div className="sales-return-dashboard-header-section-right">
                    <button
                        className="add-sales-return-btn"
                        onClick={() => {
                            navigate("/sales/return/add");
                        }}
                    >
                        + Add Sales Return
                    </button>
                </div>
            </div>
            {/* Filter Section */}
            <div className="sales-return-dashboard-filter-box">
                <div className="sales-return-dashboard-filter-content">
                    <label className="sales-return-dashboard-filter-label">
                        Filter by:
                    </label>
                    <div className="sales-return-dashboard-filter-options">
                        <select
                            className="sales-return-dashboard-filter-dropdown"
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="This Year">This Year</option>
                            <option value="This Quarter">This Quarter</option>
                            <option value="All Returns">All Returns</option>
                            <option value="Custom">Custom</option>
                        </select>
                        {filterType !== "All Returns" && (
                            <div className="sales-return-dashboard-date-range-inputs">
                                <div className="sales-return-dashboard-date-input-group">
                                    <label>From:</label>
                                    <input
                                        type="date"
                                        className="sales-return-dashboard-date-input"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="sales-return-dashboard-date-input-group">
                                    <label>To:</label>
                                    <input
                                        type="date"
                                        className="sales-return-dashboard-date-input"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="sales-return-dashboard-total-returns-box">
                <div className="sales-return-dashboard-total-returns-inner">
                    <div className="sales-return-dashboard-total-returns-amount-group">
                        <span className="sales-return-dashboard-total-returns-label">
                            Total Returns:
                        </span>
                        <span className="sales-return-dashboard-total-returns-amount">
                            ₹{" "}
                            {salesReturnData.totalSalesReturnAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </span>
                    </div>
                    <div className="sales-return-dashboard-percentage-group">
                        <div
                            className="sales-return-dashboard-percentage-box"
                            style={{
                                backgroundColor:
                                    salesReturnData.percentageChange < 0
                                        ? "#ed2040"
                                        : "transparent",
                            }}
                        >
                            <span
                                className="sales-return-dashboard-percentage-text"
                                style={{
                                    color:
                                        salesReturnData.percentageChange < 0
                                            ? "#ffe5e8"
                                            : "#29c080",
                                }}
                            >
                                {Math.abs(salesReturnData.percentageChange).toFixed(0)}%
                            </span>
                            <span
                                className={
                                    salesReturnData.percentageChange < 0
                                        ? "sales-return-dashboard-percentage-arrow-down"
                                        : "sales-return-dashboard-percentage-arrow-up "
                                }
                                style={{
                                    color:
                                        salesReturnData.percentageChange < 0
                                            ? "#ffe5e8"
                                            : "#29c080",
                                }}
                            >
                                {salesReturnData.percentageChange < 0 ? "↓" : "↑"}
                            </span>
                        </div>
                        <span className="sales-return-dashboard-vs-last-month">
                            {getComparisonText(filterType)}
                        </span>
                    </div>
                    <div className="sales-return-dashboard-conversion-summary">
                        <span className="sales-return-dashboard-converted-label">
                            Paid:{" "}
                        </span>
                        <span className="sales-return-dashboard-converted-amount">
                            ₹{" "}
                            {salesReturnData.totalPaidAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </span>
                        <span className="sales-return-dashboard-separator">|</span>
                        <span className="sales-return-dashboard-open-label">
                            Balance:{" "}
                        </span>
                        <span className="sales-return-dashboard-open-amount">
                            ₹{" "}
                            {salesReturnData.totalBalanceAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="sales-return-dashboard-table-container">
                <div className="sales-return-dashboard-table-header-section">
                    <div className="sales-return-dashboard-table-title">
                        Transactions
                    </div>
                    <div className="sales-return-dashboard-table-actions">
                        <span
                            className="sales-return-dashboard-action-icon"
                            title="Search"
                        >
                            🔍
                        </span>
                        <span
                            className="sales-return-dashboard-action-icon"
                            title="Graph"
                        >
                            📊
                        </span>
                        <span
                            className="sales-return-dashboard-action-icon"
                            title="Export to Excel"
                        >
                            📋
                        </span>
                        <span
                            className="sales-return-dashboard-action-icon"
                            title="Print"
                        >
                            🖨️
                        </span>
                    </div>
                </div>
                {salesReturnTransactionsData.length === 0 ? (
                    <div className="sales-return-dashboard-table-content">
                        <div className="sales-return-dashboard-empty-state">
                            <p className="sales-return-dashboard-empty-message-primary">
                                No Transactions to show
                            </p>
                            <p className="sales-return-dashboard-empty-message-secondary">
                                You haven't added any transactions yet.
                            </p>
                            <button
                                className="add-sales-return-btn sales-return-dashboard-empty-add-btn"
                                onClick={() => {
                                    navigate("/sales/return/add");
                                }}
                            >
                                + Add Sales Return
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="sales-return-dashboard-transactions-table-wrapper">
                        <table className="sales-return-dashboard-transactions-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Date</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Ref No</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Party</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Type</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Total</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Paid</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Balance</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Status</span>
                                            <span className="sales-return-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-return-dashboard-transactions-table-header">
                                            <span>Print/Share</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr className="sales-return-dashboard-loading-row">
                                        <td
                                            colSpan="8"
                                            className="sales-return-dashboard-loading-message"
                                        >
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr className="sales-return-dashboard-error-row">
                                        <td
                                            colSpan="8"
                                            className="sales-return-dashboard-error-message"
                                        >
                                            Error: {error}
                                        </td>
                                    </tr>
                                ) : (
                                    salesReturnTransactionsData.map(
                                        (transaction, index) => (
                                            <tr
                                                key={transaction.id | index}
                                                className="sales-return-dashboard-transaction-row"
                                            >
                                                <td>
                                                    {transaction.transactionDate || "NA"}
                                                </td>
                                                <td>
                                                    {transaction.salesReturnTransactionNumber ||
                                                        "-"}
                                                </td>
                                                <td>
                                                    {transaction.partyName || "-"}
                                                </td>
                                                <td>
                                                    {transaction.transactionType
                                                        || "-"}
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
                                                    {transaction.paidAmount
                                                        ? transaction.paidAmount.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )
                                                        : "0.00"}
                                                </td>
                                                <td>₹{" "}
                                                    {transaction.balanceAmount
                                                        ? transaction.balanceAmount.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )
                                                        : "0.00"}</td>
                                                <td>{transaction.paymentStatus || "NA"}</td>
                                                <td>
                                                    <div className="sales-return-dashboard-transactions-convert-actions">
                                                        <button
                                                            className="sales-return-dashboard-transactions-convert-button"
                                                            type="button"
                                                            title="Print"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTransactionAction(
                                                                    "print",
                                                                    transaction.salesOrderId || transaction.id
                                                                );
                                                            }}
                                                        >
                                                            🖨️
                                                        </button>
                                                        <button
                                                            className="sales-return-dashboard-transactions-convert-button"
                                                            type="button"
                                                            title="Share"
                                                            style={{ marginLeft: "5px" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTransactionAction(
                                                                    "preview",
                                                                    transaction.salesReturnId || transaction.id
                                                                );
                                                            }}
                                                        >
                                                            📤
                                                        </button>
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

export default SalesReturnDashboard;
