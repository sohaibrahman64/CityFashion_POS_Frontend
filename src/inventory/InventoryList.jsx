import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { BASE_URL, GET_ALL_INVENTORY, DELETE_INVENTORY, UPDATE_INVENTORY } from "../Constants";
import "./InventoryList.css";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get(`${BASE_URL}/${GET_ALL_INVENTORY}`);   
    setInventory(res.data);
    setFilteredInventory(res.data);
    setCurrentPage(1);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inventory entry?")) {
      await axios.delete(`${BASE_URL}/${DELETE_INVENTORY}/${id}`);
      fetchInventory();
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredInventory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory.xlsx");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = inventory.filter(
      (i) =>
        i.productName?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredInventory(filtered);
    setCurrentPage(1);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    await axios.put(`${BASE_URL}/${UPDATE_INVENTORY}/${selectedEntry.id}`, selectedEntry);
    setShowModal(false);
    fetchInventory();
  };

  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="inventory-list-container">
      <div className="inventory-list-header">
        <h2>Inventory List</h2>
        <button onClick={handleExportToExcel} className="export-button">
          Export to Excel
        </button>
      </div>
      <input
        type="text"
        placeholder="Search by product name"
        value={search}
        onChange={handleSearch}
        className="inventory-search-input"
      />
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInventory.map((i) => (
            <tr key={i.id}>
              <td>{i.productName}</td>
              <td>{i.quantity}</td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(i)}>✏️ Edit</button>
                <button className="delete-button" onClick={() => handleDelete(i.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        {/* <div>
          <label>
            Items per page:
            <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-per-page-select">
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div> */}
        <div className="pagination-buttons">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
              className={`pagination-buttons ${page === currentPage ? 'active-page' : ''}`}
            >
              {page}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="pagination-button">
            Next →
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          Page {currentPage} of {totalPages}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Inventory Entry</h3>
            <form onSubmit={handleModalSave} className="modal-form">
              <input
                type="text"
                value={selectedEntry.productName || ''}
                readOnly
                placeholder="Product Name"
                className="modal-input"
              />
              <input
                type="number"
                value={selectedEntry.quantity}
                onChange={(e) =>
                  setSelectedEntry((prev) => ({ ...prev, quantity: e.target.value }))
                }
                placeholder="Quantity"
                required
                className="modal-input"
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

export default InventoryList;