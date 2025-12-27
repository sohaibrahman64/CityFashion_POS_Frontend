import "./PartiesDashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import AddParty from "./AddParty";
import { BASE_URL, GET_ALL_PARTIES, GET_PARTIES_REPORT } from "../Constants";

const PartiesDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [parties, setParties] = useState([]);
  const [partiesTransactions, setPartiesTransactions] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [showPartyActionsMenu, setShowPartyActionsMenu] = useState(false);
  const [activePartyId, setActivePartyId] = useState(null);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [editParty, setEditParty] = useState(null);
  const [partyReports, setPartyReports] = useState([]);
  const [showPartyTransactionActionsMenu, setShowPartyTransactionActionsMenu] =
    useState(false);
  const [activePartyTransactionId, setActivePartyTransactionId] =
    useState(null);
  const partyTransactionActionsRef = useRef(null);
  const partyActionsRef = useRef(null);

  // Fetch parties from backend
  const fetchParties = async () => {
    try {
      const res = await fetch(`${BASE_URL}/${GET_ALL_PARTIES}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setParties(list);
      setFilteredParties(list);
      if (list.length > 0) {
        setSelectedPartyId(list[0].id);
        // Fetch reports for the first party immediately
        fetchPartiesReport(list[0].id);
      }
    } catch (e) {
      console.error("Failed to load parties", e);
      setParties([]);
      setFilteredParties([]);
    }
  };

  // Fetch parties reports from backend
  const fetchPartiesReport = async (partyId) => {
    if (!partyId) return;
    try {
      const response = await fetch(
        `${BASE_URL}/${GET_PARTIES_REPORT}?partyId=${partyId}`
      );
      const data = await response.json();
      setPartyReports(data ? data : []);
      setPartiesTransactions(data ? data : []);
    } catch (error) {
      console.error("Error fetching parties report:", error);
      setPartyReports([]);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "-";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  // Handle transaction actions click
  const handleTransactionActionsClick = (transactionId, event) => {
    event.stopPropagation();
    setActivePartyTransactionId(transactionId);
    setShowPartyTransactionActionsMenu(true);
  };

  // Handle transaction action selection
  const handleTransactionAction = (action, transactionId) => {
    console.log(`${action} action for transaction:`, transactionId);

    // Find the transaction data
    const transaction = partiesTransactions.find((t) => t.id === transactionId);

    switch (action) {
      case "view_edit":
        if (transaction) {
          console.log("Viewing/Editing transaction:", transaction);
          if (transaction.transactionType === "SALE") {
            navigate("/sales/new", {
              state: { invoiceId: transaction.invoiceId },
            });
          } else if (transaction.transactionType === "PURCHASE") {
            navigate("/purchases/new", {
              state: { invoiceId: transaction.invoiceId },
            });
          }
        }
        break;
      case "delete":
        if (transaction) {
          console.log("Delete transaction:", transaction);
        }
        break;
      case "duplicate":
        if (transaction) {
          console.log("Duplicate transaction:", transaction);
        }
        break;
      case "open_pdf":
        if (transaction) {
          console.log("Open PDF for transaction:", transaction);
        }
        break;
      case "preview":
        if (transaction) {
          console.log("Preview transaction:", transaction);
        }
        break;
      case "print":
        if (transaction) {
          console.log("Print transaction:", transaction);
        }
        break;
      case "convert_to_return":
        if (transaction) {
          console.log("Convert to return for transaction:", transaction);
        }
        break;
      case "download_attachments":
        if (transaction) {
          console.log("Download attachments for transaction:", transaction);
        }
        break;
      case "view_history":
        if (transaction) {
          console.log("View history for transaction:", transaction);
        }
        break;
      default:
        console.warn("Unknown action:", action);
    }

    setShowPartyTransactionActionsMenu(false);
    setActivePartyTransactionId(null);
  };

  useEffect(() => {
    fetchParties();
  }, []);

  // Filter parties when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((party) =>
        party.partyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParties(filtered);
      setSelectedPartyId(filtered[0].id);
      fetchPartiesReport(filtered[0].id);
    }
  }, [searchTerm, parties]);

  // Handle clicks outside party actions menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        partyActionsRef.current &&
        !partyActionsRef.current.contains(event.target)
      ) {
        setShowPartyActionsMenu(false);
        setActivePartyId(null);
      }

      if (
        partyTransactionActionsRef.current &&
        !partyTransactionActionsRef.current.contains(event.target)
      ) {
        setShowPartyTransactionActionsMenu(false);
        setActivePartyTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePartyClick = (partyId) => {
    setSelectedPartyId(partyId);
    fetchPartiesReport(partyId);
  };

  const handlePartyActionsClick = (partyId, event) => {
    event.stopPropagation();
    setActivePartyId(partyId);
    setShowPartyActionsMenu(true);
  };

  const handlePartyAction = (action, partyId) => {
    console.log(`${action} action for party:`, partyId);
    setShowPartyActionsMenu(false);
    setActivePartyId(null);
  };

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  return (
    <div className="parties-dashboard-container">
      {/* Header Section */}
      <div className="parties-dashboard-header-section">
        <div className="parties-dashboard-header-left">
          <span className="parties-dashboard-label">Parties</span>
        </div>
        <div className="parties-dashboard-header-right">
          <button
            className="parties-dashboard-add-party-btn"
            onClick={() => setShowAddPartyModal(true)}
          >
            + Add Party
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="parties-dashboard-content">
        {/* Left Column - Party List */}
        <div className="parties-list-column">
          {/* Search Bar */}
          <div className="parties-search-bar">
            <input
              type="text"
              className="parties-search-input"
              placeholder="Search Party Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Party List Header */}
          <div className="parties-list-header">
            <span className="party-name-header">Party Name</span>
            <span className="filter-icon">🔽</span>
            <span className="amount-header">Amount</span>
          </div>

          {/* Party List */}
          <div className="parties-list">
            {filteredParties.map((party) => (
              <div
                key={party.id}
                className={`party-row ${
                  selectedPartyId === party.id ? "selected" : ""
                }`}
                onClick={() => handlePartyClick(party.id)}
              >
                <div className="party-name">
                  {party.partyName || party.name}
                </div>
                <div className={`party-amount ${party.paymentType === "toPay" ? "parties-dashboard-amount-to-pay" : party.paymentType === "toReceive" ? "parties-dashboard-amount-to-receive" : ""}`}>
                  ₹ {(party.updatedBalance ?? 0).toFixed(2)}
                </div>
                <div className="party-actions">
                  <div
                    className="party-three-dots"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePartyActionsClick(party.id, e);
                    }}
                  >
                    ⋮
                  </div>

                  {/* Party Actions Menu */}
                  {showPartyActionsMenu && activePartyId === party.id && (
                    <div className="party-actions-menu" ref={partyActionsRef}>
                      <div
                        className="party-action-item"
                        onClick={() => handlePartyAction("view_edit", party.id)}
                      >
                        View/Edit
                      </div>
                      <div
                        className="party-action-item"
                        onClick={() => handlePartyAction("delete", party.id)}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Party Details and Transactions */}
        <div className="party-details-column">
          {/* Party Details Section */}
          <div className="party-details-section">
            <div className="party-name-header-row">
              <h3 className="party-detail-name">
                {selectedParty?.partyName ||
                  selectedParty?.name ||
                  "Select a Party"}
              </h3>
              <button
                className="party-detail-edit-icon"
                title="Edit Party"
                onClick={() => {
                  if (selectedParty) {
                    setEditParty(selectedParty);
                    setShowAddPartyModal(true);
                  }
                }}
              >
                ✏️
              </button>
            </div>
            <div className="party-contact-info">
              <div className="contact-row">
                <span className="contact-label">Phone Number</span>
                <span className="contact-value">
                  {selectedParty?.phoneNumber || "-"}
                </span>
              </div>
              <div className="contact-row">
                <span className="contact-label">Billing Address</span>
                <span className="contact-value">
                  {selectedParty?.billingAddress || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="party-transactions-section">
            <h3 className="transactions-title">Transactions</h3>
            <div className="transactions-table-wrapper">
              <table className="party-transactions-table">
                <thead>
                  <tr>
                    <th>
                      <div className="table-header">
                        <span>Type</span>
                        <span className="filter-icon">🔽</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header">
                        <span>Invoice No.</span>
                        <span className="filter-icon">🔽</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header">
                        <span>Date</span>
                        <span className="filter-icon">🔽</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header">
                        <span>Total</span>
                        <span className="filter-icon">🔽</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header">
                        <span>Balance</span>
                        <span className="filter-icon">🔽</span>
                      </div>
                    </th>
                    <th>
                      <div className="table-header">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {partyReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.transactionType}</td>
                      <td>{report.invoiceNumber}</td>
                      <td>{formatDate(report.date)}</td>
                      <td>₹ {report.partyTotal?.toFixed(2) ?? 0}</td>
                      <td>₹ {report.partyBalance?.toFixed(2) ?? 0}</td>
                      <td>
                        <div
                          className="parties-dashboard-transaction-actions"
                          title="More actions"
                        >
                          <div
                            className="parties-dashboard-transaction-three-dots"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransactionActionsClick(report.id, e);
                            }}
                          >
                            ⋮
                          </div>
                          {/* Transaction Actions Menu can be implemented similarly to Party Actions Menu */}
                          {showPartyTransactionActionsMenu &&
                            activePartyTransactionId === report.id && (
                              <div
                                className="parties-dashboard-transaction-actions-menu"
                                ref={partyTransactionActionsRef}
                              >
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_edit",
                                      report.id
                                    )
                                  }
                                >
                                  View/Edit
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction("delete", report.id)
                                  }
                                >
                                  Delete
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "duplicate",
                                      report.id
                                    )
                                  }
                                >
                                  Duplicate
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "open_pdf",
                                      report.id
                                    )
                                  }
                                >
                                  Open PDF
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "preview",
                                      report.id
                                    )
                                  }
                                >
                                  Preview
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction("print", report.id)
                                  }
                                >
                                  Print
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "convert_to_return",
                                      report.id
                                    )
                                  }
                                >
                                  Convert To Return
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "download_attachments",
                                      report.id
                                    )
                                  }
                                >
                                  Download Attachments
                                </div>
                                <div
                                  className="parties-dashboard-transaction-action-item"
                                  onClick={() =>
                                    handleTransactionAction(
                                      "view_history",
                                      report.id
                                    )
                                  }
                                >
                                  View History
                                </div>
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Party Modal */}
      {showAddPartyModal && (
        <AddParty
          onClose={() => {
            setShowAddPartyModal(false);
            setEditParty(null);
          }}
          initialParty={editParty}
          onSuccess={fetchParties}
        />
      )}
    </div>
  );
};

export default PartiesDashboard;
