import "./NewDeliveryChallanPreview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FiEdit } from "react-icons/fi";

const NewDeliveryChallanPreview = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const deliveryChallanData = location.state?.deliveryChallanData || {};
    // State for editable company info
    const [companyName, setCompanyName] = useState("My Company");
    const [companyPhone, setCompanyPhone] = useState("My Phone");
    const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
    const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
    const [tempCompanyName, setTempCompanyName] = useState("My Company");
    const [tempCompanyPhone, setTempCompanyPhone] = useState("9870253518");
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);
    const deliveryChallanPreviewRef = useRef(null);

    // Function to formate number with commas
    const formatNumberWithCommas = (num) => {
        if (num === null || num === undefined || isNaN(num)) return "0.00";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const items = deliveryChallanData.items || [];
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
            if (!deliveryChallanPreviewRef.current) {
                console.error("Delivery Challan preview element not found");
                alert("Delivery Challan preview not found. Please try again.");
                return;
            }

            // Clone the delivery challan preview element to avoid modifying the original
            const element = deliveryChallanPreviewRef.current.cloneNode(true);

            // Remove edit icons from the cloned element
            const editIcons = element.querySelectorAll(
                ".new-delivery-challan-edit-icon, .new-delivery-challan-edit-icon-logo"
            );
            editIcons.forEach((icon) => icon.remove());

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
                filename: `Delivery_Challan_${deliveryChallanData.customerName || "Customer"
                    }_${deliveryChallanData.deliveryChallanNumber ||
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
          .new-delivery-challan-preview-content-section {
            font-size: 10px !important;
            line-height: 1.1 !important;
          }
          .new-delivery-challan-paper {
            page-break-after: avoid !important;
            padding: 0 !important;
          }
          .new-delivery-challan-header-grid {
            margin-bottom: 4px !important;
          }
          .new-delivery-challan-company-info {
            line-height: 1.2 !important;
          }
          .new-delivery-challan-items-table,
          .new-delivery-challan-tax-summary-table {
            font-size: 8px !important;
            page-break-inside: avoid !important;
          }
          .new-delivery-challan-items-table th,
          .new-delivery-challan-items-table td {
            padding: 2px 3px !important;
            line-height: 1 !important;
          }
          .new-delivery-challan-tax-summary-table th,
          .new-delivery-challan-tax-summary-table td {
            padding: 1px 2px !important;
            line-height: 1 !important;
          }
          .new-delivery-challan-total-row {
            font-size: 8px !important;
          }
          .new-delivery-challan-items-table-wrapper {
            margin: 4px 0 !important;
          }
          .new-delivery-challan-footer-sections {
            page-break-inside: avoid !important;
            margin-top: 2px !important;
            font-size: 9px !important;
          }
          .new-delivery-challan-terms-section,
          .new-delivery-challan-sign-section {
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
        <div className="new-delivery-challan-preview-container">
            <div className="new-delivery-challan-preview-header-section">
                <div className="new-delivery-challan-preview-header-left">
                    <span className="new-delivery-challan-preview-header-left-label">
                        Delivery Challan Preview
                    </span>
                </div>
                <div className="new-delivery-challan-preview-header-right">
                    <button
                        className="new-delivery-challan-preview-download-button"
                        onClick={generateAndDownloadPDF}
                    >
                        <span className="new-delivery-challan-preview-download-button-label">
                            Download
                        </span>
                    </button>
                    <button
                        className="new-delivery-challan-preview-header-right-button"
                        onClick={() => navigate("/sales/delivery-challan")}
                    >
                        <span className="new-delivery-challan-preview-header-right-button-label">
                            Save And Close
                        </span>
                    </button>
                </div>
            </div>
            <div
                className="new-delivery-challan-preview-content-section"
                ref={deliveryChallanPreviewRef}
            >
                <div className="new-delivery-challan-tax-title">
                    Delivery Challan
                </div>
                <div className="new-delivery-challan-paper">
                    <div className="new-delivery-challan-header-grid">
                        <div className="new-delivery-challan-company-block">
                            <div
                                className="new-delivery-challan-company-logo"
                                onClick={handleLogoClick}
                            >
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Company Logo"
                                        className="new-delivery-challan-logo-image"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <span style={{ cursor: "pointer" }}>LOGO</span>
                                )}
                                <FiEdit className="new-delivery-challan-edit-icon-logo" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                            <div className="new-delivery-challan-company-info">
                                {isEditingCompanyName ? (
                                    <input
                                        type="text"
                                        value={tempCompanyName}
                                        onChange={(e) => setTempCompanyName(e.target.value)}
                                        onKeyPress={handleCompanyNameKeyPress}
                                        onBlur={handleCompanyNameBlur}
                                        className="new-delivery-challan-company-name-input"
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
                                        className="new-delivery-challan-company-name"
                                        onClick={handleCompanyNameClick}
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        {companyName}
                                        <FiEdit className="new-delivery-challan-edit-icon" />
                                    </div>
                                )}
                                {isEditingCompanyPhone ? (
                                    <input
                                        type="text"
                                        value={tempCompanyPhone}
                                        onChange={(e) => setTempCompanyPhone(e.target.value)}
                                        onKeyPress={handleCompanyPhoneKeyPress}
                                        onBlur={handleCompanyPhoneBlur}
                                        className="new-delivery-challan-company-phone-input"
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
                                        className="new-delivery-challan-company-phone"
                                        onClick={handleCompanyPhoneClick}
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        Phone: {companyPhone}
                                        <FiEdit className="new-delivery-challan-edit-icon" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="new-bill-delivery-challan-grid">
                            <div className="new-delivery-challan-bill-to">
                                <div className="new-delivery-challan-section-title">
                                    Delivery Challan For:
                                </div>
                                <div className="new-delivery-challan-bill-name">
                                    {deliveryChallanData.partyName || "Customer Name"}
                                </div>
                                <div className="new-delivery-challan-bill-address">
                                    {deliveryChallanData.partyPhone || "Contact No."}
                                </div>
                                <div className="new-delivery-challan-bill-state">
                                    State: 27-Maharashtra
                                </div>
                            </div>
                            <div className="new-delivery-challan-details">
                                <div className="new-delivery-challan-section-title">
                                    Delivery Challan Details:
                                </div>
                                <div className="new-delivery-challan-detail-row">
                                    <span>No:</span>
                                    <span>
                                        {deliveryChallanData.deliveryChallanNumber || "N/A"}
                                    </span>
                                </div>
                                <div className="new-delivery-challan-detail-row">
                                    <span>Date:</span>
                                    <span>{new Date().toLocaleDateString("en-GB")}</span>
                                </div>
                                <div className="new-delivery-challan-detail-row">
                                    <span>Place Of Supply:</span>
                                    <span>27-Maharashtra</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="new-delivery-challan-items-table-wrapper">
                        <table className="new-delivery-challan-items-table">
                            <thead>
                                <tr>
                                    <th className="new-delivery-challan-col-serial">#</th>
                                    <th className="new-delivery-challan-col-name">Item name</th>
                                    <th className="new-delivery-challan-col-qty">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {validItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.quantity || "0"}</td>
                                    </tr>
                                ))}
                                <tr className="new-delivery-challan-total-row">
                                    {/* Merge first 4 columns for "Total" label */}
                                    <td colSpan="2">Total</td>

                                    {/* Quantity total */}
                                    <td className="new-delivery-challan-ta-left">
                                        {deliveryChallanData.totalQuantity}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="new-delivery-challan-footer-sections">
                        <div className="new-delivery-challan-terms-section">
                            <div className="new-delivery-challan-terms-title">
                                Terms & Conditions:
                            </div>
                            <div className="new-delivery-challan-terms-body">
                                Thanks for doing business with us!
                            </div>
                        </div>
                        <div className="new-delivery-challan-receipt-table">
                            <table className="new-delivery-challan-receipt-delivery-table">
                                <tbody>
                                    <tr>
                                        <td className="new-delivery-challan-receipt-header">Received:</td>
                                        <td className="new-delivery-challan-receipt-divider"></td>
                                        <td className="new-delivery-challan-receipt-header">Delivered By:</td>
                                    </tr>
                                    <tr>
                                        <td><span className="new-delivery-challan-receipt-label">Name:</span></td>
                                        <td className="new-delivery-challan-receipt-divider"></td>
                                        <td><span className="new-delivery-challan-receipt-label">Name:</span></td>
                                    </tr>
                                    <tr>
                                        <td><span className="new-delivery-challan-receipt-label">Comment:</span></td>
                                        <td className="new-delivery-challan-receipt-divider"></td>
                                        <td><span className="new-delivery-challan-receipt-label">Comment:</span></td>
                                    </tr>
                                    <tr>
                                        <td><span className="new-delivery-challan-receipt-label">Date:</span></td>
                                        <td className="new-delivery-challan-receipt-divider"></td>
                                        <td><span className="new-delivery-challan-receipt-label">Date:</span></td>
                                    </tr>
                                    <tr>
                                        <td><span className="new-delivery-challan-receipt-label">Signature:</span></td>
                                        <td className="new-delivery-challan-receipt-divider"></td>
                                        <td><span className="new-delivery-challan-receipt-label">Signature:</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="new-delivery-challan-sign-section">
                            <div className="new-delivery-challan-sign-box">
                                <div className="new-delivery-challan-company-box-title">
                                    For {companyName}:
                                </div>
                                <div className="new-delivery-challan-signatory-text">
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

export default NewDeliveryChallanPreview;
