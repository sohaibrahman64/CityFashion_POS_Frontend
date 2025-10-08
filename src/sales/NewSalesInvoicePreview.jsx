import "./NewSalesInvoicePreview.css";
import { useNavigate, useLocation } from "react-router-dom";

const NewSalesInvoicePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state?.invoice || {};
  
  // Function to format number with commas
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get items from invoice data
  const items = invoiceData.items || [];
  const validItems = items.filter((item) => item.itemName && item.itemName.trim() !== "");
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
            className="new-sales-invoice-preview-header-right-button"
            onClick={() => navigate("/sales")}
          >
            <span className="new-sales-invoice-preview-header-right-button-label">
              Save And Close
            </span>
          </button>
        </div>
      </div>
      <div className="new-sales-invoice-preview-content-section">
        <div className="tax-invoice-title">Tax Invoice</div>
        <div className="invoice-paper">
          <div className="invoice-header-grid">
            <div className="company-block">
              <div className="company-logo">LOGO</div>
              <div className="company-info">
                <div className="company-name">My Company</div>
                <div className="company-phone">Phone: 9870253518</div>
              </div>
            </div>
            <div className="bill-invoice-grid">
              <div className="bill-to">
                <div className="section-title">Bill To:</div>
                <div className="bill-name">{invoiceData.customerName || "Customer Name"}</div>
                <div className="bill-address">{invoiceData.customerPhone || "Contact No."}</div>
                <div className="bill-state">State: 27-Maharashtra</div>
              </div>
              <div className="invoice-details">
                <div className="section-title">Invoice Details:</div>
                <div className="detail-row">
                  <span>No:</span>
                  <span>{invoiceData.invoiceNumber || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <div className="detail-row">
                  <span>Place Of Supply:</span>
                  <span>27-Maharashtra</span>
                </div>
              </div>
            </div>
          </div>

          <div className="items-table-wrapper">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th className="col-serial">#</th>
                  <th className="col-name">Item name</th>
                  <th className="col-qty">Quantity</th>
                  <th className="col-unit">Unit</th>
                  <th className="col-price">Price/ Unit(₹)</th>
                  <th className="col-discount">Discount(₹)</th>
                  <th className="col-gst">GST(₹)</th>
                  <th className="col-amount">Amount(₹)</th>
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
                <tr className="total-row">
                  <td colSpan="4">Total</td>
                  <td className="ta-right">
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
                  <td className="ta-right">
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
                  <td className="ta-right" colSpan="1"></td>
                  <td className="ta-right">
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
                  <td colSpan="8" className="no-padding-cell">
                    <div className="tax-summary-wrapper">
                      <div className="tax-summary-title">Tax Summary:</div>
                      <table className="tax-summary-table">
                        <thead>
                          <tr>
                            <th rowSpan="2" className="ts-col-hsn">
                              HSN/ SAC
                            </th>
                            <th rowSpan="2" className="ts-col-taxable">
                              Taxable amount (₹)
                            </th>
                            <th colSpan="2" className="ts-col-cgst">
                              CGST
                            </th>
                            <th colSpan="2" className="ts-col-sgst">
                              SGST
                            </th>
                            <th rowSpan="2" className="ts-col-total">
                              Total Tax (₹)
                            </th>
                          </tr>
                          <tr>
                            <th className="ts-col-rate">Rate (%)</th>
                            <th className="ts-col-amt">Amt (₹)</th>
                            <th className="ts-col-rate">Rate (%)</th>
                            <th className="ts-col-amt">Amt (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Group items by tax rate
                            const taxGroups = {};
                            validItems.forEach((item) => {
                              const taxPercent = parseFloat(item.taxPercent || 0);
                              const taxAmount = parseFloat(item.taxAmount || 0);
                              const quantity = parseFloat(item.quantity || 0);
                              const price = parseFloat(item.price || 0);
                              const discountAmount = parseFloat(item.discountAmount || 0);
                              const subtotal = quantity * price;
                              const afterDiscount = subtotal - discountAmount;
                              const taxableAmount = afterDiscount - taxAmount;
                              
                              if (!taxGroups[taxPercent]) {
                                taxGroups[taxPercent] = {
                                  taxPercent: taxPercent,
                                  taxableAmount: 0,
                                  totalTax: 0,
                                };
                              }
                              
                              taxGroups[taxPercent].taxableAmount += taxableAmount;
                              taxGroups[taxPercent].totalTax += taxAmount;
                            });
                            
                            // Convert to array and sort by tax percent
                            const taxGroupsArray = Object.values(taxGroups).sort(
                              (a, b) => a.taxPercent - b.taxPercent
                            );
                            
                            // Calculate totals
                            const grandTotalTaxable = taxGroupsArray.reduce(
                              (sum, group) => sum + group.taxableAmount,
                              0
                            );
                            const grandTotalTax = taxGroupsArray.reduce(
                              (sum, group) => sum + group.totalTax,
                              0
                            );
                            
                            return (
                              <>
                                {taxGroupsArray.map((group, index) => {
                                  const cgstRate = (group.taxPercent / 2).toFixed(2);
                                  const sgstRate = (group.taxPercent / 2).toFixed(2);
                                  const cgstAmount = (group.totalTax / 2).toFixed(2);
                                  const sgstAmount = (group.totalTax / 2).toFixed(2);
                                  
                                  return (
                                    <tr key={index}>
                                      <td></td>
                                      <td className="ta-right">
                                        {formatNumberWithCommas(
                                          group.taxableAmount.toFixed(2)
                                        )}
                                      </td>
                                      <td className="ta-center">{cgstRate}</td>
                                      <td className="ta-right">
                                        {formatNumberWithCommas(cgstAmount)}
                                      </td>
                                      <td className="ta-center">{sgstRate}</td>
                                      <td className="ta-right">
                                        {formatNumberWithCommas(sgstAmount)}
                                      </td>
                                      <td className="ta-right">
                                        {formatNumberWithCommas(
                                          group.totalTax.toFixed(2)
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="total-row">
                                  <td className="ta-center">TOTAL</td>
                                  <td className="ta-right">
                                    {formatNumberWithCommas(
                                      grandTotalTaxable.toFixed(2)
                                    )}
                                  </td>
                                  <td className="ta-center">&nbsp;</td>
                                  <td className="ta-right">
                                    {formatNumberWithCommas(
                                      (grandTotalTax / 2).toFixed(2)
                                    )}
                                  </td>
                                  <td className="ta-center">&nbsp;</td>
                                  <td className="ta-right">
                                    {formatNumberWithCommas(
                                      (grandTotalTax / 2).toFixed(2)
                                    )}
                                  </td>
                                  <td className="ta-right">
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
          <div className="invoice-footer-sections">
            <div className="terms-section">
              <div className="terms-title">Terms & Conditions:</div>
              <div className="terms-body">
                Thanks for doing business with us!
              </div>
            </div>
            <div className="sign-section">
              <div className="company-box">
                <div className="company-box-title">For My Company:</div>
              </div>
              <div className="sign-box">
                <div className="signatory-text">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSalesInvoicePreview;
