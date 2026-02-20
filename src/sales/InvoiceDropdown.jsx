import { useEffect, useRef, useState } from "react";
import { BASE_URL, GET_ALL_SALES_INVOICES } from "../Constants";
import "./InvoiceDropdown.css";

const InvoiceDropdown = ({
  onInvoiceSelect,
  selectedInvoice,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedInvoice) {
      const selectedValue =
        typeof selectedInvoice === "string" ||
        typeof selectedInvoice === "number"
          ? selectedInvoice
          : selectedInvoice?.invoiceNumber || "";
      setSearchTerm(selectedValue || "");
    }
  }, [selectedInvoice]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/${GET_ALL_SALES_INVOICES}`);
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setInvoices(list);
        setFilteredInvoices(list);
      } else {
        console.error("Failed to fetch invoices");
        setInvoices([]);
        setFilteredInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
      setFilteredInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const nextValue = e.target.value;
    setSearchTerm(nextValue);
    setIsOpen(true);
    if (nextValue.trim() === "") {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter((invoice) =>
      String(invoice?.invoiceNumber || "")
        .toLowerCase()
        .includes(nextValue.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  const handleSelect = (invoice) => {
    setSearchTerm(invoice?.invoiceNumber || "");
    setIsOpen(false);
    if (onInvoiceSelect) {
      onInvoiceSelect(invoice);
    }
  };

  return (
    <div className="invoice-numbers-dropdown" ref={dropdownRef}>
      <div className="invoice-numbers-dropdown-input-wrapper">
        <input
          type="text"
          className="invoice-numbers-dropdown-input"
          placeholder="Select invoice number"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <div className="invoice-numbers-dropdown-arrow">▼</div>
      </div>

      {isOpen && (
        <div className="invoice-numbers-dropdown-list">
          {isLoading ? (
            <div className="invoice-numbers-dropdown-no-results">Loading</div>
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <div
                key={invoice?.id || invoice?.invoiceNumber}
                className="invoice-numbers-dropdown-item"
                onClick={() => handleSelect(invoice)}
              >
                {invoice?.invoiceNumber}
              </div>
            ))
          ) : (
            <div className="invoice-numbers-dropdown-no-results">
              No invoice numbers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceDropdown;
