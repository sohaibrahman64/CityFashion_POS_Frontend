import React, { useState, useRef } from 'react';
import './AddNewProductNew.css';
import ProductSelect from './ProductSelect';
import UnitSelect from './UnitSelect';
import { GENERATE_BARCODE } from '../Constants';
import axios from 'axios';

const AddNewProductNew = () => {
  // State for form fields
  const [productName, setProductName] = useState('');
  const [productHSN, setProductHSN] = useState('');
  const [productCategory, setProductCategory] = useState('');
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
  const [location, setLocation] = useState('');

  // File input ref for image selection
  const fileInputRef = useRef(null);

  // Generate 11-digit product code
  const handleGenerateCode = () => {
    const randomCode = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setProductCode(randomCode);
  };

  // Handle unit selection
  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit);
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

  // Handle search HSN
  const handleSearchHSN = () => {
    // TODO: Implement HSN search functionality
    console.log('Searching for HSN code...');
    alert('HSN search functionality will be implemented here');
  };

  // Handle save product
  const handleSaveProduct = async () => {
    try {
      // Validation
      if (!productName.trim()) {
        alert('Please enter product name');
        return;
      }
      if (!productCode.trim()) {
        alert('Please generate product code');
        return;
      }

      setLoading(true);
      
      // Prepare product data
      const productData = {
        name: productName,
        hsn: productHSN,
        category: productCategory,
        code: productCode,
        unit: selectedUnit,
        image: selectedImage,
        pricing: {
          salePrice: parseFloat(salePrice) || 0,
          salePriceType,
          discountAmount: parseFloat(discountAmount) || 0,
          discountType
        },
        stock: {
          openingQuantity: parseInt(openingQuantity) || 0,
          atPrice: parseFloat(atPrice) || 0,
          asOfDate,
          minStock: parseInt(minStock) || 0
        }
      };

      // TODO: Add API call to save product
      console.log('Product data to save:', productData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Product saved successfully!');
      
      // Reset form if needed
      // resetForm();
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-new-product-container">
      {/* Header */}
      <div className="product-header">
        <h2 className="product-title">Add New Product</h2>
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
            <input 
              type="text" 
              value={productCategory} 
              onChange={(e) => setProductCategory(e.target.value)}
              className="input-product"
              placeholder="Enter category"
            />
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
            <div className="image-upload-button" onClick={handleImageSelect}>
              <span className="camera-icon">📷</span>
              <span className="upload-text">Add Item Image</span>
            </div>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/jpg,image/png"
              style={{ display: 'none' }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="image-preview"
                />
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

      {/* Footer Save Button */}
      <div className="product-footer-row">
        <button className="footer-btn" onClick={handleSaveProduct} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default AddNewProductNew;