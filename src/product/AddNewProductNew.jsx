import React, { useState, useRef, useEffect } from 'react';
import './AddNewProductNew.css';
import ProductSelect from './ProductSelect';
import UnitSelect from './UnitSelect';
import ProductCategorySelect from './ProductCategorySelect';
import { GENERATE_BARCODE, SAVE_PRODUCT_NEW, UPDATE_PRODUCT_NEW, BASE_URL } from '../Constants';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';

const AddNewProductNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for form fields
  const [productName, setProductName] = useState('');
  const [productHSN, setProductHSN] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productCode, setProductCode] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');
  
  // Pricing state
  const [salePrice, setSalePrice] = useState('');
  const [salePriceType, setSalePriceType] = useState('without_tax');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  
  // Stock state
  const [openingQuantity, setOpeningQuantity] = useState('');
  const [atPrice, setAtPrice] = useState('');
  const [asOfDate, setAsOfDate] = useState('');
  const [minStock, setMinStock] = useState('');
  const [stockLocation, setStockLocation] = useState('');

  // Purchase and Tax state
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchasePriceType, setPurchasePriceType] = useState('without_tax');
  const [selectedTax, setSelectedTax] = useState('none');

  // HSN Modal state
  const [showHSNModal, setShowHSNModal] = useState(false);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [filteredHsnCodes, setFilteredHsnCodes] = useState([]);
  const [hsnSearchTerm, setHsnSearchTerm] = useState('');
  const [hsnLoading, setHsnLoading] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);

  // File input ref
  const fileInputRef = useRef(null);

  // Initialize form with data from localStorage if editing
  useEffect(() => {
    const editProductData = localStorage.getItem('editProductData');
    if (editProductData) {
      try {
        const product = JSON.parse(editProductData);
        
        // Pre-fill form fields with product data
        setProductName(product.name || '');
        setProductHSN(product.hsn || '');
        setProductCategory(product.category?.name || '');
        setSelectedCategory(product.category || null);
        setProductCode(product.code || '');
        
        // Pre-fill pricing fields if available
        if (product.salePrice) setSalePrice(product.salePrice.toString());
        if (product.salePriceType) setSalePriceType(product.salePriceType);
        if (product.discountAmount) setDiscountAmount(product.discountAmount.toString());
        if (product.discountType) setDiscountType(product.discountType);
        
        // Pre-fill stock fields if available
        if (product.stock?.openingQuantity) setOpeningQuantity(product.stock.openingQuantity.toString());
        if (product.stock?.atPrice) setAtPrice(product.stock.atPrice.toString());
        if (product.stock?.asOfDate) setAsOfDate(product.stock.asOfDate);
        if (product.stock?.minStock) setMinStock(product.stock.minStock.toString());
        if (product.stock?.location) setStockLocation(product.stock.location);
        
        // Pre-fill purchase and tax fields if available
        if (product.purchasePrice) setPurchasePrice(product.purchasePrice.toString());
        if (product.purchasePriceType) setPurchasePriceType(product.purchasePriceType);
        if (product.tax) setSelectedTax(product.tax);
        
        // Clear the localStorage data after pre-filling
        localStorage.removeItem('editProductData');
        
        // Set editing mode and store product ID
        setIsEditing(true);
        setEditingProductId(product.id);
        
        // Update the page title to indicate editing mode
        document.title = 'Edit Product - CityFashion POS';
      } catch (error) {
        console.error('Error parsing product data from localStorage:', error);
        localStorage.removeItem('editProductData');
      }
    }
  }, []);

  // State to track if we're editing an existing product
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Determine if we should show back button based on navigation source
  useEffect(() => {
    // Check if we came from a specific component via navigation state
    const shouldShowBack = location.state?.fromComponent && 
                          location.state.fromComponent !== 'DynamicRoutes' && 
                          location.state.fromComponent !== 'Sidebar';
    
    if (shouldShowBack) {
      setShowBackButton(true);
      return;
    }
    
    // Check if we have a referrer (came from another page)
    const referrer = document.referrer;
    if (referrer && referrer !== '' && referrer !== window.location.href) {
      // Only show back button if referrer is from our domain and not from main navigation
      const referrerUrl = new URL(referrer);
      const currentUrl = new URL(window.location.href);
      
      if (referrerUrl.origin === currentUrl.origin && 
          !referrerUrl.pathname.includes('sidebar') && 
          !referrerUrl.pathname.includes('dynamic')) {
        setShowBackButton(true);
      }
    }
  }, [location.state]);

  // Handle back navigation
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      // Fallback: navigate to a default route
      navigate('/products');
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
    
    // Pre-populate search with Product Name if it exists
    if (productName.trim()) {
      setHsnSearchTerm(productName.trim());
      // Load codes and filter immediately
      if (hsnCodes.length === 0) {
        loadHSNCodes().then(() => {
          // Filter after codes are loaded
          filterHSNCodes(productName.trim());
        });
      } else {
        // Filter immediately if codes are already loaded
        filterHSNCodes(productName.trim());
      }
    } else {
      // Clear search term if no product name
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

  // Extract meaningful keywords from product name
  const extractKeywords = (productName) => {
    // Remove common words and numbers, keep meaningful product terms
    const commonWords = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey'];
    const sizeWords = ['small', 'medium', 'large', 'xl', 'xxl', 'xs', 's', 'm', 'l'];
    const numberPattern = /\d+/g;
    
    let keywords = productName.toLowerCase()
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
      keywords = [productName.toLowerCase()];
    }
    
    return keywords;
  };

  // Select HSN code
  const selectHSNCode = (code) => {
    setProductHSN(code.code);
    setShowHSNModal(false);
    setHsnSearchTerm('');
  };

  // Close HSN modal
  const closeHSNModal = () => {
    setShowHSNModal(false);
    setHsnSearchTerm('');
  };

  // Generate 11-digit product code
  const handleGenerateCode = () => {
    const randomCode = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setProductCode(randomCode);
  };

  // Handle unit selection
  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setProductCategory(category.name);
  };

  // Handle image selection
  const handleImageSelect = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is an image
      if (file.type.match('image.*')) {
        setSelectedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file (JPG, JPEG, or PNG)');
      }
    }
  };

  // Handle save product
//   const handleSaveProduct = async () => {
//     try {
//       setLoading(true);
      
//       // Validation
//       if (!productName.trim()) {
//         alert('Please enter product name');
//         return;
//       }
//       if (!productHSN.trim()) {
//         alert('Please enter product HSN code');
//         return;
//       }
//       if (!selectedCategory) {
//         alert('Please select a product category');
//         return;
//       }
//       if (!productCode.trim()) {
//         alert('Please generate a product code');
//         return;
//       }
//       if (!selectedUnit) {
//         alert('Please select a unit');
//         return;
//       }

//       // Prepare product data
//       const productData = {
//         name: productName.trim(),
//         hsn: productHSN.trim(),
//         category: selectedCategory,
//         code: productCode.trim(),
//         unit: selectedUnit,
//         imageData: selectedImage,
        
//         // Pricing information
//         pricing: {
//             salePrice: parseFloat(salePrice) || 0,
//             salePriceType: salePriceType,
//             discountAmount: parseFloat(discountAmount) || 0,
//             discountType: discountType,
//         },
        
//         // Stock information
//         stock: {
//             openingQuantity: parseInt(openingQuantity) || 0,
//             atPrice: parseFloat(atPrice) || 0,
//             asOfDate: asOfDate,
//             minStockToMaintain: parseInt(minStock) || 0,
//             location: location.trim(),
//         },
        
//         // Purchase and tax information
//         purchasePriceTaxes: {
//             purchasePrice: parseFloat(purchasePrice) || 0,
//             purchasePriceType: purchasePriceType,
//             taxType: selectedTax,
//         },
//       };

//       // Call backend API
//       const response = await axios.post(`${BASE_URL}/${SAVE_PRODUCT_NEW}`, productData, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.data) {
//         alert('Product saved successfully!');
//         // Reset form
//         resetForm();
//       } else {
//         alert('Failed to save product. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error saving product:', error);
//       alert('Error saving product. Please check your connection and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

