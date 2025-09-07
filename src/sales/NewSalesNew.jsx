import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BASE_URL,
  SEARCH_PRODUCTS_STARTS_WITH,
  GET_ALL_PRODUCTS_NEW,
  CREATE_NEW_SALES_INVOICE,
  GENERATE_INVOICE_NUMBER_NEW_SALES_INVOICE,
  CREATE_PRODUCT_TRANSACTION,
  GET_TAX_RATES,
  GET_TAX_RATES_LABELS,
} from "../Constants";
import "./NewSalesNew.css";
import Toast from "../components/Toast";
import html2pdf from "html2pdf.js";

const NewSalesNew = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isFullyReceived, setIsFullyReceived] = useState(false);
  const [itemInputs, setItemInputs] = useState([
    {
      id: 1,
      itemName: "",
      quantity: "",
      price: "",
      discount: "",
      discountAmount: "", // New field for discount amount
      total: "0.00",
      productId: null,
      taxType: "With Tax", // New field for tax type
      taxRateId: null, // New field for selected tax rate ID
      taxAmount: "0.00", // New field for tax amount
    },
  ]);
  const [taxRates, setTaxRates] = useState([]);
  const [headerTaxType, setHeaderTaxType] = useState("With Tax");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [invoiceNumber, setInvoiceNumber] = useState("RS-00001");

  const suggestionsRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const invoicePreviewRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Search products when search term changes
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchProducts(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Fetch all products when activeRowIndex changes (on focus)
  useEffect(() => {
    if (activeRowIndex !== null) {
      fetchAllProducts();
    }
  }, [activeRowIndex]);

  // Fetch invoice number when component mounts
  useEffect(() => {
    fetchInvoiceNumber();
  }, []);

  const shareViaWhatsApp = () => {
    try {
      // Create a simple text message for WhatsApp
      const message = `Invoice Details:
Customer: ${customerName || 'N/A'}
Total Amount: ₹${calculateSubTotal().toFixed(2)}
Items: ${itemInputs.filter(item => item.itemName.trim() !== '').length} items
Date: ${new Date().toLocaleDateString()}

Thank you for your business!`;
      
      // Encode the message for WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      
      // Open WhatsApp in a new window
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      setToastMessage("Error sharing via WhatsApp. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const printInvoice = () => {
    if (!invoicePreviewRef.current) {
      console.error("Invoice preview element not found");
      return;
    }

    // Clone the invoice preview element to avoid modifying the original
    const element = invoicePreviewRef.current.cloneNode(true);
    
    // Remove action buttons from print
    const actionButtons = element.querySelector('.action-buttons');
    if (actionButtons) {
      actionButtons.remove();
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-preview { max-width: 800px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .invoice-header { text-align: center; margin-bottom: 20px; }
            .invoice-title { text-align: center; color: #333; }
            .invoice-details { margin: 20px 0; }
            .summary-item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
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

  const generateAndDownloadPDF = async () => {
    try {
      if (!invoicePreviewRef.current) {
        console.error("Invoice preview element not found");
        return;
      }

      // Clone the invoice preview element to avoid modifying the original
      const element = invoicePreviewRef.current.cloneNode(true);
      
      // Remove action buttons from PDF
      const actionButtons = element.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.remove();
      }

      // Configure PDF options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice_${customerName || 'Customer'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
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

  const searchProducts = async (query) => {
    try {
      let url = `${BASE_URL}/${SEARCH_PRODUCTS_STARTS_WITH}`;

      // If query is provided, add it as search parameter
      if (query && query.trim()) {
        url += `?searchTerm=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products);
        setShowSuggestions(data.products.length > 0);
      } else {
        console.error("Failed to search products");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSaveNew = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${CREATE_NEW_SALES_INVOICE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          customerName: customerName,
          customerPhone: customerPhone,
          items: itemInputs,
          receivedAmount: receivedAmount,
          totalAmount: calculateSubTotal(),
          balanceAmount:
            calculateSubTotal() - parseFloat(receivedAmount || 0),
          discountAmount:
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
              ),
          isFullyReceived: isFullyReceived,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Invoice created successfully:", data);
        setToastMessage("Invoice created successfully!");
        setToastType("success");
        setShowToast(true);
        
        // Create product transactions for all items sold
        await createProductTransactions(data);
        
        // Clear all form fields after successful invoice creation
        setCustomerName("");
        setCustomerPhone("");
        setReceivedAmount("");
        setIsFullyReceived(false);
        setItemInputs([
          {
            id: 1,
            itemName: "",
            quantity: "",
            price: "",
            discount: "",
            discountAmount: "",
            total: "0.00",
            productId: null,
            hsnCode: null,
            taxType: "With Tax",
          },
        ]);
        setSearchTerm("");
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveRowIndex(null);
        setSelectedProduct(null);
        
        // Increment invoice number for next invoice
        setInvoiceNumber(prevNumber => incrementInvoiceNumber(prevNumber));
        
        // Generate and download PDF after successful invoice creation
        await generateAndDownloadPDF();
        
        // Add any additional logic here, like redirecting to the invoice page
      } else {
        console.error("Failed to create invoice");
        setToastMessage("Failed to create invoice. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setToastMessage("Error creating invoice. Please check your connection and try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const incrementInvoiceNumber = (currentInvoiceNumber) => {
    // Handle alphanumeric invoice numbers like "RS-00012"
    const match = currentInvoiceNumber.match(/^([A-Z]+)-(\d+)$/);
    
    if (match) {
      const prefix = match[1]; // "RS"
      const numberPart = parseInt(match[2], 10); // 12
      const nextNumber = numberPart + 1;
      
      // Format the number part with leading zeros (minimum 5 digits)
      const formattedNumber = nextNumber.toString().padStart(5, '0');
      return `${prefix}-${formattedNumber}`;
    }
    
    // Fallback: if format doesn't match, just increment as number
    if (!isNaN(currentInvoiceNumber)) {
      return parseInt(currentInvoiceNumber, 10) + 1;
    }
    
    // Default fallback
    return "RS-00001";
  };

  const createProductTransactions = async (invoiceData) => {
    try {
      // Filter out empty items and create transactions for each product sold
      const validItems = itemInputs.filter(item => 
        item.itemName.trim() !== "" && item.productId && item.quantity && item.price
      );

      if (validItems.length === 0) {
        console.log("No valid items to create transactions for");
        return;
      }

      const transactions = validItems.map(item => ({
        productId: item.productId,
        productName: item.itemName,
        transactionType: "SALE",
        referenceId: invoiceData.id || null, // Invoice ID from backend response
        referenceType: "SALES_INVOICE",
        referenceNumber: invoiceNumber,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.price),
        totalValue: parseFloat(item.total),
        description: `Sale of ${item.quantity} units of ${item.itemName} at ₹${item.price} per unit`,
        transactionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: "SYSTEM", // You can replace this with actual user info if available
        notes: `Invoice: ${invoiceNumber}, Customer: ${customerName}`,
        status: "COMPLETED"
      }));

      const response = await fetch(`${BASE_URL}/${CREATE_PRODUCT_TRANSACTION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactions),
      });

      if (response.ok) {
        const transactionData = await response.json();
        console.log("Product transactions created successfully:", transactionData);
      } else {
        console.error("Failed to create product transactions");
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error creating product transactions:", error);
    }
  };

  const fetchInvoiceNumber = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${GENERATE_INVOICE_NUMBER_NEW_SALES_INVOICE}`);
      console.log(response.body);
      if (response.ok) {
        const data = await response.json();
        setInvoiceNumber(data.invoiceNumber || "RS-00001");
      } else {
        console.error("Failed to fetch invoice number");
        setInvoiceNumber("RS-00001");
      }
    } catch (error) {
      console.error("Error fetching invoice number:", error);
      setInvoiceNumber("RS-00001");
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_PRODUCTS_NEW}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products);
        setShowSuggestions(data.products.length > 0);
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

  const handleItemNameChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].itemName = value;
    setItemInputs(newItemInputs);

    // Set this row as active and update search term
    setActiveRowIndex(index);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchTerm(value);
  };

  const handleProductSelect = (product, index) => {
    console.log(product);
    
    // Calculate discount values based on product's discount type
    let discount = "0";
    let discountAmount = "0.00";
    
    if (product.pricing && product.pricing.discountAmount > 0) {
      if (product.pricing.discountType === "PERCENTAGE") {
        discount = product.pricing.discountAmount.toString();
        // Calculate amount from percentage
        const price = parseFloat(product.pricing.salePrice) || 0;
        const quantity = 1; // Default quantity
        discountAmount = ((price * quantity * product.pricing.discountAmount) / 100).toFixed(2);
      } else if (product.pricing.discountType === "AMOUNT") {
        discountAmount = product.pricing.discountAmount.toString();
        // Calculate percentage from amount
        const price = parseFloat(product.pricing.salePrice) || 0;
        const quantity = 1; // Default quantity
        if (price > 0 && quantity > 0) {
          discount = ((product.pricing.discountAmount / (price * quantity)) * 100).toFixed(2);
        }
      }
    }
    
    // Find matching tax rate
    let taxRateId = null;
    if (product.purchasePriceTaxes && product.purchasePriceTaxes.taxRate) {
      const productTaxRate = product.purchasePriceTaxes.taxRate;
      const matchingTaxRateIndex = taxRates.findIndex(rate => 
        rate.id === productTaxRate.id || 
        rate.label === productTaxRate.label ||
        rate.rate === productTaxRate.rate
      );
      if (matchingTaxRateIndex !== -1) {
        taxRateId = matchingTaxRateIndex.toString();
      }
    }
    
    // Calculate price based on tax type selection
    let calculatedPrice = product.pricing.salePrice || 0;
    
    if (headerTaxType === "With Tax" && product.purchasePriceTaxes && product.purchasePriceTaxes.taxRate) {
      // If "With Tax" is selected, calculate price including tax
      const taxRate = product.purchasePriceTaxes.taxRate.rate || 0;
      calculatedPrice = product.pricing.salePrice + (product.pricing.salePrice * taxRate / 100);
    }
    
    itemInputs[index] = {
      ...itemInputs[index],
      itemName: product.name,
      price: calculatedPrice.toFixed(2),
      quantity: "1",
      discount: discount,
      discountAmount: discountAmount,
      total: "0.00",
      productId: product.id,
      hsnCode: product.hsn,
      taxRateId: taxRateId,
      taxAmount: "0.00",
    };
    setItemInputs(itemInputs);
    setSelectedProduct(product);
    setShowSuggestions(false);
    setSearchTerm("");
    setActiveRowIndex(null);

    // Calculate total for this row
    calculateRowTotal(index);
  };

  const handleQuantityChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].quantity = value;
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
    
    // Calculate discount percentage from amount
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

  const handleTaxTypeChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].taxType = value;
    setItemInputs(newItemInputs);
  };

  const handleTaxRateChange = (index, value) => {
    const newItemInputs = [...itemInputs];
    newItemInputs[index].taxRateId = value;
    
    // Get the selected tax rate by array index
    const selectedTaxRate = taxRates[parseInt(value)];
    if (selectedTaxRate) {
      const rate = selectedTaxRate.rate || 0;
      
      const price = parseFloat(newItemInputs[index].price) || 0;
      const quantity = parseFloat(newItemInputs[index].quantity) || 0;
      const subtotal = price * quantity;
      const taxAmount = (subtotal * rate) / 100;
      newItemInputs[index].taxAmount = taxAmount.toFixed(2);
    }
    
    setItemInputs(newItemInputs);
  };

  const calculateRowTotal = (index) => {
    const newItemInputs = [...itemInputs];
    const quantity = parseFloat(newItemInputs[index].quantity) || 0;
    const price = parseFloat(newItemInputs[index].price) || 0;
    const discount = parseFloat(newItemInputs[index].discount) || 0;

    const subtotal = quantity * price;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    
    // Calculate tax on the amount after discount
    const selectedTaxRate = taxRates[parseInt(newItemInputs[index].taxRateId)];
    let taxAmount = 0;
    if (selectedTaxRate) {
      const rate = selectedTaxRate.rate || 0;
      taxAmount = (afterDiscount * rate) / 100;
    }
    const total = afterDiscount + taxAmount;

    newItemInputs[index].taxAmount = taxAmount.toFixed(2);
    newItemInputs[index].total = total.toFixed(2);
    setItemInputs(newItemInputs);
  };

  const addNewRow = () => {
    const newRow = {
      id: itemInputs.length + 1,
      itemName: "",
      quantity: "",
      price: "",
      discount: "",
      discountAmount: "",
      total: "0.00",
      productId: null,
      hsnCode: null,
      taxType: "With Tax",
      taxRateId: null,
      taxAmount: "0.00",
    };
    setItemInputs([...itemInputs, newRow]);
  };

  const removeRow = (index) => {
    if (itemInputs.length > 1 || index === 0) {
      const newItemInputs = itemInputs.filter((_, i) => i !== index);
      setItemInputs(newItemInputs);
    }
  };

  const calculateSubTotal = () => {
    return itemInputs.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );
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

  // Show mobile message if on mobile device
  if (isMobile) {
    return (
      <div className="desktop-only-message">
        <h2>Desktop Only Application</h2>
        <p>
          This application is designed for desktop use only. Please access it
          from a computer or laptop.
        </p>
        <p>Minimum screen width required: 769px</p>
      </div>
    );
  }

  return (
    <div className="new-sales-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-left">
          <span className="sale-label">Sale</span>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => navigate('/sales')}>
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="main-content">
        {/* Left Column - Input Fields */}
        <div className="left-column">
          <div className="input-section">
            <div className="customer-fields">
              <div className="input-group">
                <label htmlFor="customerName">Customer Name*</label>
                <input
                  type="text"
                  id="customerName"
                  placeholder="Enter Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="customerPhone">Customer Phone Number</label>
                <input
                  type="tel"
                  id="customerPhone"
                  placeholder="Enter Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="items-section">
              <table className="items-table-new-sales">
                <thead>
                  <tr>
                    <th className="header-cell">#</th>
                    <th className="header-cell">ITEM</th>
                    <th className="header-cell">QTY</th>
                    <th className="header-cell price-unit-header">
                      <div className="price-unit-split">
                        <div className="price-label">PRICE/UNIT</div>
                        <div className="tax-type-select">
                          <select 
                            className="header-tax-select"
                            value={headerTaxType}
                            onChange={(e) => setHeaderTaxType(e.target.value)}
                          >
                            <option value="With Tax">With Tax</option>
                            <option value="Without Tax">Without Tax</option>
                          </select>
                        </div>
                      </div>
                    </th>
                    <th className="header-cell discount-header">
                      <div className="discount-split">
                        <div className="discount-label">DISCOUNT(%)</div>
                        <div className="discount-sub-split">
                          <div className="discount-percent-label">%</div>
                          <div className="discount-amount-label">AMOUNT</div>
                        </div>
                      </div>
                    </th>
                    <th className="header-cell tax-header">
                      <div className="tax-split">
                        <div className="tax-label">TAX</div>
                        <div className="tax-sub-split">
                          <div className="tax-percent-label">%</div>
                          <div className="tax-amount-label">AMOUNT</div>
                        </div>
                      </div>
                    </th>
                    <th className="header-cell">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {itemInputs.map((item, index) => (
                    <tr key={item.id} className="item-row">
                      <td className="cell item-id-cell">
                        <span className="item-id">{item.id}</span>
                        {(itemInputs.length > 1 || index === 0) && (
                          <button
                            className="remove-row-btn"
                            onClick={() => removeRow(index)}
                            title="Remove Row"
                          >
                            ×
                          </button>
                        )}
                      </td>
                      <td className="cell item-name-cell">
                        <input
                          type="text"
                          placeholder="Enter Item"
                          value={item.itemName}
                          onChange={(e) => {
                            handleItemNameChange(index, e.target.value);
                          }}
                          onFocus={() => {
                            setActiveRowIndex(index);
                          }}
                        />
                        {showSuggestions && activeRowIndex === index && (
                          <div
                            className="suggestions-dropdown"
                            ref={suggestionsRef}
                          >
                            {suggestions.length > 0 ? (
                              suggestions.map((product) => (
                                <div
                                  key={product.id}
                                  className="suggestion-item"
                                  onClick={() =>
                                    handleProductSelect(product, index)
                                  }
                                >
                                  <div className="product-name">
                                    {product.productName || product.name}
                                  </div>
                                  <div className="product-code">
                                    {product.productCode || product.code}
                                  </div>
                                  <div className="product-price">
                                    ₹{product.pricing.salePrice || "0.00"}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-suggestions">
                                No products found
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="cell">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                        />
                      </td>
                      <td className="cell price-unit-cell">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) =>
                            handlePriceChange(index, e.target.value)
                          }
                          className="price-input"
                        />
                      </td>
                      <td className="cell discount-cell">
                        <div className="discount-split">
                          <div className="discount-sub-split">
                            <input
                              type="number"
                              placeholder="0"
                              value={item.discount}
                              onChange={(e) =>
                                handleDiscountChange(index, e.target.value)
                              }
                              className="discount-input"
                            />
                            <input
                              type="number"
                              placeholder="0.00"
                              value={item.discountAmount}
                              onChange={(e) =>
                                handleDiscountAmountChange(index, e.target.value)
                              }
                              className="discount-amount-input"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="cell tax-cell">
                        <div className="tax-split">
                          <div className="tax-sub-split">
                            <select
                              value={item.taxRateId || ""}
                              onChange={(e) =>
                                handleTaxRateChange(index, e.target.value)
                              }
                              className="tax-select"
                            >
                              <option value="">Select Tax</option>
                              {taxRates.map((taxRate, rateIndex) => (
                                <option key={taxRate.id} value={rateIndex}>
                                  {item.taxRateId == rateIndex ? `✓ ${taxRate.label}` : taxRate.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="0.00"
                              value={item.taxAmount}
                              readOnly
                              className="tax-amount-display"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="cell">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="add-row-btn" onClick={addNewRow}>
                + Add Row
              </div>
            </div>

            <div className="payment-section">
              <div className="summary-row">
                <div className="summary-item">
                  <span>Sub Total</span>
                  <span>
                    ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                  </span>
                </div>
              </div>
              <div className="payment-row">
                <div className="payment-label">
                  <label>Received</label>
                </div>
                <div className="payment-controls">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                  />
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="fullyReceived"
                      checked={isFullyReceived}
                      onChange={(e) =>
                        handleFullyReceivedChange(e.target.checked)
                      }
                    />
                    <label htmlFor="fullyReceived">Fully Received</label>
                  </div>
                </div>
              </div>
              <div className="balance-row">
                <div className="summary-item">
                  <span>Balance:</span>
                  <span>
                    ₹{" "}
                    {formatNumberWithCommas(
                      (
                        calculateSubTotal() - parseFloat(receivedAmount || 0)
                      ).toFixed(2)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="total-amount-bar">
              <span>Total Amount (₹)</span>
              <span>
                {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Preview */}
        <div className="right-column">
          <div className="invoice-preview" ref={invoicePreviewRef}>
            <div className="invoice-header">
              <div className="company-info">
                <h3>My Company</h3>
                <p>9823430425</p>
              </div>
              <div className="logo-placeholder">LOGO</div>
            </div>

            <div className="header-separator"></div>

            <h2 className="invoice-title">Tax Invoice</h2>

            <div className="invoice-details">
              <div className="details-header">
                <div className="bill-to">
                  <h4>Bill To</h4>
                  <p>{customerName || "Customer Name"}</p>
                  <p>{customerPhone || "Contact No."}</p>
                </div>

                <div className="invoice-info">
                  <h4>Invoice Details</h4>
                  <div className="info-row">
                    <span>Invoice No.: {invoiceNumber}</span>
                  </div>
                  <div className="info-row">
                    <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              </div>

              {/* Items Table - Only visible when items are selected */}
              {itemInputs.some((item) => item.itemName.trim() !== "") && (
                <div className="invoice-items-table">
                  <table className="items-preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Name</th>
                        <th>HSN Code</th>
                        <th>Qty</th>
                        <th>Price/Unit</th>
                        <th>Discount</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemInputs
                        .filter((item) => item.itemName.trim() !== "")
                        .map((item, index) => (
                          <tr key={item.id} className="item-preview-row">
                            <td>{index + 1}</td>
                            <td>{item.itemName}</td>
                            <td>{item.hsnCode || "N/A"}</td>
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
                              <span className="discount-percentage">
                                ({item.discount || 0}%)
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
                      <tr className="total-row">
                        <td colSpan="3">
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
                              calculateSubTotal().toFixed(2)
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Two Column Layout Below Items Table */}
              <div className="invoice-bottom-section">
                <div className="left-column-content">
                  <div className="amount-words">
                    <p>
                      <strong>Invoice Amount in Words:</strong>{" "}
                      {numberToWords(calculateSubTotal())}
                    </p>
                  </div>
                  <div className="terms">
                    <p>
                      <strong>Terms and Conditions</strong> Thanks for doing
                      business with us!
                    </p>
                  </div>
                </div>

                <div className="right-column-content">
                  <div className="summary-item">
                    <span>Sub Total</span>
                    <span>
                      ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                    </span>
                  </div>
                  <div className="summary-item no-border">
                    <span className="total-label">
                      <strong>Total</strong>
                    </span>
                    <span>
                      ₹ {formatNumberWithCommas(calculateSubTotal().toFixed(2))}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Received</span>
                    <span>
                      ₹{" "}
                      {formatNumberWithCommas(
                        parseFloat(receivedAmount || 0).toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Balance</span>
                    <span>
                      ₹{" "}
                      {formatNumberWithCommas(
                        (
                          calculateSubTotal() - parseFloat(receivedAmount || 0)
                        ).toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="summary-item">
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

              <div className="invoice-footer">
                <div className="company-signature">
                  <p>For : My Company</p>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="save-new-btn" onClick={handleSaveNew}>
                Save & New
              </button>
              <div className="action-icons">
                <button className="icon-btn whatsapp" onClick={shareViaWhatsApp}>📱</button>
                <button className="icon-btn print" onClick={printInvoice}>🖨️</button>
                <button className="icon-btn download" onClick={generateAndDownloadPDF}>⬇️</button>
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

export default NewSalesNew;
