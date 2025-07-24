import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AddNewProduct.css";
import {
  BASE_URL,
  GET_ALL_CATEGORIES,
  GENERATE_BARCODE,
  SAVE_PRODUCT,
  SAVE_INVENTORY,
} from "../Constants";

const AddProductForm = () => {
  const barcodeInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    barcode: "",
    name: "",
    category: "",
    tax_percent: "",
    mrp: "",
    size: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showAddInventoryPrompt, setShowAddInventoryPrompt] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [lastSavedProduct, setLastSavedProduct] = useState(null);
  const [inventoryQuantity, setInventoryQuantity] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (
      [
        "stockQuantity",
        "tax_percent",
        "billSerialNumber",
        "buyPrice",
        "mrp",
      ].includes(name)
    ) {
      processedValue = value === "" ? "" : Number(value);
      setForm((prev) => ({ ...prev, [name]: processedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedCat = categories.find((cat) => cat.id === selectedId);

    setCategoryId(e.target.value);
    const { name, value } = e.target;
    const selectedName = e.target.options[e.target.selectedIndex].text;
    setForm((prev) => ({
      ...prev,
      category: selectedCat
        ? { id: selectedCat.id, name: selectedCat.name }
        : null,
    }));
  };

  const handleGenerateBarcode = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/${GENERATE_BARCODE}`);
      if (res.data && res.data.barcode) {
        setForm((prev) => ({ ...prev, barcode: res.data.barcode }));
      }
    } catch (err) {
      console.error("Barcode generation failed:", err);
      alert("Failed to generate barcode. Please try again.");
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.barcode) errs.barcode = "Barcode is required";
    if (!form.name) errs.name = "Product name is required";
    if (!form.tax_percent) errs.tax_percent = "Select tax rate";
    if (!form.size) errs.size = "Enter Size";
    if (!form.mrp) errs.mrp = "Enter MRP";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/${SAVE_PRODUCT}`, form);
      setMessage("Product added successfully ✅");
      setLastSavedProduct(res.data); // assuming API returns the saved product object
      setShowAddInventoryPrompt(true);
      setForm({
        barcode: "",
        name: "",
        category: "",
        tax_percent: "",
        size: "",
        mrp: "",
      });
      setErrors({});
    } catch (err) {
      setMessage(
        "❌ Error adding product: " + err.response?.data?.message || err.message
      );
    }
  };

  const handleAddInventoryYes = () => {
    setShowAddInventoryPrompt(false);
    setShowAddInventoryModal(true);
    setInventoryQuantity(1);
  };
  const handleAddInventoryNo = () => {
    setShowAddInventoryPrompt(false);
    setLastSavedProduct(null);
  };
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!lastSavedProduct?.id) return;
    try {
      //await axios.post(`${BASE_URL}/api/inventory/saveInventory`, {
      await axios.post(`${BASE_URL}/${SAVE_INVENTORY}`, {
        productId: lastSavedProduct.id,
        quantity: inventoryQuantity,
      });
      setShowAddInventoryModal(false);
      setLastSavedProduct(null);
      setMessage("Inventory entry saved successfully ✅");
    } catch (error) {
      setMessage("❌ Error saving inventory: " + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/${GET_ALL_CATEGORIES}`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const handleCancel = () => {
    setForm({
      barcode: "",
      name: "",
      category: "",
      tax_percent: "",
      size: "",
      mrp: "",
    });
    setErrors({});
    setMessage("");
    barcodeInputRef.current?.focus();
  };

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  return (
    <>
      <form className="product-form" onSubmit={handleSubmit}>
        {message && <p className="status-msg">{message}</p>}

        <div className="barcode-container">
          <input
            ref={barcodeInputRef}
            name="barcode"
            placeholder="Scan or enter barcode"
            value={form.barcode}
            onChange={handleChange}
          />
          <button
            type="button"
            className="generate-barcode-btn"
            onClick={handleGenerateBarcode}
          >
            Generate Barcode
          </button>
        </div>
        {errors.barcode && <span className="error">{errors.barcode}</span>}

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <input
          name="size"
          placeholder="Enter Size"
          value={form.size}
          onChange={handleChange}
        />
        {errors.size && <span className="error">{errors.size}</span>}


        <input
          name="mrp"
          type="number"
          value={form.mrp}
          onChange={handleChange}
          placeholder="MRP"
        />
        {errors.mrp && <span className="error">{errors.mrp}</span>}
        <select
          name="category"
          value={categoryId}
          onChange={handleCategoryChange}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          name="tax_percent"
          value={form.tax_percent}
          onChange={handleChange}
        >
          <option value="">Tax %</option>
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
        </select>
        {errors.tax_percent && (
          <span className="error">{errors.tax_percent}</span>
        )}

        <div className="button-group">
          <button type="submit">Save Product</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
      {showAddInventoryPrompt && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Product to Inventory?</h3>
            <p>Do you want to add <b>{lastSavedProduct?.name}</b> to inventory?</p>
            <div className="modal-actions">
              <button type="button" onClick={handleAddInventoryNo}>No</button>
              <button type="button" onClick={handleAddInventoryYes}>Yes</button>
            </div>
          </div>
        </div>
      )}
      {showAddInventoryModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Inventory Entry</h3>
            <form onSubmit={handleSaveInventory} className="modal-form">
              <input
                type="text"
                value={lastSavedProduct?.name || ''}
                readOnly
                placeholder="Product Name"
                className="modal-input"
              />
              <input
                type="number"
                value={inventoryQuantity}
                min={1}
                onChange={e => setInventoryQuantity(Number(e.target.value))}
                placeholder="Quantity"
                required
                className="modal-input"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddInventoryModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductForm;
