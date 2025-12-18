import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import "./NewPaymentInPreview.css";

const NewPaymentInPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const paymentInData = location.state?.paymentInData;

  // State for editable company info
  const [companyName, setCompanyName] = useState("My Company");
  const [companyPhone, setCompanyPhone] = useState("My Phone");
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
  const [tempCompanyName, setTempCompanyName] = useState("My Company");
  const [tempCompanyPhone, setTempCompanyPhone] = useState("9870253518");
  const [logoPreview, setLogoPreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const paymentInPreviewRef = useRef(null);

  // Function to formate number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to convert number to words
  const numberToWords = (num) => {
    if (num === 0) return "Zero";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertLessThanOneThousand = (n) => {
      if (n === 0) return "";

      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 !== 0 ? " " + convertLessThanOneThousand(n % 100) : "")
        );
    };

    const convert = (n) => {
      if (n === 0) return "Zero";

      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const remainder = n % 1000;

      let result = "";

      if (crore > 0) {
        result += convertLessThanOneThousand(crore) + " Crore ";
      }
      if (lakh > 0) {
        result += convertLessThanOneThousand(lakh) + " Lakh ";
      }
      if (thousand > 0) {
        result += convertLessThanOneThousand(thousand) + " Thousand ";
      }
      if (remainder > 0) {
        result += convertLessThanOneThousand(remainder);
      }

      return result.trim();
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = convert(rupees) + " Rupees";
    if (paise > 0) {
      result += " and " + convert(paise) + " Paisa";
    }
    result += " Only";

    return result;
  };

  const items = paymentInData.items || [];
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
      if (!paymentInPreviewRef.current) {
        console.error("Payment-In preview element not found");
        alert("Payment-In preview not found. Please try again.");
        return;
      }

      // Clone the estimate quotation preview element to avoid modifying the original
      const element = paymentInPreviewRef.current.cloneNode(true);

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
        filename: `Payment_In_${paymentInData.customerName || "Customer"}_${
          paymentInData.paymentInNumber ||
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
            .new-payment-in-preview-content-section {
              font-size: 10px !important;
              line-height: 1.1 !important;
            }
            .new-payment-in-paper {
              page-break-after: avoid !important;
              padding: 0 !important;
            }
            .new-payment-in-header-grid {
              margin-bottom: 4px !important;
            }
            .new-payment-in-company-info {
              line-height: 1.2 !important;
            }
            .new-payment-in-items-table,
            .new-payment-in-tax-summary-table {
              font-size: 8px !important;
              page-break-inside: avoid !important;
            }
            .new-payment-in-items-table th,
            .new-payment-in-items-table td {
              padding: 2px 3px !important;
              line-height: 1 !important;
            }
            .new-payment-in-tax-summary-table th,
            .new-payment-in-tax-summary-table td {
              padding: 1px 2px !important;
              line-height: 1 !important;
            }
            .new-payment-in-total-row {
              font-size: 8px !important;
            }
            .new-payment-in-items-table-wrapper {
              margin: 4px 0 !important;
            }
            .new-payment-in-footer-sections {
              page-break-inside: avoid !important;
              margin-top: 2px !important;
              font-size: 9px !important;
            }
            .new-payment-in-terms-section,
            .new-payment-in-sign-section {
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
    <div className="new-payment-in-preview-container">
      <div className="new-payment-in-preview-header-section">
        <div className="new-payment-in-preview-header-left">
          <span className="new-payment-in-preview-header-left-label">
            Payment-In Preview
          </span>
        </div>
        <div className="new-payment-in-preview-header-right">
          <button
            className="new-payment-in-preview-download-button"
            onClick={generateAndDownloadPDF}
          >
            <span className="new-payment-in-preview-download-button-label">
              Download
            </span>
          </button>
          <button
            className="new-payment-in-preview-header-right-button"
            onClick={() => navigate("/sales/payment-in")}
          >
            <span className="new-payment-in-preview-header-right-button-label">
              Save And Close
            </span>
          </button>
        </div>
      </div>
      <div
        className="new-payment-in-preview-content-section"
        ref={paymentInPreviewRef}
      >
        <div className="new-payment-in-tax-title">Payment Receipt</div>
        <div className="new-payment-in-paper">
          <div className="new-payment-in-header-grid">
            <div className="new-payment-in-company-block">
              <div
                className="new-payment-in-company-logo"
                onClick={handleLogoClick}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Company Logo"
                    className="new-payment-in-logo-image"
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
              <div className="new-payment-in-company-info">
                {isEditingCompanyName ? (
                  <input
                    type="text"
                    value={tempCompanyName}
                    onChange={(e) => setTempCompanyName(e.target.value)}
                    onKeyPress={handleCompanyNameKeyPress}
                    onBlur={handleCompanyNameBlur}
                    className="new-payment-in-company-name-input"
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
                    className="new-payment-in-company-name"
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
                    className="new-payment-in-company-phone-input"
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
                    className="new-payment-in-company-phone"
                    onClick={handleCompanyPhoneClick}
                    style={{ cursor: "pointer" }}
                  >
                    Phone: {companyPhone}
                  </div>
                )}
              </div>
            </div>
            <div className="new-bill-payment-in-grid">
              <div className="new-payment-in-bill-to">
                <div className="new-payment-in-section-title">
                  Payment Receipt For:
                </div>
                <div className="new-payment-in-bill-name">
                  {paymentInData?.partyInfo?.partyName || "Customer Name"}
                </div>
                <div className="new-payment-in-bill-address">
                  {paymentInData?.partyInfo?.partyAddress || "Contact No."}
                </div>
                <div className="new-payment-in-bill-contact">
                    <strong>Contact: </strong>{paymentInData?.partyInfo?.partyPhone || "NA"}
                </div>
                <div className="new-payment-in-bill-state">
                  <strong>State: </strong>{paymentInData?.partyInfo?.partyState || "NA"}
                </div>
              </div>
              <div className="new-payment-in-details">
                <div className="new-payment-in-section-title">
                  Payment Receipt Details:
                </div>
                <div className="new-payment-in-detail-row">
                  <span>No:</span>
                  <span>
                    {paymentInData.receiptNumber || "N/A"}
                  </span>
                </div>
                <div className="new-payment-in-detail-row">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="new-payment-in-items-table-wrapper">
            <div className="new-payment-in-received-section">
              <div className="new-payment-in-received-title">
                Received:
              </div>
              <div className="new-payment-in-received-amount-text">
                ₹ {parseFloat(paymentInData?.receivedAmount).toFixed(2)}
              </div>
            </div>
            <div className="new-payment-in-amount-in-words-section">
              <div className="new-payment-in-amount-in-words-title">
                Amount In Words:
              </div>
              <div className="new-payment-in-amount-in-words-text">
                 {numberToWords(parseFloat(paymentInData?.receivedAmount).toFixed(2))}
              </div>
            </div>
          </div>
          <div className="new-payment-in-footer-sections">
            <div className="new-payment-in-sign-section">
              <div className="new-payment-in-company-box">
                <div className="new-payment-in-company-box-title">
                  For {companyName}:
                </div>
              </div>
              <div className="new-payment-in-sign-box">
                <div className="new-payment-in-signatory-text">
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
export default NewPaymentInPreview;
