import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, UPDATE_PRODUCT } from "../Constants";
import "./ProductEditModal.css";

const ProductEditModal = ({ show, onClose, product, onSave }) => {
  const [form, setForm] = useState(product || {});

  useEffect(() => {
    setForm(product || {});
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ["stockQuantity", "tax_percent", "mrp", "buyPrice", "billSerialNumber"].includes(name)
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.put(
      `${BASE_URL}/${UPDATE_PRODUCT}/${form.id}`,
      form
    );
    onSave(res.data);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Product</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name:
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Size:
            <input
              name="size"
              value={form.size || ""}
              onChange={handleChange}
            />
          </label>

          <label>
            Tax %:
            <select
              name="tax_percent"
              value={form.tax_percent || ""}
              onChange={handleChange}
            >
              <option value="">Tax %</option>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
            </select>
          </label>

          <label>
            MRP:
            <input
              name="mrp"
              type="number"
              value={form.mrp || ""}
              onChange={handleChange}
            />
          </label>

          <div className="form-buttons">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
