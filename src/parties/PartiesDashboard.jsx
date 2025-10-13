import "./PartiesDashboard.css";
import { useState, useRef, useEffect } from "react";

const PartiesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [showPartyActionsMenu, setShowPartyActionsMenu] = useState(false);
  const [activePartyId, setActivePartyId] = useState(null);
  const partyActionsRef = useRef(null);

  // Sample data - replace with actual API call
  const sampleParties = [
    { id: 1, name: "Shadab", amount: 0.00 },
    { id: 2, name: "Shree Krishna Garments", amount: 0.00 },
    { id: 3, name: "Sameer", amount: 0.00 },
    { id: 4, name: "Arjun Singh", amount: 0.00 },
  ];

  useEffect(() => {
    setParties(sampleParties);
    setFilteredParties(sampleParties);
    if (sampleParties.length > 0) {
      setSelectedPartyId(sampleParties[0].id);
    }
  }, []);

  // Filter parties when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((party) =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParties(filtered);
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePartyClick = (partyId) => {
    setSelectedPartyId(partyId);
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
          <button className="parties-dashboard-add-party-btn">
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
                <div className="party-name">{party.name}</div>
                <div className="party-amount">
                  ₹ {party.amount.toFixed(2)}
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
                {selectedParty?.name || "Select a Party"}
              </h3>
              <span className="edit-icon">✏️</span>
            </div>
            <div className="party-contact-info">
              <div className="contact-row">
                <span className="contact-label">Phone Number</span>
                <span className="contact-value">8389253518</span>
              </div>
              <div className="contact-row">
                <span className="contact-label">Billing Address</span>
                <span className="contact-value">
                  Blk. No. 528/1055, Opp. Shubhlaxmi Apt. Ulhasnagar - 421004
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
                        <span>Number</span>
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
                        <span></span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PoS Sale</td>
                    <td>INV-2</td>
                    <td>17/08/2025</td>
                    <td>₹ 1,943.00</td>
                    <td>₹ 0.00</td>
                    <td>
                      <div className="transaction-dots">⋮</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartiesDashboard;
