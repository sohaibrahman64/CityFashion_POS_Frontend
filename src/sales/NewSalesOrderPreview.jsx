import "./NewSalesOrderPreview.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { FiEdit } from "react-icons/fi";

const NewSalesOrderPreview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const salesOrderData = location.state?.salesOrderData || {};

    // State for editable company info
    const [companyName, setCompanyName] = useState("My Company");
    const [companyPhone, setCompanyPhone] = useState("9870253518");
    const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
    const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
    const [tempCompanyName, setTempCompanyName] = useState("My Company");
    const [tempCompanyPhone, setTempCompanyPhone] = useState("9870253518");
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);
    const salesOrderPreviewRef = useRef(null);

    // Function to format number with commas
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

    // Get items from invoice data
    const items = salesOrderData.items || [];
    const validItems = items.filter((item) => item.itemName && item.itemName.trim() !== "");

    // Calculate totals
    const calculateSubTotal = () => {
        return validItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
    };

    const calculateAdvanceAmount = () => {
        return salesOrderData.advanceAmount || 0;
    };

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
            if (!salesOrderPreviewRef.current) {
                console.error("Invoice preview element not found");
                alert("Invoice preview not found. Please try again.");
                return;
            }

                        // Clone the sales order preview element to avoid modifying the original
                        const element = salesOrderPreviewRef.current.cloneNode(true);

                        // Remove edit icons from the cloned element
                        const editIcons = element.querySelectorAll(
                                ".new-sales-order-edit-icon, .new-sales-order-edit-icon-logo"
                        );
                        editIcons.forEach((icon) => icon.remove());

                        // Remove any elements that shouldn't be in the PDF (like edit indicators)
                        const editableElements = element.querySelectorAll('[style*="cursor: pointer"]');
                        editableElements.forEach(el => {
                                el.style.cursor = 'default';
                        });

                        // Configure PDF options with optimized settings for single page
                        const opt = {
                                margin: [5, 5, 5, 5],
                                filename: `SalesOrder_${salesOrderData.partyName || "Customer"}_${salesOrderData.salesOrderNumber || new Date().toISOString().split("T")[0]
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
                    .new-sales-order-preview-content-section {
                        font-size: 10px !important;
                        line-height: 1.1 !important;
                    }
                    .new-sales-order-paper {
                        page-break-after: avoid !important;
                        padding: 0 !important;
                    }
                    .new-sales-order-header-grid {
                        margin-bottom: 4px !important;
                    }
                    .new-sales-order-company-info {
                        line-height: 1.2 !important;
                    }
                    .new-sales-order-items-table,
                    .new-sales-order-tax-summary-table {
                        font-size: 8px !important;
                        page-break-inside: avoid !important;
                    }
                    .new-sales-order-items-table th,
                    .new-sales-order-items-table td {
                        padding: 2px 3px !important;
                        line-height: 1 !important;
                    }
                    .new-sales-order-tax-summary-table th,
                    .new-sales-order-tax-summary-table td {
                        padding: 1px 2px !important;
                        line-height: 1 !important;
                    }
                    .new-sales-order-total-row {
                        font-size: 8px !important;
                    }
                    .new-sales-order-items-table-wrapper {
                        margin: 4px 0 !important;
                    }
                    .new-sales-order-footer-sections {
                        page-break-inside: avoid !important;
                        margin-top: 2px !important;
                        font-size: 9px !important;
                    }
                    .new-sales-order-terms-section,
                    .new-sales-order-sign-section {
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
        <div className="new-sales-order-preview-container">
            <div className="new-sales-order-preview-header-section">
                <div className="new-sales-order-preview-header-left">
                    <span className="new-sales-order-preview-header-left-label">
                        Sales Order Preview
                    </span>
                </div>
                <div className="new-sales-order-preview-header-right">
                    <button
                        className="new-sales-order-preview-download-button"
                        onClick={generateAndDownloadPDF}
                    >
                        <span className="new-sales-order-preview-download-button-label">
                            Download
                        </span>
                    </button>
                    <button
                        className="new-sales-order-preview-header-right-button"
                        onClick={() => navigate("/sales/order")}
                    >
                        <span className="new-sales-order-preview-header-right-button-label">
                            Save And Close
                        </span>
                    </button>
                </div>
            </div>
            <div
                className="new-sales-order-preview-content-section"
                ref={salesOrderPreviewRef}
            >
                <div className="new-sales-order-tax-title">Sales Order</div>
                <div className="new-sales-order-paper">
                    <div className="new-sales-order-header-grid">
                        <div className="new-sales-order-company-block">
                            <div className="new-sales-order-company-logo" onClick={handleLogoClick}>
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Company Logo"
                                        className="new-sales-order-logo-image"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <span style={{ cursor: "pointer" }}>LOGO</span>
                                )}
                                <FiEdit className="new-sales-order-edit-icon-logo" />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                            <div className="new-sales-order-company-info">
                                {isEditingCompanyName ? (
                                    <input
                                        type="text"
                                        value={tempCompanyName}
                                        onChange={(e) => setTempCompanyName(e.target.value)}
                                        onKeyPress={handleCompanyNameKeyPress}
                                        onBlur={handleCompanyNameBlur}
                                        className="new-sales-order-company-name-input"
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
                                        className="new-sales-order-company-name"
                                        onClick={handleCompanyNameClick}
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        {companyName}
                                        <FiEdit className="new-sales-order-edit-icon" />
                                    </div>
                                )}
                                {isEditingCompanyPhone ? (
                                    <input
                                        type="text"
                                        value={tempCompanyPhone}
                                        onChange={(e) => setTempCompanyPhone(e.target.value)}
                                        onKeyPress={handleCompanyPhoneKeyPress}
                                        onBlur={handleCompanyPhoneBlur}
                                        className="new-sales-order-company-phone-input"
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
                                        className="new-sales-order-company-phone"
                                        onClick={handleCompanyPhoneClick}
                                        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        Phone: {companyPhone}
                                        <FiEdit className="new-sales-order-edit-icon" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="new-sales-order-bill-order-grid">
                            <div className="new-sales-order-bill-to">
                                <div className="new-sales-order-section-title">Bill To:</div>
                                <div className="new-sales-order-bill-name">
                                    {salesOrderData.partyName || "Customer Name"}
                                </div>
                                <div className="new-sales-order-bill-address">
                                    {salesOrderData.partyPhone || "Contact No."}
                                </div>
                                <div className="new-sales-order-bill-state">State: 27-Maharashtra</div>
                            </div>
                            <div className="new-sales-order-details">
                                <div className="new-sales-order-section-title">Sales Order Details:</div>
                                <div className="new-sales-order-detail-row">
                                    <span>No:</span>
                                    <span>{salesOrderData.salesOrderNumber || "N/A"}</span>
                                </div>
                                <div className="new-sales-order-detail-row">
                                    <span>Date:</span>
                                    <span>{new Date().toLocaleDateString("en-GB")}</span>
                                </div>
                                <div className="new-sales-order-detail-row">
                                    <span>Place Of Supply:</span>
                                    <span>27-Maharashtra</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="new-sales-order-items-table-wrapper">
                        <table className="new-sales-order-items-table">
                            <thead>
                                <tr>
                                    <th className="new-sales-order-col-serial">#</th>
                                    <th className="new-sales-order-col-name">Item name</th>
                                    <th className="new-sales-order-col-qty">Quantity</th>
                                    <th className="new-sales-order-col-unit">Unit</th>
                                    <th className="new-sales-order-col-price">Price/ Unit(₹)</th>
                                    <th className="new-sales-order-col-discount">Discount(₹)</th>
                                    <th className="new-sales-order-col-gst">GST(₹)</th>
                                    <th className="new-sales-order-col-amount">Amount(₹)</th>
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
                                <tr className="new-sales-order-total-row">
                                    <td colSpan="2">Total</td>
                                    <td className="new-sales-order-ta-left">
                                        {validItems.reduce(
                                            (sum, item) => sum + parseFloat(item.quantity || 0),
                                            0
                                        )}
                                    </td>
                                    <td></td>
                                    <td className="new-sales-order-ta-right"></td>
                                    <td className="new-sales-order-ta-right">
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
                                    <td className="new-sales-order-ta-right">
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
                                    <td className="new-sales-order-ta-right">
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
                                        className="new-sales-order-no-padding-cell new-sales-order-tax-summary-cell"
                                    >
                                        <div className="new-sales-order-tax-summary-wrapper">
                                            <div className="new-sales-order-tax-summary-title">Tax Summary:</div>
                                            <table className="new-sales-order-tax-summary-table">
                                                <thead>
                                                    {(() => {
                                                        // Check if any item has IGST
                                                        const hasIGST = validItems.some(
                                                            (item) => item.isIGST
                                                        );

                                                        return (
                                                            <>
                                                                <tr>
                                                                    <th rowSpan="2" className="new-sales-order-ts-col-hsn">
                                                                        HSN/ SAC
                                                                    </th>
                                                                    <th rowSpan="2" className="new-sales-order-ts-col-taxable">
                                                                        Taxable amount (₹)
                                                                    </th>
                                                                    {hasIGST ? (
                                                                        <th colSpan="2" className="new-sales-order-ts-col-igst">
                                                                            IGST
                                                                        </th>
                                                                    ) : (
                                                                        <>
                                                                            <th colSpan="2" className="new-sales-order-ts-col-cgst">
                                                                                CGST
                                                                            </th>
                                                                            <th colSpan="2" className="new-sales-order-ts-col-sgst">
                                                                                SGST
                                                                            </th>
                                                                        </>
                                                                    )}
                                                                    <th rowSpan="2" className="new-sales-order-ts-col-total">
                                                                        Total Tax (₹)
                                                                    </th>
                                                                </tr>
                                                                <tr>
                                                                    {hasIGST ? (
                                                                        <>
                                                                            <th className="new-sales-order-ts-col-rate">Rate (%)</th>
                                                                            <th className="new-sales-order-ts-col-amt">Amt (₹)</th>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <th className="new-sales-order-ts-col-rate">Rate (%)</th>
                                                                            <th className="new-sales-order-ts-col-amt">Amt (₹)</th>
                                                                            <th className="new-sales-order-ts-col-rate">Rate (%)</th>
                                                                            <th className="new-sales-order-ts-col-amt">Amt (₹)</th>
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
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(
                                                                                        group.taxableAmount.toFixed(2)
                                                                                    )}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-center">
                                                                                    {group.taxPercent.toFixed(2)}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(
                                                                                        group.totalTax.toFixed(2)
                                                                                    )}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-right">
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
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(
                                                                                        group.taxableAmount.toFixed(2)
                                                                                    )}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-center">
                                                                                    {cgstRate}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(cgstAmount)}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-center">
                                                                                    {sgstRate}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(sgstAmount)}
                                                                                </td>
                                                                                <td className="new-sales-order-ta-right">
                                                                                    {formatNumberWithCommas(
                                                                                        group.totalTax.toFixed(2)
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    }
                                                                })}
                                                                <tr className="new-sales-order-total-row">
                                                                    <td className="new-sales-order-ta-center">TOTAL</td>
                                                                    <td className="new-sales-order-ta-right">
                                                                        {formatNumberWithCommas(
                                                                            grandTotalTaxable.toFixed(2)
                                                                        )}
                                                                    </td>
                                                                    {hasIGST ? (
                                                                        <>
                                                                            <td className="new-sales-order-ta-center">&nbsp;</td>
                                                                            <td className="new-sales-order-ta-right">
                                                                                {formatNumberWithCommas(
                                                                                    grandTotalTax.toFixed(2)
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <td className="new-sales-order-ta-center">&nbsp;</td>
                                                                            <td className="new-sales-order-ta-right">
                                                                                {formatNumberWithCommas(
                                                                                    (grandTotalTax / 2).toFixed(2)
                                                                                )}
                                                                            </td>
                                                                            <td className="new-sales-order-ta-center">&nbsp;</td>
                                                                            <td className="new-sales-order-ta-right">
                                                                                {formatNumberWithCommas(
                                                                                    (grandTotalTax / 2).toFixed(2)
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                    <td className="new-sales-order-ta-right">
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
                                        className="new-sales-order-no-padding-cell new-sales-order-totals-summary-cell"
                                    >
                                        <div className="new-sales-order-totals-summary-wrapper">
                                            <table className="new-sales-order-totals-summary-table">
                                                <tbody>
                                                    <tr className="new-sales-order-totals-final-row">
                                                        <td className="new-sales-order-totals-label">Total</td>
                                                        <td className="new-sales-order-totals-separator">:</td>
                                                        <td className="new-sales-order-totals-value">
                                                            ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                                                        </td>
                                                    </tr>
                                                    <tr className="new-sales-order-totals-words-row">
                                                        <td colSpan="3" className="new-sales-order-totals-words">
                                                            <strong>Order Amount In Words:</strong>
                                                            <br />
                                                            {numberToWords(calculateSubTotal())}
                                                        </td>
                                                    </tr>
                                                    <tr className="new-sales-order-totals-extra-row">
                                                        <td colSpan="3" className="new-sales-order-totals-extra-cell">
                                                            <div className="new-sales-order-totals-extra-container">
                                                                <div className="new-sales-order-totals-extra-item">
                                                                    <span className="new-sales-order-totals-extra-label">Advance</span>
                                                                    <span className="new-sales-order-totals-extra-separator">:</span>
                                                                    <span className="new-sales-order-totals-extra-value">
                                                                        ₹ {formatNumberWithCommas(calculateAdvanceAmount().toFixed(2))}
                                                                    </span>
                                                                </div>
                                                                <div className="new-sales-order-totals-extra-item">
                                                                    <span className="new-sales-order-totals-extra-label">Balance</span>
                                                                    <span className="new-sales-order-totals-extra-separator">:</span>
                                                                    <span className="new-sales-order-totals-extra-value">
                                                                        ₹ {formatNumberWithCommas(
                                                                            (calculateSubTotal() - calculateAdvanceAmount()).toFixed(2)
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="new-sales-order-totals-extra-item">
                                                                    <span className="new-sales-order-totals-extra-label">You Saved</span>
                                                                    <span className="new-sales-order-totals-extra-separator">:</span>
                                                                    <span className="new-sales-order-totals-extra-value">
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
                    <div className="new-sales-order-footer-sections">
                        <div className="new-sales-order-terms-section">
                            <div className="new-sales-order-terms-title">Terms & Conditions:</div>
                            <div className="new-sales-order-terms-body">
                                Thanks for doing business with us!
                            </div>
                        </div>
                        <div className="new-sales-order-sign-section">
                            <div className="new-sales-order-sign-box">
                                <div className="new-sales-order-company-box-title">For {companyName}:</div>
                                <div className="new-sales-order-signatory-text">Authorized Signatory</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewSalesOrderPreview;
