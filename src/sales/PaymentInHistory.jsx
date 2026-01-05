import "./PaymentInHistory.css";
import { useState, useEffect } from "react";
import { BASE_URL } from "../Constants";

const PaymentInHistory = ({ onClose, partyId, paymentInHistoryResponse }) => {
  const [paymentInHistory, setPaymentInHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partyId) {
      fetchPaymentHistory();
    }
  }, [partyId]);

  const [paymentInHistoryItems, setPaymentInHistoryResponse] = useState(
    paymentInHistoryResponse ? paymentInHistoryResponse.paymentInHistoryItems : paymentInHistory
  );

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      // Replace with actual endpoint when available
      const response = await fetch(
        `${BASE_URL}/api/payment-history?partyId=${partyId}`
      );
      const data = await response.json();
      setPaymentInHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setPaymentInHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "-";
    }
  };

  const calculateTotal = () => {
    return paymentInHistory.reduce(
      (sum, item) => sum + (parseFloat(item.linkedAmount) || 0),
      0
    );
  };

  return (
    <div className="payment-in-history-overlay">
      <div className="payment-in-history-modal">
        {/* Header */}
        <div className="payment-in-history-header">
          <h2>Payment History</h2>
          <button
            type="button"
            className="payment-in-history-close-icon"
            onClick={onClose}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="payment-in-history-body">
          <div className="payment-in-history-table-wrapper">
            <table className="payment-in-history-table">
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>Ref No</th>
                  <th>Transaction Type</th>
                  <th>Linked Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="payment-in-history-loading">
                      Loading...
                    </td>
                  </tr>
                ) : paymentInHistoryItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="payment-in-history-no-data">
                      No payment history found
                    </td>
                  </tr>
                ) : (
                  paymentInHistoryItems.map((item, index) => (
                    <tr key={index}>
                      <td>{formatDate(item.transactionDate)}</td>
                      <td>{item.referenceNumber || "-"}</td>
                      <td>{item.transactionType || "SALE"}</td>
                      <td className="payment-in-history-amount">
                        {item.linkedAmount || "0"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          {paymentInHistory.length > 0 && (
            <div className="payment-in-history-total">
              Total: {calculateTotal()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="payment-in-history-footer">
          <button
            className="payment-in-history-close-btn"
            onClick={onClose}
            type="button"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentInHistory;