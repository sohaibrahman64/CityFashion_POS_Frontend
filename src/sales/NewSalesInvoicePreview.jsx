import "./NewSalesInvoicePreview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FiEdit } from "react-icons/fi";

const NewSalesInvoicePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state?.invoice || {};

  // State for editable company info
  const [companyName, setCompanyName] = useState("Company Name");
  const [companyPhone, setCompanyPhone] = useState("Company Phone");
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState("Company Name");
  const [tempCompanyPhone, setTempCompanyPhone] = useState("Company Phone");
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const invoicePreviewRef = useRef(null);

  // Function to format number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertChunk = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertChunk(n % 100) : '');
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertChunk(crore) + ' Crore ';
    if (lakh > 0) result += convertChunk(lakh) + ' Lakh ';
    if (thousand > 0) result += convertChunk(thousand) + ' Thousand ';
    if (remainder > 0) result += convertChunk(remainder);

    return result.trim() + ' Rupees Only';
  };

  // Get items from invoice data
  const items = invoiceData.items || [];
  const validItems = items.filter((item) => item.itemName && item.itemName.trim() !== "");

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
      if (!invoicePreviewRef.current) {
        console.error("Invoice preview element not found");
        alert("Invoice preview not found. Please try again.");
        return;
      }

      // Clone the invoice preview element to avoid modifying the original
      const element = invoicePreviewRef.current.cloneNode(true);

      // Remove edit icons from the cloned element
      const editIcons = element.querySelectorAll('.new-sales-invoice-preview-edit-icon, .new-sales-invoice-preview-edit-icon-logo');
      editIcons.forEach(icon => icon.remove());

      // Remove any elements that shouldn't be in the PDF (like edit indicators)
      const editableElements = element.querySelectorAll('[style*="cursor: pointer"]');
      editableElements.forEach(el => {
        el.style.cursor = 'default';
      });

      // Configure PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${invoiceData.customerName || "Customer"}_${invoiceData.invoiceNumber || new Date().toISOString().split("T")[0]
          }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();

      console.log("PDF generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };
  return (
    <div className="new-sales-invoice-preview-container">
      <div className="new-sales-invoice-preview-header-section">
        <div className="new-sales-invoice-preview-header-left">
          <span className="new-sales-invoice-preview-header-left-label">
            Invoice Preview
          </span>
        </div>
        <div className="new-sales-invoice-preview-header-right">
          <button
            className="new-sales-invoice-preview-download-button"
            onClick={generateAndDownloadPDF}
          >
            <span className="new-sales-invoice-preview-download-button-label">
              Download
            </span>
          </button>
          <button
            className="new-sales-invoice-preview-header-right-button"
            onClick={() => navigate("/sales")}
          >
            <span className="new-sales-invoice-preview-header-right-button-label">
              Save And Close
            </span>
          </button>
        </div>
      </div>
      <div
        className="new-sales-invoice-preview-content-section"
        ref={invoicePreviewRef}
      >
        <div className="new-sales-invoice-preview-tax-invoice-title">Tax Invoice</div>
        <div className="new-sales-invoice-preview-invoice-paper">
          <div className="new-sales-invoice-preview-invoice-header-grid">
            <div className="new-sales-invoice-preview-company-block">
              <div className="new-sales-invoice-preview-company-logo" onClick={handleLogoClick}>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="new-sales-invoice-preview-logo-image"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ cursor: "pointer" }}>LOGO</span>
                )}
                <FiEdit className="new-sales-invoice-preview-edit-icon-logo" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="new-sales-invoice-preview-company-info">
                {isEditingCompanyName ? (
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    onKeyPress={handleCompanyNameKeyPress}
                    onBlur={handleCompanyNameBlur}
                    className="new-sales-invoice-preview-company-name-input"
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
                    className="new-sales-invoice-preview-company-name"
                    onClick={handleCompanyNameClick}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    {companyName}
                    <FiEdit className="new-sales-invoice-preview-edit-icon" />
                  </div>
                )}
                {isEditingCompanyPhone ? (
                  <input
                    type="text"
                    value={tempCompanyPhone}
                    onChange={(e) => setTempCompanyPhone(e.target.value)}
                    onKeyPress={handleCompanyPhoneKeyPress}
                    onBlur={handleCompanyPhoneBlur}
                    className="new-sales-invoice-preview-company-phone-input"
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
                    className="new-sales-invoice-preview-company-phone"
                    onClick={handleCompanyPhoneClick}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    Phone: {companyPhone}
                    <FiEdit className="new-sales-invoice-preview-edit-icon" />
                  </div>
                )}
              </div>
            </div>
            <div className="new-sales-invoice-preview-bill-invoice-grid">
              <div className="new-sales-invoice-preview-bill-to">
                <div className="new-sales-invoice-preview-section-title">Bill To:</div>
                <div className="new-sales-invoice-preview-bill-name">
                  {invoiceData.partyName || "Customer Name"}
                </div>
                <div className="new-sales-invoice-preview-bill-address">
                  {invoiceData.partyPhone || "Contact No."}
                </div>
                <div className="new-sales-invoice-preview-bill-state">State: 27-Maharashtra</div>
              </div>
              <div className="new-sales-invoice-preview-invoice-details">
                <div className="new-sales-invoice-preview-section-title">Invoice Details:</div>
                <div className="new-sales-invoice-preview-detail-row">
                  <span>No:</span>
                  <span>{invoiceData.invoiceNumber || "N/A"}</span>
                </div>
                <div className="new-sales-invoice-preview-detail-row">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="new-sales-invoice-preview-detail-row">
                  <span>Place Of Supply:</span>
                  <span>27-Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="new-sales-invoice-preview-items-table-wrapper">
            <table className="new-sales-invoice-preview-items-table">
              <thead>
                <tr>
                  <th className="new-sales-invoice-preview-col-serial">#</th>
                  <th className="new-sales-invoice-preview-col-name">Item name</th>
                  <th className="new-sales-invoice-preview-col-hsn">HSN/ SAC</th>
                  <th className="new-sales-invoice-preview-col-qty">Quantity</th>
                  <th className="new-sales-invoice-preview-col-price">Price/ Unit(₹)</th>
                  <th className="new-sales-invoice-preview-col-discount">Discount(₹)</th>
                  <th className="new-sales-invoice-preview-col-gst">GST(₹)</th>
                  <th className="new-sales-invoice-preview-col-amount">Amount(₹)</th>
                </tr>
              </thead>
              <tbody>
                {validItems.map((item, index) => (
                  <tr key={index}>
                    <td className="new-sales-invoice-preview-ta-center">{index + 1}</td>
                    <td>{item.itemName}</td>
                    <td className="new-sales-invoice-preview-ta-center">{item.hsnCode || ""}</td>
                    <td className="new-sales-invoice-preview-ta-center">{item.quantity || "0"}</td>
                    <td className="new-sales-invoice-preview-ta-right">
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.price || 0).toFixed(2)
                      )}
                    </td>
                    <td className="new-sales-invoice-preview-ta-right">
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
                    <td className="new-sales-invoice-preview-ta-right">
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.taxAmount || 0).toFixed(2)
                      )}{" "}
                      ({item.taxPercent ? `${item.taxPercent}%` : "0%"})
                    </td>
                    <td className="new-sales-invoice-preview-ta-right">
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(item.total || 0).toFixed(2)
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="new-sales-invoice-preview-total-row">
                  <td colSpan="3" className="new-sales-invoice-preview-ta-left">Total</td>
                  <td className="new-sales-invoice-preview-ta-center">
                    {validItems.reduce(
                      (sum, item) => sum + parseFloat(item.quantity || 0),
                      0
                    )}
                  </td>
                  <td className="new-sales-invoice-preview-ta-right"></td>
                  <td className="new-sales-invoice-preview-ta-right">
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
                  <td className="new-sales-invoice-preview-ta-right">
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
                  <td className="new-sales-invoice-preview-ta-right">
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
                  <td colSpan="5" className="new-sales-invoice-preview-no-padding-cell new-sales-invoice-preview-tax-summary-cell">
                    <div className="new-sales-invoice-preview-tax-summary-wrapper">
                      <div className="new-sales-invoice-preview-tax-summary-title">Tax Summary:</div>
                      <table className="new-sales-invoice-preview-tax-summary-table">
                        <thead>
                          {(() => {
                            // Check if any item has IGST
                            const hasIGST = validItems.some(
                              (item) => item.isIGST
                            );

                            return (
                              <>
                                <tr>
                                  <th rowSpan="2" className="new-sales-invoice-preview-ts-col-hsn">
                                    HSN/ SAC
                                  </th>
                                  <th rowSpan="2" className="new-sales-invoice-preview-ts-col-taxable">
                                    Taxable amount (₹)
                                  </th>
                                  {hasIGST ? (
                                    <th colSpan="2" className="new-sales-invoice-preview-ts-col-igst">
                                      IGST
                                    </th>
                                  ) : (
                                    <>
                                      <th colSpan="2" className="new-sales-invoice-preview-ts-col-cgst">
                                        CGST
                                      </th>
                                      <th colSpan="2" className="new-sales-invoice-preview-ts-col-sgst">
                                        SGST
                                      </th>
                                    </>
                                  )}
                                  <th rowSpan="2" className="new-sales-invoice-preview-ts-col-total">
                                    Total Tax (₹)
                                  </th>
                                </tr>
                                <tr>
                                  {hasIGST ? (
                                    <>
                                      <th className="new-sales-invoice-preview-ts-col-rate">Rate (%)</th>
                                      <th className="new-sales-invoice-preview-ts-col-amt">Amt (₹)</th>
                                    </>
                                  ) : (
                                    <>
                                      <th className="new-sales-invoice-preview-ts-col-rate">Rate (%)</th>
                                      <th className="new-sales-invoice-preview-ts-col-amt">Amt (₹)</th>
                                      <th className="new-sales-invoice-preview-ts-col-rate">Rate (%)</th>
                                      <th className="new-sales-invoice-preview-ts-col-amt">Amt (₹)</th>
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
                              const groupKey = `${taxPercent}_${isIGST ? "IGST" : "GST"
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
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-center">
                                          {group.taxPercent.toFixed(2)}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-right">
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
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(
                                            group.taxableAmount.toFixed(2)
                                          )}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-center">
                                          {cgstRate}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(cgstAmount)}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-center">
                                          {sgstRate}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(sgstAmount)}
                                        </td>
                                        <td className="new-sales-invoice-preview-ta-right">
                                          {formatNumberWithCommas(
                                            group.totalTax.toFixed(2)
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                })}
                                <tr className="new-sales-invoice-preview-total-row">
                                  <td className="new-sales-invoice-preview-ta-center">TOTAL</td>
                                  <td className="new-sales-invoice-preview-ta-right">
                                    {formatNumberWithCommas(
                                      grandTotalTaxable.toFixed(2)
                                    )}
                                  </td>
                                  {hasIGST ? (
                                    <>
                                      <td className="new-sales-invoice-preview-ta-center">&nbsp;</td>
                                      <td className="new-sales-invoice-preview-ta-right">
                                        {formatNumberWithCommas(
                                          grandTotalTax.toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="new-sales-invoice-preview-ta-center">&nbsp;</td>
                                      <td className="new-sales-invoice-preview-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                      <td className="new-sales-invoice-preview-ta-center">&nbsp;</td>
                                      <td className="new-sales-invoice-preview-ta-right">
                                        {formatNumberWithCommas(
                                          (grandTotalTax / 2).toFixed(2)
                                        )}
                                      </td>
                                    </>
                                  )}
                                  <td className="new-sales-invoice-preview-ta-right">
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
                  <td colSpan="3" className="new-sales-invoice-no-padding-cell new-sales-invoice-preview-totals-summary-cell">
                    <div className="new-sales-invoice-preview-totals-summary-wrapper">
                      <table className="new-sales-invoice-preview-totals-summary-table">
                        <tbody>
                          <tr>
                            <td className="new-sales-invoice-preview-totals-label">Sub Total</td>
                            <td className="new-sales-invoice-preview-totals-separator">:</td>
                            <td className="new-sales-invoice-preview-totals-value">
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
                            <td className="new-sales-invoice-preview-totals-label">Round Off</td>
                            <td className="new-sales-invoice-preview-totals-separator">:</td>
                            <td className="new-sales-invoice-preview-totals-value">
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
                          <tr className="new-sales-invoice-preview-totals-final-row">
                            <td className="new-sales-invoice-preview-totals-label">Total</td>
                            <td className="new-sales-invoice-preview-totals-separator">:</td>
                            <td className="new-sales-invoice-preview-totals-value">
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
                          <tr className="new-sales-invoice-preview-totals-words-row">
                            <td colSpan="3" className="new-sales-invoice-preview-totals-words">
                              <strong>Invoice Amount In Words:</strong>
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
                          <tr className="new-sales-invoice-preview-totals-extra-row">
                            <td colSpan="3" className="new-sales-invoice-preview-totals-extra-cell">
                              <div className="new-sales-invoice-preview-totals-extra-container">
                                <div className="new-sales-invoice-preview-totals-extra-item">
                                  <span className="new-sales-invoice-preview-totals-extra-label">Received</span>
                                  <span className="new-sales-invoice-preview-totals-extra-separator">:</span>
                                  <span className="new-sales-invoice-preview-totals-extra-value">
                                    ₹ {formatNumberWithCommas(
                                      (invoiceData.receivedAmount || 0).toFixed(2)
                                    )}
                                  </span>
                                </div>
                                <div className="new-sales-invoice-preview-totals-extra-item">
                                  <span className="new-sales-invoice-preview-totals-extra-label">Balance</span>
                                  <span className="new-sales-invoice-preview-totals-extra-separator">:</span>
                                  <span className="new-sales-invoice-preview-totals-extra-value">
                                    ₹ {formatNumberWithCommas(
                                      Math.max(
                                        0,
                                        Math.round(
                                          validItems.reduce(
                                            (sum, item) => sum + parseFloat(item.total || 0),
                                            0
                                          )
                                        ) - (invoiceData.receivedAmount || 0)
                                      ).toFixed(2)
                                    )}
                                  </span>
                                </div>
                                <div className="new-sales-invoice-preview-totals-extra-item">
                                  <span className="new-sales-invoice-preview-totals-extra-label">You Saved</span>
                                  <span className="new-sales-invoice-preview-totals-extra-separator">:</span>
                                  <span className="new-sales-invoice-preview-totals-extra-value">
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
          <div className="new-sales-invoice-preview-footer-sections">
            <div className="new-sales-invoice-preview-terms-section">
              <div className="new-sales-invoice-preview-terms-title">Terms & Conditions:</div>
              <div className="new-sales-invoice-preview-terms-body">
                Thanks for doing business with us!
              </div>
            </div>
            <div className="new-sales-invoice-preview-sign-section">
              <div className="new-sales-invoice-preview-sign-box">
                <div className="new-sales-invoice-preview-company-box-title">For {companyName}:</div>
                <div className="new-sales-invoice-preview-signatory-text">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSalesInvoicePreview;
