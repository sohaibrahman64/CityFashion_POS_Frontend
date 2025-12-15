import { BASE_URL, GET_ALL_PAYMENT_TYPES } from "../Constants";
import PartiesDropdown from "../parties/PartiesDropdown";
import "./AddPaymentIn.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const AddPaymentIn = ({ onClose }) => {
  const navigate = useNavigate();
  const [partyName, setPartyName] = useState("");
  const [partyOpeningBalance, setPartyOpeningBalance] = useState(null);
  const [partyUpdatedBalance, setPartyUpdatedBalance] = useState(null);
  const [partyPhone, setPartyPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [partyId, setPartyId] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    partyName: "",
    paymentType: "",
    paymentRecieptNumber: "0000",
    paymentDate: "",
    paymentReceivedAmount: 0.0,
    paymentDescription: "",
  });

  const getAllPaymentTypes = () => {
    fetch(`${BASE_URL}/${GET_ALL_PAYMENT_TYPES}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPayments(data);
        // Set default Payment Type if data exists
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            paymentType: data[0].paymentMode,
            paymentTypeId: data[0].id,
          }));
        }
      })
      .catch((error) => console.error("Error fetching Payment types:", error));
  };

  useEffect(() => {
    getAllPaymentTypes();
  }, []);

  const handlePaymentTypeChange = (e) => {
    const value = e.target.value;
    const selected = payments.find((payment) => payment.paymentMode === value);
    setFormData((prev) => ({
        ...prev,
        paymentType: value,
        paymentTypeId: selected ? selected.id : "",
    }))
  };

  const handlePartySelect = (party) => {
    setPartyName(party?.partyName || party?.name || "");
    setPartyPhone(party?.phoneNumber || "");
    setPartyOpeningBalance(party?.openingBalance || "");
    setPartyUpdatedBalance(party?.updatedBalance || "");
    setBillingAddress(party?.billingAddress || "");
    setShippingAddress(party?.shippingAddress || "");
    setPartyId(party?.id || null);
  };

  return (
    <div className="add-payment-in-overlay">
      <div className="add-payment-in-modal">
        {/* Header */}
        <div className="add-payment-in-header">
          <h2>Payment-In</h2>
          <button
            type="button"
            className="add-payment-in-close-icon-button"
            title="Close"
            onClick={() => {
              if (typeof onClose === "function") {
                onClose();
              } else {
                // Fallback: navigate back if no onClose handler provided
                navigate(-1);
              }
            }}
          >
            <svg
              width="20"
              height="20"
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
        {/* Form Fields */}
        <div className="add-payment-in-body">
          <div className="add-payment-in-form-group">
            <div className="add-payment-in-form-fields">
              <label className="add-payment-in-form-label-left">Party</label>
              <PartiesDropdown
                onPartySelect={handlePartySelect}
                selectedParty={selectedParty}
              />
              <label className="add-payment-in-balance-amount">
                Balance: {partyOpeningBalance ? partyOpeningBalance : 0.00}
              </label>
            </div>
            <div className="add-payment-in-form-fields add-payment-in-right-column">
              <label className="add-payment-in-form-label-right">Receipt</label>
              <label className="add-payment-in-receipt">00001</label>
            </div>
            <div className="add-payment-in-form-fields">
              <label className="add-payment-in-form-label-left">
                Payment Type
              </label>
              <select id="paymentType" name="paymentType" value={formData.paymentType} onChange={handlePaymentTypeChange}>
                {payments.map((payment) => (
                  <option key={payment.id} value={payments.paymentType}>
                    {payment.paymentMode}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-payment-in-form-fields add-payment-in-right-column">
              <label className="add-payment-in-form-label-right">Date</label>
              <input className="add-payment-in-form-date-input" type="date" />
            </div>
            <div className="add-payment-in-form-fields">
              <label className="add-payment-in-form-label-left">Received</label>
              <input
                className="add-payment-in-form-input"
                type="text"
                placeholder="Enter Received Amount"
              />
            </div>
            <div className="add-payment-in-form-fields add-payment-in-right-column">
              <label className="add-payment-in-form-label-right">
                Description
              </label>
              <textarea
                rows="4"
                cols="8"
                className="add-payment-in-form-input-textarea"
              />
            </div>
          </div>
        </div>
        <div className="add-payment-in-actions">
          <button className="add-payment-in-link-payment-button">
            Link To Payments
          </button>
          <button className="add-payment-in-payment-history-button">
            Payment History
          </button>
          <button className="save-button">Save</button>
        </div>
      </div>
    </div>
  );
};
export default AddPaymentIn;
