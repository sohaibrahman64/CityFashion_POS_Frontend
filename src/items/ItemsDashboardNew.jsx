import "./ItemsDashboardNew.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BASE_URL,
  GET_ALL_PRODUCTS_NEW,
  GET_PRODUCT_TRANSACTIONS,
  DELETE_PRODUCT_NEW,
  STOCK_ADJUSTMENT,
} from "../Constants";
import axios from "axios";
import Toast from "../components/Toast";

const ItemsDashboardNew = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [filterInactive, setFilterInactive] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [stockMode, setStockMode] = useState("add");
  const [adjustmentDate, setAdjustmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [totalQuantity, setTotalQuantity] = useState("");
  const [atPrice, setAtPrice] = useState("");
  const [description, setDescription] = useState("");
  const [transactionsSearchTerm, setTransactionsSearchTerm] = useState("");
  const [isResizing, setIsResizing] = useState(false);
  const [currentResizeColumn, setCurrentResizeColumn] = useState(null);
  const dropdownRef = useRef(null);
  const importDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);

  // Add this state for real transactions
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);

  // Product actions menu state
  const [showProductActionsMenu, setShowProductActionsMenu] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const productActionsRef = useRef(null);

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Toast management functions
  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Add this function to load real transactions
  const loadProductTransactions = async (productId) => {
    if (!productId) return;

    try {
      setTransactionsLoading(true);
      const response = await axios.get(
        `${BASE_URL}/${GET_PRODUCT_TRANSACTIONS}/${productId}`
      );
      setTransactions(response.data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Function to determine status dot class based on transaction type
  const getStatusDotClass = (transactionType) => {
    if (!transactionType) return "neutral";

    const type = transactionType.toUpperCase();

    // Positive transactions (add stock, sales returns, etc.)
    // if (type.includes("ADD") || type.includes("SALE_RETURN") || type.includes("PURCHASE")) {
    //   return "positive";
    // }

    if (type.includes("SALE") || type.includes("REDUCE_STOCK")) {
      return "positive";
    }

    // Negative transactions (reduce stock, sales, etc.)
    // if (type.includes("REDUCE") || type.includes("SALE") || type.includes("DAMAGE") || type.includes("LOSS")) {
    //   return "negative";
    // }
    if (
      type.includes("PURCHASE") ||
      type.includes("SALE_RETURN") ||
      type.includes("DAMAGE") ||
      type.includes("LOSS")
    ) {
      return "negative";
    }

    // Neutral transactions (transfers, adjustments, etc.)
    if (
      type.includes("TRANSFER") ||
      type.includes("ADJUSTMENT") ||
      type.includes("CORRECTION")
    ) {
      return "neutral";
    }

    // Default to neutral for unknown transaction types
    return "neutral";
  };

  // Function to format transaction dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "-";
      }

      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Call this when a product is selected
  useEffect(() => {
    if (selectedProductId) {
      loadProductTransactions(selectedProductId);
    }
  }, [selectedProductId]);

  // Load products from backend
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Auto-select first product when products are loaded
  useEffect(() => {
    if (filteredProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, selectedProductId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS_NEW}`);
      console.log(response.data);
      setProducts(response.data.products);
      setFilteredProducts(response.data.products); // Initialize filtered products
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product row click
  const handleProductRowClick = (productId) => {
    setSelectedProductId(productId);
  };

  // Handle product actions click
  const handleProductActionsClick = (productId, event) => {
    event.stopPropagation(); // Prevent product row selection
    setActiveProductId(productId);
    setShowProductActionsMenu(true);
  };

  // Handle product action selection
  const handleProductAction = async (action, productId) => {
    console.log(`${action} action for product:`, productId);

    switch (action) {
      case "view_edit":
        // Find the product data and store it in localStorage for pre-filling
        const product = products.find((p) => p.id === productId);
        if (product) {
          // Store product data in localStorage for the AddNewProductNew component
          localStorage.setItem("editProductData", JSON.stringify(product));
          // Navigate to the add product page
          navigate("/products/add", {
            state: { fromComponent: "ProductTransactions" },
          });
        }
        break;
      case "delete":
        // Show delete confirmation
        if (
          window.confirm(
            "Are you sure you want to delete this product? This action cannot be undone."
          )
        ) {
          try {
            // Call the delete API
            await axios.delete(
              `${BASE_URL}/${DELETE_PRODUCT_NEW}/${productId}`
            );

            // Remove the product from local state
            setProducts((prev) => prev.filter((p) => p.id !== productId));
            setFilteredProducts((prev) =>
              prev.filter((p) => p.id !== productId)
            );

            // If the deleted product was selected, clear selection and select another product if available
            if (selectedProductId === productId) {
              setSelectedProductId(null);
              // Reset adjustment modal state and form fields
              setShowAdjustModal(false);
              setTotalQuantity("");
              setAtPrice("");
              setDescription("");
              // Clear transactions for the deleted product
              setTransactions([]);
              // Select the first available product if there are any left
              setFilteredProducts((prev) => {
                if (prev.length > 0) {
                  setSelectedProductId(prev[0].id);
                }
                return prev;
              });
            }

            // Show success message
            addToast("Product deleted successfully!", "success");
          } catch (error) {
            console.error("Error deleting product:", error);
            addToast("Failed to delete product. Please try again.", "error");
          }
        }
        break;
      default:
        console.log("Unknown action:", action);
    }

    // Close the menu
    setShowProductActionsMenu(false);
    setActiveProductId(null);
  };

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        importDropdownRef.current &&
        !importDropdownRef.current.contains(event.target)
      ) {
        setShowImportDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        productActionsRef.current &&
        !productActionsRef.current.contains(event.target)
      ) {
        setShowProductActionsMenu(false);
        setActiveProductId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Cleanup resizing state when component unmounts
  useEffect(() => {
    return () => {
      setIsResizing(false);
      setCurrentResizeColumn(null);
    };
  }, []);

  // Handle bulk actions
  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} action triggered`);
    setShowDropdown(false);
    // Add your bulk action logic here
  };

  const handleImportBulk = () => {
    console.log("Import Products in Bulk action triggered");
    setShowImportDropdown(false);
    // Add your import bulk action logic here
  };

  // Handle filter actions
  const handleClearFilter = () => {
    setFilterActive(false);
    setFilterInactive(false);
    setShowFilterDropdown(false);
  };

  const handleApplyFilter = () => {
    console.log("Filter applied:", {
      active: filterActive,
      inactive: filterInactive,
    });
    setShowFilterDropdown(false);
    // Add your filter application logic here
  };

  // Column resizing functions
  const handleMouseDown = (e, columnIndex) => {
    e.preventDefault();
    setIsResizing(true);
    setCurrentResizeColumn(columnIndex);

    const startX = e.clientX;
    const startWidth = e.target.closest("th").offsetWidth;

    const handleMouseMove = (moveEvent) => {
      if (isResizing) {
        const currentX = moveEvent.clientX;
        const diff = currentX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px

        const table = e.target.closest("table");
        const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
        if (th) {
          th.style.width = `${newWidth}px`;
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentResizeColumn(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleFilterClick = (columnName) => {
    console.log(`Filter clicked for column: ${columnName}`);
    // TODO: Implement filter functionality for each column
  };

  const handleSaveAdjustment = async () => {
    try {
      // Validate required fields
      if (!selectedProductId || !totalQuantity || !atPrice) {
        addToast(
          "Please fill in all required fields (Product, Quantity, and Price)",
          "error"
        );
        return;
      }

      // Prepare the stock adjustment data
      const adjustmentData = {
        productId: selectedProductId,
        quantity: parseFloat(totalQuantity),
        atPrice: parseFloat(atPrice),
        description: description || "",
        adjustmentDate: adjustmentDate,
        stockMode: stockMode, // 'add' or 'reduce'
        adjustmentType: stockMode === "add" ? "ADD_STOCK" : "REDUCE_STOCK",
      };

      console.log("Saving adjustment:", adjustmentData);

      // Make API call to backend
      const response = await axios.post(
        `${BASE_URL}/${STOCK_ADJUSTMENT}`,
        adjustmentData
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Stock adjustment saved successfully:", response.data);

        // Show success message
        addToast("Stock adjustment saved successfully!", "success");

        // Close modal and reset form
        setShowAdjustModal(false);
        setTotalQuantity("");
        setAtPrice("");
        setDescription("");

        // Update the local product state immediately to reflect changes
        setProducts((prevProducts) => {
          return prevProducts.map((product) => {
            if (product.id === selectedProductId) {
              // Create a new product object with updated values
              const updatedProduct = { ...product };

              // Update stock quantity based on mode
              if (stockMode === "add") {
                updatedProduct.stock = {
                  ...updatedProduct.stock,
                  openingQuantity:
                    (updatedProduct.stock.openingQuantity || 0) +
                    parseFloat(totalQuantity),
                };
              } else {
                updatedProduct.stock = {
                  ...updatedProduct.stock,
                  openingQuantity: Math.max(
                    0,
                    (updatedProduct.stock.openingQuantity || 0) -
                      parseFloat(totalQuantity)
                  ),
                };
              }

              // Update purchase price if it's different from current price
              if (
                parseFloat(atPrice) !==
                (updatedProduct.purchasePriceTaxes?.purchasePrice || 0)
              ) {
                updatedProduct.purchasePriceTaxes = {
                  ...updatedProduct.purchasePriceTaxes,
                  purchasePrice: parseFloat(atPrice),
                };
              }

              return updatedProduct;
            }
            return product;
          });
        });

        // Also update filtered products to maintain consistency
        setFilteredProducts((prevFilteredProducts) => {
          return prevFilteredProducts.map((product) => {
            if (product.id === selectedProductId) {
              // Create a new product object with updated values
              const updatedProduct = { ...product };

              // Update stock quantity based on mode
              if (stockMode === "add") {
                updatedProduct.stock = {
                  ...updatedProduct.stock,
                  openingQuantity:
                    (updatedProduct.stock.openingQuantity || 0) +
                    parseFloat(totalQuantity),
                };
              } else {
                updatedProduct.stock = {
                  ...updatedProduct.stock,
                  openingQuantity: Math.max(
                    0,
                    (updatedProduct.stock.openingQuantity || 0) -
                      parseFloat(totalQuantity)
                  ),
                };
              }

              // Update purchase price if it's different from current price
              if (
                parseFloat(atPrice) !==
                (updatedProduct.purchasePriceTaxes?.purchasePrice || 0)
              ) {
                updatedProduct.purchasePriceTaxes = {
                  ...updatedProduct.purchasePriceTaxes,
                  purchasePrice: parseFloat(atPrice),
                };
              }

              return updatedProduct;
            }
            return product;
          });
        });

        // Reload products from backend to ensure data consistency
        await loadProducts();
      }
    } catch (error) {
      console.error("Error saving stock adjustment:", error);

      // Show error message to user
      if (error.response) {
        addToast(
          `Error: ${
            error.response.data.message || "Failed to save stock adjustment"
          }`,
          "error"
        );
      } else if (error.request) {
        addToast("Error: No response from server. Please check your connection.", "error");
      } else {
        addToast(`Error: ${error.message}`, "error");
      }
    }
  };

  return (
    <div className="items-dashboard-container">
      {/* Header Section */}
      <div className="items-dashboard-header-section">
        <div className="items-dashboard-header-left">
          <span className="items-dashboard-label">Items</span>
        </div>
        <div className="items-dashboard-header-right">
          <button
            className="items-dashboard-add-item-btn"
            onClick={() =>
              navigate("/products/add", {
                state: { fromComponent: "ProductTransactions" },
              })
            }
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="items-dashboard-content">
        {/* Left Column - Items List */}
        <div className="items-list-column">
          {/* Search Bar */}
          <div className="items-search-bar">
            <input
              type="text"
              className="items-search-input"
              placeholder="Search Item Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Items List Header */}
          <div className="items-list-header">
            <span className="item-name-header">Item Name</span>
            <span className="filter-icon">🔽</span>
            <span className="quantity-header">Quantity</span>
          </div>

          {/* Items List */}
          <div className="items-list">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`item-row ${
                  selectedProductId === product.id ? "selected" : ""
                }`}
                onClick={() => handleProductRowClick(product.id)}
              >
                <div className="item-name">{product.name}</div>
                <div className="item-quantity">
                  {product.stock?.openingQuantity || 0}
                </div>
                <div className="item-actions">
                  <div
                    className="item-three-dots"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductActionsClick(product.id, e);
                    }}
                  >
                    ⋮
                  </div>

                  {/* Item Actions Menu */}
                  {showProductActionsMenu && activeProductId === product.id && (
                    <div className="item-actions-menu" ref={productActionsRef}>
                      <div
                        className="item-action-item"
                        onClick={() =>
                          handleProductAction("view_edit", product.id)
                        }
                      >
                        View/Edit
                      </div>
                      <div
                        className="item-action-item"
                        onClick={() =>
                          handleProductAction("delete", product.id)
                        }
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Item Details and Transactions */}
        <div className="item-details-column">
          {selectedProductId && (
            <>
              {/* Item Details Section */}
              <div className="item-details-section">
                <div className="item-name-header-row">
                  <h3 className="item-detail-name">
                    {products
                      .find((p) => p.id === selectedProductId)
                      ?.name?.toUpperCase() || "SELECT A PRODUCT"}
                  </h3>
                  <div className="item-detail-actions">
                    <button
                      className="item-detail-edit-icon"
                      title="Edit Product"
                      onClick={() => {
                        const product = products.find(
                          (p) => p.id === selectedProductId
                        );
                        if (product) {
                          localStorage.setItem(
                            "editProductData",
                            JSON.stringify(product)
                          );
                          navigate("/products/add", {
                            state: { fromComponent: "ProductTransactions" },
                          });
                        }
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="item-detail-adjust-btn"
                      title="Adjust Item"
                      onClick={() => setShowAdjustModal(true)}
                    >
                      Adjust Item
                    </button>
                  </div>
                </div>
                <div className="sale-price-info">
                  SALE PRICE:{" "}
                  <span
                    className={
                      selectedProductId
                        ? (filteredProducts.find((p) => p.id === selectedProductId)
                            ?.pricing?.salePrice || 0) > 0
                          ? "value-positive"
                          : "value-zero"
                        : "value-zero"
                    }
                  >
                    ₹{" "}
                    {selectedProductId
                      ? filteredProducts.find((p) => p.id === selectedProductId)
                          ?.pricing?.salePrice || "0"
                      : "0"}
                  </span>{" "}
                  ({selectedProductId
                  ? filteredProducts.find((p) => p.id === selectedProductId)
                      ?.pricing?.salePriceType === "WITH_TAX"
                    ? "incl"
                    : "excl"
                  : "excl"}
                )
                </div>
                <div className="purchase-price-info">
                  PURCHASE PRICE:{" "}
                  <span
                    className={
                      selectedProductId
                        ? (filteredProducts.find((p) => p.id === selectedProductId)
                            ?.purchasePriceTaxes?.purchasePrice || 0) > 0
                          ? "value-positive"
                          : "value-zero"
                        : "value-zero"
                    }
                  >
                    ₹{" "}
                    {selectedProductId
                      ? filteredProducts.find((p) => p.id === selectedProductId)
                          ?.purchasePriceTaxes?.purchasePrice || "0"
                      : "0"}
                  </span>{" "}
                  (incl)
                </div>
                <div className="stock-quantity-info">
                  STOCK QUANTITY:{" "}
                  <span
                    className={
                      selectedProductId
                        ? (filteredProducts.find((p) => p.id === selectedProductId)
                            ?.stock?.openingQuantity || 0) > 0
                          ? "value-positive"
                          : "value-zero"
                        : "value-zero"
                    }
                  >
                    {selectedProductId
                      ? filteredProducts.find((p) => p.id === selectedProductId)?.stock
                          ?.openingQuantity || "0"
                      : "0"}
                  </span>
                </div>
                <div className="stock-value-info">
                  STOCK VALUE:{" "}
                  <span
                    className={
                      selectedProductId
                        ? (() => {
                            const product = filteredProducts.find(
                              (p) => p.id === selectedProductId
                            );
                            if (product) {
                              const purchasePrice =
                                product.purchasePriceTaxes?.purchasePrice || 0;
                              const openingQuantity =
                                product.stock?.openingQuantity || 0;
                              return purchasePrice * openingQuantity > 0
                                ? "value-positive"
                                : "value-zero";
                            }
                            return "value-zero";
                          })()
                        : "value-zero"
                    }
                  >
                    ₹{" "}
                    {selectedProductId
                      ? (() => {
                          const product = products.find(
                            (p) => p.id === selectedProductId
                          );
                          if (product) {
                            const purchasePrice =
                              product.purchasePriceTaxes?.purchasePrice || 0;
                            const openingQuantity =
                              product.stock?.openingQuantity || 0;
                            return (purchasePrice * openingQuantity).toFixed(2);
                          }
                          return "0.00";
                        })()
                      : "0.00"}
                  </span>
                </div>
              </div>

              {/* Transactions Section */}
              <div className="transactions-section">
                <div className="transactions-header">
                  <h3 className="transactions-title">TRANSACTIONS</h3>
                  <div className="transactions-controls">
                    <div className="transactions-search">
                      <span className="search-icon">🔍</span>
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        className="transactions-search-input"
                        value={transactionsSearchTerm}
                        onChange={(e) =>
                          setTransactionsSearchTerm(e.target.value)
                        }
                      />
                    </div>
                    <button className="export-btn">
                      <span className="export-icon">📊</span>
                    </button>
                  </div>
                </div>

                <div className="transactions-table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th className="type-column">
                          TYPE
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="invoice-column">
                          INVOICE...
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="name-column">
                          NAME
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="date-column">
                          DATE
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="quantity-column">
                          QUANTI...
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="price-column">
                          PRICE/...
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="status-column">
                          STATUS
                          <span className="filter-icon">🔽</span>
                        </th>
                        <th className="actions-column"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsLoading ? (
                        <tr>
                          <td colSpan="8" className="loading-cell">
                            Loading transactions...
                          </td>
                        </tr>
                      ) : transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                          <tr
                            key={transaction.id || index}
                            className={`transaction-row ${
                              index === 1 ? "highlighted" : ""
                            }`}
                          >
                            <td className="transaction-type">
                              <span
                                className={`status-dot ${getStatusDotClass(
                                  transaction.transactionType
                                )}`}
                              ></span>
                              {transaction.transactionType || "Sale"}
                            </td>
                            <td className="transaction-invoice">
                              {transaction.invoiceNumber || ""}
                            </td>
                            <td className="transaction-name">
                              {transaction.customerName || "Opening Stock"}
                            </td>
                            <td className="transaction-date">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="transaction-quantity">
                              {transaction.quantity || "0"}
                            </td>
                            <td className="transaction-price">
                              ₹ {transaction.price || "0.00"}
                            </td>
                            <td className="transaction-status">
                              {transaction.status || ""}
                            </td>
                            <td className="transaction-actions">
                              <span className="more-icon">⋮</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="no-transactions">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Adjust Item Modal */}
      {showAdjustModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdjustModal(false)}
        >
          <div className="adjust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-left">
                <h3>Adjust Item</h3>
                <div className="stock-toggle-container">
                  <span className="toggle-label">Add Stock</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      className="toggle-input"
                      checked={stockMode === "reduce"}
                      onChange={(e) =>
                        setStockMode(e.target.checked ? "reduce" : "add")
                      }
                    />
                    <span className="toggle-label-element"></span>
                  </label>
                  <span className="toggle-label">Reduce Stock</span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowAdjustModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="item-info-section">
              <div className="item-name-section">
                <div className="item-label">Item Name</div>
                <div className="item-value">
                  {selectedProductId
                    ? filteredProducts.find((p) => p.id === selectedProductId)
                        ?.name || "No Product Selected"
                    : "No Product Selected"}
                </div>
              </div>
              <div className="adjustment-date-section">
                <label className="date-label">Adjustment Date</label>
                <input
                  type="date"
                  className="date-picker"
                  value={adjustmentDate}
                  onChange={(e) => setAdjustmentDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-content">
              <div className="input-row">
                <div className="total-qty-section">
                  <label className="total-qty-label">Total Qty</label>
                  <input
                    type="number"
                    className="total-qty-input"
                    placeholder="Enter quantity"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                  />
                </div>
                <div className="unit-section">
                  <label className="unit-label">Unit</label>
                  <div className="unit-value">
                    {selectedProductId
                      ? filteredProducts.find((p) => p.id === selectedProductId)
                          ?.unit?.label || "N/A"
                      : "N/A"}
                  </div>
                </div>
                <div className="at-price-section">
                  <label className="at-price-label">At Price</label>
                  <input
                    type="number"
                    className="at-price-input"
                    placeholder="Enter price"
                    value={atPrice}
                    onChange={(e) => setAtPrice(e.target.value)}
                    step="0.01"
                  />
                </div>
                <div className="description-section">
                  <label className="description-label">Description</label>
                  <input
                    type="text"
                    className="description-input"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="save-button-container">
                <button className="save-button" onClick={handleSaveAdjustment}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
export default ItemsDashboardNew;
