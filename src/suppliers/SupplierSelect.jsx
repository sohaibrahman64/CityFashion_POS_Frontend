import { useState } from "react";
import { BASE_URL, GET_ALL_SUPPLIERS, SAVE_SUPPLIER } from "../Constants";
import axios from "axios";
import AsyncSelect from "react-select/async";
import "./SupplierSelect.css";

const SupplierSelect = ({ onSupplierSelect }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [inputValue, setInputValue] = useState("");

  const loadOptions = async (inputValue) => {
    const response = await axios.get(`${BASE_URL}/${GET_ALL_SUPPLIERS}`);
    let options = response.data.map((supplier) => ({
      label: supplier.name,
      value: supplier.id,
      supplier,
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
    setSelectedSupplier(option);
    if (onSupplierSelect) {
      onSupplierSelect(option.supplier);
    }
  };

  const handleAddSupplier = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/${SAVE_SUPPLIER}`, {
        name,
        phone,
        email,
        address,
      });
      const newSupplier = {
        label: res.data.name,
        value: res.data.id,
        supplier: res.data,
      };
      setSelectedSupplier(newSupplier);
      if (onSupplierSelect) {
        onSupplierSelect(res.data);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error adding supplier", err);
      alert("Could not save supplier.");
    }
  };

  return (
    <div className="supplier-select-container">
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
        value={selectedSupplier}
        onChange={handleChange}
        placeholder="Search supplier by name or phone"
        inputValue={inputValue}
        onInputChange={setInputValue}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No supplier found." : "Type to search suppliers"
        }
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Supplier</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSupplier();
              }}
            >
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
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSelect;
