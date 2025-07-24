import React, { useRef } from "react";
import "./InvoicePrint.css";
import { SHOP_NAME, SHOP_ADDRESS } from "../Constants";
import html2pdf from "html2pdf.js";

const InvoicePrint = ({ invoice }) => {
  const invoiceRef = useRef();

  const handleDownloadPDF = () => {
    if (invoiceRef.current) {
      html2pdf()
        .from(invoiceRef.current)
        .set({
          margin: 10,
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    }
  };

  const handleShareOnWhatsApp = () => {
    const message = `Invoice ${invoice.invoiceNumber}\nCustomer: ${
      invoice.printData.customer?.name
    }\nTotal: ₹${parseFloat(
      invoice.printData.totals.grandTotal.toFixed(2)
    )}\nPaid: ₹${parseFloat(invoice.printData.totals.paid).toFixed(
      2
    )}\nDue: ₹${parseFloat(invoice.printData.totals.due).toFixed(2)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = ""; // Remove app name from header

    window.print();

    document.title = originalTitle; // Restore original title after printing
  };

  if (!invoice) return <div className="print-error">Invoice not found.</div>;

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

  const formatNumber = (number) => {
    return parseFloat(number).toFixed(2).toString();
  };

  return (
    <div className="print-container">
      <div ref={invoiceRef}>
        <div className="store-header">
          <h1 className="store-title">{SHOP_NAME}</h1>
          <h2 className="store-address">{SHOP_ADDRESS}</h2>
        </div>
        <div className="invoice-box">
          <div className="invoice-header">
            <p>
              <strong>Invoice Number:</strong> {invoice.invoiceNumber}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
            </p>
          </div>

          <div className="customer-info">
            <p>
              <strong>Customer:</strong> {invoice.printData.customer?.name}
            </p>
            <p>
              <strong>Phone:</strong> {invoice.printData.customer?.phone}
            </p>
            <p>
              <strong>Address: </strong> {invoice.printData.customer?.address}
            </p>
            <p>
              <strong>Email: </strong> {invoice.printData.customer?.email}
            </p>
          </div>

          <div className="items-section">
            <h3>Items:</h3>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.printData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>₹{formatNumber(item.price)}</td>
                    <td>₹{formatNumber(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary">
            <p>
              <strong>Subtotal:</strong> ₹
              {formatNumber(invoice.printData.totals.subtotal)}
            </p>
            {/* <p><strong>Tax (10%):</strong> ₹{formatNumber(invoice.printData.totals.tax)}</p> */}
            <p>
              <strong>Discount:</strong> ₹
              {formatNumber(invoice.printData.totals.discount)}
            </p>
            <p>
              <strong>Grand Total:</strong> ₹
              {formatNumber(invoice.printData.totals.grandTotal)}
            </p>
            <p>
              <strong>Paid:</strong> ₹
              {formatNumber(invoice.printData.totals.paid)}
            </p>
            <p>
              <strong>Due:</strong> ₹
              {formatNumber(invoice.printData.totals.due)}
            </p>
            <div className="payment-breakup">
              <h4>Payment Breakup:</h4>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Payment Mode</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.printData?.payments?.map((payment, idx) => (
                    <tr key={idx}>
                      <td>{payment.paymentMode}</td>
                      <td>₹{formatNumber(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="thank-you-message">Thank you for visiting!</div>
        </div>
      </div>
      <div className="print-buttons">
        <button className="button" onClick={handlePrint}>🖨️ Print Invoice</button>
        <button className="button" onClick={handleDownloadPDF}>📄 Download PDF</button>
        <button className="button" onClick={handleShareOnWhatsApp}>📤 Share on WhatsApp</button>
      </div>
    </div>
  );
};

export default InvoicePrint;
