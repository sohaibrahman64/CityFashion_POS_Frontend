import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL, SAVE_SUPPLIER } from "../Constants";
import "./AddSupplier.css";

const SupplierForm = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [message, setMessage] = useState("");
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(`${BASE_URL}/${SAVE_SUPPLIER}`, form);
    setMessage("Supplier added successfully ✅");
    setForm({ name: "", phone: "", email: "", address: "" });
  };

  return (
    <form className="supplier-form" onSubmit={handleSubmit}>
      {message && <p className="status-msg">{message}</p>}
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <div className="button-group">
        <button type="submit">Save Supplier</button>
      </div>
    </form>
  );
};

export default SupplierForm;
