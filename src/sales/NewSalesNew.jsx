import React, { useState, useEffect, useRef } from "react";
import { BASE_URL, SEARCH_PRODUCTS_STARTS_WITH } from "../Constants";
import "./NewSalesNew.css";

const NewSalesNew = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemInputs, setItemInputs] = useState([
    {
      id: 1,
      itemName: "",
      quantity: "",
      price: "",
      discount: "",
      total: "0.00",
    },
  ]);

  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search products when search term changes
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const searchProducts = async (query) => {
    try {
      const response = await fetch(
        `${BASE_URL}/${SEARCH_PRODUCTS_STARTS_WITH}?searchTerm=${encodeURIComponent(
          query
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("data", data.products);
        setSuggestions(data.products);
        setShowSuggestions(data.products.length > 0);
      } else {
        console.error("Failed to search products");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleItemNameChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].itemName = value;
    setItemInputs(newItemInputs);

    // Set this row as active and update search term
    setActiveRowIndex(index);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchTerm(value);
  };

  const handleProductSelect = (product, index) => {
    // const newItemInputs = [...itemInputs];
    // newItemInputs[index] = {
    //   ...itemInputs[index],
    //   itemName: product.name,
    //   price: product.pricing.salePrice || "0.00",
    //   quantity: "1",
    //   discount: "0",
    //   total: "0.00",
    // };
    itemInputs[index] = {
      ...itemInputs[index],
      itemName: product.name,
      price: product.pricing.salePrice || "0.00",
      quantity: "1",
      discount: "0",
      total: "0.00",
    };
    setItemInputs(itemInputs);
    console.log("itemInputs", itemInputs);
    setSelectedProduct(product);
    setShowSuggestions(false);
    setSearchTerm("");
    setActiveRowIndex(null);

    // Calculate total for this row
    calculateRowTotal(index);
  };

  const handleQuantityChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].quantity = value;
    setItemInputs(newItemInputs);
    calculateRowTotal(index);
  };

  const handlePriceChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].price = value;
    setItemInputs(newItemInputs);
    calculateRowTotal(index);
  };

  const handleDiscountChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].discount = value;
    setItemInputs(newItemInputs);
    calculateRowTotal(index);
  };

  const calculateRowTotal = (index) => {
    const newItemInputs = [...itemInputs];
    const quantity = parseFloat(newItemInputs[index].quantity) || 0;
    const price = parseFloat(newItemInputs[index].price) || 0;
    const discount = parseFloat(newItemInputs[index].discount) || 0;

    const subtotal = quantity * price;
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;

    newItemInputs[index].total = total.toFixed(2);
    setItemInputs(newItemInputs);
  };

  const addNewRow = () => {
    const newRow = {
      id: itemInputs.length + 1,
      itemName: "",
      quantity: "",
      price: "",
      discount: "",
      total: "0.00",
    };
    setItemInputs([...itemInputs, newRow]);
  };

  const removeRow = (index) => {
    if (itemInputs.length > 1) {
      const newItemInputs = itemInputs.filter((_, i) => i !== index);
      setItemInputs(newItemInputs);
    }
  };

  const calculateSubTotal = () => {
    return itemInputs.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
  };

  return (
    <div className="new-sales-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-left">
          <span className="sale-label">Sale</span>
          {/* <button className="switch-mode-btn">Switch to Full Mode</button> */}
        </div>
        {/* <div className="header-right">
          <span className="customer-support">Customer Support : (+91)-6364444752</span>
          <span className="support-text">Get Instant Online Support</span>
        </div> */}
      </div>

      {/* Main Content - Two Columns */}
      <div className="main-content">
        {/* Left Column - Input Fields */}
        <div className="left-column">
          <div className="input-section">
            <div className="customer-fields">
              <div className="input-group">
                <label htmlFor="customerName">Customer Name*</label>
                <input
                  type="text"
                  id="customerName"
                  placeholder="Enter Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="customerPhone">Customer Phone Number</label>
                <input
                  type="tel"
                  id="customerPhone"
                  placeholder="Enter Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="items-section">
              <table className="items-table">
                <thead>
                  <tr>
                    <th className="header-cell">#</th>
                    <th className="header-cell">ITEM</th>
                    <th className="header-cell">QTY</th>
                    <th className="header-cell">PRICE</th>
                    <th className="header-cell">DISCOUNT(%)</th>
                    <th className="header-cell">TOTAL</th>
                    <th className="header-cell">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {itemInputs.map((item, index) => (
                    <tr key={item.id} className="item-row">
                      <td className="cell">{item.id}</td>
                      <td className="cell item-name-cell">
                        <input
                          type="text"
                          placeholder="Enter Item"
                          value={item.itemName}
                          onChange={(e) => {
                              handleItemNameChange(index, e.target.value);
                            }
                          }
                          // onFocus={() => {
                          //   if (item.itemName.trim()) {
                          //     setSearchTerm(item.itemName);
                          //   }
                          // }}
                        />
                        {showSuggestions && searchTerm.trim() && activeRowIndex === index && (
                          <div
                            className="suggestions-dropdown"
                            ref={suggestionsRef}
                          >
                            {suggestions.length > 0 ? (
                              suggestions.map((product) => (
                                <div
                                  key={product.id}
                                  className="suggestion-item"
                                  onClick={() =>
                                    handleProductSelect(product, index)
                                  }
                                >
                                  <div className="product-name">
                                    {product.productName || product.name}
                                  </div>
                                  <div className="product-code">
                                    {product.productCode || product.code}
                                  </div>
                                  <div className="product-price">
                                    ₹{product.pricing.salePrice || "0.00"}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-suggestions">
                                No products found
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="cell">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                        />
                      </td>
                      <td className="cell">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) =>
                            handlePriceChange(index, e.target.value)
                          }
                        />
                      </td>
                      <td className="cell">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.discount}
                          onChange={(e) =>
                            handleDiscountChange(index, e.target.value)
                          }
                        />
                      </td>
                      <td className="cell">{item.total}</td>
                      <td className="cell">
                        {itemInputs.length > 1 && (
                          <button
                            className="remove-row-btn"
                            onClick={() => removeRow(index)}
                            title="Remove Row"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="add-row-btn" onClick={addNewRow}>
                + Add Row
              </div>
            </div>

            <div className="payment-section">
              <div className="payment-row">
                <div className="payment-input">
                  <label>Received</label>
                  <input type="number" placeholder="0.00" />
                </div>
                <div className="checkbox-group">
                  <input type="checkbox" id="fullyReceived" />
                  <label htmlFor="fullyReceived">Fully Received</label>
                </div>
              </div>
              <div className="summary-row">
                <div className="summary-item">
                  <span>Sub Total</span>
                  <span>₹ {calculateSubTotal().toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Balance:</span>
                  <span>₹ 0.00</span>
                </div>
              </div>
            </div>

            <div className="total-amount-bar">
              <span>Total Amount (₹)</span>
              <span>{calculateSubTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Preview */}
        <div className="right-column">
          <div className="invoice-preview">
            <div className="invoice-header">
              <div className="company-info">
                <h3>My Company</h3>
                <p>9823430425</p>
              </div>
              <div className="logo-placeholder">LOGO</div>
            </div>

            <h2 className="invoice-title">Tax Invoice</h2>

            <div className="invoice-details">
              <div className="bill-to">
                <h4>Bill To:</h4>
                <p>{customerName || "Customer Name"}</p>
                <p>{customerPhone || "Phone Number"}</p>
              </div>

              <div className="invoice-info">
                <div className="info-row">
                  <span>Invoice No.:</span>
                  <span>2</span>
                </div>
                <div className="info-row">
                  <span>Date:</span>
                  <span>15-08-2025</span>
                </div>
              </div>

              <div className="amount-words">
                <p>Invoice Amount in Words: Zero</p>
              </div>

              <div className="terms">
                <p>Terms and Conditions</p>
                <p>Thanks for doing business with us!</p>
              </div>

              <div className="invoice-summary">
                <div className="summary-row">
                  <span>Total</span>
                  <span>₹ {calculateSubTotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Received</span>
                  <span>₹ 0.00</span>
                </div>
                <div className="summary-row">
                  <span>Balance</span>
                  <span>₹ 0.00</span>
                </div>
              </div>
            </div>

            <div className="invoice-footer">
              <div className="company-signature">
                <p>For : My Company</p>
                <p>Authorized Signatory</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="save-new-btn">Save & New</button>
            <div className="action-icons">
              <button className="icon-btn whatsapp">📱</button>
              <button className="icon-btn print">🖨️</button>
              <button className="icon-btn download">⬇️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };
  
  export default NewSalesNew;
