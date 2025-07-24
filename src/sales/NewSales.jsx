import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BASE_URL,
  CREATE_INVOICE,
  GENERATE_INVOICE_NUMBER,
  GET_ALL_PAYMENT_MODES,
  GET_INVENTORY_BY_BARCODE,
  GET_PRODUCT_BY_BARCODE,
  SAVE_INVENTORY,
} from "../Constants";
import "./NewSales.css";

import SupplierSelect from "../suppliers/SupplierSelect";
import CustomerSelect from "./CustomerSelect";
import InvoiceNumber from "./InvoiceNumber";
import InvoicePrint from "./InvoicePrint";
import ProductSelect from "../product/ProductSelect";

const NewSales = () => {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(null);
  const [paymentBreakup, setPaymentBreakup] = useState([
    { modeId: "", amount: "" },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);

  const initialForm = {
    invoiceDate: new Date().toLocaleDateString("en-CA"),
    customer: "",
    discountAmount: 0,
  };
  const [form, setForm] = useState(initialForm);

  const [showProductNotFoundModal, setShowProductNotFoundModal] = useState(false);
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false);
  const [missingProductInfo, setMissingProductInfo] = useState({ name: '', index: null });
  const [addInventoryForm, setAddInventoryForm] = useState({
    productId: '',
    quantity: '',
    purchasePrice: '',
    supplier: '',
    purchaseDate: '',
    billNumber: '',
  });

  const fetchInvoiceNumber = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/${GENERATE_INVOICE_NUMBER}`
      );
      setInvoiceNumber(response.data);
    } catch (error) {
      console.error("Error fetching invoice number:", error);
      setInvoiceNumber("Error");
    }
  };

  const handlePaymentChange = (index, field, value) => {
    const updated = [...paymentBreakup];
    updated[index][field] = field === "amount" ? parseFloat(value || 0) : value;
    setPaymentBreakup(updated);
    // Recalculate total paid
    const newTotalPaid = updated.reduce(
      (sum, entry) => sum + (parseFloat(entry.amount) || 0),
      0
    );
    setPaidAmount(newTotalPaid);
  };

  const addPaymentRow = () => {
    setPaymentBreakup([...paymentBreakup, { modeId: "", amount: "" }]);
  };

  const removePaymentRow = (index) => {
    const updated = [...paymentBreakup];
    updated.splice(index, 1);
    setPaymentBreakup(updated);
  };

  const totalPaid = paymentBreakup.reduce(
    (sum, p) => sum + (parseFloat(p.amount) || 0),
    0
  );

  useEffect(() => {
    if (!invoiceNumber) fetchInvoiceNumber();
  }, []);

  const calculateInvoiceSummary = () => {
    if (invoiceItems.length === 0) {
      return {
        subtotal: "0.00",
        discount: "0.00",
        tax: "0.00",
        grandTotal: "0.00",
        roundedTotal: "0.00",
      };
    }

    const subtotal = invoiceItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity || 0);
    }, 0);

    const discount = subtotal * (form.discountAmount / 100 || 0);

    const totalTax = invoiceItems.reduce((sum, item) => {
      const itemTax = item.price * item.quantity * (item.taxPercent / 100 || 0);
      return sum + (itemTax || 0);
    }, 0);

    const grandTotal = subtotal - discount + totalTax;
    const roundedTotal = Math.round(grandTotal);

    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      tax: totalTax.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      roundedTotal: roundedTotal.toFixed(2),
    };
  };

  const calculateTotal = (price, quantity, taxPercent) => {
    const base = price * quantity;
    const taxAmount = base * (taxPercent / 100);
    return +(base + taxAmount).toFixed(2);
  };

  // const handleQuantityChange = (e, index) => {
  //   const quantity = parseInt(e.target.value) || 1;
  //   const updatedItems = [...invoiceItems];

  //   const item = updatedItems[index];
  //   updatedItems[index] = {
  //     ...item,
  //     quantity,
  //     total: calculateTotal(item.price, quantity, item.taxPercent),
  //   };

  //   setInvoiceItems(updatedItems);
  // };

  const summary = calculateInvoiceSummary();

  const handleReset = () => {
    setInvoiceItems([]);
    setForm({
      invoiceDate: new Date().toLocaleDateString("en-CA"),
      customer: null,
      paymentMode: "",
      discountAmount: 0,
    });
    setShowResetConfirm(false);
  };

  const deleteRow = (index) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const handleDiscountChange = (e) => {
    const discountAmount = parseFloat(e.target.value) || 0;
    setForm({ ...form, discountAmount });
  };

  const calculateGrandTotal = () => {
    const subtotal = invoiceItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity || 0);
    }, 0);

    const discount = subtotal * (form.discountAmount / 100 || 0);

    const totalTax = invoiceItems.reduce((sum, item) => {
      const itemTax = item.price * item.quantity * (item.taxPercent / 100 || 0);
      return sum + itemTax || 0;
    }, 0);

    const grandTotal = subtotal - discount + totalTax;

    return Math.max(0, grandTotal).toFixed(2);
  };

  //const paid = parseFloat(form.paidAmount || 0);
  const total = parseFloat(summary.grandTotal || 0);
  const due = Math.max(0, total - paidAmount).toFixed(2);

  const handleBarcodeChange = async (e, index) => {
    const barcode = e.target.value;
    const updatedItems = [...invoiceItems];
    updatedItems[index].barcode = barcode;

    try {
      // Fetch Product by Barcode
      const res = await axios.get(
        `${BASE_URL}/${GET_PRODUCT_BY_BARCODE}/${barcode}`
      );
      const product = res.data;

      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        productName: product.name,
        price: product.mrp,
        taxPercent: product.tax_percent,
        quantity: 1,
        total: calculateTotal(product.mrp, 1, product.tax_percent),
      };
    } catch (err) {
      console.error("Product not found");
      updatedItems[index] = { barcode };
    }

    setInvoiceItems(updatedItems);
  };

  const fetchInventory = async (barcode, index) => {
    try {
      const inventoryRes = await axios.get(
        `${BASE_URL}/${GET_INVENTORY_BY_BARCODE}/${barcode}`
      );
      const inventory = inventoryRes.data;
      const updatedItems = [...invoiceItems];
      updatedItems[index].availableQuantity = inventory.quantity;
      setInvoiceItems(updatedItems);
    } catch (err) {
      setMissingProductInfo({ name: invoiceItems[index].productName, index });
      setShowProductNotFoundModal(true);
    }
  };

  const handleQuantityChange = (e, index) => {
    const quantity = parseInt(e.target.value) || 1;
    if (quantity > invoiceItems[index].availableQuantity) {
      alert(
        `Quantity cannot be greater than available quantity. Available quantity of ${invoiceItems[index].productName}: ${invoiceItems[index].availableQuantity}`
      );
      return;
    }
    const updatedItems = [...invoiceItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = calculateTotal(
      invoiceItems[index].price,
      quantity,
      invoiceItems[index].taxPercent
    );
    setInvoiceItems(updatedItems);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceNumber) {
      alert("Please enter an invoice number.");
      return;
    }
    if (!form.customer?.id) {
      alert("Please select a customer.");
      return;
    }
    if (!invoiceItems.length) {
      alert("Please add at least one item to the invoice.");
      return;
    }

    // Validate Quantity
    for (let i = 0; i < invoiceItems.length; i++) {
      const item = invoiceItems[i];
      if (!item.quantity || item.quantity <= 0) {
        alert(`Please enter a valid quantity for item in row ${i + 1}`);
        return;
      }
    }

    // Validate Barcodes
    for (let i = 0; i < invoiceItems.length; i++) {
      const item = invoiceItems[i];
      if (!item.barcode || item.barcode.trim() === "") {
        alert(`Please enter a barcode for item in row ${i + 1}`);
        return;
      }
    }

    // Validate Payments
    for (let i = 0; i < paymentBreakup.length; i++) {
      const entry = paymentBreakup[i];

      if (!entry.modeId) {
        alert(`Please select a payment mode in row ${i + 1}`);
        return;
      }

      if (!entry.amount || parseFloat(entry.amount) <= 0) {
        alert(`Please enter a valid amount in row ${i + 1}`);
        return;
      }
    }

    const payments = paymentBreakup.map((p) => ({
      paymentModeId: parseInt(p.modeId),
      amount: parseFloat(p.amount),
    }));

    const totalPaid = paymentBreakup.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );

    const payload = {
      invoiceNumber: invoiceNumber,
      customerId: form.customer.id,
      paymentModes: paymentBreakup.map((p) => ({
        paymentModeId: parseInt(p.modeId),
        amount: parseFloat(p.amount),
      })),

      discountPercent: parseFloat(form.discountAmount || 0),
      paidAmount: parseFloat(totalPaid || 0),
      taxAmount: parseFloat(summary.tax),
      totalAmount: parseFloat(summary.grandTotal),
      discountAmount: parseFloat(summary.discount),
      subtotalAmount: parseFloat(summary.subtotal),
      items: invoiceItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price),
        taxPercent: parseFloat(item.taxPercent),
      })),
      dueAmount: parseFloat(due),
      payments,
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/${CREATE_INVOICE}`,
        payload
      );
      const invoiceResponse = response.data;
      setSavedInvoice(invoiceResponse);

      alert(`Invoice #${invoiceNumber} saved successfully!`);

      // Optionally reset form
      setForm({ ...initialForm }); // reset customer, payment etc.
      setInvoiceItems([]); // clear table
      setPaymentBreakup([{ modeId: "", amount: "" }]);
      fetchInvoiceNumber();
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice. Please try again.");
    }
  };

  const addEmptyRow = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        barcode: "",
        quantity: 1,
        total: "0.00",
      },
    ]);
  };

  const [paymentModes, setPaymentModes] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/${GET_ALL_PAYMENT_MODES}`)
      .then((res) => setPaymentModes(res.data))
      .catch((err) => console.error("Failed to load payment modes:", err));
  }, []);

  // Modal close handler
  const handleCloseProductNotFoundModal = () => {
    // Remove the row from the table
    const updatedItems = [...invoiceItems];
    if (missingProductInfo.index !== null) {
      updatedItems.splice(missingProductInfo.index, 1);
      setInvoiceItems(updatedItems);
    }
    setShowProductNotFoundModal(false);
    setMissingProductInfo({ name: '', index: null });
  };

  const handleAddInventory = () => {
    setShowProductNotFoundModal(false);
    setAddInventoryForm({
      productName: missingProductInfo.name || '',
      quantity: '',
      purchasePrice: '',
      supplier: '',
      purchaseDate: '',
      billNumber: '',
    });
    setShowAddInventoryDialog(true);
  };

  const handleAddInventoryFormChange = (e) => {
    const { name, value } = e.target;
    setAddInventoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInventoryFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/${SAVE_INVENTORY}`, addInventoryForm);
      setShowAddInventoryDialog(false);
      setAddInventoryForm({
        productId: '',
        quantity: '',
        purchasePrice: '',
        supplier: '',
        purchaseDate: '',
        billNumber: '',
      });
      alert('Inventory entry saved successfully!');
    } catch (error) {
      alert('Error saving inventory entry.');
    }
  };

  return (
    <div className="new-invoice-container">
      {savedInvoice ? (
        <InvoicePrint invoice={savedInvoice} />
      ) : (
        <>
          <h2>New Invoice</h2>
          <InvoiceNumber
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
          />
          <div className="invoice-header">
            <label>
              Invoice Date:
              <input
                type="date"
                value={form.invoiceDate}
                onChange={(e) =>
                  setForm({ ...form, invoiceDate: e.target.value })
                }
              />
            </label>

            <label>
              Customer
              <CustomerSelect
                onCustomerSelect={(customer) => setForm({ ...form, customer })}
              />
            </label>
            <label>
              Payment Mode:
              <div className="payment-modes-group">
                {paymentBreakup.map((entry, idx) => (
                  <div key={idx} className="payment-row">
                    <select
                      value={entry.modeId}
                      onChange={(e) =>
                        handlePaymentChange(idx, "modeId", e.target.value)
                      }
                    >
                      <option value="">Select Mode</option>
                      {paymentModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.modeName}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={entry.amount}
                      onChange={(e) =>
                        handlePaymentChange(idx, "amount", e.target.value)
                      }
                      placeholder="Amount"
                      min="0"
                    />

                    {paymentBreakup.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentRow(idx)}
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}

                <button
                  className="add-payment-mode-btn"
                  type="button"
                  onClick={addPaymentRow}
                >
                  ➕ Add Payment Mode
                </button>
              </div>
            </label>
          </div>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th style={{ width: "30%" }}>Product</th>
                <th style={{ width: "15%" }}>Quantity</th>
                <th>Available Quantity</th>
                <th>MRP</th>
                {/* <th>Tax %</th> */}
                <th>Total Price</th>
                <th>Delete?</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={item.barcode}
                      onChange={(e) => handleBarcodeChange(e, idx)}
                      onBlur={() => fetchInventory(item.barcode, idx)}
                      className="barcode-input"
                    />
                  </td>
                  <td>{item.productName || "--"}</td>
                  <td>
                    <input
                      style={{ width: "20%" }}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(e, idx)}
                    />
                  </td>
                  <td>{item.availableQuantity || "--"}</td>
                  <td>₹{item.price || "--"}</td>
                  {/* <td>{item.taxPercent || "--"}</td> */}
                  <td>₹{item.total || "0.00"}</td>

                  <td>
                    <button onClick={() => deleteRow(idx)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invoice-actions">
            <button className="add-item-btn" onClick={addEmptyRow}>
              ➕ Add Item
            </button>
            <button
              className="btn-reset"
              onClick={() => setShowResetConfirm(true)}
            >
              🔄 Reset Invoice
            </button>
          </div>
          {showResetConfirm && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Reset Invoice</h3>
                <p>
                  Are you sure you want to reset the invoice? This will clear
                  all items and customer information.
                </p>
                <div className="modal-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn-confirm" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="invoice-summary-new-sales">
            <label>
              Discount (%):
              <input
                className="discount-input"
                type="number"
                value={form.discountAmount}
                onChange={handleDiscountChange}
                step="0.1"
              />
            </label>

            <div className="total-amount">Total: ₹{calculateGrandTotal()}</div>
          </div>
          <div className="invoice-breakdown">
            <div>
              <strong>Subtotal:</strong> ₹{summary.subtotal}
            </div>
            <div>
              <strong>Discount:</strong> -₹{summary.discount}
            </div>
            {/* <div>
              <strong>Tax:</strong> +₹{summary.tax}
            </div> */}
            <div>
              <strong>Grand Total:</strong> ₹{summary.grandTotal}
            </div>
            <div className="rounded-total">
              <strong>Rounded Total:</strong> ₹{summary.roundedTotal}
            </div>
            <div>
              <strong>Paid:</strong> ₹{paidAmount.toFixed(2) || 0}
            </div>
            {paidAmount < total && (
              <div className="due-amount">
                <strong>Due:</strong> ₹{due}
              </div>
            )}
          </div>
          <button onClick={handleSaveInvoice} className="btn-save">
            🧾 Save Invoice
          </button>
          {showProductNotFoundModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Product Not Found in Inventory</h3>
                <p>
                  Product <strong>{missingProductInfo.name || ''}</strong> not found in inventory.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseProductNotFoundModal}
                    className="btn-confirm"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={handleAddInventory}
                    className="btn-confirm"
                  >
                    Add Inventory
                  </button>
                </div>
              </div>
            </div>
          )}
          {showAddInventoryDialog && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Add Inventory Entry</h3>
                <form className="inventory-form" onSubmit={handleAddInventoryFormSubmit}>
                <input
                    type="text"
                    name="billNumber"
                    value={addInventoryForm.billNumber}
                    onChange={handleAddInventoryFormChange}
                    required
                    placeholder="Bill Sr. No"
                  />
                  <ProductSelect
                    onProductSelect={(product) =>
                      setAddInventoryForm((prev) => ({ ...prev, productId: product?.id || "" }))
                    }
                  />
                  <input
                    type="number"
                    name="quantity"
                    value={addInventoryForm.quantity}
                    onChange={handleAddInventoryFormChange}
                    required
                    min="1"
                    placeholder="Quantity"
                  />
                  <input
                    type="number"
                    name="purchasePrice"
                    value={addInventoryForm.purchasePrice}
                    onChange={handleAddInventoryFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Purchase Price"
                  />
                  {/* <SupplierSelect
                    name="supplier"
                    value={addInventoryForm.supplier}
                    onChange={handleAddInventoryFormChange}
                    required
                    placeholder="Supplier"
                  /> */}
                  <SupplierSelect
                    onSupplierSelect={(supplier) => 
                      setAddInventoryForm((prev) => ({ ...prev, supplierId: supplier?.id || "" }))
                    }
                  />
                  <input
                    type="date"
                    name="purchaseDate"
                    value={addInventoryForm.purchaseDate}
                    onChange={handleAddInventoryFormChange}
                    required
                    placeholder="Purchase Date"
                  />
                  
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddInventoryDialog(false)}>
                      Cancel
                    </button>
                    <button type="submit">Save Entry</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewSales;
