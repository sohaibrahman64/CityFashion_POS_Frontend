import React, { useState, useEffect, useRef } from "react";
import "./PartiesDropdown.css";
import { BASE_URL, GET_ALL_PARTIES } from "../Constants";
import AddParty from "./AddParty";

const PartiesDropdown = ({ onPartySelect, selectedParty, showAddParty = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch parties from backend
  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/${GET_ALL_PARTIES}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      console.log(list);
      setParties(list);
      setFilteredParties(list);
    } catch (e) {
      console.error("Failed to load parties", e);
      setParties([]);
      setFilteredParties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    if (selectedParty && parties.length > 0) {
      const match = parties.find((party) => party.id === selectedParty);
      if (match) {
        setSearchTerm(match.partyName || match.name || "");
      }
    }}, [selectedParty, parties]);

  // Filter parties when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((party) =>
        (party.partyName || party.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.phoneNumber || "").includes(searchTerm)
      );
      setFilteredParties(filtered);
    }
  }, [searchTerm, parties]);

  // Handle clicks outside dropdown to close it
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

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handlePartySelect = (party) => {
    setSearchTerm(party.partyName || party.name || "");
    setIsOpen(false);
    if (onPartySelect) {
      onPartySelect(party);
    }
  };

  const handleAddPartyClick = () => {
    setShowAddPartyModal(true);
  };

  const handleAddPartySuccess = () => {
    fetchParties(); // Refresh the parties list
  };

  const handleAddPartyClose = () => {
    setShowAddPartyModal(false);
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance) || 0;
    return num.toFixed(0);
  };

  return (
    <div className="parties-dropdown-container">
      <div className="parties-dropdown-wrapper" ref={dropdownRef}>
        {/* Customer Input Field */}
        <div className="parties-dropdown-input-container">
          <div className="parties-dropdown-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="parties-dropdown-input"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            <div className="parties-dropdown-arrow">▼</div>
          </div>
        </div>

        {/* Dropdown List */}
        {isOpen && (
          <div className="parties-dropdown-list">
            {loading ? (
              <div className="parties-dropdown-loading">Loading...</div>
            ) : (
              <>
                {/* Add Party Button - Inside Dropdown */}
                {showAddParty && (
                  <div className="parties-dropdown-add-party-container">
                    <button
                      className="parties-dropdown-add-party-btn"
                      onClick={handleAddPartyClick}
                    >
                      <span className="add-party-icon">+</span>
                      <span className="add-party-text">Add Party</span>
                    </button>
                  </div>
                )}
                
                {/* Party List */}
                {filteredParties.length > 0 ? (
                  filteredParties.map((party) => (
                    <div
                      key={party.id}
                      className="parties-dropdown-item"
                      onClick={() => handlePartySelect(party)}
                    >
                      <div className="party-info">
                        <div className="party-name">
                          {party.partyName || party.name || "Unnamed Party"}
                        </div>
                        <div className="party-phone">
                          {party.phoneNumber || "No phone"}
                        </div>
                      </div>
                      <div className="party-balance">
                        {formatBalance(party.openingBalance)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="parties-dropdown-no-results">
                    No parties found
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>


      {/* Add Party Modal */}
      {showAddPartyModal && (
        <AddParty
          onClose={handleAddPartyClose}
          onSuccess={handleAddPartySuccess}
        />
      )}
    </div>
  );
};

export default PartiesDropdown;
