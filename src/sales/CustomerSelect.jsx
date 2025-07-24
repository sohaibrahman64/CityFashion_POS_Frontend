import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { ADD_CUSTOMER, BASE_URL, SEARCH_CUSTOMER } from "../Constants";
import './CustomerSelect.css';

const CustomerSelect = ({onCustomerSelect }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const response = await axios.get(`${BASE_URL}/${SEARCH_CUSTOMER}`, {
        params: { keyword: inputValue },
      });
      if (response.data.length > 0) {
        setSelectedCustomer(true);
        return response.data.map((c) => ({
          label: c.name + (c.phone ? ` (${c.phone})` : ""),
          value: c.id,
          customer: c,
        }));
      } else {
        setSelectedCustomer(false);
        return [];
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
      setSelectedCustomer(false);
      return [];
    }
  };

  const handleChange = (option) => {
    setSelectedCustomer(option);
    if (onCustomerSelect) {
      onCustomerSelect(option.customer); // Send full customer object
    }
  };

  const handleAddCustomer = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/${ADD_CUSTOMER}`, {
        name,
        phone,
        email,
        address,
      });

      const newCustomer = {
        label: res.data.name,
        value: res.data.id,
        customer: res.data,
      };

      setSelectedCustomer(newCustomer);
      if (onCustomerSelect) {
        onCustomerSelect(res.data);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error adding customer", err);
      alert("Could not save customer.");
    }
  };

  return (
    <div className="customer-select-container">
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
        value={selectedCustomer}
        onChange={handleChange}
        placeholder="Search customer by name or phone"
        noOptionsMessage={({ inputValue }) => (
          inputValue ? (
            <div>
              No customer found.{" "}
              <button 
                className="btn-inline-add" 
                onClick={() => {
                  setName(inputValue);
                  setShowModal(true);
                }}
              >
                ➕ Add "{inputValue}"
              </button>
            </div>
          ) : "Type to search customers"
        )}
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Customer</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddCustomer();
            }}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="modal-input"
              />
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="modal-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
              />
              <textarea
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="modal-textarea"
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelect;
