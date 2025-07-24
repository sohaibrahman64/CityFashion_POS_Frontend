import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL, GENERATE_INVOICE_NUMBER } from '../Constants';
import './InvoiceNumber.css';

const InvoiceNumber = ({ invoiceNumber, setInvoiceNumber }) => {


  return (
    <div className="invoice-number-container">
      <span className="invoice-number-label">Invoice #:</span>
      <span className="invoice-number-value">{invoiceNumber}</span>
    </div>
  );
};

export default InvoiceNumber; 