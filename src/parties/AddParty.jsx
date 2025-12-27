import React, { useState, useEffect } from "react";
import "./AddParty.css";
import {
  BASE_URL,
  GET_ACTIVE_STATES,
  GET_ACTIVE_GST_TYPES,
  CREATE_PARTY,
  UPDATE_PARTY,
  CREATE_PARTY_TRANSACTION,
} from "../Constants";
import Toast from "../components/Toast";
import { TbNumber1Small } from "react-icons/tb";

const AddParty = ({ onClose, initialParty, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("gst");
  const [states, setStates] = useState([]);
  const [gstTypes, setGstTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  // helpers for date formatting
  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const ddmmyyyyToYYYYMMDD = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [dd, mm, yyyy] = ddmmyyyy.split("-");
    if (!dd || !mm || !yyyy) return "";
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    partyName: "",
    gstin: "",
    phoneNumber: "",
    gstType: "",
    gstTypeId: "",
    state: "",
    stateId: "",
    emailId: "",
    billingAddress: "",
    shippingAddress: "",
    enableShipping: false,
    // Credit & Balance fields
    openingBalance: "",
    asOfDate: formatDateToDDMMYYYY(new Date()),
    paymentType: "toPay",
    creditLimitType: "noLimit",
    customLimit: "",
  });

  // Prefill when initialParty is provided
  useEffect(() => {
    if (!initialParty) return;
    setFormData((prev) => ({
      ...prev,
      partyName: initialParty.partyName || initialParty.name || "",
      gstin: initialParty.gstin || "",
      phoneNumber: initialParty.phoneNumber || "",
      gstType: initialParty.gstType || prev.gstType,
      gstTypeId: initialParty.gstTypeId || prev.gstTypeId,
      state: initialParty.state || prev.state,
      stateId: initialParty.stateId || prev.stateId,
      emailId: initialParty.emailId || "",
      billingAddress: initialParty.billingAddress || "",
      shippingAddress: initialParty.shippingAddress || "",
      enableShipping: Boolean(initialParty.shippingAddress),
      openingBalance: String(
        initialParty.openingBalance ?? prev.openingBalance
      ),
      asOfDate: (() => {
        // backend might send yyyy-MM-dd or dd-mm-yyyy; normalize to dd-mm-yyyy
        const val = initialParty.asOfDate;
        if (!val) return prev.asOfDate;
        if (val.includes("-")) {
          const parts = val.split("-");
          if (parts[0].length === 4) {
            // yyyy-MM-dd -> dd-mm-yyyy
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          if (parts[0].length === 2) {
            return val; // already dd-mm-yyyy
          }
        }
        try {
          return formatDateToDDMMYYYY(new Date(val));
        } catch (_) {
          return prev.asOfDate;
        }
      })(),
      paymentType: initialParty.paymentType || prev.paymentType,
      creditLimitType: initialParty.creditLimitType || prev.creditLimitType,
      customLimit: String(initialParty.customLimit ?? prev.customLimit),
    }));
  }, [initialParty]);

  const handleAsOfDateChange = (e) => {
    // e.target.value is in yyyy-mm-dd -> convert to dd-mm-yyyy for storage
    const value = e.target.value; // yyyy-mm-dd
    if (!value) {
      setFormData((prev) => ({ ...prev, asOfDate: "" }));
      return;
    }
    const [yyyy, mm, dd] = value.split("-");
    const formatted = `${dd}-${mm}-${yyyy}`;
    setFormData((prev) => ({ ...prev, asOfDate: formatted }));
  };

  useEffect(() => {
    // Fetch States
    fetch(`${BASE_URL}/${GET_ACTIVE_STATES}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setStates(data);
        // Set default state if data exists
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            state: data[0].state,
            stateId: data[0].id,
          }));
        }
      })
      .catch((error) => console.error("Error fetching states:", error));

    // Fetch GST Types
    fetch(`${BASE_URL}/${GET_ACTIVE_GST_TYPES}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setGstTypes(data);
        // Set default GST type if data exists
        if (data && data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            gstType: data[0].gstType,
            gstTypeId: data[0].id,
          }));
        }
      })
      .catch((error) => console.error("Error fetching GST types:", error));
  }, []);

  const handleGstTypeChange = (e) => {
    const value = e.target.value;
    const selected = gstTypes.find((gt) => gt.gstType === value);
    setFormData((prev) => ({
      ...prev,
      gstType: value,
      gstTypeId: selected ? selected.id : "",
    }));
  };

  const handleStateChange = (e) => {
    const value = e.target.value;
    const selected = states.find((st) => st.state === value);
    setFormData((prev) => ({
      ...prev,
      state: value,
      stateId: selected ? selected.id : "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.partyName) {
      setToast({ message: "Please enter Party Name", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        asOfDate: ddmmyyyyToYYYYMMDD(formData.asOfDate),
      };
      const isEdit = Boolean(initialParty && initialParty.id);
      const url = isEdit
        ? `${BASE_URL}/${UPDATE_PARTY}/${initialParty.id}`
        : `${BASE_URL}/${CREATE_PARTY}`;
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const partyData = await response.json();

      if (response.ok) {
        const successMsg = isEdit
          ? "Party updated successfully!"
          : "Party created successfully!";
        console.log(successMsg, partyData);
        setToast({ message: successMsg, type: "success" });
        // Call onSuccess callback to refresh the parties list in parent component
        if (onSuccess) {
          onSuccess();
          await createPartyTransaction(partyData, onSuccess);
        }
        setTimeout(() => {
          onClose(); // Close the modal after showing success message
        }, 1500);
      } else {
        console.error("Error saving party:", partyData);
        setToast({
          message: "Failed to save party. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving party:", error);
      setToast({
        message: "An error occurred while saving party. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNew = async () => {
    // Validate required fields
    if (!formData.partyName) {
      setToast({ message: "Please enter Party Name", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        asOfDate: ddmmyyyyToYYYYMMDD(formData.asOfDate),
      };
      const response = await fetch(`${BASE_URL}/${CREATE_PARTY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const partyData = await response.json();

      if (response.ok) {
        console.log("Party created successfully:", partyData);
        setToast({ message: "Party created successfully!", type: "success" });

        // Call onSuccess callback to refresh the parties list in parent component
        if (onSuccess) {
          onSuccess();
          await createPartyTransaction(partyData, onSuccess);
        }

        // Reset form and keep modal open
        setFormData({
          partyName: "",
          gstin: "",
          phoneNumber: "",
          gstType: gstTypes.length > 0 ? gstTypes[0].gstType : "",
          gstTypeId: gstTypes.length > 0 ? gstTypes[0].id : "",
          state: states.length > 0 ? states[0].state : "",
          stateId: states.length > 0 ? states[0].id : "",
          emailId: "",
          billingAddress: "",
          shippingAddress: "",
          enableShipping: false,
          openingBalance: "",
          asOfDate: formatDateToDDMMYYYY(new Date()),
          paymentType: "toPay",
          creditLimitType: "noLimit",
          customLimit: "",
        });
      } else {
        console.error("Error creating party:", partyData);
        setToast({
          message: "Failed to create party. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating party:", error);
      setToast({
        message: "An error occurred while creating party. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPartyTransaction = async (partyData, onSuccess) => {
    try {
          const payload = {
            partyId: partyData.id,
            partyName: partyData.partyName,
            partyPhone: partyData.phoneNumber,
            invoiceId: null,
            invoiceNumber: null,
            partyTotal: partyData.openingBalance ? partyData.openingBalance : partyData.openingBalance === 0 ? 0 : null,
            partyBalance: partyData.updatedBalance ? partyData.updatedBalance : partyData.updatedBalance === 0 ? 0 : null,
            transactionType: partyData.paymentType ? partyData.paymentType === "toReceive" ? "RECEIVABLE_OPENING_BALANCE" : partyData.paymentType === "toPay" ? "PAYABLE_OPENING_BALANCE" : "OTHER" : "NA",
            referenceId: null,
            referenceType: partyData.paymentType ? partyData.paymentType === "toReceive" ? "RECEIVABLE_OPENING_BALANCE" : partyData.paymentType === "toPay" ? "PAYABLE_OPENING_BALANCE" : "OTHER" : "NA",
            referenceNumber: null,
            description: partyData.paymentType ? partyData.paymentType === "toReceive" ? "Receivable Opening Balance" : partyData.paymentType === "toPay" ? "Payable Opening Balance" : "Other" : "NA",
            transactionDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            date: new Date().toISOString(),
            createdBy: "SYSTEM",
            updatedBy: "SYSTEM",
            status: onSuccess ? partyData.paymentType === "toReceive" ? "RECEIVABLE_OPENING_BALANCE" : partyData.paymentType === "toPay" ? "PAYABLE_OPENING_BALANCE" : "OTHER" : "NA",
          };
    
          const response = await fetch(`${BASE_URL}/${CREATE_PARTY_TRANSACTION}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
    
          if (!response.ok) {
            const txt = await response.text();
            console.error("Failed to create party transaction", txt);
          }
        } catch (err) {
          console.error("Error creating party transaction:", err);
        }

  };

  return (
    <div className="add-party-overlay">
      <div className="add-party-modal">
        {/* Header */}
        <div className="add-party-header">
          <h2>{initialParty ? "Edit Party" : "Add Party"}</h2>
          <div className="add-party-header-actions">
            <button className="add-party-icon-button" title="Settings">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m21 0a2 2 0 0 0-2-2h-3m-5 0H3a2 2 0 0 0-2 2m11 0v3a2 2 0 0 1-2 2h-3m-5 0a2 2 0 0 1-2-2v-3"></path>
              </svg>
            </button>
            <button
              className="add-party-icon-button"
              onClick={onClose}
              title="Close"
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
        </div>

        <form onSubmit={handleSubmit}>
          {/* Party Details Section */}
          <div className="add-party-details-section">
            <div className="add-party-form-row">
              <div className="add-party-form-group">
                <label htmlFor="partyName">
                  Party Name <span className="add-party-required">*</span>
                </label>
                <input
                  type="text"
                  id="partyName"
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="add-party-form-group">
                <label htmlFor="gstin">
                  GSTIN
                  <span
                    className="add-party-info-icon"
                    title="GST Identification Number"
                  >
                    ℹ️
                  </span>
                </label>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-party-form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="add-party-tab-navigation">
            <button
              type="button"
              className={`add-party-tab-button ${
                activeTab === "gst" ? "active" : ""
              }`}
              onClick={() => setActiveTab("gst")}
            >
              GST & Address
            </button>
            <button
              type="button"
              className={`add-party-tab-button ${
                activeTab === "credit" ? "active" : ""
              }`}
              onClick={() => setActiveTab("credit")}
            >
              Credit & Balance
              <span className="add-party-badge-new">New</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="add-party-tab-content">
            {activeTab === "gst" && (
              <div className="add-party-gst-address-content">
                <div className="add-party-form-columns">
                  <div className="add-party-form-column">
                    <div className="add-party-form-group">
                      <label htmlFor="gstType">GST Type</label>
                      <select
                        id="gstType"
                        name="gstType"
                        value={formData.gstType}
                        onChange={handleGstTypeChange}
                      >
                        {gstTypes.map((gstType) => (
                          <option key={gstType.id} value={gstType.gstType}>
                            {gstType.gstType}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="add-party-form-group">
                      <label htmlFor="state">State</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleStateChange}
                      >
                        {states.map((state) => (
                          <option key={state.id} value={state.state}>
                            {state.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="add-party-form-group">
                      <label htmlFor="emailId">Email ID</label>
                      <input
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="add-party-form-column">
                    <div className="add-party-form-group">
                      <label htmlFor="billingAddress">Billing Address</label>
                      <textarea
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        rows="4"
                      />
                    </div>

                    {!formData.enableShipping && (
                      <button
                        type="button"
                        className="add-party-enable-shipping-link"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            enableShipping: true,
                          }))
                        }
                      >
                        + Enable Shipping Address
                      </button>
                    )}

                    {formData.enableShipping && (
                      <div className="add-party-form-group">
                        <label htmlFor="shippingAddress">
                          Shipping Address
                        </label>
                        <textarea
                          id="shippingAddress"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          rows="4"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "credit" && (
              <div className="add-party-credit-balance-content">
                <div className="add-party-credit-form">
                  <div className="add-party-credit-row">
                    <div className="add-party-form-group">
                      <label htmlFor="openingBalance">Opening Balance</label>
                      <input
                        type="number"
                        id="openingBalance"
                        name="openingBalance"
                        value={formData.openingBalance}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="add-party-form-group">
                      <label htmlFor="asOfDate">As Of Date</label>
                      <input
                        type="date"
                        id="asOfDate"
                        name="asOfDate"
                        value={ddmmyyyyToYYYYMMDD(formData.asOfDate)}
                        onChange={handleAsOfDateChange}
                      />
                    </div>
                  </div>

                  <div className="add-party-payment-type-section">
                    <label className="add-party-section-label">
                      Payment Type
                    </label>
                    <div className="add-party-radio-group">
                      <label className="add-party-radio-label">
                        <input
                          type="radio"
                          name="paymentType"
                          value="toPay"
                          checked={formData.paymentType === "toPay"}
                          onChange={handleInputChange}
                          className="add-party-radio-input"
                        />
                        <span className="add-party-radio-custom to-pay">
                          To Pay
                        </span>
                      </label>
                      <label className="add-party-radio-label">
                        <input
                          type="radio"
                          name="paymentType"
                          value="toReceive"
                          checked={formData.paymentType === "toReceive"}
                          onChange={handleInputChange}
                          className="add-party-radio-input"
                        />
                        <span className="add-party-radio-custom to-receive">
                          To Receive
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="add-party-credit-limit-section">
                    <div className="add-party-credit-limit-header">
                      <label className="add-party-section-label">
                        Credit Limit
                        <span
                          className="add-party-info-icon"
                          title="Credit limit for this party"
                        >
                          ℹ️
                        </span>
                      </label>
                    </div>

                    <div className="add-party-credit-toggle-container">
                      <div className="add-party-credit-toggle-wrapper">
                        <label className="add-party-toggle-switch-label">
                          <input
                            type="checkbox"
                            checked={formData.creditLimitType === "customLimit"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                creditLimitType: e.target.checked
                                  ? "customLimit"
                                  : "noLimit",
                              }))
                            }
                            className="add-party-toggle-checkbox"
                          />
                          <span className="add-party-toggle-slider"></span>
                        </label>
                        <span className="add-party-toggle-label-text">
                          {formData.creditLimitType === "noLimit"
                            ? "No Limit"
                            : "Custom Limit"}
                        </span>
                      </div>
                    </div>

                    {formData.creditLimitType === "customLimit" && (
                      <div
                        className="add-party-form-group"
                        style={{ marginTop: "16px" }}
                      >
                        <input
                          type="number"
                          name="customLimit"
                          value={formData.customLimit}
                          onChange={handleInputChange}
                          placeholder="Enter custom limit"
                          className="add-party-custom-limit-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="add-party-additional-fields-content">
                <p>Additional Fields content will go here...</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="add-party-modal-footer">
            <button
              type="button"
              className="add-party-btn-close"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </button>
            <button
              type="button"
              className="add-party-btn-save-new"
              onClick={handleSaveAndNew}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save & New"}
            </button>
            <button
              type="submit"
              className="add-party-btn-save"
              disabled={loading}
            >
              {loading ? "Saving..." : initialParty ? "Update Party" : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AddParty;
