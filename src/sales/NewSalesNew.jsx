import React, { useState, useEffect, useRef } from "react";
import { BASE_URL, SEARCH_PRODUCTS_STARTS_WITH, GET_ALL_PRODUCTS_NEW } from "../Constants";
import "./NewSalesNew.css";

const NewSalesNew = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isFullyReceived, setIsFullyReceived] = useState(false);
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

  // Fetch all products when activeRowIndex changes (on focus)
  useEffect(() => {
    if (activeRowIndex !== null) {
      fetchAllProducts();
    }
  }, [activeRowIndex]);

  const searchProducts = async (query) => {
    try {
      let url = `${BASE_URL}/${SEARCH_PRODUCTS_STARTS_WITH}`;
      
      // If query is provided, add it as search parameter
      if (query && query.trim()) {
        url += `?searchTerm=${encodeURIComponent(query)}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
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

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_PRODUCTS_NEW}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products);
        setShowSuggestions(data.products.length > 0);
      } else {
        console.error("Failed to fetch all products");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
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
    itemInputs[index] = {
      ...itemInputs[index],
      itemName: product.name,
      price: product.pricing.salePrice || "0.00",
      quantity: "1",
      discount: "0",
      total: "0.00",
    };
    setItemInputs(itemInputs);
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

  const handleFullyReceivedChange = (checked) => {
    setIsFullyReceived(checked);
    if (checked) {
      // When checkbox is checked, set received amount to sub total
      setReceivedAmount(calculateSubTotal().toFixed(2));
    } else {
      // When checkbox is unchecked, clear the received amount
      setReceivedAmount("");
    }
  };

  // Function to format number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    if (num === 0) return "Zero";
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertLessThanOneThousand = (n) => {
      if (n === 0) return '';
      
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
    };
    
    const convert = (n) => {
      if (n === 0) return 'Zero';
      
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const remainder = n % 1000;
      
      let result = '';
      
      if (crore > 0) {
        result += convertLessThanOneThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        result += convertLessThanOneThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        result += convertLessThanOneThousand(thousand) + ' Thousand ';
      }
      if (remainder > 0) {
        result += convertLessThanOneThousand(remainder);
      }
      
      return result.trim();
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convert(paise) + ' Paisa';
    }
    result += ' Only';
    
    return result;
  };

    return (
    <div className="new-sales-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-left">
          <span className="sale-label">Sale</span>
        </div>
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
                          onFocus={() => {
                            setActiveRowIndex(index);
                          }}
                        />
                        {showSuggestions && activeRowIndex === index && (
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
              <div className="summary-row">
                <div className="summary-item">
                  <span>Sub Total</span>
                  <span>₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}</span>
                </div>
              </div>
              <div className="payment-row">
                <div className="payment-label">
                  <label>Received</label>
                </div>
                <div className="payment-controls">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                  />
                  <div className="checkbox-group">
                    <input 
                      type="checkbox" 
                      id="fullyReceived" 
                      checked={isFullyReceived}
                      onChange={(e) => handleFullyReceivedChange(e.target.checked)}
                    />
                    <label htmlFor="fullyReceived">Fully Received</label>
                  </div>
                </div>
              </div>
              <div className="balance-row">
                <div className="summary-item">
                  <span>Balance:</span>
                  <span>₹ {formatNumberWithCommas((calculateSubTotal() - parseFloat(receivedAmount || 0)).toFixed(2))}</span>
                </div>
              </div>
            </div>

            <div className="total-amount-bar">
              <span>Total Amount (₹)</span>
              <span>{formatNumberWithCommas(calculateSubTotal().toFixed(2))}</span>
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

            <div className="header-separator"></div>

            <h2 className="invoice-title">Tax Invoice</h2>

            <div className="invoice-details">
              <div className="details-header">
                <div className="bill-to">
                  <h4>Bill To</h4>
                  <p>{customerName || "Customer Name"}</p>
                  <p>{customerPhone || "Contact No."}</p>
                </div>

                <div className="invoice-info">
                  <h4>Invoice Details</h4>
                  <div className="info-row">
                    <span>Invoice No.: 2</span>
                  </div>
                  <div className="info-row">
                    <span>Date: 15-08-2025</span>
                  </div>
                </div>
              </div>

              {/* Items Table - Only visible when items are selected */}
              {itemInputs.some(item => item.itemName.trim() !== "") && (
                <div className="invoice-items-table">
                  <table className="items-preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Name</th>
                        <th>HSN</th>
                        <th>Qty</th>
                        <th>Price/Unit</th>
                        <th>Discount</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemInputs
                        .filter(item => item.itemName.trim() !== "")
                        .map((item, index) => (
                          <tr key={item.id} className="item-preview-row">
                            <td>{index + 1}</td>
                            <td>{item.itemName}</td>
                            <td>HSN Code</td>
                            <td>{item.quantity || "0"}</td>
                            <td>₹ {formatNumberWithCommas(parseFloat(item.price || 0).toFixed(2))}</td>
                            <td>
                              ₹ {formatNumberWithCommas(((parseFloat(item.price || 0) * parseFloat(item.quantity || 0) * parseFloat(item.discount || 0)) / 100).toFixed(2))}
                              <span className="discount-percentage">({item.discount || 0}%)</span>
                            </td>
                            <td>₹ {formatNumberWithCommas(parseFloat(item.total || 0).toFixed(2))}</td>
                          </tr>
                        ))}
                      {/* Total Row */}
                      <tr className="total-row">
                        <td colSpan="3"><strong>Total</strong></td>
                        <td><strong>{itemInputs.filter(item => item.itemName.trim() !== "").reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0)}</strong></td>
                        <td></td>
                        <td><strong>₹ {formatNumberWithCommas(itemInputs.filter(item => item.itemName.trim() !== "").reduce((sum, item) => sum + ((parseFloat(item.price || 0) * parseFloat(item.quantity || 0) * parseFloat(item.discount || 0)) / 100), 0).toFixed(2))}</strong></td>
                        <td><strong>₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Two Column Layout Below Items Table */}
              <div className="invoice-bottom-section">
                <div className="left-column-content">
                  <div className="amount-words">
                    <p><strong>Invoice Amount in Words:</strong> {numberToWords(calculateSubTotal())}</p>
                  </div>
                  <div className="terms">
                    <p><strong>Terms and Conditions</strong> Thanks for doing business with us!</p>
                  </div>
                </div>

                <div className="right-column-content">
                  <div className="summary-item">
                    <span>Sub Total</span>
                    <span>₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}</span>
                  </div>
                  <div className="summary-item no-border">
                    <span className="total-label"><strong>Total</strong></span>
                    <span>₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}</span>
                  </div>
                  <div className="summary-item">
                    <span>Received</span>
                    <span>₹ {formatNumberWithCommas(parseFloat(receivedAmount || 0).toFixed(2))}</span>
                  </div>
                  <div className="summary-item">
                    <span>Balance</span>
                    <span>₹ {formatNumberWithCommas((calculateSubTotal() - parseFloat(receivedAmount || 0)).toFixed(2))}</span>
                  </div>
                  <div className="summary-item">
                    <span>You Saved</span>
                    <span>₹ {formatNumberWithCommas(itemInputs.filter(item => item.itemName.trim() !== "").reduce((sum, item) => sum + ((parseFloat(item.price || 0) * parseFloat(item.quantity || 0) * parseFloat(item.discount || 0)) / 100), 0).toFixed(2))}</span>
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
    </div>
    );
  };
  
  export default NewSalesNew;
