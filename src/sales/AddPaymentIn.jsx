import {
  BASE_URL,
  GET_ALL_PAYMENT_TYPES,
  GET_PAYMENT_IN_RECEIPT_NUMBER,
  CREATE_PAYMENT_IN,
} from "../Constants";
import PartiesDropdown from "../parties/PartiesDropdown";
import "./AddPaymentIn.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";


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
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [formData, setFormData] = useState({
    partyName: "",
    partyId: "",
    partyOpeningBalance: 0,
    partyUpdatedBalance: 0,
    paymentTypeId: 1,
    receiptNumber: "0000",
    receivedDate: "",
    receivedAmount: 0.0,
    description: "",
  });

  const [receiptNumber, setReceiptNumber] = useState([]);

  const fetchReceiptNumber = () => {
    fetch(`${BASE_URL}/${GET_PAYMENT_IN_RECEIPT_NUMBER}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setReceiptNumber(data.receiptNumber || "00001");
        setFormData((prev) => ({
          ...prev,
          receiptNumber: data.receiptNumber,
        }));
      })
      .catch((error) =>
        console.error("Error fetching Payment Receipt Number:", error)
      );
  };

  const getAllPaymentTypes = () => {
    fetch(`${BASE_URL}/${GET_ALL_PAYMENT_TYPES}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Set default Payment Type if data exists
        if (data && data.length > 0) {
          setPaymentTypes(data);
          setFormData((prev) => ({
            ...prev,
            paymentType: data[0].paymentType,
            paymentTypeId: data[0].id,
          }));
        }
      })
      .catch((error) => console.error("Error fetching Payment types:", error));
  };

  useEffect(() => {
    fetchReceiptNumber();
  }, []);

  useEffect(() => {
    getAllPaymentTypes();
  }, []);

  const handlePaymentTypeChange = (e) => {
    const value = e.target.value;
    const selected = paymentTypes.find(
      (payment) => payment.paymentType === value
    );
    setFormData((prev) => ({
      ...prev,
      paymentType: value,
      paymentTypeId: selected ? selected.id : "",
    }));
  };

  const handlePartySelect = (party) => {
    setPartyName(party?.partyName || party?.name || "");
    setPartyPhone(party?.phoneNumber || "");
    setPartyOpeningBalance(party?.openingBalance || "");
    setPartyUpdatedBalance(party?.updatedBalance || "");
    setBillingAddress(party?.billingAddress || "");
    setShippingAddress(party?.shippingAddress || "");
    setPartyId(party?.id || null);
    setSelectedParty(party);
    setFormData((prev) => ({
      ...prev,
      partyId: party?.id,
      partyName: party?.partyName,
      partyOpeningBalance: party?.openingBalance,
      partyUpdatedBalance: party?.updatedBalance,
    }));
  };

  const getCurrentDate = () => {
    const today = new Date();
    const currentDate = today.toLocaleDateString("en-CA");
    return currentDate;
  };

  const incrementReceiptNumber = (currentReceiptNumber) => {
    // Handle alphanumeric estimate numbers like "RS-00012"
    const match = currentReceiptNumber.match(/^([A-Z]+)-(\d+)$/);

    if (match) {
      const prefix = match[1]; // "PI"
      const numberPart = parseInt(match[2], 10); // 12
      const nextNumber = numberPart + 1;

      // Format the number part with leading zeros (minimum 5 digits)
      const formattedNumber = nextNumber.toString().padStart(5, "0");
      return `${prefix}-${formattedNumber}`;
    }

    // Fallback: if format doesn't match, just increment as number
    if (!isNaN(currentReceiptNumber)) {
      return parseInt(currentReceiptNumber, 10) + 1;
    }

    // Default fallback
    return "00001";
  };

  const handleReceivedAmountChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      receivedAmount: value,
    }));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      receivedDate: value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        partyId: formData.partyId,
        partyName: formData.partyName,
        partyOpeningBalance: formData.partyOpeningBalance,
        partyUpdatedBalance: formData.partyUpdatedBalance,
        receiptNumber: formData.receiptNumber,
        receivedAmount: formData.receivedAmount,
        paymentTypeId: formData.paymentTypeId,
        receivedDate: formData.receivedDate,
        description: formData.description,
      };

      const response = await fetch(`${BASE_URL}/${CREATE_PAYMENT_IN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Payment recorded successfully");
        setToastMessage("Proforma Invoice created successfully!");
        setToastType("success");
        setShowToast(true);
        setFormData({
          partyName: "",
          partyId: "",
          partyOpeningBalance: 0.0,
          partyUpdatedBalance: 0.0,
          paymentTypeId: 1,
          receiptNumber: "0000",
          receivedDate: "",
          receivedAmount: 0.0,
          description: "",
        });
        setReceiptNumber((prevNumber) => incrementReceiptNumber(prevNumber));
        setTimeout(() => {
          navigate("/sales/payment-in/preview", {
            state: { paymentInData: data },
          });
        }, 2500);
      } else {
        console.error("Failed to create estimate");
        setToastMessage("Failed to create estimate. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
      setToastMessage(
        "Error creating estimate. Please check your connection and try again."
      );
      setToastType("error");
      setShowToast(true);
    }
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
                Balance: {formData.partyUpdatedBalance ? formData.partyUpdatedBalance : 0.0}
              </label>
            </div>
            <div className="add-payment-in-form-fields add-payment-in-right-column">
              <label className="add-payment-in-form-label-right">Receipt</label>
              <label className="add-payment-in-receipt">{receiptNumber}</label>
            </div>
            <div className="add-payment-in-form-fields">
              <label className="add-payment-in-form-label-left">
                Payment Type
              </label>
              <select
                className="add-payment-in-form-select"
                id="paymentType"
                name="paymentType"
                value={formData.paymentType}
                onChange={handlePaymentTypeChange}
              >
                {paymentTypes.map((payment) => (
                  <option key={payment.id} value={paymentTypes.paymentType}>
                    {payment.paymentType}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-payment-in-form-fields add-payment-in-right-column">
              <label className="add-payment-in-form-label-right">Date</label>
              <input
                value={getCurrentDate()}
                className="add-payment-in-form-date-input"
                type="date"
                onChange={handleDateChange}
              />
            </div>
            <div className="add-payment-in-form-fields">
              <label className="add-payment-in-form-label-left">
                Received Amount
              </label>
              <input
                className="add-payment-in-form-input"
                type="number"
                onChange={handleReceivedAmountChange}
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
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
        </div>
        <div className="add-payment-in-actions">
          <button className="add-payment-in-link-payment-button" type="button">
            Link Payments To Invoice
          </button>
          <button
            className="add-payment-in-payment-history-button"
            type="button"
          >
            Payment History
          </button>
          <button className="save-button" type="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default AddPaymentIn;
