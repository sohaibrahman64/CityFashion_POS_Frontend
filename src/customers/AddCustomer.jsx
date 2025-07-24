import React, { useState } from "react";
import axios from "axios";
import { BASE_URL, ADD_CUSTOMER } from "../Constants";
import "./AddCustomer.css";

const AddCustomer = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and Phone are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/${ADD_CUSTOMER}`, form);
      setSuccess("Customer added successfully!");
      setForm({ name: "", phone: "", email: "", address: "" });
    } catch (err) {
      setError("Failed to add customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-customer-form-container">
      <h2>Add New Customer</h2>
      <form className="add-customer-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name*"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone*"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <textarea
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Customer"}
        </button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default AddCustomer;