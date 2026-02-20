import "./AddSalesReturn.css";
import PartiesDropdown from "../parties/PartiesDropdown";
import ItemsDropdown from "../product/ItemsDropdown";
import InvoiceDropdown from "./InvoiceDropdown";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    useNavigate,
    useNavigate as useRouterNavigate,
    useLocation,
} from "react-router-dom";
import {
    BASE_URL,
    GET_ALL_ITEMS,
    GET_TAX_RATES,
    CREATE_NEW_SALES_RETURN,
    GENERATE_SALES_RETURN_NUMBER,
    CREATE_SALES_RETURN_TRANSACTION,
    CREATE_PARTY_TRANSACTION,
} from "../Constants";
import html2pdf from "html2pdf.js";
import Toast from "../components/Toast";

const AddSalesReturn = () => {
    const navigate = useNavigate();
    const routerNavigate = useRouterNavigate();
    const [partyName, setPartyName] = useState("");
    const [partyPhone, setPartyPhone] = useState("");
    const [partyId, setPartyId] = useState(null);
    const [selectedParty, setSelectedParty] = useState("");
    const [headerTaxType, setHeaderTaxType] = useState("With Tax");
    const [itemInputs, setItemInputs] = useState([
        {
            id: 1,
            itemName: "",
            quantity: "",
            price: "",
            purchasePrice: null,
            originalSalePrice: null, // New field for original sale price
            discount: "",
            discountAmount: "", // New field for discount amount
            total: "0.00",
            itemId: null,
            taxType: "With Tax", // New field for tax type
            taxRateId: null, // New field for selected tax rate ID
            taxRateIndex: null, // New field for tax rate index
            taxAmount: "0.00", // New field for tax amount
            isProductWithTax: false, // New field to track if product includes tax
        },
    ]);
    const [activeRowIndex, setActiveRowIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [taxRates, setTaxRates] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [companyName, setCompanyName] = useState("My Company");
    const [companyPhone, setCompanyPhone] = useState("My Phone Number");
    const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
    const [isEditingCompanyPhone, setIsEditingCompanyPhone] = useState(false);
    const [tempCompanyName, setTempCompanyName] = useState("My Company");
    const [tempCompanyPhone, setTempCompanyPhone] = useState("My Phone Number");
    const [logoImage, setLogoImage] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [
        isFromSalesReturnDashboard,
        setIsFromSalesReturnDashboard,
    ] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [paidAmount, setReceivedAmount] = useState("");
    const [isFullyReceived, setIsFullyReceived] = useState(false);
    const [billingAddress, setBillingAddress] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [billingEnabled, setBillingEnabled] = useState(false);
    const [shippingEnabled, setShippingEnabled] = useState(false);
    const [showBillingAddress, setShowBillingAddress] = useState(true);
    const [showShippingAddress, setShowShippingAddress] = useState(true);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const searchTimeoutRef = useRef(null);
    const salesReturnPreviewRef = useRef(null);
    const fileInputRef = useRef(null);
    const billingRef = useRef(null);
    const shippingRef = useRef(null);
    const [salesReturnNumber, setSalesReturnNumber] = useState("CRED-00001");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleHeaderTaxTypeChange = (newTaxType) => {
        setHeaderTaxType(newTaxType);

        // Recalculate all existing items based on new header tax selection
        const updatedItemInputs = itemInputs.map((item, index) => {
            if (item.itemId) {
                // Recalculate total based on new header tax selection
                let calculatedTotal = parseFloat(item.price) || 0;
                let calculatedTaxAmount = item.taxAmount || "0.00";
                let updatedPrice = parseFloat(item.price) || 0;

                // If "Without Tax" is selected and product includes tax, add tax to total
                if (newTaxType === "Without Tax" && item.isProductWithTax) {
                    const quantity = parseFloat(item.quantity) || 1;
                    const subtotal = parseFloat(item.price) * quantity;
                    const discountAmount = parseFloat(item.discountAmount) || 0;
                    const afterDiscount = subtotal - discountAmount;

                    // Get tax rate from the selected tax rate
                    if (item.taxRateIndex && taxRates[parseInt(item.taxRateIndex)]) {
                        const taxRate = taxRates[parseInt(item.taxRateIndex)].rate || 0;
                        calculatedTotal = afterDiscount + (afterDiscount * taxRate) / 100;
                        calculatedTaxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
                    }
                }
                // If "Without Tax" is selected and product doesn't include tax, show price with tax added
                else if (newTaxType === "Without Tax" && !item.isProductWithTax) {
                    const quantity = parseFloat(item.quantity) || 1;
                    const subtotal = parseFloat(item.price) * quantity;
                    const discountAmount = parseFloat(item.discountAmount) || 0;
                    const afterDiscount = subtotal - discountAmount;

                    // Get tax rate from the selected tax rate
                    if (item.taxRateIndex && taxRates[parseInt(item.taxRateIndex)]) {
                        const taxRate = taxRates[parseInt(item.taxRateIndex)].rate || 0;
                        // Calculate price with tax added (original price + tax amount)
                        const taxAmount = (parseFloat(item.price) * taxRate) / 100;
                        //updatedPrice = parseFloat(item.price) + taxAmount;
                        updatedPrice = parseFloat(item.price);
                        calculatedTotal = afterDiscount + (afterDiscount * taxRate) / 100;
                        calculatedTaxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
                    }
                }
                // If "With Tax" is selected, calculate total as Price - Discount (no separate tax calculation)
                else if (newTaxType === "With Tax") {
                    const quantity = parseFloat(item.quantity) || 1;
                    const subtotal = parseFloat(item.price) * quantity;
                    const discountAmount = parseFloat(item.discountAmount) || 0;
                    calculatedTotal = subtotal - discountAmount;
                    calculatedTaxAmount = "0.00";
                }

                return {
                    ...item,
                    price: updatedPrice.toFixed(2),
                    total: calculatedTotal.toFixed(2),
                    taxAmount: calculatedTaxAmount,
                    taxPercent: item.taxPercent,
                };
            }
            return item;
        });

        setItemInputs(updatedItemInputs);
    };

    const handlePartySelect = useCallback((party) => {
        setPartyName(party?.partyName || party?.name || "");
        setPartyPhone(party?.phoneNumber || "");
        setPartyId(party?.id ?? null);
        setBillingAddress(party?.billingAddress || "");
        setShippingAddress(party?.shippingAddress || "");
    }, []);

    // Handlers for address controls
    const handleEnableBilling = () => {
        setBillingEnabled(true);
    };

    const handleEnableShipping = () => {
        setShippingEnabled(true);
    };

    const handleRemoveBilling = () => {
        setShowBillingAddress(false);
        setBillingAddress("");
    };

    const handleRemoveShipping = () => {
        setShowShippingAddress(false);
        setShippingAddress("");
    };

    const shareViaWhatsApp = () => {
        try {
            // Create a simple text message for WhatsApp
            const message = `Sales Return Details:
Customer: ${partyName || "N/A"}
Total Amount: ₹${calculateSubTotal().toFixed(2)}
Items: ${itemInputs.filter((item) => item.itemName.trim() !== "").length} items
Date: ${new Date().toLocaleDateString()}

Thank you for your business!`;

            // Encode the message for WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

            // Open WhatsApp in a new window
            window.open(whatsappUrl, "_blank");
        } catch (error) {
            console.error("Error sharing via WhatsApp:", error);
            setToastMessage("Error sharing via WhatsApp. Please try again.");
            setToastType("error");
            setShowToast(true);
        }
    };

    const generateAndDownloadPDF = async () => {
        try {
            if (!salesReturnPreviewRef.current) {
                console.error("Sales Return / Credit Note preview element not found");
                return;
            }

            // Clone the return preview element to avoid modifying the original
            const element = salesReturnPreviewRef.current.cloneNode(true);

            // Remove action buttons from PDF
            const actionButtons = element.querySelector(".action-buttons");
            if (actionButtons) {
                actionButtons.remove();
            }

            // Configure PDF options
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Sales_Return_${partyName || "Customer"}_${new Date().toISOString().split("T")[0]
                    }.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
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
            setToastMessage("Error generating PDF. Please try again.");
            setToastType("error");
            setShowToast(true);
        }
    };

    const printInvoice = () => {
        if (!salesReturnPreviewRef.current) {
            console.error("Sales Return preview element not found");
            return;
        }

        // Clone the return preview element to avoid modifying the original
        const element = salesReturnPreviewRef.current.cloneNode(true);

        // Remove action buttons from print
        const actionButtons = element.querySelector(".action-buttons");
        if (actionButtons) {
            actionButtons.remove();
        }

        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
      <html>
        <head>
          <title>Print Sales Return</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .add-sales-return-preview { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .add-sales-return-header { text-align: center; margin-bottom: 20px; }
            .add-sales-return-title { text-align: center; color: #333; }
            .add-sales-return-details { margin: 20px 0; }
            .add-sales-return-summary-item { display: flex; justify-content: space-between; margin: 5px 0; }
            .add-sales-return-total-row { font-weight: bold; background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              .add-sales-return-no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const addNewRow = () => {
        const newRow = {
            id: itemInputs.length + 1,
            itemName: "",
            quantity: "",
            price: "",
            purchasePrice: null,
            originalSalePrice: null, // New field for original sale price
            discount: "",
            discountAmount: "",
            total: "0.00",
            itemId: null,
            hsnCode: null,
            taxType: "With Tax",
            taxRateId: null,
            taxRateIndex: null,
            taxAmount: "0.00",
            isProductWithTax: false, // New field for new rows
        };
        setItemInputs([...itemInputs, newRow]);
    };

    const removeRow = (index) => {
        if (itemInputs.length > 1 || index === 0) {
            const newItemInputs = itemInputs.filter((_, i) => i !== index);
            setItemInputs(newItemInputs);
        }
    };

    const handleItemNameChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].itemName = value;
        setItemInputs(newItemInputs);

        // Set this row as active and update search term
        setActiveRowIndex(index);
        setSearchTerm(value);
    };

    const handleItemDropdownFocus = (index, event) => {
        setActiveRowIndex(index);
        // Fetch all products when input is focused
        //fetchAllProducts();
        fetchAllItems();
    };

    // Validation function to check if required fields are filled
    const validateSalesReturnData = () => {
        // Check if customer name is provided
        if (!partyName.trim()) {
            setToastMessage("Please enter customer name.");
            setToastType("error");
            setShowToast(true);
            return false;
        }

        // Check if at least one item is added with all required fields
        const validItems = itemInputs.filter(
            (item) =>
                item.itemName.trim() !== "" &&
                item.quantity &&
                item.price &&
                parseFloat(item.quantity) > 0 &&
                parseFloat(item.price) > 0
        );

        if (validItems.length === 0) {
            setToastMessage(
                "Please add at least one item with valid quantity and price."
            );
            setToastType("error");
            setShowToast(true);
            return false;
        }

        // Check each valid item for completeness
        for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];

            if (!item.itemName.trim()) {
                setToastMessage(`Please enter item name for row ${i + 1}.`);
                setToastType("error");
                setShowToast(true);
                return false;
            }

            if (!item.quantity || parseFloat(item.quantity) <= 0) {
                setToastMessage(`Please enter valid quantity for "${item.itemName}".`);
                setToastType("error");
                setShowToast(true);
                return false;
            }

            if (!item.price || parseFloat(item.price) <= 0) {
                setToastMessage(`Please enter valid price for "${item.itemName}".`);
                setToastType("error");
                setShowToast(true);
                return false;
            }
        }

        return true;
    };



    const createSalesReturnTransaction = async (salesReturnData) => {
        try {
            const validItemsForPayload = itemInputs.filter(
                (i) => i.itemName.trim() !== ""
            );

            console.log("validItemsForPayload", validItemsForPayload);

            const totalQuantity = validItemsForPayload.reduce(
                (sum, item) => sum + parseFloat(item.quantity || 0),
                0
            );

            const payload = {
                salesReturnId: salesReturnData.salesReturnId || null,
                invoiceId: selectedInvoice?.id ?? selectedInvoice?.invoiceId ?? null,
                salesReturnTransactionNumber:
                    salesReturnData.salesReturnNumber || salesReturnNumber,
                partyName: partyName,
                partyId: partyId,
                totalAmount: calculateSubTotal(),
                paidAmount: salesReturnData.paidAmount || paidAmount,
                balanceAmount: calculateSubTotal() - parseFloat(salesReturnData.paidAmount || paidAmount),
                taxAmount: salesReturnData.totalTaxAmount || 0.0,
                discountAmount: itemInputs
                    .filter((item) => item.itemName.trim() !== "")
                    .reduce(
                        (sum, item) =>
                            sum +
                            (parseFloat(item.price || 0) *
                                parseFloat(item.quantity || 0) *
                                parseFloat(item.discount || 0)) /
                            100,
                        0
                    ),
                itemCount: validItemsForPayload.length,
                totalQuantity: totalQuantity,
                paymentMode: "CASH", // Default payment mode, can be enhanced to allow selection
                items: validItemsForPayload,
                paymentStatus:
                    salesReturnData.balanceAmount <= 0
                        ? "PAID"
                        : (salesReturnData.paidAmount || 0) <= 0
                            ? "UNPAID"
                            : "PARTIAL",
                createdBy: "SYSTEM",
                notes: `Sales Return / Credit Note Data | Sales Return / Credit Note: ${salesReturnData.salesReturnNumber || salesReturnNumber
                    }`,
                createdAt: new Date().toISOString(),
            };

            console.log(payload);

            const res = await fetch(
                `${BASE_URL}/${CREATE_SALES_RETURN_TRANSACTION}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const txt = await res.text();
                console.error("Failed to create sales return transaction", txt);
            }
        } catch (err) {
            console.error("Error creating sales return transaction:", err);
        }
    };

    const createPartyTransaction = async (salesReturnData) => {
        try {
            const partyTotal = calculateSubTotal();
            const partyBalance = partyTotal - parseFloat(paidAmount || 0);

            // Determine status based on party balance
            let status = "UNPAID";
            if (partyBalance <= 0) {
                status = "COMPLETED";
            } else if (partyBalance < partyTotal) {
                status = "PARTIAL";
            }

            const payload = {
                partyId: partyId,
                partyName: partyName,
                partyPhone: partyPhone,
                invoiceId: salesReturnData.salesReturnId || null,
                invoiceNumber: salesReturnData.salesReturnNumber || salesReturnNumber,
                partyTotal: partyTotal,
                partyBalance: partyBalance,
                transactionType: "SALE",
                referenceId: salesReturnData.salesReturnId || null,
                referenceType: "SALES_RETURN",
                referenceNumber: salesReturnNumber,
                description: `Sale of ${itemInputs.length} items to ${partyName}`,
                transactionDate: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                date: new Date().toISOString(),
                createdBy: "SYSTEM",
                updatedBy: "SYSTEM",
                status: status,
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


    const incrementSalesReturnNumber = (currentSalesReturnNumber) => {
        // Handle alphanumeric return numbers like "CRED-00012"
        const match = currentSalesReturnNumber.match(/^([A-Z]+)-(\d+)$/);

        if (match) {
            const prefix = match[1]; // "PI"
            const numberPart = parseInt(match[2], 10); // 12
            const nextNumber = numberPart + 1;

            // Format the number part with leading zeros (minimum 5 digits)
            const formattedNumber = nextNumber.toString().padStart(5, "0");
            return `${prefix}-${formattedNumber}`;
        }

        // Fallback: if format doesn't match, just increment as number
        if (!isNaN(currentSalesReturnNumber)) {
            return parseInt(currentSalesReturnNumber, 10) + 1;
        }

        // Default fallback
        return "CRED-00001";
    };

    const handleSaveNew = async () => {
        // Validate the form before proceeding
        if (!validateSalesReturnData()) {
            return; // Stop execution if validation fails
        }

        try {
            const payload = {
                invoiceId: selectedInvoice?.id ?? selectedInvoice?.invoiceId ?? null,
                invoiceNumber: selectedInvoice?.invoiceNumber ?? null,
                invoiceDate: selectedInvoice?.invoiceDate ?? null,
                partyId: partyId,
                partyName: partyName,
                partyPhone: partyPhone,
                billingAddress: billingAddress,
                shippingAddress: shippingAddress,
                items: itemInputs,
                paidAmount: parseFloat(paidAmount) || 0,
                subtotalAmount: calculateSubTotal(),
                totalAmount: calculateSubTotal(),
                balanceAmount: calculateSubTotal() - parseFloat(paidAmount || 0),
                totalQuantity: itemInputs.reduce(
                    (sum, item) => sum + parseFloat(item.quantity || 0),
                    0
                ),
                discountAmount: itemInputs
                    .filter((item) => item.itemName.trim() !== "")
                    .reduce(
                        (sum, item) =>
                            sum +
                            (parseFloat(item.price || 0) *
                                parseFloat(item.quantity || 0) *
                                parseFloat(item.discount || 0)) /
                            100,
                        0
                    ),
                totalTaxAmount: calculateTotalTaxAmount(),
                taxableAmount: calculateTaxableAmount(),
                isFullyReceived: isFullyReceived,
            };

            const response = await fetch(
                `${BASE_URL}/${CREATE_NEW_SALES_RETURN}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );
            if (response.ok) {
                const data = await response.json();
                console.log("Sales Return created successfully:", data);
                setToastMessage("Sales Return created successfully!");
                setToastType("success");
                setShowToast(true);

                // Also create sales return transaction
                await createSalesReturnTransaction(data);

                // Also create party transaction
                await createPartyTransaction(data);

                // Clear all form fields after successful sales return creation
                setPartyName("");
                setPartyPhone("");
                setPartyId(null);
                setReceivedAmount("");
                setIsFullyReceived(false);
                setItemInputs([
                    {
                        id: 1,
                        itemName: "",
                        quantity: "",
                        price: "",
                        originalSalePrice: null,
                        discount: "",
                        discountAmount: "",
                        total: "0.00",
                        itemId: null,
                        hsnCode: null,
                        taxType: "With Tax",
                    },
                ]);
                setSearchTerm("");
                setSuggestions([]);
                setShowSuggestions(false);
                setActiveRowIndex(null);
                setSelectedProduct(null);

                // Increment return number for next return
                setSalesReturnNumber((prevNumber) => incrementSalesReturnNumber(prevNumber));

                // Generate and download PDF after successful return creation
                // await generateAndDownloadPDF();

                // Delay navigation to allow toast to display
                setTimeout(() => {
                    routerNavigate("/sales/return/preview", {
                        state: { salesReturnData: data },
                    });
                }, 2500);
                // Add any additional logic here, like redirecting to the return page
            } else {
                console.error("Failed to create sales return");
                setToastMessage("Failed to create sales return. Please try again.");
                setToastType("error");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Error creating sales return:", error);
            setToastMessage(
                "Error creating sales return. Please check your connection and try again."
            );
            setToastType("error");
            setShowToast(true);
        }
    };

    const handleProductSelect = (item, index) => {
        console.log(item);

        // Calculate discount values based on product's discount type
        let discount = "0";
        let discountAmount = "0.00";

        if (item && item.discountAmount > 0) {
            if (item.discountType === "Percentage") {
                discount = item.discountAmount.toString();
                // Calculate amount from percentage
                const price = parseFloat(item.salePrice) || 0;
                const quantity = 1; // Default quantity
                discountAmount = (
                    (price * quantity * item.discountAmount) /
                    100
                ).toFixed(2);
            } else if (item.discountType === "Amount") {
                discountAmount = item.discountAmount.toString();
                // Calculate percentage from amount
                const price = parseFloat(item.salePrice) || 0;
                const quantity = 1; // Default quantity
                if (price > 0 && quantity > 0) {
                    discount = ((item.discountAmount / (price * quantity)) * 100).toFixed(
                        2
                    );
                }
            }
        }

        // Find matching tax rate
        let taxRateId = item.taxRate.id;
        let taxRateIndex = null;
        if (item && item.taxRate) {
            const productTaxRate = item.taxRate;
            const matchingTaxRate = taxRates.find(
                (rate) =>
                    rate.id === productTaxRate.id ||
                    rate.label === productTaxRate.label ||
                    rate.rate === productTaxRate?.rate
            );
            if (matchingTaxRate) {
                taxRateIndex = matchingTaxRate.index.toString();
            }
        }

        // Calculate price based on product's salePriceType and header tax type selection
        let calculatedPrice = item.salePrice || 0;

        // If product's salePriceType is "WITH_TAX", use the sale price directly regardless of header selection
        if (item.salePriceType === "With Tax") {
            calculatedPrice = item.salePrice || 0;
        } else if (headerTaxType === "With Tax" && item && item.taxRate) {
            // If product's salePriceType is "WITHOUT_TAX" and "With Tax" is selected, calculate price including tax
            const taxRate = item.taxRate.rate || 0;
            calculatedPrice = item.salePrice + (item.salePrice * taxRate) / 100;
        } else if (
            headerTaxType === "Without Tax" &&
            item &&
            item.taxRate &&
            item.pricing.salePriceType === "Without Tax"
        ) {
            calculatedPrice = item.salePrice;
        } else if (headerTaxType === "Without Tax" && item && item.taxRate) {
            // If "Without Tax" is selected, show price without tax in the input field
            const taxRate = item.taxRate.rate || 0;
            calculatedPrice = item.salePrice - (item.salePrice * taxRate) / 100;
        }

        // Calculate total based on header tax selection and product type
        let calculatedTotal = calculatedPrice;
        if (headerTaxType === "Without Tax" && item.salePriceType === "With Tax") {
            // Add tax to the total when header is "Without Tax" but product includes tax
            const taxRate = item.taxRate?.rate || 0;
            const quantity = 1; // Default quantity
            const subtotal = calculatedPrice * quantity;
            const discountAmountValue = parseFloat(discountAmount) || 0;
            const afterDiscount = subtotal - discountAmountValue;
            calculatedTotal = afterDiscount + (afterDiscount * taxRate) / 100;
            calculatedPrice = item.salePrice - item.salePrice * (taxRate / 100);
        } else if (
            headerTaxType === "With Tax" &&
            item.salePriceType === "Without Tax"
        ) {
            // Calculate total as Price - Discount when "With Tax" is selected and product is WITHOUT_TAX
            const quantity = 1; // Default quantity
            const subtotal = calculatedPrice * quantity;
            const discountAmountValue = parseFloat(discountAmount) || 0;
            calculatedTotal = subtotal - discountAmountValue;
        }

        // Check if product already includes tax
        const isProductWithTax = item.salePriceType === "With Tax";

        // Calculate tax amount based on product configuration
        //let calculatedTaxAmount = "0.00";
        let calculatedTaxAmount = (
            (item.salePrice * (item.taxRate?.rate || 0)) /
            100
        ).toFixed(2);
        if (!isProductWithTax && item && item.taxRate) {
            // For products without tax, calculate tax amount
            const taxRate = item.taxRate?.rate || 0;
            const basePrice = parseFloat(item.salePrice) || 0;
            const quantity = 1; // Default quantity
            const subtotal = basePrice * quantity;
            //const subtotal = (basePrice * quantity) + ((basePrice * taxRate) / 100).toFixed(2);
            const discountAmountValue = parseFloat(discountAmount) || 0;
            const afterDiscount = subtotal - discountAmountValue;
            calculatedTaxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
            //calculatedTaxAmount = afterDiscount;
        } else if (
            headerTaxType === "With Tax" &&
            item.salePriceType === "Without Tax" &&
            item.purchasePriceTaxes &&
            item.purchasePriceTaxes?.taxRate
        ) {
            // When "With Tax" is selected and product is WITHOUT_TAX, calculate tax amount
            const taxRate = item.taxRate?.rate || 0;
            const basePrice = parseFloat(item.salePrice) || 0;
            const quantity = 1; // Default quantity
            const subtotal = basePrice * quantity;
            const discountAmountValue = parseFloat(discountAmount) || 0;
            const afterDiscount = subtotal - discountAmountValue;
            calculatedTaxAmount = ((afterDiscount * taxRate) / 100).toFixed(2);
        }

        // Check if the selected tax is IGST
        const selectedTaxRate =
            taxRateIndex !== null ? taxRates[parseInt(taxRateIndex)] : null;
        const isIGST =
            selectedTaxRate?.label?.toUpperCase().includes("IGST") || false;

        itemInputs[index] = {
            ...itemInputs[index],
            itemName: item.name,
            price: calculatedPrice.toFixed(2),
            purchasePrice: item.purchasePrice ?? null,
            originalSalePrice: item.salePrice, // Store original sale price for calculations
            quantity: "1",
            discount: discount,
            discountAmount: discountAmount,
            total: calculatedTotal.toFixed(2),
            itemId: item.id,
            hsnCode: item.hsn,
            taxRateId: taxRateId,
            taxRateIndex: taxRateIndex,
            taxPercent: item.taxRate?.rate || 0,
            taxAmount: calculatedTaxAmount,
            isProductWithTax: isProductWithTax, // Track if product includes tax
            isIGST: isIGST, // Track if tax is IGST
        };
        setItemInputs(itemInputs);
        setSelectedProduct(item);
        setShowSuggestions(false);
        setSearchTerm("");
        setActiveRowIndex(null);

        // Calculate total for this row
        calculateRowTotal(index);
    };

    useEffect(() => {
        fetchSalesReturnNumber();
    }, []);


    const fetchSalesReturnNumber = async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/${GENERATE_SALES_RETURN_NUMBER}`
            );
            console.log(response.body);
            if (response.ok) {
                const data = await response.json();
                setSalesReturnNumber(data.salesReturnNumber);
            } else {
                console.error("Failed to fetch sales return number");
                setSalesReturnNumber("CRED-00001");
            }
        } catch (error) {
            console.error("Error fetching sales return number:", error);
            setSalesReturnNumber("CRED-00001");
        }
    };

    const handleInvoiceSelect = (invoice) => {
        if (!invoice) {
            setSelectedInvoice(null);
            return;
        }

        setSelectedInvoice(invoice);
        setPartyName(invoice.partyName || "");
        setPartyPhone(invoice.partyPhone || "");
        setPartyId(invoice.partyId ?? null);
        setSelectedParty(invoice.party ?? invoice.partyId ?? null);
        setBillingAddress(invoice.billingAddress || "");
        setShippingAddress(invoice.shippingAddress || "");
        setShowBillingAddress(Boolean(invoice.billingAddress));
        setShowShippingAddress(Boolean(invoice.shippingAddress));

        if (Array.isArray(invoice.items) && invoice.items.length > 0) {
            const mappedItems = invoice.items.map((item, index) => ({
                id: index + 1,
                itemName: item.itemName || item.name || "",
                quantity: String(item.quantity ?? ""),
                price: String(item.price ?? ""),
                purchasePrice: item.purchasePrice ?? null,
                originalSalePrice:
                    item.originalSalePrice ?? item.salePrice ?? item.price ?? null,
                discount: String(item.discount ?? ""),
                discountAmount: String(item.discountAmount ?? ""),
                total: String(item.total ?? "0.00"),
                itemId: item.itemId ?? item.id ?? null,
                hsnCode: item.hsnCode ?? item.hsn ?? null,
                taxType: item.taxType ?? "With Tax",
                taxRateId: item.taxRateId ?? item.taxRate?.id ?? null,
                taxRateIndex: item.taxRateIndex ?? null,
                taxAmount: String(item.taxAmount ?? "0.00"),
                isProductWithTax:
                    item.isProductWithTax ?? item.salePriceType === "With Tax",
                taxPercent: item.taxPercent ?? item.taxRate?.rate ?? 0,
                isIGST:
                    item.isIGST ??
                    item.taxRate?.label?.toUpperCase().includes("IGST") ??
                    false,
            }));

            setItemInputs(mappedItems);
        }

        if (invoice.receivedAmount !== undefined && invoice.receivedAmount !== null) {
            setReceivedAmount(String(invoice.receivedAmount));
        }

        if (invoice.party != undefined && invoice.party != null) {
            handlePartySelect(invoice.party);
        }
    };

    const handleQuantityChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].quantity = value;

        // Recalculate discount amount based on new quantity
        const price = parseFloat(newItemInputs[index].price) || 0;
        const quantity = parseFloat(value) || 0;
        const discountPercent = parseFloat(newItemInputs[index].discount) || 0;
        const discountAmount = (price * quantity * discountPercent) / 100;
        newItemInputs[index].discountAmount = discountAmount.toFixed(2);

        // Recalculate tax amount based on new quantity
        const selectedTaxRate =
            taxRates[parseInt(newItemInputs[index].taxRateIndex)];
        if (selectedTaxRate) {
            const rate = selectedTaxRate.rate || 0;
            const subtotal = price * quantity;
            const discountAmountValue =
                parseFloat(newItemInputs[index].discountAmount) || 0;
            const afterDiscount = subtotal - discountAmountValue;
            const taxAmount = (afterDiscount * rate) / 100;
            newItemInputs[index].taxAmount = taxAmount.toFixed(2);
        }

        setItemInputs(newItemInputs);
        calculateRowTotal(index);
    };

    const handlePriceChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].price = value;
        setItemInputs(newItemInputs);
        calculateRowTotal(index);
    };

    const handleDiscountChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].discount = value;

        // Calculate discount amount from percentage
        const price = parseFloat(newItemInputs[index].price) || 0;
        const quantity = parseFloat(newItemInputs[index].quantity) || 0;
        const discountPercent = parseFloat(value) || 0;
        const discountAmount = (price * quantity * discountPercent) / 100;
        newItemInputs[index].discountAmount = discountAmount.toFixed(2);

        setItemInputs(newItemInputs);
        calculateRowTotal(index);
    };

    const handleDiscountAmountChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].discountAmount = value;

        const price = parseFloat(newItemInputs[index].price) || 0;
        const quantity = parseFloat(newItemInputs[index].quantity) || 0;
        const discountAmount = parseFloat(value) || 0;

        if (price > 0 && quantity > 0) {
            const discountPercent = (discountAmount / (price * quantity)) * 100;
            newItemInputs[index].discount = discountPercent.toFixed(2);
        } else {
            newItemInputs[index].discount = "0";
        }

        setItemInputs(newItemInputs);
        calculateRowTotal(index);
    };

    const handleTaxRateChange = (index, value) => {
        const newItemInputs = [...itemInputs];
        newItemInputs[index].taxRateIndex = value;
        newItemInputs[index].taxRate = value;

        const selectedTaxRate = taxRates[parseInt(value)];
        if (selectedTaxRate) {
            const rate = selectedTaxRate.rate || 0;
            const isIGST =
                selectedTaxRate.label?.toUpperCase().includes("IGST") || false;

            const price = parseFloat(newItemInputs[index].price) || 0;
            const quantity = parseFloat(newItemInputs[index].quantity) || 0;
            const subtotal = price * quantity;
            const discountAmountValue =
                parseFloat(newItemInputs[index].discountAmount) || 0;
            const afterDiscount = subtotal - discountAmountValue;
            const taxAmount = (afterDiscount * rate) / 100;
            newItemInputs[index].taxAmount = taxAmount.toFixed(2);
            newItemInputs[index].taxPercent = rate.toFixed(2);
            newItemInputs[index].taxRate = rate.toFixed(2);
            newItemInputs[index].isIGST = isIGST;
        }

        setItemInputs(newItemInputs);
    };

    const calculateRowTotal = (index) => {
        const newItemInputs = [...itemInputs];
        const quantity = parseFloat(newItemInputs[index].quantity) || 0;
        const price = parseFloat(newItemInputs[index].price) || 0;
        const originalSalePrice =
            parseFloat(newItemInputs[index].originalSalePrice) || price;
        const discount = parseFloat(newItemInputs[index].discount) || 0;
        const discountAmount =
            parseFloat(newItemInputs[index].discountAmount) || 0;

        const calculationPrice =
            headerTaxType === "Without Tax" ? originalSalePrice : price;
        const subtotal = quantity * calculationPrice;
        const calculatedDiscountAmount = (subtotal * discount) / 100;
        const afterDiscount = subtotal - calculatedDiscountAmount;

        let taxAmount = 0;
        let total = 0;

        if (newItemInputs[index].isProductWithTax) {
            total = subtotal - discountAmount;
        } else {
            const selectedTaxRate =
                taxRates[parseInt(newItemInputs[index].taxRateIndex)];
            if (selectedTaxRate) {
                const rate = selectedTaxRate.rate || 0;
                taxAmount = (afterDiscount * rate) / 100;
            }
            total = afterDiscount + taxAmount;
        }

        newItemInputs[index].total = total.toFixed(2);
        setItemInputs(newItemInputs);
    };

    // Fetch all products when activeRowIndex changes (on focus)
    useEffect(() => {
        if (activeRowIndex !== null) {
            fetchAllItems();
        }
    }, [activeRowIndex]);

    const fetchAllItems = async () => {
        try {
            const response = await fetch(`${BASE_URL}/${GET_ALL_ITEMS}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data.items);
                setSuggestions(data.items);
                setShowSuggestions(data.items.length > 0);
            } else {
                console.error("Failed to fetch all products");
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error("Error fetching all products:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Fetch tax rates on component mount
    useEffect(() => {
        const fetchTaxRates = async () => {
            try {
                const response = await fetch(`${BASE_URL}/${GET_TAX_RATES}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Tax rates:", data);
                    setTaxRates(data);
                } else {
                    console.error("Failed to fetch tax rates");
                }
            } catch (error) {
                console.error("Error fetching tax rates:", error);
            }
        };

        fetchTaxRates();
    }, []);

    // Function to format number with commas
    const formatNumberWithCommas = (num) => {
        if (num === null || num === undefined || isNaN(num)) return "0.00";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Calculate taxable amount (total price amount minus total tax amount)
    const calculateTaxableAmount = () => {
        const totalPriceAmount = itemInputs
            .filter((item) => item.itemName.trim() !== "")
            .reduce((sum, item) => {
                const quantity = parseFloat(item.quantity || 0);
                const price = parseFloat(item.price || 0);
                const discountAmount = parseFloat(item.discountAmount || 0);
                const subtotal = quantity * price;
                const afterDiscount = subtotal - discountAmount;
                return sum + afterDiscount;
            }, 0);

        const totalTaxAmount = calculateTotalTaxAmount();

        return totalPriceAmount - totalTaxAmount;
    };

    const calculateSubTotal = () => {
        return itemInputs.reduce(
            (sum, item) => sum + parseFloat(item.total || 0),
            0
        );
    };

    // Calculate total tax amount from all items
    const calculateTotalTaxAmount = () => {
        return itemInputs
            .filter((item) => item.itemName.trim() !== "")
            .reduce((sum, item) => {
                const taxAmount = parseFloat(item.taxAmount || 0);
                return sum + taxAmount;
            }, 0);
    };

    const handleFullyReceivedChange = (checked) => {
        setIsFullyReceived(checked);
        if (checked) {
            // When checkbox is checked, set received amount to sub total
            setReceivedAmount(calculateSubTotal().toFixed(2));
        } else {
            // When checkbox is unchecked, clear the received amount
            setReceivedAmount("");
        }
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

    return (
        <div className="add-sales-return-container">
            {/* Header Section */}
            <div className="add-sales-return-header-section">
                <div className="add-sales-return-header-section-left">
                    <span className="add-sales-return-label">
                        Add Sales Return/Credit Note
                    </span>
                </div>
                <div className="add-sales-return-header-section-right">
                    <button
                        className="add-sales-return-btn-back"
                        onClick={() => {
                            // Back Button Logic Here
                            navigate(-1);
                        }}
                    >
                        ← Back
                    </button>
                </div>
            </div>
            {/* Form Section */}
            <div className="main-content">
                {/* Left Column - Input Fields */}
                <div className="add-sales-return-left-column">
                    <div className="add-sales-return-input-section">
                        <div className="add-sales-return-invoice-fields">
                            <div className="add-sales-return-input-group">
                                <label>Sales Return Number</label>
                                <div className="add-sales-return-number-display">
                                    {salesReturnNumber}
                                </div>
                            </div>
                            <div className="add-sales-return-input-group">
                                <label htmlFor="invoiceNumber">Invoice Number</label>
                                <InvoiceDropdown
                                    onInvoiceSelect={handleInvoiceSelect}
                                    selectedInvoice={selectedInvoice}
                                />
                            </div>
                        </div>
                        <div className="add-sales-return-customer-fields">
                            <div className="add-sales-return-input-group">
                                <label htmlFor="partyName">Party Name*: </label>
                                <PartiesDropdown
                                    onPartySelect={handlePartySelect}
                                    selectedParty={selectedParty}
                                />
                            </div>
                            <div className="add-sales-return-input-group">
                                <label htmlFor="customerPhone">Party Phone Number</label>
                                <input
                                    type="tel"
                                    id="customerPhone"
                                    placeholder="Enter Number"
                                    value={partyPhone}
                                    onChange={(e) => setPartyPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="add-sales-return-address-fields">
                            {showBillingAddress && (
                                <div className="add-sales-return-address-input-group">
                                    <label htmlFor="billingAddress">Billing Address</label>
                                    <textarea
                                        id="billingAddress"
                                        placeholder="Enter Billing Address"
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                        rows="3"
                                        disabled={!billingEnabled}
                                        ref={billingRef}
                                    />
                                    <div className="add-sales-return-address-actions">
                                        <button
                                            type="button"
                                            className="add-sales-return-address-btn remove"
                                            onClick={handleRemoveBilling}
                                        >
                                            Remove
                                        </button>
                                        <button
                                            type="button"
                                            className="add-sales-return-address-btn change"
                                            onClick={handleEnableBilling}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showShippingAddress && (
                                <div className="add-sales-return-address-input-group">
                                    <label htmlFor="shippingAddress">Shipping Address</label>
                                    <textarea
                                        id="shippingAddress"
                                        placeholder="Enter Shipping Address"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        rows="3"
                                        disabled={!shippingEnabled}
                                        ref={shippingRef}
                                    />
                                    <div className="add-sales-return-address-actions">
                                        <button
                                            type="button"
                                            className="add-sales-return-address-btn remove"
                                            onClick={handleRemoveShipping}
                                        >
                                            Remove
                                        </button>
                                        <button
                                            type="button"
                                            className="add-sales-return-address-btn change"
                                            onClick={handleEnableShipping}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="add-sales-return-items-section">
                            <table className="add-sales-return-items-table">
                                <thead>
                                    <tr>
                                        <th className="add-sales-return-header-cell">#</th>
                                        <th className="add-sales-return-header-cell">ITEM</th>
                                        <th className="add-sales-return-header-cell">QTY</th>
                                        <th className="add-sales-return-header-cell add-sales-return-price-unit-header">
                                            <div className="add-sales-return-price-unit-split">
                                                <div className="add-sales-return-price-label">
                                                    PRICE/UNIT
                                                </div>
                                                <div className="add-sales-return-tax-type-select">
                                                    <select
                                                        className="add-sales-return-header-tax-select"
                                                        value={headerTaxType}
                                                        onChange={(e) =>
                                                            handleHeaderTaxTypeChange(e.target.value)
                                                        }
                                                    >
                                                        <option value="With Tax">With Tax</option>
                                                        <option value="Without Tax">Without Tax</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </th>
                                        <th className="add-sales-return-header-cell add-sales-return-discount-header">
                                            <div className="add-sales-return-discount-split">
                                                <div className="add-sales-return-discount-label">
                                                    DISCOUNT (%)
                                                </div>
                                                <div className="add-sales-return-discount-sub-split">
                                                    <div className="add-sales-return-discount-percent-label">
                                                        %
                                                    </div>
                                                    <div className="add-sales-return-discount-amount-label">
                                                        AMOUNT
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                        <th className="add-sales-return-header-cell add-sales-return-tax-header">
                                            <div className="add-sales-return-tax-split">
                                                <div className="add-sales-return-tax-label">
                                                    TAX
                                                </div>
                                                <div className="add-sales-return-tax-sub-split">
                                                    <div className="add-sales-return-tax-percent-label">
                                                        %
                                                    </div>
                                                    <div className="add-sales-return-tax-amount-label">
                                                        AMOUNT
                                                    </div>
                                                </div>
                                            </div>
                                        </th>
                                        <th className="add-sales-return-header-cell">
                                            TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemInputs.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="add-sales-return-item-row"
                                        >
                                            <td className="add-sales-return-cell add-sales-return-item-id-cell">
                                                <span className="add-sales-return-item-id">
                                                    {item.id}
                                                </span>
                                                {(itemInputs.length > 1 || index === 0) && (
                                                    <button
                                                        className="add-sales-return-remove-row-btn"
                                                        onClick={() => removeRow(index)}
                                                        title="Remove Row"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </td>
                                            <td className="add-sales-return-cell add-sales-return-item-name-cell">
                                                <ItemsDropdown
                                                    value={item.itemName}
                                                    onChange={(value) =>
                                                        handleItemNameChange(index, value)
                                                    }
                                                    onProductSelect={handleProductSelect}
                                                    rowIndex={index}
                                                    suggestions={suggestions}
                                                    onFocus={handleItemDropdownFocus}
                                                    onSearchChange={(value) => setSearchTerm(value)}
                                                    showSuggestions={
                                                        showSuggestions && activeRowIndex === index
                                                    }
                                                    placeholder="Enter Item"
                                                />
                                            </td>
                                            <td className="add-sales-return-cell">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleQuantityChange(index, e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td className="add-sales-return-cell add-sales-return-price-unit-cell">
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    onChange={(e) =>
                                                        handlePriceChange(index, e.target.value)
                                                    }
                                                    className="add-sales-return-price-input"
                                                />
                                            </td>
                                            <td className="add-sales-return-cell add-sales-return-discount-cell">
                                                <div className="add-sales-return-discount-split">
                                                    <div className="add-sales-return-discount-sub-split">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={item.discount}
                                                            onChange={(e) =>
                                                                handleDiscountChange(index, e.target.value)
                                                            }
                                                            className="add-sales-return-discount-input"
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={item.discountAmount}
                                                            onChange={(e) =>
                                                                handleDiscountAmountChange(
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="add-sales-return-discount-amount-input"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="add-sales-return-cell add-sales-return-tax-cell">
                                                <div className="add-sales-return-tax-split">
                                                    <div className="add-sales-return-tax-sub-split">
                                                        <select
                                                            value={item.taxRateIndex || ""}
                                                            onChange={(e) =>
                                                                handleTaxRateChange(index, e.target.value)
                                                            }
                                                            className="add-sales-return-tax-select"
                                                        >
                                                            <option value="">Select Tax</option>
                                                            {isFromSalesReturnDashboard
                                                                ? taxRates.map((taxRate, rateIndex) => (
                                                                    <option
                                                                        key={taxRate.index}
                                                                        value={rateIndex}
                                                                    >
                                                                        {item.taxRateIndex == rateIndex
                                                                            ? `✓ ${taxRate.label}`
                                                                            : taxRate.label}
                                                                    </option>
                                                                ))
                                                                : taxRates.map((taxRate, rateIndex) => (
                                                                    <option
                                                                        key={taxRate.index}
                                                                        value={rateIndex}
                                                                    >
                                                                        {item.taxRateIndex == rateIndex
                                                                            ? `✓ ${taxRate.label}`
                                                                            : taxRate.label}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            placeholder="0.00"
                                                            value={item.taxAmount}
                                                            readOnly
                                                            className="add-sales-return-tax-amount-input"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="add-sales-return-cell">
                                                {item.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div
                                className="add-sales-return-add-row-btn"
                                onClick={addNewRow}
                            >
                                + Add Row
                            </div>
                        </div>
                        <div className="add-sales-return-payment-section">
                            <div className="add-sales-return-summary-row">
                                <div className="add-sales-return-summary-item">
                                    <span>Sub Total</span>
                                    <span>
                                        ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                                    </span>
                                </div>
                            </div>
                            <div className="add-sales-return-payment-row">
                                <div className="add-sales-return-payment-label">
                                    <label>Paid Amount</label>
                                </div>
                                <div className="add-sales-return-payment-controls">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={paidAmount}
                                        onChange={(e) => setReceivedAmount(e.target.value)}
                                    />
                                    <div className="add-sales-return-checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="fullyReceived"
                                            checked={isFullyReceived}
                                            onChange={(e) =>
                                                handleFullyReceivedChange(e.target.checked)
                                            }
                                        />
                                        <label htmlFor="fullyReceived">Fully Paid</label>
                                    </div>
                                </div>
                            </div>
                            <div className="add-sales-return-balance-row">
                                <div className="add-sales-return-summary-item">
                                    <span>Balance:</span>
                                    <span>
                                        ₹{" "}
                                        {formatNumberWithCommas(
                                            (
                                                calculateSubTotal() - parseFloat(paidAmount || 0)
                                            ).toFixed(2)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="add-sales-return-total-amount-bar">
                        <span>Total Amount (₹)</span>
                        <span>
                            {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                        </span>
                    </div>
                </div>

                {/* Right Column - Invoice Preview */}
                <div className="add-sales-return-right-column">
                    <div
                        className="add-sales-return-estimate-preview"
                        ref={salesReturnPreviewRef}
                    >
                        <h2 className="add-sales-return-estimate-title">
                            Sales Return / Credit Note
                        </h2>

                        <div className="add-sales-return-estimate-details">
                            <div className="add-sales-return-details-header">
                                <div className="add-sales-return-estimate-for">
                                    <h4>Sales Return / Credit Note For</h4>
                                    <p>{partyName || "Customer Name"}</p>
                                    <p>{partyPhone || "Contact No. "}</p>
                                </div>

                                <div className="add-sales-return-estimate-info">
                                    <h4>Sales Return / Credit Note Details</h4>
                                    <div className="add-sales-return-info-row">
                                        <span>Ref. No. {salesReturnNumber}</span>
                                    </div>
                                    <div className="add-sales-return-info-row">
                                        <span>Return Date: {returnDate ? new Date(returnDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Items Table - Only visible when items are selected */}
                            {itemInputs.some((item) => item.itemName.trim() !== "") && (
                                <div className="add-sales-return-estimate-items-table">
                                    <table className="add-sales-return-items-preview-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Item Name</th>
                                                <th>Qty</th>
                                                <th>Price/Unit</th>
                                                <th>Discount</th>
                                                <th>GST</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itemInputs
                                                .filter((item) => item.itemName.trim() !== "")
                                                .map((item, index) => (
                                                    <tr
                                                        key={item.id}
                                                        className="add-sales-return-estimate-item-preview-row"
                                                    >
                                                        <td>{index + 1}</td>
                                                        <td>{item.itemName}</td>
                                                        <td>{item.quantity || "0"}</td>
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
                                                            )}
                                                            <span className="add-sales-return-discount-percentage">
                                                                ({item.discount || 0}%)
                                                            </span>
                                                        </td>
                                                        <td>
                                                            ₹{" "}
                                                            {formatNumberWithCommas(
                                                                parseFloat(item.taxAmount || 0).toFixed(2)
                                                            )}
                                                            <span className="add-sales-return-gst-percentage">
                                                                (
                                                                {item.taxPercent ? `${item.taxPercent}%` : "0%"}
                                                                )
                                                            </span>
                                                        </td>
                                                        <td>
                                                            ₹{" "}
                                                            {formatNumberWithCommas(
                                                                parseFloat(item.total || 0).toFixed(2)
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {/* Total Row */}
                                            <tr className="add-sales-return-total-row">
                                                <td colSpan="2">
                                                    <strong>Total</strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        {itemInputs
                                                            .filter((item) => item.itemName.trim() !== "")
                                                            .reduce(
                                                                (sum, item) =>
                                                                    sum + parseFloat(item.quantity || 0),
                                                                0
                                                            )}
                                                    </strong>
                                                </td>
                                                <td></td>
                                                <td>
                                                    <strong>
                                                        ₹{" "}
                                                        {formatNumberWithCommas(
                                                            itemInputs
                                                                .filter((item) => item.itemName.trim() !== "")
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
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        ₹{" "}
                                                        {formatNumberWithCommas(
                                                            itemInputs
                                                                .filter((item) => item.itemName.trim() !== "")
                                                                .reduce(
                                                                    (sum, item) =>
                                                                        sum + parseFloat(item.taxAmount || 0),
                                                                    0
                                                                )
                                                                .toFixed(2)
                                                        )}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <strong>
                                                        ₹{" "}
                                                        {formatNumberWithCommas(
                                                            calculateSubTotal().toFixed(2)
                                                        )}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="add-sales-return-no-padding-cell"
                                                >
                                                    <div className="add-sales-return-tax-summary-wrapper">
                                                        <div className="add-sales-return-tax-summary-title">
                                                            Tax Summary:
                                                        </div>
                                                        <table className="add-sales-return-tax-summary-table">
                                                            <thead>
                                                                {(() => {
                                                                    // Check if any item has IGST
                                                                    const hasIGST = itemInputs
                                                                        .filter(
                                                                            (item) => item.itemName.trim() !== ""
                                                                        )
                                                                        .some((item) => item.isIGST);

                                                                    return (
                                                                        <>
                                                                            <tr>
                                                                                <th
                                                                                    rowSpan="2"
                                                                                    className="add-sales-return-ts-col-hsn"
                                                                                >
                                                                                    HSN/ SAC
                                                                                </th>
                                                                                <th
                                                                                    rowSpan="2"
                                                                                    className="add-sales-return-ts-col-taxable"
                                                                                >
                                                                                    Taxable amount (₹)
                                                                                </th>
                                                                                {hasIGST ? (
                                                                                    <th
                                                                                        colSpan="2"
                                                                                        className="add-sales-return-ts-col-igst"
                                                                                    >
                                                                                        IGST
                                                                                    </th>
                                                                                ) : (
                                                                                    <>
                                                                                        <th
                                                                                            colSpan="2"
                                                                                            className="add-sales-return-ts-col-cgst"
                                                                                        >
                                                                                            CGST
                                                                                        </th>
                                                                                        <th
                                                                                            colSpan="2"
                                                                                            className="add-sales-return-ts-col-sgst"
                                                                                        >
                                                                                            SGST
                                                                                        </th>
                                                                                    </>
                                                                                )}
                                                                                <th
                                                                                    rowSpan="2"
                                                                                    className="add-sales-return-ts-col-total"
                                                                                >
                                                                                    Total Tax (₹)
                                                                                </th>
                                                                            </tr>
                                                                            <tr>
                                                                                {hasIGST ? (
                                                                                    <>
                                                                                        <th className="add-sales-return-ts-col-rate">
                                                                                            Rate (%)
                                                                                        </th>
                                                                                        <th className="add-sales-return-ts-col-amt">
                                                                                            Amt (₹)
                                                                                        </th>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <th className="add-sales-return-ts-col-rate">
                                                                                            Rate (%)
                                                                                        </th>
                                                                                        <th className="add-sales-return-ts-col-amt">
                                                                                            Amt (₹)
                                                                                        </th>
                                                                                        <th className="add-sales-return-ts-col-rate">
                                                                                            Rate (%)
                                                                                        </th>
                                                                                        <th className="add-sales-return-ts-col-amt">
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
                                                                    const validItems = itemInputs.filter(
                                                                        (item) => item.itemName.trim() !== ""
                                                                    );

                                                                    const taxGroups = {};
                                                                    validItems.forEach((item) => {
                                                                        const taxPercent = parseFloat(
                                                                            item.taxPercent || 0
                                                                        );
                                                                        const taxAmount = parseFloat(
                                                                            item.taxAmount || 0
                                                                        );
                                                                        const quantity = parseFloat(
                                                                            item.quantity || 0
                                                                        );
                                                                        const price = parseFloat(item.price || 0);
                                                                        const discountAmount = parseFloat(
                                                                            item.discountAmount || 0
                                                                        );
                                                                        const subtotal = quantity * price;
                                                                        const afterDiscount =
                                                                            subtotal - discountAmount;
                                                                        const taxableAmount =
                                                                            afterDiscount - taxAmount;
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
                                                                    const grandTotalTaxable =
                                                                        taxGroupsArray.reduce(
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
                                                                                            <td className="add-sales-return-ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    group.taxableAmount.toFixed(2)
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-center">
                                                                                                {group.taxPercent.toFixed(2)}
                                                                                            </td>
                                                                                            <td className="ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    group.totalTax.toFixed(2)
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-right">
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
                                                                                            <td className="add-sales-return-ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    group.taxableAmount.toFixed(2)
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-center">
                                                                                                {cgstRate}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    cgstAmount
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-center">
                                                                                                {sgstRate}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    sgstAmount
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="add-sales-return-ta-right">
                                                                                                {formatNumberWithCommas(
                                                                                                    group.totalTax.toFixed(2)
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    );
                                                                                }
                                                                            })}
                                                                            <tr className="add-sales-return-total-row">
                                                                                <td className="add-sales-return-ta-center">
                                                                                    TOTAL
                                                                                </td>
                                                                                <td className="add-sales-return-ta-right">
                                                                                    {formatNumberWithCommas(
                                                                                        grandTotalTaxable.toFixed(2)
                                                                                    )}
                                                                                </td>
                                                                                {hasIGST ? (
                                                                                    <>
                                                                                        <td className="add-sales-return-ta-center">
                                                                                            &nbsp;
                                                                                        </td>
                                                                                        <td className="add-sales-return-ta-right">
                                                                                            {formatNumberWithCommas(
                                                                                                grandTotalTax.toFixed(2)
                                                                                            )}
                                                                                        </td>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <td className="add-sales-return-ta-center">
                                                                                            &nbsp;
                                                                                        </td>
                                                                                        <td className="add-sales-return-ta-right">
                                                                                            {formatNumberWithCommas(
                                                                                                (grandTotalTax / 2).toFixed(2)
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="add-sales-return-ta-center">
                                                                                            &nbsp;
                                                                                        </td>
                                                                                        <td className="add-sales-return-ta-right">
                                                                                            {formatNumberWithCommas(
                                                                                                (grandTotalTax / 2).toFixed(2)
                                                                                            )}
                                                                                        </td>
                                                                                    </>
                                                                                )}
                                                                                <td className="add-sales-return-ta-right">
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
                            )}

                            {/* Two Column Layout Below Items Table */}
                            <div className="add-sales-return-estimate-bottom-section">
                                <div className="add-sales-return-estimate-left-column-content">
                                    <div className="add-sales-return-amount-words">
                                        <p>
                                            <strong>Sales Return / Credit Note Amount In Words: </strong>{" "}
                                            {numberToWords(calculateSubTotal())}
                                        </p>
                                    </div>
                                    <div className="add-sales-return-terms">
                                        <p>
                                            <strong>Terms and Conditions</strong> Thanks for doing
                                            business with us!
                                        </p>
                                    </div>
                                </div>
                                <div className="add-sales-return-right-column-content">
                                    <div className="add-sales-return-summary-item">
                                        <strong>Total</strong>
                                        <span>
                                            ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                                        </span>
                                    </div>
                                    <div className="add-sales-return-summary-item add-sales-return-no-border">
                                        <span className="add-sales-return-total-label">
                                            <strong>Total</strong>
                                        </span>
                                        <span>
                                            ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                                        </span>
                                    </div>
                                    <div className="add-sales-return-summary-item">
                                        <span>Paid Amount</span>
                                        <span>
                                            ₹{" "}
                                            {formatNumberWithCommas(
                                                parseFloat(paidAmount || 0).toFixed(2)
                                            )}
                                        </span>
                                    </div>
                                    <div className="add-sales-return-summary-item">
                                        <span>Balance</span>
                                        <span>
                                            ₹{" "}
                                            {formatNumberWithCommas(
                                                (
                                                    calculateSubTotal() - parseFloat(paidAmount || 0)
                                                ).toFixed(2)
                                            )}
                                        </span>
                                    </div>
                                    <div className="add-sales-return-summary-item">
                                        <span>You Saved</span>
                                        <span>
                                            ₹{" "}
                                            {formatNumberWithCommas(
                                                itemInputs
                                                    .filter((item) => item.itemName.trim() !== "")
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
                            </div>
                            {/* <div className="add-sales-return-footer">
                <div className="add-sales-return-company-signature">
                  <p>For : {companyName}</p>
                  <p>Authorized Signatory</p>
                </div>
              </div> */}
                        </div>

                        <div className="add-sales-return-action-buttons">
                            <button
                                className="add-sales-return-save-new-btn"
                                onClick={handleSaveNew}
                            >
                                Save & New
                            </button>
                            <div className="add-sales-return-action-icons">
                                <button
                                    className="add-sales-return-icon-btn"
                                    onClick={shareViaWhatsApp}
                                >
                                    📱
                                </button>
                                <button
                                    className="add-sales-return-icon-btn"
                                    onClick={printInvoice}
                                >
                                    🖨️
                                </button>
                                <button
                                    className="add-sales-return-icon-btn"
                                    onClick={generateAndDownloadPDF}
                                >
                                    ⬇️
                                </button>
                            </div>
                        </div>
                    </div>
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
export default AddSalesReturn;
