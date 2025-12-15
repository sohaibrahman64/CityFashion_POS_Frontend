import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddPurchase.css"; // optional CSS
import ProductSelect from "../product/ProductSelect";
import SupplierSelect from "../suppliers/SupplierSelect";
import { BASE_URL, GET_ALL_PAYMENT_TYPES, GET_ALL_SUPPLIERS, GET_ALL_PRODUCTS, ADD_PURCHASE } from "../Constants";

const AddPurchase = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substr(0, 10));
  const [billNumber, setBillNumber] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentModeId, setPaymentModeId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [paymentModes, setPaymentModes] = useState([]);

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    // Fetch payment modes
    axios.get(`${BASE_URL}/${GET_ALL_PAYMENT_TYPES}`)
      .then(res => setPaymentModes(res.data))
      .catch(err => console.error("Failed to load payment modes", err));
  }, []);

  const fetchSuppliers = async () => {
    try {
      /* const res = await axios.get("/api/suppliers/getAll"); */
      const res = await axios.get(`${BASE_URL}/${GET_ALL_SUPPLIERS}`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    }
  };

  const fetchProducts = async () => {
    try {
      /* const res = await axios.get("/api/products/getAll"); */
      const res = await axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const addItemRow = () => {
    setItems([...items, { productId: "", quantity: 1, pricePerUnit: 0, discount: 0, tax: 0, total: 0 }]);
  };

  const removeItemRow = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (["quantity", "pricePerUnit", "discount", "tax"].includes(field)) {
      updated[index][field] = parseFloat(value);
    } else {
      updated[index][field] = value;
    }
    // Auto-calculate total
    const qty = updated[index].quantity || 0;
    const price = updated[index].pricePerUnit || 0;
    const tax = updated[index].tax || 0;
    const discount = updated[index].discount || 0;
    const price_without_discount = (price + (tax / 100) * price) * qty;
    const discount_price = (discount / 100) * price_without_discount;
    const total = price_without_discount - discount_price;
    updated[index].total = isNaN(total) ? 0 : parseFloat(total.toFixed(2));
    setItems(updated);
  };

  const handleSubmit = async () => {
    if (!selectedSupplier) {
      alert("Please select a supplier.");
      return;
    }
    if (!billNumber.trim()) {
      alert("Please enter bill number.");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    if (!paymentModeId) {
      alert("Please select a payment type.");
      return;
    }

    const payload = {
      supplierId: selectedSupplier,
      purchaseDate,
      billNumber,
      paymentModeId: paymentModeId,
      description,
      imagePath: image ? `${BASE_URL}/${image}` : null,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        discountPercent: item.discount,
        taxPercent: item.tax,
        totalPrice: item.total
      })),
      totalAmount: totalAmount
    };

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/${ADD_PURCHASE}`, payload);
      alert("Purchase recorded successfully!");
      resetForm();
    } catch (err) {
      console.error("Failed to save purchase", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplier("");
    setPurchaseDate(new Date().toISOString().substr(0, 10));
    setBillNumber("");
    setItems([]);
    setPaymentModeId("");
    setDescription("");
    setImage(null);
  };

  // Calculate total amount for all items
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  // Helpers for Discount and Tax Amounts
  const getDiscountAmount = (item) => {
    const qty = item.quantity || 0;
    const price = item.pricePerUnit || 0;
    const taxPercent = item.tax || 0;
    const discountPercent = item.discount || 0;
    const priceWithTax = price + (taxPercent / 100) * price;
    const subtotal = priceWithTax * qty;
    return ((discountPercent / 100) * subtotal).toFixed(2);
  };
  const getTaxAmount = (item) => {
    const qty = item.quantity || 0;
    const price = item.pricePerUnit || 0;
    const taxPercent = item.tax || 0;
    return ((taxPercent / 100) * price * qty).toFixed(2);
  };

  return (
    <div className="add-purchase-container">
      <h2>Add Purchase</h2>

      <div className="form-section">
        <label>
          Purchase Date:
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </label>

        <label>
          Supplier:
          <SupplierSelect
            onSupplierSelect={supplier => setSelectedSupplier(supplier?.id || "")}
          />
        </label>

        <label>
          Bill Number:
          <input
            className="bill-number-input"
            type="text"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
          />
        </label>
      </div>

      <div className="items-section">
        <h3>Items</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th className="product-col" rowSpan="2" style={{ textAlign: 'center' }}>Product</th>
              <th className="qty-col" rowSpan="2" style={{ textAlign: 'center' }}>Quantity</th>
              <th className="priceunit-col" rowSpan="2" style={{ textAlign: 'center' }}>Price/Unit (w/o tax)</th>
              <th className="discount-col" colSpan="2" style={{ textAlign: 'center' }}>Discount</th>
              <th className="tax-col" colSpan="2" style={{ textAlign: 'center' }}>Tax</th>
              <th className="total-col" rowSpan="2" style={{ textAlign: 'center' }}>Total</th>
              <th rowSpan="2" style={{ textAlign: 'center' }}>Remove</th>
            </tr>
            <tr>
              <th style={{ width: 60, textAlign: 'center' }}>(%)</th>
              <th style={{ width: 90, textAlign: 'center' }}>(Amount)</th>
              <th style={{ width: 60, textAlign: 'center' }}>(%)</th>
              <th style={{ width: 90, textAlign: 'center' }}>(Amount)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="product-col">
                  <ProductSelect
                    onProductSelect={product => {
                      const updated = [...items];
                      updated[idx].productId = product?.id || "";
                      // Optionally, set other fields like pricePerUnit, buyPrice, etc. if needed
                      setItems(updated);
                    }}
                  />
                </td>
                <td className="qty-col">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                  />
                </td>
                <td className="priceunit-col">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.pricePerUnit}
                    onChange={(e) => handleItemChange(idx, "pricePerUnit", e.target.value)}
                  />
                </td>
                <td className="discount-col">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discount}
                    onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                  />
                </td>
                <td className="discount-col">
                  <input
                    type="number"
                    value={getDiscountAmount(item)}
                    readOnly
                    style={{ background: '#f4f7fa', fontWeight: 600 }}
                  />
                </td>
                <td className="tax-col">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.tax}
                    onChange={(e) => handleItemChange(idx, "tax", e.target.value)}
                  />
                </td>
                <td className="tax-col">
                  <input
                    type="number"
                    value={getTaxAmount(item)}
                    readOnly
                    style={{ background: '#f4f7fa', fontWeight: 600 }}
                  />
                </td>
                <td className="total-col">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.total}
                    readOnly
                    style={{ background: '#f4f7fa', fontWeight: 600 }}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeItemRow(idx)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <button className="add-item-btn" type="button" onClick={addItemRow}>
            ➕ Add Item
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <label htmlFor="total-amount" style={{ fontWeight: 600, color: '#0a69b9', marginBottom: 4 }}>Total Amount:</label>
            <input
              id="total-amount"
              type="number"
              value={totalAmount.toFixed(2)}
              readOnly
              style={{ background: '#f4f7fa', fontWeight: 700, fontSize: 18, border: '1.5px solid #0a69b9', borderRadius: 6, padding: '6px 16px', width: 180 }}
            />
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginTop: 24 }}>
        <label>
          Payment Type:
          <select value={paymentModeId} onChange={e => setPaymentModeId(e.target.value)}>
            <option value="">Select Payment Type</option>
            {paymentModes.map(mode => (
              <option key={mode.id} value={mode.id}>{mode.modeName}</option>
            ))}
          </select>
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ resize: 'vertical', minHeight: 40 }}
          />
        </label>
        <label>
          Add Image:
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
        </label>
      </div>

      <div className="form-actions">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Purchase"}
        </button>
      </div>
    </div>
  );
};

export default AddPurchase;
