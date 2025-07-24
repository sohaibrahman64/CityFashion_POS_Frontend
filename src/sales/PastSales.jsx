import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PastSales.css"; // We'll style this later
import {
  BASE_URL,
  GET_PAST_INVOICES,
  GET_INVOICE_PRINT_RESPONSE,
  GET_ALL_CUSTOMERS,
  GET_ALL_PAYMENT_MODES,
} from "../Constants";
import InvoicePrint from "./InvoicePrint";

const PastSales = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    customerId: "",
    invoiceNumber: "",
    paymentModeId: "",
    paymentStatus: "",
  });

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${GET_ALL_CUSTOMERS}`);
        setCustomers(res.data);
      } catch (error) {
        console.error("Failed to load customers", error);
      }
    };

    const fetchPaymentModes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/${GET_ALL_PAYMENT_MODES}`);
        setPaymentModes(res.data);
      } catch (error) {
        console.error("Failed to load payment modes", error);
      }
    };

    fetchCustomers();
    fetchPaymentModes();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev, 
      [field]: value,
    }));
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/${GET_PAST_INVOICES}`);
      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      customerId: "",
      invoiceNumber: "",
      paymentModeId: "",
      paymentStatus: "",
    });
    setSales([]);
  };

  const handleViewInvoice = async (sale) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/${GET_INVOICE_PRINT_RESPONSE}/${sale.id}`
      );
      setSelectedInvoice(res.data);
    } catch (err) {
      console.error("Error fetching invoice:", err);
    }
  };

  // Client-side search filter (like CustomerList)
  const filteredSales = sales.filter((sale) => {
    const q = search.toLowerCase();
    return (
      sale.invoiceNumber?.toLowerCase().includes(q) ||
      sale.invoiceDate?.toLowerCase().includes(q) ||
      sale.customerName?.toLowerCase().includes(q) ||
      sale.paymentStatus?.toLowerCase().includes(q) ||
      (sale.paymentModeName?.toLowerCase().includes(q) || // if paymentModeName is present
        (paymentModes.find((pm) => pm.id === sale.paymentModeId)?.modeName?.toLowerCase().includes(q) ?? false))
    );
  });

  // Pagination logic
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on page size change
  };

  return (
    <div className="past-sales-container">
      {selectedInvoice ? (
        <div className="invoice-print-container">
          <button className="back-btn" onClick={() => setSelectedInvoice(null)}>
            ← Back to Sales List
          </button>
          <InvoicePrint invoice={selectedInvoice} />
        </div>
      ) : (
        <>
          <h2>Past Sales / Sales History</h2>
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <input
              type="text"
              placeholder="Search by date, invoice number, customer, payment mode, status..."
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
          <table className="sales-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.length > 0 ? (
                paginatedSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.invoiceNumber}</td>
                    <td>{sale.invoiceDate.split("T")[0]}</td>
                    <td>{sale.customerName}</td>
                    <td>₹{sale.totalAmount}</td>
                    <td>₹{sale.paidAmount}</td>
                    <td>₹{sale.dueAmount}</td>
                    <td>{sale.paymentStatus}</td>
                    <td>
                      <button
                        className="view-invoice-btn"
                        onClick={() => handleViewInvoice(sale)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
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
        </>
      )}
    </div>
  );
};

export default PastSales;
