import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BASE_URL,
  GET_ALL_CUSTOMERS,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
} from "../Constants";
import "./CustomersList.css";
import CustomersPurchaseHistory from "./CustomersPurchaseHistory";

const initialForm = { name: "", phone: "", email: "", address: "" };

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;
  const [showHistoryFor, setShowHistoryFor] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/${GET_ALL_CUSTOMERS}`);
      setCustomers(res.data);
    } catch (err) {
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openEdit = (customer) => {
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setEditId(customer.id || customer._id);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(`${BASE_URL}/${UPDATE_CUSTOMER}/${editId}`, editForm);
      setEditModal(false);
      fetchCustomers();
    } catch (err) {
      alert("Failed to update customer.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      await axios.delete(`${BASE_URL}/${DELETE_CUSTOMER}/${id}`);
      fetchCustomers();
    } catch (err) {
      alert("Failed to delete customer.");
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  const handleViewHistory = (customerId) => {
    setShowHistoryFor(customerId);
    setShowHistory(true);
  };

  // Filter customers by search
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="customers-list-container">
      {showHistory ? (
        <div style={{ marginTop: 32 }}>
          <CustomersPurchaseHistory customerId={showHistoryFor} />
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button
              className="pagination-button"
              onClick={() => setShowHistory(false)}
            >
              Close History
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>Customer List</h2>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <input
              type="text"
              placeholder="Search by name, phone, email, address..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '60%',
                maxWidth: 400,
                fontSize: 15,
                margin: '0 auto',
              }}
            />
          </div>
          <div className="customer-list-container">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredCustomers.length === 0 ? (
              <div>No customers found.</div>
            ) : (
              <>
                <table className="customers-table">
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
                    {filteredCustomers
                      .slice(
                        (currentPage - 1) * customersPerPage,
                        currentPage * customersPerPage
                      )
                      .map((c) => (
                        <tr key={c.id || c._id || c.phone}>
                          <td>{c.name}</td>
                          <td>{c.phone}</td>
                          <td>{c.email}</td>
                          <td>{c.address}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => openEdit(c)}
                                title="Edit"
                              >
                                <span role="img" aria-label="edit">
                                  ✏️
                                </span>
                              </button>
                              <button
                                className="btn-history"
                                onClick={() => handleViewHistory(c.id || c._id)}
                                title="View Purchase History"
                              >
                                <span role="img" aria-label="history">
                                  📜
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 20,
                  }}
                >
                  <button
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ⬅ Prev
                  </button>
                  {Array.from(
                    { length: Math.ceil(filteredCustomers.length / customersPerPage) },
                    (_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-button${
                          currentPage === i + 1 ? " pagination-active" : ""
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                  <button
                    className="pagination-button"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredCustomers.length / customersPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredCustomers.length / customersPerPage)
                    }
                  >
                    Next ➡
                  </button>
                </div>
                {editModal && (
                  <div className="modal-overlay">
                    <div className="modal">
                      <h3>Edit Customer</h3>
                      <form
                        className="add-customer-form"
                        onSubmit={handleEditSubmit}
                      >
                        <input
                          type="text"
                          name="name"
                          placeholder="Name*"
                          value={editForm.name}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          type="text"
                          name="phone"
                          placeholder="Phone*"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={editForm.email}
                          onChange={handleEditChange}
                        />
                        <textarea
                          name="address"
                          placeholder="Address"
                          value={editForm.address}
                          onChange={handleEditChange}
                        />
                        <div className="modal-actions">
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setEditModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-confirm"
                            disabled={editLoading}
                          >
                            {editLoading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {/* {showHistoryFor && (
                  <div style={{ marginTop: 32 }}>
                    <CustomersPurchaseHistory customerId={showHistoryFor} />
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                      <button
                        className="pagination-button"
                        onClick={() => setShowHistoryFor(null)}
                      >
                        Close History
                      </button>
                    </div>
                  </div>
                )} */}
              </>
            )}
          </div>
        </>
      )}
      {/* <h2>Customer List</h2> */}
    </div>
  );
};

export default CustomersList;
