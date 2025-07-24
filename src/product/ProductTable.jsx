import React, { useState } from "react";
import "./ProductTable.css"; // Optional: for table & pagination styles

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  selectedProducts,
  onSelectProduct,
  setSelectedProducts
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(products.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = products.slice(indexOfFirstRow, indexOfLastRow);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <table className="product-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={currentRows.every((p) =>
                  selectedProducts.some((sp) => sp.id === p.id)
                )}
                onChange={(e) => {
                  const allVisible = currentRows;
                  if (e.target.checked) {
                    const newSelection = [
                      ...selectedProducts,
                      ...allVisible.filter(
                        (p) => !selectedProducts.some((sp) => sp.id === p.id)
                      ),
                    ];
                    setSelectedProducts(newSelection);
                  } else {
                    setSelectedProducts(
                      selectedProducts.filter(
                        (p) => !allVisible.some((sp) => sp.id === p.id)
                      )
                    );
                  }
                }}
              />
            </th>
            <th>Barcode</th>
            <th>Name</th>
            <th>Category</th>
            <th>Size</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((p) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.some((sp) => sp.id === p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, p]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((sp) => sp.id !== p.id)
                        );
                      }
                    }}
                  />
                </td>
                <td>{p.barcode}</td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td>{p.size}</td>
                <td>₹{p.mrp.toFixed(2)}</td>
                <td>
                  <button onClick={() => onEdit(p)}>✏️ Edit</button>
                  <button onClick={() => onDelete(p.id)}>🗑️ Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Numeric Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={page === currentPage ? "active-page" : ""}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}
    </>
  );
};

export default ProductTable;
