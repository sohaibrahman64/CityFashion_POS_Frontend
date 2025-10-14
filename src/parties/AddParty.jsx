import React, { useState } from "react";
import "./AddParty.css";

const AddParty = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("gst");
  const [formData, setFormData] = useState({
    partyName: "Monish",
    gstin: "",
    phoneNumber: "9923536215",
    gstType: "Unregistered/Consumer",
    state: "Maharashtra",
    emailId: "sohaib.rahman64@gmail.com",
    billingAddress: "XYZ ABC",
    shippingAddress: "",
    enableShipping: false,
    // Credit & Balance fields
    openingBalance: "25000",
    asOfDate: "17/08/2025",
    paymentType: "toPay",
    creditLimitType: "noLimit",
    customLimit: "",
    // Additional Fields
    additionalField1: { enabled: false, name: "", type: "text" },
    additionalField2: { enabled: false, name: "", type: "text" },
    additionalField3: { enabled: false, name: "", type: "text" },
    additionalField4: { enabled: false, name: "", type: "date" },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdditionalFieldChange = (fieldNumber, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [`additionalField${fieldNumber}`]: {
        ...prev[`additionalField${fieldNumber}`],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission logic here
  };

  const handleSaveAndNew = () => {
    console.log("Save & New clicked");
    // Reset form and keep modal open
    setFormData({
      partyName: "",
      gstin: "",
      phoneNumber: "",
      gstType: "Unregistered/Consumer",
      state: "Maharashtra",
      emailId: "",
      billingAddress: "",
      shippingAddress: "",
      enableShipping: false,
      openingBalance: "",
      asOfDate: "",
      paymentType: "toPay",
      creditLimitType: "noLimit",
      customLimit: "",
      additionalField1: { enabled: false, name: "", type: "text" },
      additionalField2: { enabled: false, name: "", type: "text" },
      additionalField3: { enabled: false, name: "", type: "text" },
      additionalField4: { enabled: false, name: "", type: "date" },
    });
  };

  return (
    <div className="add-party-overlay">
      <div className="add-party-modal">
        {/* Header */}
        <div className="add-party-header">
          <h2>Add Party</h2>
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
            <button
              type="button"
              className={`add-party-tab-button ${
                activeTab === "additional" ? "active" : ""
              }`}
              onClick={() => setActiveTab("additional")}
            >
              Additional Fields
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
                        onChange={handleInputChange}
                      >
                        <option value="Unregistered/Consumer">
                          Unregistered/Consumer
                        </option>
                        <option value="Registered">Registered</option>
                        <option value="Composition">Composition</option>
                      </select>
                    </div>

                    <div className="add-party-form-group">
                      <label htmlFor="state">State</label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Delhi">Delhi</option>
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
                        value={formData.asOfDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="add-party-payment-type-section">
                    <label className="add-party-section-label">Payment Type</label>
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
                        <span className="add-party-radio-custom to-pay">To Pay</span>
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
                        <span className="add-party-radio-custom to-receive">To Receive</span>
                      </label>
                    </div>
                  </div>

                  <div className="add-party-credit-limit-section">
                    <div className="add-party-credit-limit-header">
                      <label className="add-party-section-label">
                        Credit Limit
                        <span className="add-party-info-icon" title="Credit limit for this party">
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
                                creditLimitType: e.target.checked ? "customLimit" : "noLimit",
                              }))
                            }
                            className="add-party-toggle-checkbox"
                          />
                          <span className="add-party-toggle-slider"></span>
                        </label>
                        <span className="add-party-toggle-label-text">
                          {formData.creditLimitType === "noLimit" ? "No Limit" : "Custom Limit"}
                        </span>
                      </div>
                    </div>

                    {formData.creditLimitType === "customLimit" && (
                      <div className="add-party-form-group" style={{ marginTop: "16px" }}>
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
                <div className="add-party-additional-fields-form">
                  {/* Additional Field 1 */}
                  <div className="add-party-additional-field-row">
                    <input
                      type="checkbox"
                      checked={formData.additionalField1.enabled}
                      onChange={(e) =>
                        handleAdditionalFieldChange(1, "enabled", e.target.checked)
                      }
                      className="add-party-additional-checkbox"
                    />
                    <input
                      type="text"
                      placeholder="Additional Field 1 Name"
                      value={formData.additionalField1.name}
                      onChange={(e) =>
                        handleAdditionalFieldChange(1, "name", e.target.value)
                      }
                      className="add-party-additional-input"
                    />
                  </div>

                  {/* Additional Field 2 */}
                  <div className="add-party-additional-field-row">
                    <input
                      type="checkbox"
                      checked={formData.additionalField2.enabled}
                      onChange={(e) =>
                        handleAdditionalFieldChange(2, "enabled", e.target.checked)
                      }
                      className="add-party-additional-checkbox"
                    />
                    <input
                      type="text"
                      placeholder="Additional Field 2 Name"
                      value={formData.additionalField2.name}
                      onChange={(e) =>
                        handleAdditionalFieldChange(2, "name", e.target.value)
                      }
                      className="add-party-additional-input"
                    />
                  </div>

                  {/* Additional Field 3 */}
                  <div className="add-party-additional-field-row">
                    <input
                      type="checkbox"
                      checked={formData.additionalField3.enabled}
                      onChange={(e) =>
                        handleAdditionalFieldChange(3, "enabled", e.target.checked)
                      }
                      className="add-party-additional-checkbox"
                    />
                    <input
                      type="text"
                      placeholder="Additional Field 3 Name"
                      value={formData.additionalField3.name}
                      onChange={(e) =>
                        handleAdditionalFieldChange(3, "name", e.target.value)
                      }
                      className="add-party-additional-input"
                    />
                  </div>

                  {/* Additional Field 4 */}
                  <div className="add-party-additional-field-row">
                    <input
                      type="checkbox"
                      checked={formData.additionalField4.enabled}
                      onChange={(e) =>
                        handleAdditionalFieldChange(4, "enabled", e.target.checked)
                      }
                      className="add-party-additional-checkbox"
                    />
                    <input
                      type="text"
                      placeholder="Additional Field 4 Name"
                      value={formData.additionalField4.name}
                      onChange={(e) =>
                        handleAdditionalFieldChange(4, "name", e.target.value)
                      }
                      className="add-party-additional-input"
                    />
                    <div className="add-party-date-picker-wrapper">
                      <input
                        type="date"
                        className="add-party-date-picker"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="add-party-modal-footer">
            <button
              type="button"
              className="add-party-btn-save-new"
              onClick={handleSaveAndNew}
            >
              Save & New
            </button>
            <button type="submit" className="add-party-btn-save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParty;
