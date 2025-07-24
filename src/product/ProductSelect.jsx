import { useState, useEffect } from "react";
import { BASE_URL, GET_ALL_PRODUCTS, SAVE_PRODUCT, GET_ALL_CATEGORIES, GENERATE_BARCODE } from "../Constants";
import axios from "axios";
import AsyncSelect from "react-select/async";
import "./ProductSelect.css";

const ProductSelect = ({ onProductSelect }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [mrp, setMrp] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [size, setSize] = useState("");
  const [tax, setTax] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  useEffect(() => {
    axios.get(`${BASE_URL}/${GET_ALL_CATEGORIES}`)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  const loadOptions = async (inputValue) => {
    const response = await axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS}`);
    let options = response.data.map((product) => ({
      /* label: product.name + (product.barcode ? ` (${product.barcode})` : ""), */
      label: product.name + (product.size ? ` (${product.size})` : ""),
      value: product.id,
      product,
    }));
    if (inputValue) {
      const filtered = options.filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()));
      if (filtered.length === 0) {
        return [
          {
            label: `➕ Add "${inputValue}"`,
            value: "__add_new__",
            inputValue,
            isAddNew: true,
          },
        ];
      }
      return filtered;
    }
    return options;
  };

  const handleChange = (option) => {
    if (option.isAddNew) {
      setName(option.inputValue);
      setShowModal(true);
      return;
    }
    setSelectedProduct(option);
    if (onProductSelect) {
      onProductSelect(option.product);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/${SAVE_PRODUCT}`, {
        name,
        barcode,
        mrp,
        size,
        tax_percent: tax,
        category: categories.find(cat => cat.id === parseInt(categoryId)) || null,
      });
      const newProduct = {
        label: res.data.name + (res.data.size ? ` (${res.data.size})` : ""),
        value: res.data.id,
        product: res.data,
      };
      setSelectedProduct(newProduct);
      if (onProductSelect) {
        onProductSelect(res.data);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error adding product", err);
      alert("Could not save product.");
    }
  };

  const handleGenerateBarcode = async () => {
    setBarcodeLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/${GENERATE_BARCODE}`);
      if (res.data && res.data.barcode) {
        setBarcode(res.data.barcode);
      }
    } catch (err) {
      alert("Failed to generate barcode. Please try again.");
    } finally {
      setBarcodeLoading(false);
    }
  };

  return (
    <div className="product-select-container">
      <AsyncSelect
        styles={{
          control: (base, state) => ({
            ...base,
            border: "1px solid #ccc",
            borderRadius: "6px",
            minHeight: "38px",
            boxShadow: state.isFocused ? "0 0 0 2px #0a69b933" : "none",
            "&:hover": {
              borderColor: "#999",
            },
          }),
          input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "0 10px",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "38px",
          }),
        }}
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={selectedProduct}
        onChange={handleChange}
        placeholder="Search product by name"
        inputValue={inputValue}
        onInputChange={setInputValue}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No product found." : "Type to search products"
        }
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Product</h3>
            <div className="form-grid">
              <label>
                Name:
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="modal-input"
                />
              </label>
              <label>
                Barcode:
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="modal-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    disabled={barcodeLoading}
                    style={{ minWidth: 50, height: '40px', marginTop: 0 }}
                  >
                    {barcodeLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </label>
              <label>
                MRP:
                <input
                  type="number"
                  placeholder="MRP"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="modal-input"
                />
              </label>
              <label>
                Size:
                <input
                  type="text"
                  placeholder="Size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="modal-input"
                />
              </label>
              <label>
                Tax %:
                <select
                  value={tax}
                  onChange={e => setTax(e.target.value)}
                  className="modal-input"
                  required
                >
                  <option value="">Select Tax %</option>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                </select>
              </label>
              <label>
                Category:
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="modal-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" onClick={handleAddProduct}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelect; 