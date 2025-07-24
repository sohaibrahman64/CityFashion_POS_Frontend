import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL, GET_PAST_INVOICES, GET_INVOICE_PRINT_RESPONSE } from "../Constants";
import "./CustomerPurchaseHistory.css";
import InvoicePrint from "../sales/InvoicePrint";

const CustomersPurchaseHistory = ({ customerId }) => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    invoiceNumber: "",
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const salesPerPage = 10;

  useEffect(() => {
    if (customerId) fetchSales();
    // eslint-disable-next-line
  }, [customerId]);

  const fetchSales = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        ...filters,
        customerId,
      };
      // Remove empty filters
      Object.keys(params).forEach((k) => (params[k] === "" ? delete params[k] : null));
      const res = await axios.get(`${BASE_URL}/${GET_PAST_INVOICES}`, { params });
      setSales(res.data);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to load purchase history.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    fetchSales();
  };

  const handleReset = () => {
    setFilters({ fromDate: "", toDate: "", invoiceNumber: "" });
    setSales([]);
  };

  // Pagination
  const totalPages = Math.ceil(sales.length / salesPerPage);
  const paginatedSales = sales.slice((currentPage - 1) * salesPerPage, currentPage * salesPerPage);

  const handleViewInvoice = async (sale) => {
    setInvoiceLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/${GET_INVOICE_PRINT_RESPONSE}/${sale.id}`);
      setSelectedInvoice(res.data);
    } catch (err) {
      alert("Failed to load invoice details.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="customer-purchase-history-container">
      {selectedInvoice ? (
        <div className="invoice-print-container">
          <button className="pagination-button" onClick={() => setSelectedInvoice(null)}>
            ← Back to Purchase History
          </button>
          <InvoicePrint invoice={selectedInvoice} />
        </div>
      ) : (
        <>
          <h2>Customer Purchase History</h2>
          <div className="filter-section">
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
            />
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="invoiceNumber"
              placeholder="Invoice Number"
              value={filters.invoiceNumber}
              onChange={handleFilterChange}
            />
            <button className="pagination-button" onClick={handleFilter}>
              Filter
            </button>
            <button className="pagination-button" onClick={handleReset}>
              Reset
            </button>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
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
                      <td>{sale.invoiceDate ? sale.invoiceDate.split("T")[0] : "-"}</td>
                      <td>₹{sale.totalAmount}</td>
                      <td>₹{sale.paidAmount}</td>
                      <td>₹{sale.dueAmount}</td>
                      <td>{sale.paymentStatus}</td>
                      <td>
                        <button
                          className="pagination-button"
                          onClick={() => handleViewInvoice(sale)}
                          disabled={invoiceLoading}
                        >
                          {invoiceLoading ? "Loading..." : "View"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ⬅ Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-button${currentPage === i + 1 ? ' pagination-active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next ➡
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomersPurchaseHistory;