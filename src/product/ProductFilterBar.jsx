import React from "react";
import "./ProductFilterBar.css";

const ProductFilterBar = ({
  filters,
  setFilters,
  categories,
  onApplyFilters,
}) => {
  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = () => {
    setFilters({
      categoryId: "",
      stockLessThan: "",
      stockDate: "",
    });
    onApplyFilters();
  };

  return (
    <div className="filter-bar">
      <label>
        Category:
        <select
          name="categoryId"
          value={filters.categoryId}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Stock Less Than:
        <input
          type="number"
          name="stockLessThan"
          placeholder="e.g. 10"
          value={filters.stockLessThan}
          onChange={handleChange}
        />
      </label>

      <label>
        Stock Date:
        <input
          type="date"
          name="stockDate"
          value={filters.stockDate}
          onChange={handleChange}
        />
      </label>

      <div className="button-group">
        <button onClick={onApplyFilters}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default ProductFilterBar;
