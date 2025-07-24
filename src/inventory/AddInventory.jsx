import "./AddInventory.css";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BASE_URL,
  GET_ALL_PRODUCTS,
  SAVE_INVENTORY,
  } from "../Constants";
import ProductSelect from "../product/ProductSelect";

const AddInventory = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/${GET_ALL_PRODUCTS}`);
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/${SAVE_INVENTORY}`, form);
      alert("Inventory entry saved successfully!");
      setForm({
        productId: "",
        quantity: "",
      });
    } catch (error) {
      console.error("Error saving inventory:", error);
    }
  };


  return (
    <div className="add-inventory-form-container">
      <h2>Add Inventory</h2>
      <form className="inventory-form" onSubmit={handleSubmit}>
        <ProductSelect
          onProductSelect={(product) =>
            setForm((prev) => ({ ...prev, productId: product?.id || "" }))
          }
        />

        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          required
          min="1"
          placeholder="Quantity"
        />

        <div className="button-group">
          <button type="submit">Save Inventory</button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
