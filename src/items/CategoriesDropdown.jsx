import React, { useState, useEffect, useRef } from "react";
import "./CategoriesDropdown.css";
import { BASE_URL, GET_ALL_CATEGORIES, ADD_CATEGORY } from "../Constants";
import Toast from "../components/Toast";

const CategoriesDropdown = ({ onCategorySelect, selectedCategory, showAddCategory = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${GET_ALL_CATEGORIES}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      setFilteredCategories(list);
    } catch (e) {
      console.error("Failed to load categories", e);
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        (category.categoryName || category.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleCategorySelect = (category) => {
    setSearchTerm(category.categoryName || category.name || "");
    setIsOpen(false);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleAddCategoryClick = () => {
    setShowAddCategoryModal(true);
  };

  const handleAddCategorySuccess = () => {
    fetchCategories(); // Refresh the categories list
  };

  const handleAddCategoryClose = () => {
    setShowAddCategoryModal(false);
    setNewCategoryName("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setCreatingCategory(true);
    try {
      const response = await fetch(`${BASE_URL}/${ADD_CATEGORY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Refresh the categories list to get the updated data from backend
      await fetchCategories();
      
      // Find the newly created category and select it
      const newCategory = categories.find(cat => 
        cat.categoryName === newCategoryName.trim() || 
        cat.name === newCategoryName.trim()
      ) || result;
      
      if (newCategory) {
        handleCategorySelect(newCategory);
      }
      
      // Close modal and reset
      setShowAddCategoryModal(false);
      setNewCategoryName("");
      
      // Show success toast
      setToast({ 
        message: "Category created successfully!", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error creating category:", error);
      setToast({ 
        message: "Failed to create category. Please try again.", 
        type: "error" 
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="categories-dropdown-container">
      <div className="categories-dropdown-wrapper" ref={dropdownRef}>
        {/* Category Input Field */}
        <div className="categories-dropdown-input-container">
          <div className="categories-dropdown-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="categories-dropdown-input"
              placeholder="Search category..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <div className="categories-dropdown-arrow">▼</div>
          </div>
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <div className="categories-dropdown-list">
            {loading ? (
              <div className="categories-dropdown-loading">Loading...</div>
            ) : (
              <>
                {/* Add Category Button - Inside Dropdown */}
                {showAddCategory && (
                  <div className="categories-dropdown-add-category-container">
                    <button
                      className="categories-dropdown-add-category-btn"
                      onClick={handleAddCategoryClick}
                    >
                      <span className="add-category-icon">+</span>
                      <span className="add-category-text">Add Category</span>
                    </button>
                  </div>
                )}
                
                {/* Category List */}
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="categories-dropdown-item"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="category-info">
                        <div className="category-name">
                          {category.categoryName || category.name || "Unnamed Category"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="categories-dropdown-no-results">
                    No categories found
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="add-category-modal-overlay" onClick={handleAddCategoryClose}>
          <div className="add-category-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="add-category-modal-header">
              <h3>Add Category</h3>
              <button 
                className="add-category-modal-close"
                onClick={handleAddCategoryClose}
              >
                ✕
              </button>
            </div>
            <div className="add-category-modal-body">
              <label className="add-category-label">Enter Category Name</label>
              <input
                type="text"
                className="add-category-input"
                placeholder="e.g., Grocery"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="add-category-modal-footer">
              <button 
                className="add-category-create-btn"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || creatingCategory}
              >
                {creatingCategory ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CategoriesDropdown;
