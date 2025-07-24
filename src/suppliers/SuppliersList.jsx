import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { BASE_URL, GET_ALL_SUPPLIERS, DELETE_SUPPLIER, SAVE_SUPPLIER } from "../Constants";
import "./SuppliersList.css";

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await axios.get(`${BASE_URL}/${GET_ALL_SUPPLIERS}`);
    setSuppliers(res.data);
    setFilteredSuppliers(res.data);
    setCurrentPage(1);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      await axios.delete(`${BASE_URL}/${DELETE_SUPPLIER}/${id}`);
      fetchSuppliers();
    }
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSuppliers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, "suppliers.xlsx");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(value.toLowerCase()) ||
        (s.phone && s.phone.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredSuppliers(filtered);
    setCurrentPage(1);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    await axios.post(`${BASE_URL}/${SAVE_SUPPLIER}`, selectedSupplier);
    setShowModal(false);
    fetchSuppliers();
  };

  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIdx, endIdx);

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
    <div className="suppliers-list-container">
      <div className="suppliers-list-header">
        <h2>Suppliers List</h2>
        <button onClick={handleExportToExcel} className="export-button">
          Export to Excel
        </button>
      </div>
      <input
        type="text"
        placeholder="Search by name or phone"
        value={search}
        onChange={handleSearch}
        className="supplier-search-input"
      />
      <table className="suppliers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSuppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.phone}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(s)}>✏️</button>
                <button className="delete-button" onClick={() => handleDelete(s.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        <div>
          <label>
            Items per page:
            <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-per-page-select">
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
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
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Supplier</h3>
            <form onSubmit={handleModalSave} className="modal-form">
              <input
                type="text"
                value={selectedSupplier.name}
                onChange={(e) =>
                  setSelectedSupplier((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Name"
                required
                className="modal-input"
              />
              <input
                type="text"
                value={selectedSupplier.phone}
                onChange={(e) =>
                  setSelectedSupplier((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="Phone"
                className="modal-input"
              />
              <input
                type="email"
                value={selectedSupplier.email}
                onChange={(e) =>
                  setSelectedSupplier((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Email"
                className="modal-input"
              />
              <textarea
                value={selectedSupplier.address}
                onChange={(e) =>
                  setSelectedSupplier((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Address"
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

export default SuppliersList;