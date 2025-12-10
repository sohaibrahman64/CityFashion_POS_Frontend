import "./NewProformaInvoicePreview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

const NewProformaInvoicePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const proformaInvoiceData = location.state?.proformaInvoiceData || {};
  // State for editable company info
  const [companyName, setCompanyName] = useState("My Company");
  const [companyPhone, setCompanyPhone] = useState("My Phone");
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState("My Company");
  const [tempCompanyPhone, setTempCompanyPhone] = useState("9870253518");
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const proformaInvoicePreviewRef = useRef(null);

  // Function to formate number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const items = proformaInvoiceData.items || [];
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
      if (!proformaInvoicePreviewRef.current) {
        console.error("Proforma Invoice preview element not found");
        alert("Proforma Invoice preview not found. Please try again.");
        return;
      }

      // Clone the estimate quotation preview element to avoid modifying the original
      const element = proformaInvoicePreviewRef.current.cloneNode(true);

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
        filename: `Proforma_Invoice_${
          proformaInvoiceData.customerName || "Customer"
        }_${
          proformaInvoiceData.proformaInvoiceNumber ||
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
          .new-proforma-invoice-preview-content-section {
            font-size: 10px !important;
            line-height: 1.1 !important;
          }
          .new-proforma-invoice-paper {
            page-break-after: avoid !important;
            padding: 0 !important;
          }
          .new-proforma-invoice-header-grid {
            margin-bottom: 4px !important;
          }
          .new-proforma-invoice-company-info {
            line-height: 1.2 !important;
          }
          .new-proforma-invoice-items-table,
          .new-proforma-invoice-tax-summary-table {
            font-size: 8px !important;
            page-break-inside: avoid !important;
          }
          .new-proforma-invoice-items-table th,
          .new-proforma-invoice-items-table td {
            padding: 2px 3px !important;
            line-height: 1 !important;
          }
          .new-proforma-invoice-tax-summary-table th,
          .new-proforma-invoice-tax-summary-table td {
            padding: 1px 2px !important;
            line-height: 1 !important;
          }
          .new-proforma-invoice-total-row {
            font-size: 8px !important;
          }
          .new-proforma-invoice-items-table-wrapper {
            margin: 4px 0 !important;
          }
          .new-proforma-invoice-footer-sections {
            page-break-inside: avoid !important;
            margin-top: 2px !important;
            font-size: 9px !important;
          }
          .new-proforma-invoice-terms-section,
          .new-proforma-invoice-sign-section {
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
    <div className="new-proforma-invoice-preview-container">
      <div className="new-proforma-invoice-preview-header-section">
        <div className="new-proforma-invoice-preview-header-left">
          <span className="new-proforma-invoice-preview-header-left-label">
            Proforma Invoice Preview
          </span>
        </div>
        <div className="new-proforma-invoice-preview-header-right">
          <button
            className="new-proforma-invoice-preview-download-button"
            onClick={generateAndDownloadPDF}
          >
            <span className="new-proforma-invoice-preview-download-button-label">
              Download
            </span>
          </button>
          <button
            className="new-proforma-invoice-preview-header-right-button"
            onClick={() => navigate("/sales/proforma")}
          >
            <span className="new-proforma-invoice-preview-header-right-button-label">
              Save And Close
            </span>
          </button>
        </div>
      </div>
      <div
        className="new-proforma-invoice-preview-content-section"
        ref={proformaInvoicePreviewRef}
      >
        <div className="new-proforma-invoice-tax-title">
          Proforma Invoice
        </div>
        <div className="new-proforma-invoice-paper">
          <div className="new-proforma-invoice-header-grid">
            <div className="new-proforma-invoice-company-block">
              <div
                className="new-proforma-invoice-company-logo"
                onClick={handleLogoClick}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="new-proforma-invoice-logo-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ cursor: "pointer" }}>LOGO</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="new-proforma-invoice-company-info">
                {isEditingCompanyName ? (
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    onKeyPress={handleCompanyNameKeyPress}
                    onBlur={handleCompanyNameBlur}
                    className="new-proforma-invoice-company-name-input"
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
                    className="new-proforma-invoice-company-name"
                    onClick={handleCompanyNameClick}
                    style={{ cursor: "pointer" }}
                  >
                    {companyName}
                  </div>
                )}
                {isEditingCompanyPhone ? (
                  <input
                    type="text"
                    value={tempCompanyPhone}
                    onChange={(e) => setTempCompanyPhone(e.target.value)}
                    onKeyPress={handleCompanyPhoneKeyPress}
                    onBlur={handleCompanyPhoneBlur}
                    className="new-proforma-invoice-company-phone-input"
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
                    className="new-proforma-invoice-company-phone"
                    onClick={handleCompanyPhoneClick}
                    style={{ cursor: "pointer" }}
                  >
                    Phone: {companyPhone}
                  </div>
                )}
              </div>
            </div>
            <div className="new-bill-proforma-invoice-grid">
              <div className="new-proforma-invoice-bill-to">
                <div className="new-proforma-invoice-section-title">
                  Proforma Invoice For:
                </div>
                <div className="new-proforma-invoice-bill-name">
                  {proformaInvoiceData.partyName || "Customer Name"}
                </div>
                <div className="new-proforma-invoice-bill-address">
                  {proformaInvoiceData.partyPhone || "Contact No."}
                </div>
                <div className="new-proforma-invoice-bill-state">
                  State: 27-Maharashtra
                </div>
              </div>
              <div className="new-proforma-invoice-details">
                <div className="new-proforma-invoice-section-title">
                  Proforma Invoice Details:
                </div>
                <div className="new-proforma-invoice-detail-row">
                  <span>No:</span>
                  <span>
                    {proformaInvoiceData.proformaInvoiceNumber || "N/A"}
                  </span>
                </div>
                <div className="new-proforma-invoice-detail-row">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="new-proforma-invoice-detail-row">
                  <span>Place Of Supply:</span>
                  <span>27-Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="new-proforma-invoice-items-table-wrapper">
            <table className="new-proforma-invoice-items-table">
              <thead>
                <tr>
                  <th className="new-proforma-invoice-col-serial">#</th>
                  <th className="new-proforma-invoice-col-name">Item name</th>
                  <th className="new-proforma-invoice-col-qty">Quantity</th>
                  <th className="new-proforma-invoice-col-unit">Unit</th>
                  <th className="new-proforma-invoice-col-price">
                    Price/ Unit(₹)
                  </th>
                  <th className="new-proforma-invoice-col-discount">
                    Discount(₹)
                  </th>
                  <th className="new-proforma-invoice-col-gst">GST(₹)</th>
                  <th className="new-proforma-invoice-col-amount">
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
                <tr className="new-proforma-invoice-total-row">
                  {/* Merge first 4 columns for "Total" label */}
                  <td colSpan="2">Total</td>

                  {/* Quantity total */}
                  <td className="new-proforma-invoice-ta-left">
                    {proformaInvoiceData.totalQuantity}
                  </td>

                  {/* Price/Unit column left blank */}
                  <td></td>

                  {/* Price/Unit column left blank */}
                  <td className="new-proforma-invoice-ta-right"></td>

                  {/* Discount total */}
                  <td className="new-proforma-invoice-ta-right">
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
                  <td className="new-proforma-invoice-ta-right">
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
                  <td className="new-proforma-invoice-ta-right">
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
                    colSpan="8"
                    className="new-proforma-invoice-no-padding-cell"
                  >
                    <div className="new-proforma-invoice-tax-summary-wrapper">
                      <div className="new-proforma-invoice-tax-summary-title">
                        Tax Summary:
                      </div>
                      <table className="new-proforma-invoice-tax-summary-table">
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
                                    className="new-proforma-invoice-ts-col-hsn"
                                  >
                                    HSN/ SAC
                                  </th>
                                  <th
                                    rowSpan="2"
                                    className="new-proforma-invoice-ts-col-taxable"
                                  >
                                    Taxable amount (₹)
                                  </th>
                                  {hasIGST ? (
                                    <th
                                      colSpan="2"
                                      className="new-proforma-invoice-ts-col-igst"
                                    >
                                      IGST
                                    </th>
                                  ) : (
                                    <>
                                      <th
                                        colSpan="2"
                                        className="new-proforma-invoice-ts-col-cgst"
                                      >
                                        CGST
                                      </th>
                                      <th
                                        colSpan="2"
                                        className="new-proforma-invoice-ts-col-sgst"
                                      >
                                        SGST
                                      </th>
                                    </>
                                  )}
                                  <th
                                    rowSpan="2"
                                    className="new-proforma-invoice-ts-col-total"
                                  >
                                    Total Tax (₹)
                                  </th>
                                </tr>
                                <tr>
                                  {hasIGST ? (
                                    <>
                                      <th className="new-proforma-invoice-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-proforma-invoice-ts-col-amt">
                                        Amt (₹)
                                      </th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="new-proforma-invoice-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-proforma-invoice-ts-col-amt">
                                        Amt (₹)
                                      </th>
                                      <th className="new-proforma-invoice-ts-col-rate">
                                        Rate (%)
                                      </th>
                                      <th className="new-proforma-invoice-ts-col-amt">
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
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-proforma-invoice-ta-center">
                                          {group.taxPercent.toFixed(2)}
                                        </td>
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-proforma-invoice-ta-right">
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
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-proforma-invoice-ta-center">
                                          {cgstRate}
                                        </td>
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(cgstAmount)}
                                        </td>
                                        <td className="new-proforma-invoice-ta-center">
                                          {sgstRate}
                                        </td>
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(sgstAmount)}
                                        </td>
                                        <td className="new-proforma-invoice-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                })}
                                <tr className="new-proforma-invoice-total-row">
                                  <td className="new-proforma-invoice-ta-center">
                                    TOTAL
                                  </td>
                                  <td className="new-proforma-invoice-ta-right">
                                    {formatNumberWithCommas(
                                      grandTotalTaxable.toFixed(2)
                                    )}
                                  </td>
                                  {hasIGST ? (
                                    <>
                                      <td className="new-proforma-invoice-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-proforma-invoice-ta-right">
                                        {formatNumberWithCommas(
                                          grandTotalTax.toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="new-proforma-invoice-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-proforma-invoice-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                      <td className="new-proforma-invoice-ta-center">
                                        &nbsp;
                                      </td>
                                      <td className="new-proforma-invoice-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  )}
                                  <td className="new-proforma-invoice-ta-right">
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
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="new-proforma-invoice-footer-sections">
            <div className="new-proforma-invoice-terms-section">
              <div className="new-proforma-invoice-terms-title">
                Terms & Conditions:
              </div>
              <div className="new-proforma-invoice-terms-body">
                Thanks for doing business with us!
              </div>
            </div>
            <div className="new-proforma-invoice-sign-section">
              <div className="new-proforma-invoice-company-box">
                <div className="new-proforma-invoice-company-box-title">
                  For {companyName}:
                </div>
              </div>
              <div className="new-proforma-invoice-sign-box">
                <div className="new-proforma-invoice-signatory-text">
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

export default NewProformaInvoicePreview;
