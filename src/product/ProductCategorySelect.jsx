import { useState, useEffect } from "react";
import { BASE_URL, GET_ALL_CATEGORIES, ADD_CATEGORY } from "../Constants";
import axios from "axios";
import AsyncSelect from "react-select/async";
import "./ProductCategorySelect.css";

const ProductCategorySelect = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [inputValue, setInputValue] = useState("");

  const loadOptions = async (inputValue) => {
    try {
      const response = await axios.get(`${BASE_URL}/${GET_ALL_CATEGORIES}`);
      let options = response.data.map((category) => ({
        label: category.name,
        value: category.id,
        category,
      }));
      
      if (inputValue) {
        const filtered = options.filter(opt => 
          opt.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        
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
    } catch (error) {
      console.error("Error loading categories:", error);
      return [];
    }
  };

  const handleChange = (option) => {
    if (option.isAddNew) {
      setCategoryName(option.inputValue);
      setShowModal(true);
      return;
    }
    setSelectedCategory(option);
    if (onCategorySelect) {
      onCategorySelect(option.category);
    }
  };

  const handleAddCategory = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/${ADD_CATEGORY}`, {
        name: categoryName,
        description: categoryDescription,
      });
      
      const newCategory = {
        label: res.data.name,
        value: res.data.id,
        category: res.data,
      };
      
      setSelectedCategory(newCategory);
      if (onCategorySelect) {
        onCategorySelect(res.data);
      }
      setShowModal(false);
      setCategoryName("");
      setCategoryDescription("");
    } catch (err) {
      console.error("Error adding category", err);
      alert("Could not save category. Please try again.");
    }
  };

  return (
    <div className="product-category-select-container">
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
        value={selectedCategory}
        onChange={handleChange}
        placeholder="Search category by name"
        inputValue={inputValue}
        onInputChange={setInputValue}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No category found." : "Type to search categories"
        }
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Category</h3>
            <div className="form-grid">
              <label>
                Category Name:
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="modal-input"
                />
              </label>
              <label>
                Description:
                <textarea
                  placeholder="Category Description (optional)"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="modal-textarea"
                  rows="3"
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="button" onClick={handleAddCategory}>Add Category</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategorySelect; 