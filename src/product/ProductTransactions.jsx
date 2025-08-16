import "./ProductTransactions.css";
import { useState, useEffect, useRef } from "react";
import { BASE_URL, GET_ALL_PRODUCTS_NEW, STOCK_ADJUSTMENT } from "../Constants";
import axios from "axios";

const ProductTransactions = () => {
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
  const handleProductActionsClick = (productId) => {
    console.log("Product actions clicked for:", productId);
    // TODO: Show product actions menu
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
    const startWidth = e.target.closest('th').offsetWidth;
    
    const handleMouseMove = (moveEvent) => {
      if (isResizing) {
        const currentX = moveEvent.clientX;
        const diff = currentX - startX;
        const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
        
        const table = e.target.closest('table');
        const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
        if (th) {
          th.style.width = `${newWidth}px`;
        }
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setCurrentResizeColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleFilterClick = (columnName) => {
    console.log(`Filter clicked for column: ${columnName}`);
    // TODO: Implement filter functionality for each column
  };

  const handleSaveAdjustment = async () => {
    try {
      // Validate required fields
      if (!selectedProductId || !totalQuantity || !atPrice) {
        alert(
          "Please fill in all required fields (Product, Quantity, and Price)"
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
        alert("Stock adjustment saved successfully!");
        
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
        alert(
          `Error: ${
            error.response.data.message || "Failed to save stock adjustment"
          }`
        );
      } else if (error.request) {
        alert("Error: No response from server. Please check your connection.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

    return (
    <div className="product-transactions-container">
            <h2>Product Transactions</h2>

      <div className="transactions-layout">
        {/* First div - Left side, 20% width, full height */}
        <div className="left-panel">
          {/* Left panel controls section */}
          <div className="left-panel-controls">
            {showSearch ? (
              /* Search bar */
              <div className="search-bar-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="close-search-btn"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm("");
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              /* Original controls */
              <>
                {/* Search icon */}
                <div
                  className="search-icon-container"
                  onClick={() => setShowSearch(true)}
                >
                  <span className="search-icon-btn">🔍</span>
                </div>

                {/* Add Item button and dropdown */}
                <div className="add-item-container">
                  <button
                    className="add-item-btn"
                    onClick={() => (window.location.href = "/add")}
                  >
                    Add Item
                  </button>
                  <button
                    className="dropdown-arrow-btn"
                    onClick={() => setShowImportDropdown(!showImportDropdown)}
                  >
                    <span className="dropdown-arrow">▼</span>

                    {/* Import dropdown menu */}
                    {showImportDropdown && (
                      <div
                        className="import-dropdown-menu"
                        ref={importDropdownRef}
                      >
                        <div
                          className="dropdown-item"
                          onClick={() => handleImportBulk()}
                        >
                          Import Products in Bulk
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Three dots menu */}
                <div
                  className="three-dots-menu"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="three-dots">⋮</span>

                  {/* Dropdown menu */}
                  {showDropdown && (
                    <div className="dropdown-menu" ref={dropdownRef}>
                      <div
                        className="dropdown-item"
                        onClick={() => handleBulkAction("inactive")}
                      >
                        Bulk Inactive
                      </div>
                      <div
                        className="dropdown-item"
                        onClick={() => handleBulkAction("active")}
                      >
                        Bulk Active
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Table header with filter */}
          <div className="table-header-filter">
            <div className="header-labels">
              <span className="header-label">ITEM</span>
              <div className="filter-section">
                <div
                  className="filter-icon-container"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <span className="filter-icon">🔽</span>

                  {/* Filter dropdown */}
                  {showFilterDropdown && (
                    <div
                      className="filter-dropdown-menu"
                      ref={filterDropdownRef}
                    >
                      <div className="filter-option">
                        <input
                          type="checkbox"
                          id="active-filter"
                          checked={filterActive}
                          onChange={(e) => setFilterActive(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          htmlFor="active-filter"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Active
                        </label>
                      </div>
                      <div className="filter-option">
                        <input
                          type="checkbox"
                          id="inactive-filter"
                          checked={filterInactive}
                          onChange={(e) => setFilterInactive(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          htmlFor="inactive-filter"
                          onClick={(e) => e.stopPropagation()}
                        >
                          InActive
                        </label>
                      </div>
                      <div className="filter-actions">
                        <button
                          className="filter-btn clear-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearFilter();
                          }}
                        >
                          Clear
                        </button>
                        <button
                          className="filter-btn apply-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyFilter();
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="header-label">QUANTITY</span>
            </div>
          </div>

          {/* Product list */}
          <div className="product-list-container">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className={`product-row ${
                  selectedProductId === product.id ? "selected" : ""
                }`}
                onClick={() => handleProductRowClick(product.id)}
              >
                <div className="product-name">{product.name}</div>
                <div
                  className={`product-quantity ${
                    product.stock.openingQuantity > product.stock.minStock
                      ? "stock-adequate"
                      : "stock-low"
                  }`}
                >
                  {product.stock.openingQuantity}
                </div>
                <div className="product-actions">
                  <div
                    className="product-three-dots"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductActionsClick(product.id);
                    }}
                  >
                    ⋮
                  </div>
                </div>
              </div>
            ))}

            {/* Loading state */}
            {loading && (
              <div className="loading-message">Loading products...</div>
            )}

            {/* Empty state */}
            {!loading && filteredProducts.length === 0 && (
              <div className="no-products-message">No products found</div>
            )}
          </div>
        </div>

        {/* Container for middle and right panels */}
        <div className="middle-right-container">
          {/* Second div - Middle, remaining width, 30% height */}
          <div className="middle-panel">
            <div className="product-info-container">
              <div className="selected-product-title">
                {selectedProductId
                  ? filteredProducts.find((p) => p.id === selectedProductId)
                      ?.name || "No Product Selected"
                  : "No Product Selected"}
              </div>
              <div className="sale-price-info">
                SALE PRICE:{" "}
                <span
                  className={
                    selectedProductId
                      ? (filteredProducts.find(
                          (p) => p.id === selectedProductId
                        )?.pricing?.salePrice || 0) > 0
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
                (
                {selectedProductId
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
                      ? (filteredProducts.find(
                          (p) => p.id === selectedProductId
                        )?.purchasePriceTaxes?.purchasePrice || 0) > 0
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
                (
                {selectedProductId
                  ? filteredProducts.find((p) => p.id === selectedProductId)
                      ?.purchasePriceTaxes?.taxType === "WITH_TAX"
                    ? "incl"
                    : "excl"
                  : "excl"}
                )
              </div>
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
                  ? filteredProducts.find((p) => p.id === selectedProductId)
                      ?.stock?.openingQuantity || "0"
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
                      const product = filteredProducts.find(
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
            <button
              className="adjust-item-btn"
              onClick={() => setShowAdjustModal(true)}
            >
              Adjust Item
            </button>
          </div>

          {/* Third div - Right side, remaining width, 70% height */}
          <div className="right-panel">
            <div className="right-panel-header">
              <h3 className="transactions-title">Transactions</h3>
              <div className="transactions-search-container">
                <input
                  type="text"
                  className="transactions-search-input"
                  placeholder="Search transactions..."
                  value={transactionsSearchTerm}
                  onChange={(e) => setTransactionsSearchTerm(e.target.value)}
                />
                <button
                  className="transactions-close-btn"
                  onClick={() => setTransactionsSearchTerm("")}
                  style={{ display: transactionsSearchTerm ? "flex" : "none" }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Transactions Table */}
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th 
                      className={`status-dot-header ${currentResizeColumn === 0 ? 'resizing' : ''}`} 
                      data-column="status"
                      onMouseDown={(e) => handleMouseDown(e, 0)}
                    >
                      <div className="column-header-content">
                        <span></span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('status')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 1 ? 'resizing' : ''}
                      data-column="type"
                      onMouseDown={(e) => handleMouseDown(e, 1)}
                    >
                      <div className="column-header-content">
                        <span>TYPE</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('type')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 2 ? 'resizing' : ''}
                      data-column="invoice"
                      onMouseDown={(e) => handleMouseDown(e, 2)}
                    >
                      <div className="column-header-content">
                        <span>INVOICE</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('invoice')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 3 ? 'resizing' : ''}
                      data-column="name"
                      onMouseDown={(e) => handleMouseDown(e, 3)}
                    >
                      <div className="column-header-content">
                        <span>NAME</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('name')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 4 ? 'resizing' : ''}
                      data-column="date"
                      onMouseDown={(e) => handleMouseDown(e, 4)}
                    >
                      <div className="column-header-content">
                        <span>DATE</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('date')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 5 ? 'resizing' : ''}
                      data-column="quantity"
                      onMouseDown={(e) => handleMouseDown(e, 5)}
                    >
                      <div className="column-header-content">
                        <span>QUANTITY</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('quantity')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 6 ? 'resizing' : ''}
                      data-column="price"
                      onMouseDown={(e) => handleMouseDown(e, 6)}
                    >
                      <div className="column-header-content">
                        <span>PRICE</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('price')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 7 ? 'resizing' : ''}
                      data-column="status"
                      onMouseDown={(e) => handleMouseDown(e, 7)}
                    >
                      <div className="column-header-content">
                        <span>STATUS</span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('status')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                    <th 
                      className={currentResizeColumn === 8 ? 'resizing' : ''}
                      data-column="actions"
                      onMouseDown={(e) => handleMouseDown(e, 8)}
                    >
                      <div className="column-header-content">
                        <span></span>
                        <div 
                          className="filter-icon-container"
                          onClick={() => handleFilterClick('actions')}
                        >
                          <span className="filter-icon">🔽</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample transaction data - replace with actual data */}
                  <tr>
                    <td>
                      <div className="status-dot neutral"></div>
                    </td>
                    <td>Stock Adjustment</td>
                    <td>-</td>
                    <td>Opening stock added</td>
                    <td>2024-01-15</td>
                    <td>+50</td>
                    <td>₹25.00</td>
                    <td>Completed</td>
                    <td>
                      <div className="action-dots">⋮</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="status-dot positive"></div>
                    </td>
                    <td>SALE</td>
                    <td>INV-001</td>
                    <td>Customer purchase</td>
                    <td>2024-01-15</td>
                    <td>-2</td>
                    <td>₹30.00</td>
                    <td>Completed</td>
                    <td>
                      <div className="action-dots">⋮</div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="status-dot negative"></div>
                    </td>
                    <td>Stock Reduction</td>
                    <td>-</td>
                    <td>Damaged items removed</td>
                    <td>2024-01-14</td>
                    <td>-5</td>
                    <td>₹25.00</td>
                    <td>Completed</td>
                    <td>
                      <div className="action-dots">⋮</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
    </div>
  );
};

export default ProductTransactions;