const handleSaveProduct = async () => {
    try {
      setLoading(true);
  
      // Validation
     if (!productName.trim()) {
        alert('Please enter product name');
        return;
      }
      if (!productHSN.trim()) {
        alert('Please enter product HSN code');
        return;
      }
      if (!selectedCategory) {
        alert('Please select a product category');
        return;
      }
      if (!productCode.trim()) {
        alert('Please generate a product code');
        return;
      }
      if (!selectedUnit) {
        alert('Please select a unit');
        return;
      }
      // Prepare product JSON
      const productData = {
        ...(isEditing && { id: editingProductId }), // Include ID if editing
        name: productName.trim(),
        hsn: productHSN.trim(),
        category: selectedCategory,
        code: productCode.trim(),
        unit: selectedUnit,
        pricing: {
          salePrice: parseFloat(salePrice) || 0,
          salePriceType,
          discountAmount: parseFloat(discountAmount) || 0,
          discountType,
        },
        stock: {
          openingQuantity: parseInt(openingQuantity) || 0,
          atPrice: parseFloat(atPrice) || 0,
          asOfDate,
          minStock: parseInt(minStock) || 0,
          location: stockLocation.trim(),
        },
        purchasePriceTaxes: {
          purchasePrice: parseFloat(purchasePrice) || 0,
          purchasePriceType,
          taxType: selectedTax,
        },
      };
  
      // Prepare FormData
      const formData = new FormData();
      
      // Only append image if it exists
      if (selectedImage) {
        formData.append("imageFile", selectedImage); 
      }
      
      formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));

      console.log(formData);
  
      // Send request - use UPDATE_PRODUCT_NEW if editing, SAVE_PRODUCT_NEW if creating new
      const apiEndpoint = isEditing ? UPDATE_PRODUCT_NEW : SAVE_PRODUCT_NEW;
      
      let response;
      if (isEditing) {
        // Use PUT for updates
        response = await axios.put(`${BASE_URL}/${apiEndpoint}/${editingProductId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Use POST for creating new products
        response = await axios.post(`${BASE_URL}/${apiEndpoint}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
  
      if (response.data?.success) {
        alert(isEditing ? "Product updated successfully!" : "Product saved successfully!");
        resetForm();
      } else {
        alert(isEditing ? "Failed to update product. Please try again." : "Failed to save product. Please try again.");
      }
    } catch (error) {
      console.error(isEditing ? "Error updating product:" : "Error saving product:", error);
      alert(isEditing ? "Error updating product. Please check your connection and try again." : "Error saving product. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setProductName('');
    setProductHSN('');
    setProductCategory('');
    setSelectedCategory(null);
    setProductCode('');
    setSelectedUnit(null);
    setSelectedImage(null);
    setImagePreview(null);
    
    // Reset pricing
    setSalePrice('');
    setSalePriceType('without_tax');
    setDiscountAmount('');
    setDiscountType('percentage');
    
    // Reset stock
    setOpeningQuantity('');
    setAtPrice('');
    setAsOfDate('');
    setMinStock('');
    setStockLocation('');
    
    // Reset purchase and tax
    setPurchasePrice('');
    setPurchasePriceType('without_tax');
    setSelectedTax('none');
    
    // Reset active tab
    setActiveTab('pricing');
    
    // Reset editing state
    setIsEditing(false);
    setEditingProductId(null);
    
    // Reset page title
    document.title = 'Add New Product - CityFashion POS';
  };

  return (
    <div className="add-new-product-container">
      {/* Header */}
      <div className="product-header">
        {showBackButton && (
          <button 
            className="back-button"
            onClick={handleBackNavigation}
            title="Go back"
          >
            ←
          </button>
        )}
        <h2 className="product-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      {/* Main Form Section */}
      <div className="product-main-section">
        {/* Input Fields Group */}
        <div className="product-inputs-group">
          <div className="form-group-product">
            <label>Product Name</label>
            <input 
              type="text" 
              value={productName} 
              onChange={(e) => setProductName(e.target.value)}
              className="input-product"
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group-product">
            <label>Product HSN</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                value={productHSN} 
                onChange={(e) => setProductHSN(e.target.value)}
                className="input-product"
                placeholder="Enter HSN code"
              />
              <span className="search-icon" onClick={handleSearchHSN}>🔍</span>
            </div>
          </div>

          <div className="form-group-product">
            <label>Product Category</label>
            <ProductCategorySelect onCategorySelect={handleCategorySelect} />
          </div>

          <div className="form-group-product">
            <label>Product Code</label>
            <div className="product-code-container">
              <input 
                type="text" 
                value={productCode} 
                onChange={(e) => setProductCode(e.target.value)}
                className="input-product"
                placeholder="Product code"
                readOnly
              />
              <button 
                type="button" 
                className="generate-code-btn"
                onClick={handleGenerateCode}
              >
                Assign Code
              </button>
            </div>
          </div>

          <div className="form-group-product">
            <label>Select Unit</label>
            <UnitSelect onUnitSelect={handleUnitSelect} />
          </div>
        </div>

        {/* Image Selection Group */}
        <div className="product-image-group">
          <div className="image-upload-section">
            {!imagePreview ? (
              <div className="image-upload-button" onClick={handleImageSelect}>
                <span className="camera-icon">📷</span>
                <span className="upload-text">Add Item Image</span>
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Product preview" className="image-preview" />
                <button 
                  className="remove-image-btn" 
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
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
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs-section">
        <div className="tabs-container">
          <div className="tab-header">
            <button 
              className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing
            </button>
            <button 
              className={`tab-button ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              Stock
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'pricing' && (
               <div className="pricing-tab">
                 <h3>Pricing Information</h3>
                 <div className="pricing-fields-container">
                   {/* Sale Price Section */}
                   <div className="pricing-field-group">
                     <div className="pricing-field-row">
                       <div className="pricing-input-group">
                         <label>Sale Price</label>
                         <input 
                           type="number" 
                           value={salePrice} 
                           onChange={(e) => setSalePrice(e.target.value)}
                           className="pricing-input"
                           placeholder="Enter sale price"
                           min="0"
                           step="0.01"
                         />
                       </div>
                       <div className="pricing-select-group">
                         <label>Price Type</label>
                         <select 
                           value={salePriceType} 
                           onChange={(e) => setSalePriceType(e.target.value)}
                           className="pricing-select"
                         >
                           <option value="without_tax">Without Tax</option>
                           <option value="with_tax">With Tax</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   {/* Discount Section */}
                   <div className="pricing-field-group">
                     <div className="pricing-field-row">
                       <div className="pricing-input-group">
                         <label>Discount On Sale Price</label>
                         <input 
                           type="number" 
                           value={discountAmount} 
                           onChange={(e) => setDiscountAmount(e.target.value)}
                           className="pricing-input"
                           placeholder="Enter discount"
                           min="0"
                           step="0.01"
                         />
                       </div>
                       <div className="pricing-select-group">
                         <label>Discount Type</label>
                         <select 
                           value={discountType} 
                           onChange={(e) => setDiscountType(e.target.value)}
                           className="pricing-select"
                         >
                           <option value="percentage">Percentage</option>
                           <option value="amount">Amount</option>
                         </select>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}
            
            {activeTab === 'stock' && (
               <div className="stock-tab">
                 <h3>Stock Information</h3>
                 <div className="stock-fields-container">
                   <div className="stock-field-row">
                     <div className="stock-input-group">
                       <label>Opening Quantity</label>
                       <input 
                         type="number" 
                         value={openingQuantity} 
                         onChange={(e) => setOpeningQuantity(e.target.value)}
                         className="stock-input"
                         placeholder="Enter opening quantity"
                         min="0"
                         step="1"
                       />
                     </div>

                     <div className="stock-input-group">
                       <label>At Price</label>
                       <input 
                         type="number" 
                         value={atPrice} 
                         onChange={(e) => setAtPrice(e.target.value)}
                         className="stock-input"
                         placeholder="Enter price"
                         min="0"
                         step="0.01"
                       />
                     </div>

                     <div className="stock-input-group">
                       <label>As Of Date</label>
                       <input 
                         type="datetime-local" 
                         value={asOfDate} 
                         onChange={(e) => setAsOfDate(e.target.value)}
                         className="stock-input"
                       />
                     </div>

                     <div className="stock-input-group min-stock-group">
                       <label>Min Stock to Maintain</label>
                       <input 
                         type="number" 
                         value={minStock} 
                         onChange={(e) => setMinStock(e.target.value)}
                         className="stock-input"
                         placeholder="Enter min stock"
                         min="0"
                         step="1"
                       />
                     </div>

                     {/* <div className="stock-input-group">
                       <label>Location</label>
                       <input 
                         type="text" 
                         value={location} 
                         onChange={(e) => setLocation(e.target.value)}
                         className="stock-input"
                         placeholder="Enter location"
                       />
                     </div> */}
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Purchase Price and Taxes Section */}
      <div className="purchase-taxes-section">
        {/* Purchase Price Div */}
        <div className="purchase-price-div">
          <h3>Purchase Price</h3>
          <div className="purchase-price-row">
            <div className="purchase-input-group">
              <input 
                type="number" 
                value={purchasePrice} 
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="purchase-input"
                placeholder="Enter purchase price"
                min="0"
                step="0.01"
              />
            </div>
            <div className="purchase-select-group">
              <select 
                value={purchasePriceType} 
                onChange={(e) => setPurchasePriceType(e.target.value)}
                className="purchase-select"
              >
                <option value="without_tax">Without Tax</option>
                <option value="with_tax">With Tax</option>
              </select>
            </div>
          </div>
        </div>

        {/* Taxes Div */}
        <div className="taxes-div">
          <h3>Taxes</h3>
          <div className="taxes-select-group">
            <select 
              value={selectedTax} 
              onChange={(e) => setSelectedTax(e.target.value)}
              className="taxes-select"
            >
              <option value="none">None</option>
              <option value="igst_0">IGST@0%</option>
              <option value="gst_0">GST@0%</option>
              <option value="igst_025">IGST@0.25%</option>
              <option value="gst_025">GST@0.25%</option>
              <option value="igst_3">IGST@3%</option>
              <option value="gst_3">GST@3%</option>
              <option value="igst_5">IGST@5%</option>
              <option value="gst_5">GST@5%</option>
              <option value="igst_12">IGST@12%</option>
              <option value="gst_12">GST@12%</option>
              <option value="igst_18">IGST@18%</option>
              <option value="gst_18">GST@18%</option>
              <option value="igst_28">IGST@28%</option>
              <option value="gst_28">GST@28%</option>
              <option value="exempt">Exempt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer Save Button */}
      <div className="product-footer-row">
        <button className="footer-btn" onClick={handleSaveProduct} disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Save')}
        </button>
      </div>

      {/* HSN Search Modal */}
      {showHSNModal && (
        <div className="hsn-modal-overlay" onClick={closeHSNModal}>
          <div className="hsn-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hsn-modal-header">
              <div className="hsn-header-content">
                <h2>Select HSN</h2>
                <div className="hsn-search-container">
                  <input
                    type="text"
                    value={hsnSearchTerm}
                    onChange={(e) => filterHSNCodes(e.target.value)}
                    placeholder="Search HSN codes or descriptions..."
                    className="hsn-search-input"
                  />
                  <button 
                    onClick={() => filterHSNCodes('')} 
                    className="hsn-clear-search-btn"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button className="hsn-modal-close" onClick={closeHSNModal}>✕</button>
            </div>

            <div className="hsn-table-container">
              <div className="hsn-table-header">
                <div className="hsn-table-cell header">Code</div>
                <div className="hsn-table-cell header">Description</div>
                <div className="hsn-table-cell header">Action</div>
              </div>
              
              {hsnLoading ? (
                <div className="hsn-loading">Loading HSN codes...</div>
              ) : filteredHsnCodes.length === 0 ? (
                <div className="hsn-no-results">No HSN codes found for "{hsnSearchTerm}".</div>
              ) : (
                <div className="hsn-table-body">
                  {filteredHsnCodes.map((code, index) => (
                    <div key={index} className="hsn-table-row">
                      <div className="hsn-table-cell">{code.code}</div>
                      <div className="hsn-table-cell">{code.description}</div>
                      <div className="hsn-table-cell">
                        <button 
                          className="hsn-select-btn"
                          onClick={() => selectHSNCode(code)}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewProductNew;