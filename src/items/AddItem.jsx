import "./AddItem.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import * as XLSX from 'xlsx';
import { BASE_URL, GET_ALL_TAX_TYPES, GET_ALL_DISCOUNT_TYPES, GET_ALL_UNITS, GET_TAX_RATES, SAVE_PRODUCT_NEW } from '../Constants';
import CategoriesDropdown from './CategoriesDropdown';
import Toast from '../components/Toast';

const AddItem = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pricing");
  const [productType, setProductType] = useState("product");
  const [formData, setFormData] = useState({
    itemName: "",
    itemHSN: "",
    selectedUnit: "",
    category: "",
    itemCode: "",
    // Pricing
    salePrice: "",
    salePriceTaxMode: "", // without_tax | inclusive | exclusive
    discountOnSale: "",
    discountType: "", // amount | percent
    purchasePrice: "",
    purchasePriceTaxMode: "",
    // Taxes
    taxRate: "", // percent only for now
    // Stock
    openingQuantity: "",
    atPrice: "",
    asOfDate: "",
    minStockToMaintain: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  
  // HSN Modal state
  const [showHSNModal, setShowHSNModal] = useState(false);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [filteredHsnCodes, setFilteredHsnCodes] = useState([]);
  const [hsnSearchTerm, setHsnSearchTerm] = useState('');
  const [hsnLoading, setHsnLoading] = useState(false);
  
  // API data state
  const [taxTypes, setTaxTypes] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [loadingTaxTypes, setLoadingTaxTypes] = useState(false);
  const [loadingDiscountTypes, setLoadingDiscountTypes] = useState(false);
  const [loadingTaxRates, setLoadingTaxRates] = useState(false);
  
  // Unit Modal state
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedBaseUnit, setSelectedBaseUnit] = useState('');
  const [selectedSecondaryUnit, setSelectedSecondaryUnit] = useState('');
  
  // Category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchTaxTypes();
    fetchDiscountTypes();
    fetchTaxRates();
  }, []);

  const handleNumberChange = (key, value) => {
    const sanitized = value.replace(/[^0-9.]/g, "");
    setFormData({ ...formData, [key]: sanitized });
  };

  const generateItemCode = () => {
    const randomNumber = Math.floor(10000000000 + Math.random() * 90000000000);
    setFormData({ ...formData, itemCode: randomNumber.toString() });
  };

  const clearItemCode = () => {
    setFormData({ ...formData, itemCode: "" });
  };

  // Fetch tax types from API
  const fetchTaxTypes = async () => {
    setLoadingTaxTypes(true);
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_TAX_TYPES}`);
      if (response.ok) {
        const data = await response.json();
        setTaxTypes(data);
      } else {
        console.error("Failed to fetch tax types");
      }
    } catch (error) {
      console.error("Error fetching tax types:", error);
    } finally {
      setLoadingTaxTypes(false);
    }
  };

  // Fetch discount types from API
  const fetchDiscountTypes = async () => {
    setLoadingDiscountTypes(true);
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_DISCOUNT_TYPES}`);
      if (response.ok) {
        const data = await response.json();
        setDiscountTypes(data);
      } else {
        console.error("Failed to fetch discount types");
      }
    } catch (error) {
      console.error("Error fetching discount types:", error);
    } finally {
      setLoadingDiscountTypes(false);
    }
  };

  // Fetch tax rates from API
  const fetchTaxRates = async () => {
    setLoadingTaxRates(true);
    try {
      const response = await fetch(`${BASE_URL}/${GET_TAX_RATES}`);
      if (response.ok) {
        const data = await response.json();
        setTaxRates(data);
      } else {
        console.error("Failed to fetch tax rates");
      }
    } catch (error) {
      console.error("Error fetching tax rates:", error);
    } finally {
      setLoadingTaxRates(false);
    }
  };

  // Fetch units from API
  const fetchUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_UNITS}`);
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        console.error("Failed to fetch units");
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Load HSN codes from Excel file
  const loadHSNCodes = async () => {
    setHsnLoading(true);
    try {
      const response = await fetch('/GST_HSN_CODES.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let allCodes = [];
      
      // Read all sheets except the first one (header)
      workbook.SheetNames.forEach((sheetName, index) => {
        if (index > 0) { // Skip first sheet (header)
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and process data
          jsonData.slice(1).forEach(row => {
            // Check if we have at least 3 columns (SL NO, HS Code, Description)
            if (row.length >= 3) {
              // Ignore SL NO (index 0), read HS Code (index 1) and Description (index 2)
              const hsCode = row[1];
              const description = row[2];
              
              if (hsCode && description) { // Check if both HS Code and Description exist
                allCodes.push({
                  code: hsCode.toString(),
                  description: description.toString()
                });
              }
            }
          });
        }
      });
      
      setHsnCodes(allCodes);
      setFilteredHsnCodes(allCodes);
      return allCodes; // Return the codes for chaining
    } catch (error) {
      console.error('Error loading HSN codes:', error);
      alert('Error loading HSN codes. Please check if the file exists.');
      return []; // Return empty array on error
    } finally {
      setHsnLoading(false);
    }
  };

  // Handle HSN search
  const handleSearchHSN = () => {
    setShowHSNModal(true);
    
    // Pre-populate search with Item Name if it exists
    if (formData.itemName.trim()) {
      setHsnSearchTerm(formData.itemName.trim());
      // Load codes and filter immediately
      if (hsnCodes.length === 0) {
        loadHSNCodes().then(() => {
          // Filter after codes are loaded
          filterHSNCodes(formData.itemName.trim());
        });
      } else {
        // Filter immediately if codes are already loaded
        filterHSNCodes(formData.itemName.trim());
      }
    } else {
      // Clear search term if no item name
      setHsnSearchTerm('');
      if (hsnCodes.length === 0) {
        loadHSNCodes();
      } else {
        setFilteredHsnCodes(hsnCodes);
      }
    }
  };

  // Filter HSN codes based on search term
  const filterHSNCodes = (searchTerm) => {
    setHsnSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredHsnCodes(hsnCodes);
    } else {
      // Extract meaningful keywords from the search term
      const keywords = extractKeywords(searchTerm);
      
      const filtered = hsnCodes.filter(code => {
        const codeText = code.code.toLowerCase();
        const descriptionText = code.description.toLowerCase();
        
        // Check if any keyword matches in code or description
        return keywords.some(keyword => 
          codeText.includes(keyword.toLowerCase()) ||
          descriptionText.includes(keyword.toLowerCase())
        );
      });
      
      setFilteredHsnCodes(filtered);
    }
  };

  // Extract meaningful keywords from item name
  const extractKeywords = (itemName) => {
    // Remove common words and numbers, keep meaningful product terms
    const commonWords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    const sizeWords = ['small', 'medium', 'large', 'xl', 'xxl', 'xs', 's', 'm', 'l'];
    const numberPattern = /\d+/g;
    
    let keywords = itemName.toLowerCase()
      .split(/\s+/)
      .filter(word => {
        // Remove common color words
        if (commonWords.includes(word)) return false;
        // Remove size words
        if (sizeWords.includes(word)) return false;
        // Remove pure numbers
        if (numberPattern.test(word) && word.length <= 3) return false;
        // Keep words with at least 2 characters
        return word.length >= 2;
      });
    
    // If no meaningful keywords found, use the original search term
    if (keywords.length === 0) {
      keywords = [itemName.toLowerCase()];
    }
    
    return keywords;
  };

  // Select HSN code
  const selectHSNCode = (code) => {
    setFormData({ ...formData, itemHSN: code.code });
    setShowHSNModal(false);
    setHsnSearchTerm('');
  };

  // Close HSN modal
  const closeHSNModal = () => {
    setShowHSNModal(false);
    setHsnSearchTerm('');
  };

  // Handle unit selection modal
  const handleSelectUnit = () => {
    setShowUnitModal(true);
    if (units.length === 0) {
      fetchUnits();
    }
  };

  // Close unit modal
  const closeUnitModal = () => {
    setShowUnitModal(false);
    setSelectedBaseUnit('');
    setSelectedSecondaryUnit('');
  };

  // Confirm unit selection
  const confirmUnitSelection = () => {
    if (selectedBaseUnit) {
      setFormData({ ...formData, selectedUnit: selectedBaseUnit });
      setShowUnitModal(false);
      setSelectedBaseUnit('');
      setSelectedSecondaryUnit('');
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFormData({ ...formData, category: category.categoryName || category.name || "" });
  };

  // Handle image selection
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
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

  // Save product function
  const saveProduct = async (isSaveAndNew = false) => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Prepare form data for API
      const productData = {
        name: formData.itemName,
        hsn: formData.itemHSN,
        unit: formData.selectedUnit,
        category: formData.category,
        code: formData.itemCode,
        pricing: {
          salePrice: parseFloat(formData.salePrice) || 0,
          salePriceType: formData.salePriceTaxMode,
          discountAmount: parseFloat(formData.discountOnSale) || 0,
          discountType: formData.discountType,
        },
        purchasePriceTaxes: {
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          purchasePriceType: formData.purchasePriceTaxMode,
          taxRate: formData.taxRate
            ? taxRates.find((rate) => rate.id == formData.taxRate)
            : null,
        },
        stock: {
          openingQuantity: parseInt(formData.openingQuantity) || 0,
          atPrice: parseFloat(formData.atPrice) || 0,
          asOfDate: formData.asOfDate,
          minStock: parseInt(formData.minStockToMaintain) || 0,
          location: formData.location.trim(),
        },
      };

      const formData1 = new FormData();

      // Only append image if it exists
      if (selectedImage) {
        formData1.append("imageFile", selectedImage);
      }

      formData1.append("item", new Blob([JSON.stringify(productData)], { type: "application/json" }));

      const response = await fetch(`${BASE_URL}/${SAVE_PRODUCT_NEW}`,
        formData1, 
       {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        setToast({ message: "Item saved successfully!", type: "success" });
      } else {
        setToast({ message: "Failed to save item. Please try again.", type: "error" });
      }

      if (isSaveAndNew) {
        // Reset form for new item
        setFormData({
          itemName: '',
          itemHSN: '',
          selectedUnit: '',
          category: '',
          itemCode: '',
          salePrice: '',
          salePriceTaxMode: '',
          discountOnSale: '',
          discountType: '',
          purchasePrice: '',
          purchasePriceTaxMode: '',
          taxRate: '',
          openingQuantity: '',
          atPrice: '',
          asOfDate: new Date().toISOString().split('T')[0],
          minStock: '',
          location: '',
        });
        setSelectedCategory(null);
      } else {
        // Navigate back to items list
        setTimeout(() => {
          navigate("/item");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setToast({ 
        message: "Failed to save product. Please try again.", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-items-container">
      <div className="add-items-header-section">
        <div className="add-items-header-left">
          <span className="add-items-label">Add Item</span>
        </div>
        <div className="add-items-header-right">
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
                <button 
                  className="add-item-search-icon"
                  onClick={handleSearchHSN}
                  type="button"
                >
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
              <button 
                className="add-item-select-unit-btn"
                onClick={handleSelectUnit}
                type="button"
              >
                Select Unit
              </button>
              <div className="add-item-selected-unit">{formData.selectedUnit || "PCS"}</div>
            </div>
            <div className="add-item-form-group">
              <label>Add Item Image</label>
              <div className="add-item-image-upload-section">
                {!imagePreview ? (
                  <button className="add-item-add-image-btn" onClick={handleImageSelect}>
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
                ) : (
                  <div className="add-item-image-preview-container">
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="add-item-image-preview"
                    />
                    <button
                      className="add-item-remove-image-btn"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png"
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>

          <div className="add-item-form-row">
            <div className="add-item-form-group">
              <label>Category</label>
              <CategoriesDropdown 
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
                showAddCategory={true}
              />
            </div>
            <div className="add-item-form-group">
              <label>Item Code</label>
              <div className="add-item-input-with-button">
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) =>
                    setFormData({ ...formData, itemCode: e.target.value })
                  }
                />
                {formData.itemCode ? (
                  <button 
                    type="button"
                    className="add-item-clear-btn"
                    onClick={clearItemCode}
                    title="Clear"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                ) : (
                  <button 
                    type="button"
                    className="add-item-assign-btn"
                    onClick={generateItemCode}
                  >
                    Assign
                  </button>
                )}
              </div>
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
                    <div className="currency-input-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="text"
                        value={formData.salePrice}
                        onChange={(e) =>
                          handleNumberChange("salePrice", e.target.value)
                        }
                      />
                    </div>
                    <select
                      value={formData.salePriceTaxMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salePriceTaxMode: e.target.value,
                        })
                      }
                      className="add-item-dropdown-input"
                      disabled={loadingTaxTypes}
                    >
                      <option value="">{loadingTaxTypes ? "Loading..." : "Select Tax Type"}</option>
                      {taxTypes.map((taxType, index) => (
                        <option key={taxType.id || index} value={taxType.taxType || taxType.name}>
                          {taxType.taxType || taxType.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="discount-section">
                    <label>Disc. On Sale Price</label>
                    <div className="discount-input-group">
                      <div className="currency-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                          type="text"
                          value={formData.discountOnSale}
                          onChange={(e) =>
                            handleNumberChange("discountOnSale", e.target.value)
                          }
                        />
                      </div>
                      <select
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountType: e.target.value,
                          })
                        }
                        className="add-item-dropdown-input"
                        disabled={loadingDiscountTypes}
                      >
                        <option value="">{loadingDiscountTypes ? "Loading..." : "Select Discount Type"}</option>
                        {discountTypes.map((discountType, index) => (
                          <option key={discountType.id || index} value={discountType.discountType || discountType.name}>
                            {discountType.discountType || discountType.name}
                          </option>
                        ))}
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
                      <div className="currency-input-wrapper">
                        <span className="currency-symbol">₹</span>
                        <input
                          type="text"
                          value={formData.purchasePrice}
                          onChange={(e) =>
                            handleNumberChange("purchasePrice", e.target.value)
                          }
                        />
                      </div>
                      <select
                        value={formData.purchasePriceTaxMode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchasePriceTaxMode: e.target.value,
                          })
                        }
                        className="add-item-dropdown-input"
                        disabled={loadingTaxTypes}
                      >
                        <option value="">{loadingTaxTypes ? "Loading..." : "Select Tax Type"}</option>
                        {taxTypes.map((taxType, index) => (
                          <option key={taxType.id || index} value={taxType.taxType || taxType.name}>
                            {taxType.taxType || taxType.name}
                          </option>
                        ))}
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
                      disabled={loadingTaxRates}
                    >
                      <option value="">{loadingTaxRates ? "Loading..." : "Select Tax Rate"}</option>
                      {taxRates.map((taxRate, index) => (
                        <option key={taxRate.id || index} value={taxRate.id}>
                          {taxRate.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stock" && (
              <div className="stock-section">
                <div className="stock-form-container">
                  <div className="stock-form-row">
                    <div className="stock-form-group">
                      <div className="stock-input-with-button">
                        <input
                          type="text"
                          placeholder="Opening Quantity"
                          value={formData.openingQuantity}
                          onChange={(e) =>
                            handleNumberChange("openingQuantity", e.target.value)
                          }
                        />
                        <button className="stock-batch-btn">Batch</button>
                      </div>
                    </div>
                    <div className="stock-form-group">
                      <input
                        type="text"
                        placeholder="At Price"
                        value={formData.atPrice}
                        onChange={(e) =>
                          handleNumberChange("atPrice", e.target.value)
                        }
                      />
                    </div>
                    <div className="stock-form-group">
                      <label className="stock-date-label">As Of Date</label>
                      <div className="stock-date-input">
                        <input
                          type="text"
                          value={formData.asOfDate}
                          onChange={(e) =>
                            setFormData({ ...formData, asOfDate: e.target.value })
                          }
                        />
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="calendar-icon"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stock-form-row">
                    <div className="stock-form-group">
                      <input
                        type="text"
                        placeholder="Min Stock To Maintain"
                        value={formData.minStockToMaintain}
                        onChange={(e) =>
                          handleNumberChange("minStockToMaintain", e.target.value)
                        }
                      />
                    </div>
                    <div className="stock-form-group">
                      <input
                        type="text"
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
            onClick={() => saveProduct(true)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & New"}
          </button>
          <button
            className="save-btn"
            onClick={() => saveProduct(false)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* HSN Search Modal */}
      {showHSNModal && (
        <div className="hsn-modal-overlay" onClick={closeHSNModal}>
          <div className="hsn-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hsn-modal-header">
              <div className="hsn-header-content">
                <h2>Select HSN/SAC Code</h2>
                <div className="hsn-search-container">
                  <div className="hsn-search-input-wrapper">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="hsn-search-icon"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      value={hsnSearchTerm}
                      onChange={(e) => filterHSNCodes(e.target.value)}
                      placeholder="Search HSN codes or descriptions..."
                      className="hsn-search-input"
                    />
                    {hsnSearchTerm && (
                      <button 
                        onClick={() => filterHSNCodes('')} 
                        className="hsn-clear-search-btn"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button className="hsn-modal-close" onClick={closeHSNModal}>
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

            <div className="hsn-table-container">
              <div className="hsn-table-header">
                <div className="hsn-table-cell header">CODE</div>
                <div className="hsn-table-cell header">DESCRIPTION</div>
                <div className="hsn-table-cell header"></div>
              </div>
              
              {hsnLoading ? (
                <div className="hsn-loading">Loading HSN codes...</div>
              ) : filteredHsnCodes.length === 0 ? (
                <div className="hsn-no-results">No HSN codes found for "{hsnSearchTerm}".</div>
              ) : (
                <div className="hsn-table-body">
                  {filteredHsnCodes.map((code, index) => (
                    <div 
                      key={index} 
                      className="hsn-table-row"
                      onClick={() => selectHSNCode(code)}
                    >
                      <div className="hsn-table-cell code-cell">{code.code}</div>
                      <div className="hsn-table-cell description-cell">{code.description}</div>
                      <div className="hsn-table-cell action-cell">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="hsn-arrow-icon"
                        >
                          <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unit Selection Modal */}
      {showUnitModal && (
        <div className="unit-modal-overlay" onClick={closeUnitModal}>
          <div className="unit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="unit-modal-header">
              <h2>Select Unit</h2>
              <button className="unit-modal-close" onClick={closeUnitModal}>
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

            <div className="unit-modal-body">
              <div className="unit-selection-group">
                <div className="unit-combo-group">
                  <label>BASE UNIT</label>
                  <select
                    value={selectedBaseUnit}
                    onChange={(e) => setSelectedBaseUnit(e.target.value)}
                    className="unit-select"
                    disabled={loadingUnits}
                  >
                    <option value="">{loadingUnits ? "Loading..." : "Select Base Unit"}</option>
                    {units.map((unit, index) => (
                      <option key={unit.id || index} value={unit.unitName || unit.unitName}>
                        {unit.label || unit.unitName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="unit-combo-group">
                  <label>SECONDARY UNIT</label>
                  <select
                    value={selectedSecondaryUnit}
                    onChange={(e) => setSelectedSecondaryUnit(e.target.value)}
                    className="unit-select"
                    disabled={loadingUnits}
                  >
                    <option value="">{loadingUnits ? "Loading..." : "Select Secondary Unit"}</option>
                    {units.map((unit, index) => (
                      <option key={unit.id || index} value={unit.unitName || unit.unitName}>
                        {unit.label || unit.unitName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="unit-modal-footer">
              <button 
                className="unit-cancel-btn"
                onClick={closeUnitModal}
              >
                Cancel
              </button>
              <button 
                className="unit-confirm-btn"
                onClick={confirmUnitSelection}
                disabled={!selectedBaseUnit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AddItem;
