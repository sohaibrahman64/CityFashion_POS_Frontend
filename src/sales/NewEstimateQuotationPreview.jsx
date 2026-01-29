import "./NewEstimateQuotationPreview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FiEdit } from "react-icons/fi";

const NewEstimateQuotationPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const estimateQuotationData = location.state?.estimateQuotationData || {};
  // State for editable company info
  const [companyName, setCompanyName] = useState("My Company");
  const [companyPhone, setCompanyPhone] = useState("My Phone");
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState("My Company");
  const [tempCompanyPhone, setTempCompanyPhone] = useState("9870253518");
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const estimateQuotationPreviewRef = useRef(null);

  // Function to formate number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    if (!num || num === 0) return "Zero Rupees Only";
    const single = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const double = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const formatTens = (n) => n < 10 ? single[n] : n >= 10 && n < 20 ? double[n - 10] : tens[Math.floor(n / 10)] + " " + single[n % 10];
    const formatHundreds = (n) => {
      if (n > 99) return single[Math.floor(n / 100)] + " Hundred " + formatTens(n % 100);
      return formatTens(n);
    };
    let str = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = num;
    if (crore > 0) str += formatHundreds(crore) + " Crore ";
    if (lakh > 0) str += formatHundreds(lakh) + " Lakh ";
    if (thousand > 0) str += formatHundreds(thousand) + " Thousand ";
    if (hundred > 0) str += formatHundreds(hundred);
    return str.trim() + " Rupees Only";
  };

  const items = estimateQuotationData.items || [];
  const validItems = items.filter(
    (item) => item.itemName && item.itemName.trim() !== ""
  );

  // Handlers for company name editing
  const handleCompanyNameClick = () => {
    setIsEditingCompanyName(true);
    setTempCompanyName(companyName);
  };

  const handleCompanyNameKeyPress = (e) => {
    if (e.key === "Enter") {
      setCompanyName(tempCompanyName);
      setIsEditingCompanyName(false);
    } else if (e.key === "Escape") {
      setTempCompanyName(companyName);
      setIsEditingCompanyName(false);
    }
  };

  const handleCompanyNameBlur = () => {
    setCompanyName(tempCompanyName);
    setIsEditingCompanyName(false);
  };

  // Handlers for company phone editing
  const handleCompanyPhoneClick = () => {
    setIsEditingCompanyPhone(true);
    setTempCompanyPhone(companyPhone);
  };

  const handleCompanyPhoneKeyPress = (e) => {
    if (e.key === "Enter") {
      setCompanyPhone(tempCompanyPhone);
      setIsEditingCompanyPhone(false);
    } else if (e.key === "Escape") {
      setTempCompanyPhone(companyPhone);
      setIsEditingCompanyPhone(false);
    }
  };

  const handleCompanyPhoneBlur = () => {
    setCompanyPhone(tempCompanyPhone);
    setIsEditingCompanyPhone(false);
  };

  // Handlers for logo upload
  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to generate and download PDF
  const generateAndDownloadPDF = async () => {
    try {
      if (!estimateQuotationPreviewRef.current) {
        console.error("Estimate Quotation preview element not found");
        alert("Estimate quotation preview not found. Please try again.");
        return;
      }

      // Clone the estimate quotation preview element to avoid modifying the original
      const element = estimateQuotationPreviewRef.current.cloneNode(true);

      // Remove edit icons from the cloned element
      const editIcons = element.querySelectorAll('.new-estimate-quotation-edit-icon, .new-estimate-quotation-edit-icon-logo');
      editIcons.forEach(icon => icon.remove());

      // Remove any elements that shouldn't be in the PDF (like edit indicators)
      const editableElements = element.querySelectorAll(
        '[style*="cursor: pointer"]'
      );

      editableElements.forEach((el) => {
        el.style.cursor = "default";
      });

      // Configure PDF options with optimized settings for single page
      const opt = {
        margin: [5, 5, 5, 5], // Reduced margins to fit content
        filename: `Estimate_${
          estimateQuotationData.customerName || "Customer"
        }_${
          estimateQuotationData.estimateQuotationNumber ||
          new Date().toISOString().split("T")[0]
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      // Apply print-friendly styles before PDF generation to compress layout
      const styleSheet = document.createElement("style");
      styleSheet.innerHTML = `
        @media print {
          body { margin: 0; padding: 0; }
          .new-estimate-quotation-preview-content-section {
            font-size: 10px !important;
            line-height: 1.1 !important;
          }
          .new-estimate-quotation-paper {
            page-break-after: avoid !important;
            padding: 0 !important;
          }
          .new-estimate-quotation-header-grid {
            margin-bottom: 4px !important;
          }
          .new-estimate-quotation-company-info {
            line-height: 1.2 !important;
          }
          .new-estimate-quotation-items-table,
          .new-estimate-quotation-tax-summary-table {
            font-size: 8px !important;
            page-break-inside: avoid !important;
          }
          .new-estimate-quotation-items-table th,
          .new-estimate-quotation-items-table td {
            padding: 2px 3px !important;
            line-height: 1 !important;
          }
          .new-estimate-quotation-tax-summary-table th,
          .new-estimate-quotation-tax-summary-table td {
            padding: 1px 2px !important;
            line-height: 1 !important;
          }
          .new-estimate-quotation-total-row {
            font-size: 8px !important;
          }
          .new-estimate-quotation-items-table-wrapper {
            margin: 4px 0 !important;
          }
          .new-estimate-quotation-footer-sections {
            page-break-inside: avoid !important;
            margin-top: 2px !important;
            font-size: 9px !important;
          }
          .new-estimate-quotation-terms-section,
          .new-estimate-quotation-sign-section {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `;
      document.head.appendChild(styleSheet);

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();

      // Remove the style sheet after PDF generation
      document.head.removeChild(styleSheet);

      console.log("PDF generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  return (
    <div className="new-estimate-quotation-preview-container">
      <div className="new-estimate-quotation-preview-header-section">
        <div className="new-estimate-quotation-preview-header-left">
          <span className="new-estimate-quotation-preview-header-left-label">
            Estimate Quotation Preview
          </span>
        </div>
        <div className="new-estimate-quotation-preview-header-right">
          <button
            className="new-estimate-quotation-preview-download-button"
            onClick={generateAndDownloadPDF}
          >
            <span className="new-estimate-quotation-preview-download-button-label">
              Download
            </span>
          </button>
          <button
            className="new-estimate-quotation-preview-header-right-button"
            onClick={() => navigate("/sales/estimate")}
          >
            <span className="new-estimate-quotation-preview-header-right-button-label">
              Save And Close
            </span>
          </button>
        </div>
      </div>
      <div
        className="new-estimate-quotation-preview-content-section"
        ref={estimateQuotationPreviewRef}
      >
        <div className="new-estimate-quotation-tax-title">
          Estimate/Quotation
        </div>
        <div className="new-estimate-quotation-paper">
          <div className="new-estimate-quotation-header-grid">
            <div className="new-estimate-quotation-company-block">
              <div
                className="new-estimate-quotation-company-logo"
                onClick={handleLogoClick}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="new-estimate-quotation-logo-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ cursor: "pointer" }}>LOGO</span>
                )}
                <FiEdit className="new-estimate-quotation-edit-icon-logo" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="new-estimate-quotation-company-info">
                {isEditingCompanyName ? (
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    onKeyPress={handleCompanyNameKeyPress}
                    onBlur={handleCompanyNameBlur}
                    className="new-estimate-quotation-company-name-input"
                    autoFocus
                    style={{
                      border: "1px solid #4a90e2",
                      padding: "4px",
                      fontSize: "16px",
                      fontWeight: "600",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <div
                    className="new-estimate-quotation-company-name"
                    onClick={handleCompanyNameClick}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    {companyName}
                    <FiEdit className="new-estimate-quotation-edit-icon" />
                  </div>
                )}
                {isEditingCompanyPhone ? (
                  <input
                    type="text"
                    value={tempCompanyPhone}
                    onChange={(e) => setTempCompanyPhone(e.target.value)}
                    onKeyPress={handleCompanyPhoneKeyPress}
                    onBlur={handleCompanyPhoneBlur}
                    className="new-estimate-quotation-company-phone-input"
                    autoFocus
                    style={{
                      border: "1px solid #4a90e2",
                      padding: "4px",
                      fontSize: "14px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <div
                    className="new-estimate-quotation-company-phone"
                    onClick={handleCompanyPhoneClick}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    Phone: {companyPhone}
                    <FiEdit className="new-estimate-quotation-edit-icon" />
                  </div>
                )}
              </div>
            </div>
            <div className="new-bill-estimate-quotation-grid">
              <div className="new-estimate-quotation-bill-to">
                <div className="new-estimate-quotation-section-title">
                  Estimate For:
                </div>
                <div className="new-estimate-quotation-bill-name">
                  {estimateQuotationData.partyName || "Customer Name"}
                </div>
                <div className="new-estimate-quotation-bill-address">
                  {estimateQuotationData.partyPhone || "Contact No."}
                </div>
                <div className="new-estimate-quotation-bill-state">
                  State: 27-Maharashtra
                </div>
              </div>
              <div className="new-estimate-quotation-details">
                <div className="new-estimate-quotation-section-title">
                  Estimate Details:
                </div>
                <div className="new-estimate-quotation-detail-row">
                  <span>No:</span>
                  <span>
                    {estimateQuotationData.estimateQuotationNumber || "N/A"}
                  </span>
                </div>
                <div className="new-estimate-quotation-detail-row">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="new-estimate-quotation-detail-row">
                  <span>Place Of Supply:</span>
                  <span>27-Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="new-estimate-quotation-items-table-wrapper">
            <table className="new-estimate-quotation-items-table">
              <thead>
                <tr>
                  <th className="new-estimate-quotation-col-serial">#</th>
                  <th className="new-estimate-quotation-col-name">Item name</th>
                  <th className="new-estimate-quotation-col-qty">Quantity</th>
                  <th className="new-estimate-quotation-col-unit">Unit</th>
                  <th className="new-estimate-quotation-col-price">
                    Price/ Unit(₹)
                  </th>
                  <th className="new-estimate-quotation-col-discount">
                    Discount(₹)
                  </th>
                  <th className="new-estimate-quotation-col-gst">GST(₹)</th>
                  <th className="new-estimate-quotation-col-amount">
                    Amount(₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {validItems.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td>{item.quantity || "0"}</td>
                    <td>Pcs</td>
                    <td>
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.price || 0).toFixed(2)
                      )}
                    </td>
                    <td>
                      ₹{" "}
                      {formatNumberWithCommas(
                        (
                          (parseFloat(item.price || 0) *
                            parseFloat(item.quantity || 0) *
                            parseFloat(item.discount || 0)) /
                          100
                        ).toFixed(2)
                      )}{" "}
                      ({item.discount || 0}%)
                    </td>
                    <td>
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.taxAmount || 0).toFixed(2)
                      )}{" "}
                      ({item.taxPercent ? `${item.taxPercent}%` : "0%"})
                    </td>
                    <td>
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.total || 0).toFixed(2)
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="new-estimate-quotation-total-row">
                  {/* Merge first 4 columns for "Total" label */}
                  <td colSpan="2">Total</td>

                  {/* Quantity total */}
                  <td className="new-estimate-quotation-ta-left">
                    {estimateQuotationData.totalQuantity}
                  </td>

                  {/* Price/Unit column left blank */}
                  <td></td>

                  {/* Price/Unit column left blank */}
                  <td className="new-estimate-quotation-ta-right"></td>

                  {/* Discount total */}
                  <td className="new-estimate-quotation-ta-right">
                    ₹{" "}
                    {formatNumberWithCommas(
                      validItems
                        .reduce(
                          (sum, item) =>
                            sum +
                            (parseFloat(item.price || 0) *
                              parseFloat(item.quantity || 0) *
                              parseFloat(item.discount || 0)) /
                              100,
                          0
                        )
                        .toFixed(2)
                    )}
                  </td>

                  {/* GST total */}
                  <td className="new-estimate-quotation-ta-right">
                    ₹{" "}
                    {formatNumberWithCommas(
                      validItems
                        .reduce(
                          (sum, item) => sum + parseFloat(item.taxAmount || 0),
                          0
                        )
                        .toFixed(2)
                    )}
                  </td>

                  {/* Amount total */}
                  <td className="new-estimate-quotation-ta-right">
                    ₹{" "}
                    {formatNumberWithCommas(
                      validItems
                        .reduce(
                          (sum, item) => sum + parseFloat(item.total || 0),
                          0
                        )
                        .toFixed(2)
                    )}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="5"
                    className="new-estimate-quotation-no-padding-cell new-estimate-quotation-tax-summary-cell"
                  >
                    <div className="new-estimate-quotation-tax-summary-wrapper">
                      <div className="new-estimate-quotation-tax-summary-title">
                        Tax Summary:
                      </div>
                      <table className="new-estimate-quotation-tax-summary-table">
                        <thead>
                          {(() => {
                            // Check if any item has IGST
                            const hasIGST = validItems.some(
                              (item) => item.isIGST
                            );

                            return (
                              <>
                                <tr>
                                  <th
                                    rowSpan="2"
                                    className="new-estimate-quotation-ts-col-hsn"
                                  >
                                    HSN/ SAC
                                  </th>
                                  <th
                                    rowSpan="2"
                                    className="new-estimate-quotation-ts-col-taxable"
                                  >
                                    Taxable amount (₹)
                                  </th>
                                  {hasIGST ? (
                                    <th
                                      colSpan="2"
                                      className="new-estimate-quotation-ts-col-igst"
                                    >
                                      IGST
                                    </th>
                                  ) : (
                                    <>
                                      <th
                                        colSpan="2"
                                        className="new-estimate-quotation-ts-col-cgst"
                                      >
                                        CGST
                                      </th>
                                      <th
                                        colSpan="2"
                                        className="new-estimate-quotation-ts-col-sgst"
                                      >
                                        SGST
                                      </th>
                                    </>
                                  )}
                                  <th
                                    rowSpan="2"
                                    className="new-estimate-quotation-ts-col-total"
                                  >
                                    Total Tax (₹)
                                  </th>
                                </tr>
                                <tr>
                                  {hasIGST ? (
                                    <>
                                      <th className="new-estimate-quotation-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-estimate-quotation-ts-col-amt">
                                        Amt (₹)
                                      </th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="new-estimate-quotation-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-estimate-quotation-ts-col-amt">
                                        Amt (₹)
                                      </th>
                                      <th className="new-estimate-quotation-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-estimate-quotation-ts-col-amt">
                                        Amt (₹)
                                      </th>
                                    </>
                                  )}
                                </tr>
                              </>
                            );
                          })()}
                        </thead>
                        <tbody>
                          {(() => {
                            // Group items by tax rate and type (IGST vs CGST/SGST)
                            const taxGroups = {};
                            validItems.forEach((item) => {
                              const taxPercent = parseFloat(
                                item.taxPercent || 0
                              );
                              const taxAmount = parseFloat(item.taxAmount || 0);
                              const quantity = parseFloat(item.quantity || 0);
                              const price = parseFloat(item.price || 0);
                              const discountAmount = parseFloat(
                                item.discountAmount || 0
                              );
                              const subtotal = quantity * price;
                              const afterDiscount = subtotal - discountAmount;
                              const taxableAmount = afterDiscount - taxAmount;
                              const isIGST = item.isIGST || false;

                              // Create unique key combining tax rate and tax type
                              const groupKey = `${taxPercent}_${
                                isIGST ? "IGST" : "GST"
                              }`;

                              if (!taxGroups[groupKey]) {
                                taxGroups[groupKey] = {
                                  taxPercent: taxPercent,
                                  taxableAmount: 0,
                                  totalTax: 0,
                                  isIGST: isIGST,
                                };
                              }

                              taxGroups[groupKey].taxableAmount +=
                                taxableAmount;
                              taxGroups[groupKey].totalTax += taxAmount;
                            });

                            // Convert to array and sort by tax percent
                            const taxGroupsArray = Object.values(
                              taxGroups
                            ).sort((a, b) => a.taxPercent - b.taxPercent);

                            // Calculate totals
                            const grandTotalTaxable = taxGroupsArray.reduce(
                              (sum, group) => sum + group.taxableAmount,
                              0
                            );
                            const grandTotalTax = taxGroupsArray.reduce(
                              (sum, group) => sum + group.totalTax,
                              0
                            );

                            // Check if any item has IGST
                            const hasIGST = taxGroupsArray.some(
                              (group) => group.isIGST
                            );

                            return (
                              <>
                                {taxGroupsArray.map((group, index) => {
                                  if (group.isIGST) {
                                    // IGST row - single column for IGST
                                    return (
                                      <tr key={index}>
                                        <td></td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-estimate-quotation-ta-center">
                                          {group.taxPercent.toFixed(2)}
                                        </td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  } else {
                                    // CGST/SGST row - split columns
                                    const cgstRate = (
                                      group.taxPercent / 2
                                    ).toFixed(2);
                                    const sgstRate = (
                                      group.taxPercent / 2
                                    ).toFixed(2);
                                    const cgstAmount = (
                                      group.totalTax / 2
                                    ).toFixed(2);
                                    const sgstAmount = (
                                      group.totalTax / 2
                                    ).toFixed(2);

                                    return (
                                      <tr key={index}>
                                        <td></td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-estimate-quotation-ta-center">
                                          {cgstRate}
                                        </td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(cgstAmount)}
                                        </td>
                                        <td className="new-estimate-quotation-ta-center">
                                          {sgstRate}
                                        </td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(sgstAmount)}
                                        </td>
                                        <td className="new-estimate-quotation-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                })}
                                <tr className="new-estimate-quotation-total-row">
                                  <td className="new-estimate-quotation-ta-center">
                                    TOTAL
                                  </td>
                                  <td className="new-estimate-quotation-ta-right">
                                    {formatNumberWithCommas(
                                      grandTotalTaxable.toFixed(2)
                                    )}
                                  </td>
                                  {hasIGST ? (
                                    <>
                                      <td className="new-estimate-quotation-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-estimate-quotation-ta-right">
                                        {formatNumberWithCommas(
                                          grandTotalTax.toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="new-estimate-quotation-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-estimate-quotation-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                      <td className="new-estimate-quotation-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-estimate-quotation-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  )}
                                  <td className="new-estimate-quotation-ta-right">
                                    {formatNumberWithCommas(
                                      grandTotalTax.toFixed(2)
                                    )}
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </td>
                  <td
                    colSpan="3"
                    className="new-estimate-quotation-no-padding-cell new-estimate-quotation-totals-summary-cell"
                  >
                    <div className="new-estimate-quotation-totals-summary-wrapper">
                      <table className="new-estimate-quotation-totals-summary-table">
                        <tbody>
                          <tr>
                            <td className="new-estimate-quotation-totals-label">Sub Total</td>
                            <td className="new-estimate-quotation-totals-separator">:</td>
                            <td className="new-estimate-quotation-totals-value">
                              ₹{" "}
                              {formatNumberWithCommas(
                                validItems
                                  .reduce(
                                    (sum, item) => sum + parseFloat(item.total || 0),
                                    0
                                  )
                                  .toFixed(2)
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="new-estimate-quotation-totals-label">Round Off</td>
                            <td className="new-estimate-quotation-totals-separator">:</td>
                            <td className="new-estimate-quotation-totals-value">
                              - ₹{" "}
                              {(() => {
                                const subtotal = validItems.reduce(
                                  (sum, item) => sum + parseFloat(item.total || 0),
                                  0
                                );
                                const rounded = Math.round(subtotal);
                                const roundOff = subtotal - rounded;
                                return formatNumberWithCommas(Math.abs(roundOff).toFixed(2));
                              })()}
                            </td>
                          </tr>
                          <tr className="new-estimate-quotation-totals-final-row">
                            <td className="new-estimate-quotation-totals-label">Total</td>
                            <td className="new-estimate-quotation-totals-separator">:</td>
                            <td className="new-estimate-quotation-totals-value">
                              ₹{" "}
                              {formatNumberWithCommas(
                                Math.round(
                                  validItems.reduce(
                                    (sum, item) => sum + parseFloat(item.total || 0),
                                    0
                                  )
                                ).toFixed(2)
                              )}
                            </td>
                          </tr>
                          <tr className="new-estimate-quotation-totals-words-row">
                            <td colSpan="3" className="new-estimate-quotation-totals-words">
                              <strong>Estimate Amount In Words:</strong>
                              <br />
                              {numberToWords(
                                Math.round(
                                  validItems.reduce(
                                    (sum, item) => sum + parseFloat(item.total || 0),
                                    0
                                  )
                                )
                              )}
                            </td>
                          </tr>
                          <tr className="new-estimate-quotation-totals-extra-row">
                            <td colSpan="3" className="new-estimate-quotation-totals-extra-cell">
                              <div className="new-estimate-quotation-totals-extra-container">
                                <div className="new-estimate-quotation-totals-extra-item">
                                  <span className="new-estimate-quotation-totals-extra-label">You Saved</span>
                                  <span className="new-estimate-quotation-totals-extra-separator">:</span>
                                  <span className="new-estimate-quotation-totals-extra-value">
                                    ₹ {formatNumberWithCommas(
                                      validItems
                                        .reduce(
                                          (sum, item) =>
                                            sum +
                                            (parseFloat(item.price || 0) *
                                              parseFloat(item.quantity || 0) *
                                              parseFloat(item.discount || 0)) /
                                            100,
                                          0
                                        )
                                        .toFixed(2)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="new-estimate-quotation-footer-sections">
            <div className="new-estimate-quotation-terms-section">
              <div className="new-estimate-quotation-terms-title">
                Terms & Conditions:
              </div>
              <div className="new-estimate-quotation-terms-body">
                Thanks for doing business with us!
              </div>
            </div>
            <div className="new-estimate-quotation-sign-section">
              <div className="new-estimate-quotation-sign-box">
                <div className="new-estimate-quotation-company-box-title">
                  For {companyName}:
                </div>
                <div className="new-estimate-quotation-signatory-text">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewEstimateQuotationPreview;
