import "./AddItem.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const AddItem = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pricing");
  const [productType, setProductType] = useState("product");
  const [formData, setFormData] = useState({
    itemName: 'Black T-Shirt 32"',
    itemHSN: "6207",
    selectedUnit: "PCS",
    category: "T-Shirts",
    itemCode: "38628046468",
    // Pricing
    salePrice: "400",
    salePriceTaxMode: "without_tax", // without_tax | inclusive | exclusive
    discountOnSale: "10",
    discountType: "amount", // amount | percent
    purchasePrice: "350",
    purchasePriceTaxMode: "without_tax",
    // Taxes
    taxRate: "3", // percent only for now
  });
  const [errors, setErrors] = useState({});

  const handleNumberChange = (key, value) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    setFormData({ ...formData, [key]: sanitized });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.itemName?.trim())
      newErrors.itemName = "Item name is required";
    const numericFields = [
      "salePrice",
      "discountOnSale",
      "purchasePrice",
      "taxRate",
    ];
    numericFields.forEach((f) => {
      const v = parseFloat(formData[f]);
      if (Number.isNaN(v) || v < 0) newErrors[f] = "Invalid number";
    });
    if (formData.discountType === "percent") {
      const p = parseFloat(formData.discountOnSale || "0");
      if (p > 100) newErrors.discountOnSale = "Percent must be ≤ 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const computeDiscountedSale = () => {
    const price = parseFloat(formData.salePrice || "0");
    const d = parseFloat(formData.discountOnSale || "0");
    if (formData.discountType === "percent") return price - (price * d) / 100;
    return price - d;
  };

  const onSave = () => {
    if (!validateForm()) return;
    // integrate save later
    console.log("Form submit", formData);
  };

  return (
    <div className="add-items-container">
      <div className="add-items-header-section">
        <div className="add-items-header-left">
          <span className="add-items-label">Add Item</span>
          <div className="product-service-toggle">
            <button
              className={`toggle-btn ${
                productType === "product" ? "active" : ""
              }`}
              onClick={() => setProductType("product")}
            >
              Product
            </button>
            <button
              className={`toggle-btn ${
                productType === "service" ? "active" : ""
              }`}
              onClick={() => setProductType("service")}
            >
              Service
            </button>
          </div>
        </div>
        <div className="add-items-header-right">
          <button className="settings-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <button className="close-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="add-item-form-container">
        <div className="item-details-section">
          <div className="add-item-form-row">
            <div className="add-item-form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) =>
                  setFormData({ ...formData, itemName: e.target.value })
                }
              />
            </div>
            <div className="add-item-form-group">
              <label>Item HSN</label>
              <div className="add-item-input-with-search">
                <input
                  type="text"
                  value={formData.itemHSN}
                  onChange={(e) =>
                    setFormData({ ...formData, itemHSN: e.target.value })
                  }
                />
                <button className="add-item-search-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="add-item-form-group">
              <label>Select Unit</label>
              <button className="add-item-select-unit-btn">Select Unit</button>
              <div className="add-item-selected-unit">PCS</div>
            </div>
            <div className="add-item-form-group">
              <label>Add Item Image</label>
              <button className="add-item-add-image-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                  <line x1="20" y1="4" x2="21" y2="3"></line>
                </svg>
                Add Item Image
              </button>
            </div>
          </div>

          <div className="add-item-form-row">
            <div className="add-item-form-group">
              <label>Category</label>
              <div className="add-item-dropdown-container">
                <input
                  type="text"
                  value={formData.category}
                  readOnly
                  className="add-item-dropdown-input"
                />
                <button className="add-item-dropdown-arrow">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div className="add-item-form-group">
              <label>Item Code</label>
              <input
                type="text"
                value={formData.itemCode}
                onChange={(e) =>
                  setFormData({ ...formData, itemCode: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="add-item-tabs-section">
          <div className="add-item-tabs">
            <button
              className={`tab ${activeTab === "pricing" ? "active" : ""}`}
              onClick={() => setActiveTab("pricing")}
            >
              Pricing
            </button>
            <button
              className={`tab ${activeTab === "stock" ? "active" : ""}`}
              onClick={() => setActiveTab("stock")}
            >
              Stock
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "pricing" && (
              <div className="pricing-section">
                <div className="sale-price-section">
                  <h3>Sale Price</h3>
                  <div className="price-input-group">
                    <input
                      type="text"
                      value={formData.salePrice}
                      onChange={(e) =>
                        handleNumberChange("salePrice", e.target.value)
                      }
                    />
                    <select
                      value={formData.salePriceTaxMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salePriceTaxMode: e.target.value,
                        })
                      }
                      className="add-item-dropdown-input"
                    >
                      <option value="without_tax">Without Tax</option>
                      <option value="inclusive">Inclusive</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>

                  <div className="discount-section">
                    <label>Disc. On Sale Price</label>
                    <div className="discount-input-group">
                      <input
                        type="text"
                        value={formData.discountOnSale}
                        onChange={(e) =>
                          handleNumberChange("discountOnSale", e.target.value)
                        }
                      />
                      <select
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountType: e.target.value,
                          })
                        }
                        className="add-item-dropdown-input"
                      >
                        <option value="amount">Amount</option>
                        <option value="percent">Percent</option>
                      </select>
                    </div>
                  </div>

                  <button className="add-wholesale-btn">
                    <span>+</span>
                    Add Wholesale Price
                  </button>
                </div>

                <div className="purchase-taxes-section">
                  <div className="purchase-price-group">
                    <label>Purchase Price</label>
                    <div className="price-input-group">
                      <input
                        type="text"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                          handleNumberChange("purchasePrice", e.target.value)
                        }
                      />
                      <select
                        value={formData.purchasePriceTaxMode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchasePriceTaxMode: e.target.value,
                          })
                        }
                        className="add-item-dropdown-input"
                      >
                        <option value="without_tax">Without Tax</option>
                        <option value="inclusive">Inclusive</option>
                        <option value="exclusive">Exclusive</option>
                      </select>
                    </div>
                  </div>

                  <div className="taxes-group">
                    <label>Taxes</label>
                    <select
                      value={formData.taxRate}
                      onChange={(e) =>
                        handleNumberChange("taxRate", e.target.value)
                      }
                      className="add-item-dropdown-input"
                    >
                      <option value="0">GST@0%</option>
                      <option value="3">GST@3%</option>
                      <option value="5">GST@5%</option>
                      <option value="12">GST@12%</option>
                      <option value="18">GST@18%</option>
                      <option value="28">GST@28%</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stock" && (
              <div className="stock-section">Stock settings coming soon…</div>
            )}
          </div>
        </div>

        {/* <div className="action-buttons">
          <button className="save-new-btn" onClick={() => { if (validateForm()) console.log("Save & New", formData); }}>Save & New</button>
          <button className="save-btn" onClick={onSave}>Save</button>
        </div> */}
      </div>
      {/* <div className="action-buttons">
        <button
          className="save-new-btn"
          onClick={() => {
            if (validateForm()) console.log("Save & New", formData);
          }}
        >
          Save & New
        </button>
        <button className="save-btn" onClick={onSave}>
          Save
        </button>
      </div> */}
      <div className="add-items-footer-section">
        <div className="add-items-footer-left">
          <button
            className="cancel-btn"
            onClick={() => {
              navigate("/items");
            }}
          >
            Cancel
          </button>
        </div>
        <div className="add-items-footer-right">
          <button
            className="save-new-btn"
            onClick={() => {
              if (validateForm()) console.log("Save & New", formData);
            }}
          >
            Save & New
          </button>
          <button
            className="save-btn"
            onClick={() => {
              if (validateForm()) console.log("Save", formData);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
