import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PurchaseHistory.css";
import { BASE_URL, GET_PURCHASE_HISTORY, GET_ALL_PAYMENT_MODES } from "../Constants";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewPurchase, setViewPurchase] = useState(null);

  useEffect(() => {
    fetchPurchases();
    fetchPaymentModes();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/${GET_PURCHASE_HISTORY}`);
      console.log(res.data);
      setPurchases(res.data);
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    }
  };

  const fetchPaymentModes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/${GET_ALL_PAYMENT_MODES}`);
      setPaymentModes(res.data);
    } catch (err) {
      console.error("Failed to fetch payment modes", err);
    }
  };

  // Search filter
  const filteredPurchases = purchases.filter((purchase) => {
    const q = search.toLowerCase();
    const paymentModeName = paymentModes.find(pm => pm.id === purchase.paymentType)?.modeName || "";
    const itemsString = (purchase.items || [])
      .map(item => item.productName || item.product?.name || "")
      .join(", ");
    return (
      purchase.billNumber?.toLowerCase().includes(q) ||
      purchase.purchaseDate?.toLowerCase().includes(q) ||
      paymentModeName.toLowerCase().includes(q) ||
      itemsString.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const totalItems = filteredPurchases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIdx, endIdx);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Helper to calculate discount and tax amounts
  const getDiscountAmount = (item) => {
    const qty = item.quantity || 0;
    const price = item.pricePerUnit || 0;
    const taxPercent = item.taxPercent ?? item.tax ?? 0;
    const discountPercent = item.discountPercent ?? item.discount ?? 0;
    const priceWithTax = price + (taxPercent / 100) * price;
    const subtotal = priceWithTax * qty;
    return ((discountPercent / 100) * subtotal).toFixed(2);
  };
  const getTaxAmount = (item) => {
    const qty = item.quantity || 0;
    const price = item.pricePerUnit || 0;
    const taxPercent = item.taxPercent ?? item.tax ?? 0;
    return ((taxPercent / 100) * price * qty).toFixed(2);
  };

  return (
    <div className="purchase-history-container">
      <h2>Purchase History</h2>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by bill number, date, payment mode, product items..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="purchase-search-bar"
        />
      </div>
      <table className="purchase-history-table">
        <thead>
          <tr>
            <th>Bill Number</th>
            <th>Purchase Date</th>
            <th>Payment Mode</th>
            <th>Product Items</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPurchases.length > 0 ? (
            paginatedPurchases.map((purchase) => {
              //const paymentModeName = paymentModes.find(pm => pm.id === purchase.paymentModeName)?.modeName || "";
              const paymentModeName = purchase.paymentMode;
              const itemsString = (purchase.items || [])
                .map(item => item.productName || item.product?.name || "")
                .join(", ");
              return (
                <tr key={purchase.id}>
                  <td>{purchase.billNumber}</td>
                  <td>{purchase.purchaseDate?.split("T")[0]}</td>
                  <td>{paymentModeName}</td>
                  <td>{itemsString}</td>
                  <td>₹{purchase.totalAmount?.toFixed ? purchase.totalAmount.toFixed(2) : purchase.totalAmount}</td>
                  <td>
                    <button className="purchase-action-btn view-btn" title="View" onClick={() => setViewPurchase(purchase)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/></svg>
                    </button>
                    <button className="purchase-action-btn edit-btn" title="Edit" onClick={() => { /* TODO: Edit logic */ }}>
                      <span role="img" aria-label="Edit">✏️</span>
                    </button>
                    <button className="purchase-action-btn delete-btn" title="Delete" onClick={() => { /* TODO: Delete logic */ }}>
                      <span role="img" aria-label="Delete">🗑️</span>
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="purchase-pagination-controls">
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
      {viewPurchase && (
        <div className="purchase-modal-overlay">
          <div className="purchase-modal">
            <button className="purchase-modal-close" onClick={() => setViewPurchase(null)}>&times;</button>
            <h3>Purchase Details</h3>
            <table className="purchase-modal-table">
              <thead>
                <tr>
                  <th rowSpan="2">Product Name</th>
                  <th rowSpan="2">Quantity</th>
                  <th rowSpan="2">Price Per Unit</th>
                  <th colSpan="2">Discount</th>
                  <th colSpan="2">Tax</th>
                  <th rowSpan="2">Total Price</th>
                </tr>
                <tr>
                  <th>%</th>
                  <th>Amount</th>
                  <th>%</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(viewPurchase.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName || item.product?.name || ""}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.pricePerUnit?.toFixed ? item.pricePerUnit.toFixed(2) : item.pricePerUnit}</td>
                    <td>{item.discountPercent ?? item.discount ?? 0}</td>
                    <td>₹{getDiscountAmount(item)}</td>
                    <td>{item.taxPercent ?? item.tax ?? 0}</td>
                    <td>₹{getTaxAmount(item)}</td>
                    <td>₹{item.totalPrice?.toFixed ? item.totalPrice.toFixed(2) : item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;