import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./SalesOrderDashboard.css";
import {
    BASE_URL,
    GET_TOTAL_SALES_ORDER_AMOUNT,
    GET_ALL_SALES_ORDER_TRANSACTIONS,
} from "../Constants";

const SalesOrderDashboard = () => {
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

    const [salesOrderTransactionsData, setSalesOrderTransactionsData] =
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
    const [salesOrderData, setSalesOrderData] = useState({
        totalSalesOrderAmount: 0,
        totalAdvanceAmount: 0,
        totalOverdueAmount: 0,
        percentageChange: 0,
    });
    const [transactions, setTransactions] = useState(
        salesOrderTransactionsData
    );
    const [convertToSaleType, setConvertToSaleType] = useState({});

    // Fetch sales order transaction data from API
    const fetchTotalSalesOrderAmount = async () => {
        try {
            let url = `${BASE_URL}/${GET_TOTAL_SALES_ORDER_AMOUNT}`;

            // Add date range params if filter is applied
            if (filterType !== "All Orders" && fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                console.error(
                    "Failed to fetch total sales order amount:",
                    response.status
                );
                return;
            }

            const data = await response.json();
            console.log("Response JSON: ", data);

            setSalesOrderData({
                totalSalesOrderAmount: data.data.totalSalesOrderAmount || 0,
                totalAdvanceAmount: data.data.totalAdvanceAmount || 0,
                totalOverdueAmount: data.data.totalOverdueAmount || 0,
                percentageChange: data.data.percentageChange || 0,
            });
            console.log("Sales Order updated: ", salesOrderData);
        } catch (error) {
            console.error("Error fetching total sales order amount:", error);
        }
    };

    // Fetch all estimate quotation transactions from API
    const fetchAllSalesOrderTransaction = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = `${BASE_URL}/${GET_ALL_SALES_ORDER_TRANSACTIONS}`;

            // Add date range params if filter is applied
            if (filterType !== "All Estimates" && fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch all sales order transactions: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Sales Order Transactions Response: ", data);

            // Assuming the API returns data in data.data or data array format
            const transactions = data.data || data || [];
            setSalesOrderTransactionsData(transactions);
        } catch (error) {
            console.error("Error fetching sales order transaction: ", error);
            setError(error.message);
            setSalesOrderTransactionsData([]);
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

    const handleConvertToSaleType = (saleType, salesOrderId, e) => {
        e.stopPropagation();
        setConvertToSaleType((prev) => ({
            ...prev,
            [salesOrderId]: saleType,
        }));
        console.log(`${saleType} for transaction: `, salesOrderId);
    };

    const handleTransactionActionsClick = (salesOrderId, event) => {
        event.stopPropagation();
        setActiveActionMenuRowId(salesOrderId);
        setShowTransactionActionsMenu(true);
    };

    // Handle transaction action selection
    const handleTransactionAction = (action, salesOrderId) => {
        console.log(`${action} action for transaction:`, salesOrderId);

        // Find the transaction data
        const transaction = salesOrderData.find(
            (t) => t.salesOrderId === salesOrderId
        );

        switch (action) {
            case "view_edit":
                if (transaction) {
                    console.log("View/Edit transaction:", transaction);
                    navigate("/sales/order/add", {
                        state: { salesOrderId: transaction.salesOrderId },
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
                    console.log("Delete transaction:", salesOrderId);
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
        fetchTotalSalesOrderAmount();
        fetchAllSalesOrderTransaction();
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
        <div className="sales-order-dashboard-container">
            {/* Header Section */}
            <div className="sales-order-dashboard-header-section">
                <div className="sales-order-dashboard-header-section-left">
                    <span className="sales-order-dashboard-label">
                        Sales Order Dashboard
                    </span>
                </div>
                <div className="sales-order-dashboard-header-section-right">
                    <button
                        className="add-sales-order-btn"
                        onClick={() => {
                            navigate("/sales/order/add");
                        }}
                    >
                        + Add Sales Order
                    </button>
                </div>
            </div>
            {/* Filter Section */}
            <div className="sales-order-dashboard-filter-box">
                <div className="sales-order-dashboard-filter-content">
                    <label className="sales-order-dashboard-filter-label">
                        Filter by:
                    </label>
                    <div className="sales-order-dashboard-filter-options">
                        <select
                            className="sales-order-dashboard-filter-dropdown"
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="This Year">This Year</option>
                            <option value="This Quarter">This Quarter</option>
                            <option value="All Orders">All Orders</option>
                            <option value="Custom">Custom</option>
                        </select>
                        {filterType !== "All Orders" && (
                            <div className="sales-order-dashboard-date-range-inputs">
                                <div className="sales-order-dashboard-date-input-group">
                                    <label>From:</label>
                                    <input
                                        type="date"
                                        className="sales-order-dashboard-date-input"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="sales-order-dashboard-date-input-group">
                                    <label>To:</label>
                                    <input
                                        type="date"
                                        className="sales-order-dashboard-date-input"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="sales-order-dashboard-total-orders-box">
                <div className="sales-order-dashboard-total-orders-inner">
                    <div className="sales-order-dashboard-total-orders-amount-group">
                        <span className="sales-order-dashboard-total-orders-label">
                            Total Orders:
                        </span>
                        <span className="sales-order-dashboard-total-orders-amount">
                            ₹{" "}
                            {salesOrderData.totalSalesOrderAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </span>
                    </div>
                    <div className="sales-order-dashboard-percentage-group">
                        <div
                            className="sales-order-dashboard-percentage-box"
                            style={{
                                backgroundColor:
                                    salesOrderData.percentageChange < 0
                                        ? "#ed2040"
                                        : "transparent",
                            }}
                        >
                            <span
                                className="sales-order-dashboard-percentage-text"
                                style={{
                                    color:
                                        salesOrderData.percentageChange < 0
                                            ? "#ffe5e8"
                                            : "#29c080",
                                }}
                            >
                                {Math.abs(salesOrderData.percentageChange).toFixed(0)}%
                            </span>
                            <span
                                className={
                                    salesOrderData.percentageChange < 0
                                        ? "sales-order-dashboard-percentage-arrow-down"
                                        : "sales-order-dashboard-percentage-arrow-up "
                                }
                                style={{
                                    color:
                                        salesOrderData.percentageChange < 0
                                            ? "#ffe5e8"
                                            : "#29c080",
                                }}
                            >
                                {salesOrderData.percentageChange < 0 ? "↓" : "↑"}
                            </span>
                        </div>
                        <span className="sales-order-dashboard-vs-last-month">
                            {getComparisonText(filterType)}
                        </span>
                    </div>
                    <div className="sales-order-dashboard-conversion-summary">
                        <span className="sales-order-dashboard-converted-label">
                            Advance:{" "}
                        </span>
                        <span className="sales-order-dashboard-converted-amount">
                            ₹{" "}
                            {salesOrderData.totalAdvanceAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </span>
                        <span className="sales-order-dashboard-separator">|</span>
                        <span className="sales-order-dashboard-open-label">
                            Overdue:{" "}
                        </span>
                        <span className="sales-order-dashboard-open-amount">
                            ₹{" "}
                            {salesOrderData.totalOverdueAmount.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>
            </div>
            <div className="sales-order-dashboard-table-container">
                <div className="sales-order-dashboard-table-header-section">
                    <div className="sales-order-dashboard-table-title">
                        Transactions
                    </div>
                    <div className="sales-order-dashboard-table-actions">
                        <span
                            className="sales-order-dashboard-action-icon"
                            title="Search"
                        >
                            🔍
                        </span>
                        <span
                            className="sales-order-dashboard-action-icon"
                            title="Graph"
                        >
                            📊
                        </span>
                        <span
                            className="sales-order-dashboard-action-icon"
                            title="Export to Excel"
                        >
                            📋
                        </span>
                        <span
                            className="sales-order-dashboard-action-icon"
                            title="Print"
                        >
                            🖨️
                        </span>
                    </div>
                </div>
                {salesOrderTransactionsData.length === 0 ? (
                    <div className="sales-order-dashboard-table-content">
                        <div className="sales-order-dashboard-empty-state">
                            <p className="sales-order-dashboard-empty-message-primary">
                                No Transactions to show
                            </p>
                            <p className="sales-order-dashboard-empty-message-secondary">
                                You haven't added any transactions yet.
                            </p>
                            <button
                                className="add-sales-order-btn sales-order-dashboard-empty-add-btn"
                                onClick={() => {
                                    navigate("/sales/order/add");
                                }}
                            >
                                + Add Sales Order
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="sales-order-dashboard-transactions-table-wrapper">
                        <table className="sales-order-dashboard-transactions-table">
                            <thead>
                                <tr>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Party</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Ref No</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Order Date</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Due Date</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Total</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Balance</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Type</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Status</span>
                                            <span className="sales-order-dashboard-transactions-filter-icon">
                                                🔽
                                            </span>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="sales-order-dashboard-transactions-table-header">
                                            <span>Actions</span>
                                        </div>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr className="sales-order-dashboard-loading-row">
                                        <td
                                            colSpan="8"
                                            className="sales-order-dashboard-loading-message"
                                        >
                                            Loading transactions...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr className="sales-order-dashboard-error-row">
                                        <td
                                            colSpan="8"
                                            className="sales-order-dashboard-error-message"
                                        >
                                            Error: {error}
                                        </td>
                                    </tr>
                                ) : (
                                    salesOrderTransactionsData.map(
                                        (transaction, index) => (
                                            <tr
                                                key={transaction.id | index}
                                                className="sales-order-dashboard-transaction-row"
                                            >
                                                <td>
                                                    {transaction.partyName || transaction.party || "NA"}
                                                </td>
                                                <td>
                                                    {transaction.salesOrderNumber ||
                                                        transaction.salesOrderNo ||
                                                        "-"}
                                                </td>
                                                <td>
                                                    {transaction.orderDate
                                                        ? new Date(
                                                            transaction.orderDate
                                                        ).toLocaleDateString("en-IN")
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {transaction.dueDate
                                                        ? new Date(
                                                            transaction.dueDate
                                                        ).toLocaleDateString("en-IN")
                                                        : "-"}
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
                                                <td>{transaction.transactionType || "NA"}</td>
                                                <td>{transaction.status || "NA"}</td>
                                                <td>
                                                    <div className="sales-order-dashboard-transactions-convert-actions">
                                                        <button
                                                            className="sales-order-dashboard-transactions-convert-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleConvertToSaleType(
                                                                    "Convert To Sale",
                                                                    transaction.salesOrderId,
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
                                                        className="sales-order-dashboard-transaction-three-dots"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTransactionActionsClick(
                                                                transaction.salesOrderId,
                                                                e
                                                            );
                                                        }}
                                                    >
                                                        ⋮
                                                    </div>
                                                    {/* Transaction Actions Menu - positioned relative to this transaction */}
                                                    {showTransactionActionsMenu &&
                                                        activeActionMenuRowId ===
                                                        transaction.salesOrderId && (
                                                            <div
                                                                className="sales-order-dashboard-transaction-actions-menu"
                                                                ref={transactionActionsRef}
                                                            >
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "view_edit",
                                                                            transaction.salesOrderId ||
                                                                            transaction.id
                                                                        )
                                                                    }
                                                                >
                                                                    View/Edit
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "delete",
                                                                            transaction.salesOrderId
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "duplicate",
                                                                            transaction.salesOrderId
                                                                        )
                                                                    }
                                                                >
                                                                    Duplicate
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "open_pdf",
                                                                            transaction.salesOrderId
                                                                        )
                                                                    }
                                                                >
                                                                    Open PDF
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "preview",
                                                                            transaction.salesOrderId
                                                                        )
                                                                    }
                                                                >
                                                                    Preview
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "print",
                                                                            transaction.salesOrderId
                                                                        )
                                                                    }
                                                                >
                                                                    Print
                                                                </div>
                                                                <div
                                                                    className="sales-order-dashboard-transaction-action-item"
                                                                    onClick={() =>
                                                                        handleTransactionAction(
                                                                            "view_history",
                                                                            transaction.salesOrderId
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

export default SalesOrderDashboard;
