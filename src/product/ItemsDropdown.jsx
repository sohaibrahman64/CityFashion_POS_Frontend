import React, { useState, useEffect, useRef } from "react";
import "./ItemsDropdown.css";

const ItemsDropdown = ({
  value,
  onChange,
  onProductSelect,
  rowIndex,
  suggestions,
  onFocus,
  onSearchChange,
  showSuggestions,
  placeholder = "Enter Item",
}) => {
  const suggestionsRef = useRef(null);

  // Update dropdown position when suggestions are shown
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const inputElement = document.querySelector(
        `input[data-row-index="${rowIndex}"]`
      );
      if (inputElement) {
        const rect = inputElement.getBoundingClientRect();
        const element = suggestionsRef.current;
        element.style.position = "fixed";
        element.style.top = `${rect.bottom + 2}px`;
        element.style.left = `${rect.left}px`;
        element.style.zIndex = "1000";
      }
    }
  }, [showSuggestions, rowIndex]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleInputFocus = (e) => {
    if (onFocus) {
      onFocus(rowIndex, e);
    }
  };

  const handleProductClick = (product) => {
    if (onProductSelect) {
      onProductSelect(product, rowIndex);
    }
  };

  return (
    <div className="items-dropdown-container">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        data-row-index={rowIndex}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="items-dropdown-input"
      />
      {showSuggestions && (
        <div className="suggestions-dropdown" ref={suggestionsRef}>
          <table className="suggestions-table">
            <thead>
              <tr>
                <th>Add Item +</th>
                <th>SALE PRICE</th>
                <th>PURCHASE PRICE</th>
                <th>STOCK</th>
              </tr>
            </thead>
            <tbody>
              {suggestions && suggestions.length > 0 ? (
                suggestions.map((product) => (
                  <tr
                    key={product.id}
                    className="suggestion-item"
                    onClick={() => handleProductClick(product)}
                  >
                    <td className="product-info">
                      {product.productName || product.name} (
                      {product.productCode || product.code})
                    </td>
                    <td className="sale-price">
                      ₹{product.pricing?.salePrice || "0.00"}
                    </td>
                    <td className="purchase-price">
                      ₹{product.pricing?.purchasePrice || "0.00"}
                    </td>
                    <td className="stock">
                      {product.stock?.openingQuantity || "0"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-suggestions">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ItemsDropdown;

