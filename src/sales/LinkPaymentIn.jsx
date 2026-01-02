import "./LinkPaymentIn.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  BASE_URL,
  GET_PARTIAL_OR_UNPAID_PARTIES,
  LINK_PAYMENT_TO_TRANSACTIONS,
} from "../Constants";
import Toast from "../components/Toast";

const LinkPaymentIn = ({ onClose, party, receivedAmount }) => {
  const navigate = useNavigate();
  const [selectedParty, setSelectedParty] = useState(party || null);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const inputRef = useRef(null);
  const [receivedAmountState, setReceivedAmountState] = useState(
    receivedAmount || "0.00"
  );
  const [partyTransactions, setPartyTransactions] = useState([]);
  const [linkedAmounts, setLinkedAmounts] = useState({});
  const [selectedTransactions, setSelectedTransactions] = useState({});
  const linkedInputRefs = useRef({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  // Ref to store timeout for closing modal after showing toast
  const toastCloseTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize linked amounts and selection when transactions change
    const initialLinked = {};
    const initialSelected = {};
    partyTransactions.forEach((t, idx) => {
      const key = t.transactionId ?? t.id ?? t.txnId ?? String(idx);
      const amt =
        t.linkedAmount !== undefined && t.linkedAmount !== null
          ? String(t.linkedAmount)
          : "0.00";
      initialLinked[key] = amt;
      initialSelected[key] = parseFloat(amt) > 0;
    });
    setLinkedAmounts(initialLinked);
    setSelectedTransactions(initialSelected);
  }, [partyTransactions]);

  const handleLinkedAmountChange = (transactionId, value) => {
    // Allow only numbers and one decimal point, max 2 decimals
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) sanitized = parts[0] + "." + parts.slice(1).join("");
    if (sanitized.includes(".")) {
      const [intPart, decPart] = sanitized.split(".");
      sanitized = intPart + "." + decPart.slice(0, 2);
    }
    setLinkedAmounts((prev) => ({ ...prev, [transactionId]: sanitized }));
    // auto-select row if positive amount entered
    const numericVal = parseFloat(sanitized) || 0;
    if (numericVal > 0) {
      setSelectedTransactions((prev) => ({ ...prev, [transactionId]: true }));
    }
  };

  const handleToggleSelect = (transactionId, checked) => {
    setSelectedTransactions((prev) => ({ ...prev, [transactionId]: checked }));
    if (!checked) {
      // reset linked amount when row is deselected
      setLinkedAmounts((prev) => ({ ...prev, [transactionId]: "0.00" }));
    } else {
      setLinkedAmounts((prev) => ({
        ...prev,
        [transactionId]: prev[transactionId] ?? "0.00",
      }));
      // focus and select the linked amount input after it becomes visible
      setTimeout(() => {
        const el = linkedInputRefs.current[transactionId];
        if (el) {
          el.focus();
          if (typeof el.select === "function") el.select();
        }
      }, 0);
    }
  };

  const totalLinked = Object.values(linkedAmounts).reduce(
    (s, v) => s + (parseFloat(v) || 0),
    0
  );
  const unusedAmount = Math.max(
    0,
    (parseFloat(receivedAmountState) || 0) - totalLinked
  ).toFixed(2);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [unusedAmountState, setUnusedAmountState] = useState("0.00");

  const handleDone = async () => {
    console.log("Selected Party:", selectedParty);
    const items = partyTransactions
      .map((txn, idx) => {
        const key = txn.transactionId ?? txn.id ?? txn.txnId ?? String(idx);
        if (!selectedTransactions[key]) return null;
        return {
          partyTransactionId: txn.transactionId ?? txn.id ?? key,
          linkedAmount: parseFloat(linkedAmounts[key]) || 0,
          referenceNumber: txn.referenceNumber || "",
        };
      })
      .filter(Boolean);

    const payload = {
      party: selectedParty,
      receivedAmount: parseFloat(receivedAmountState) || 0,
      linkedAmountItems: items,
      unusedAmount: parseFloat(unusedAmount) || 0,
      paymentInId: null,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${BASE_URL}/${LINK_PAYMENT_TO_TRANSACTIONS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Link payment failed:", text);
        setToastMessage("Error linking payment");
        setToastType("error");
        setShowToast(true);
        setIsSubmitting(false);
        return;
      } else {
        const data = await response.json();
        console.log("Link payment response:", data);
        setUnusedAmountState(data.unusedAmount || "0.00");
        setToastMessage(data.message);
        setToastType("success");
        setShowToast(true);

        // Prepare payload to return to parent so it can display the unused amount
        const resultPayload = {
          success: true,
          unusedAmount: data.unusedAmount ?? "0.00",
          linkPaymentInTxnId: data.linkPaymentInTxnId ?? null,
        };

        // success - close modal/navigate after a short delay to allow toast to appear
        // clear any existing timeout
        if (toastCloseTimeoutRef.current)
          clearTimeout(toastCloseTimeoutRef.current);

        toastCloseTimeoutRef.current = setTimeout(() => {
          if (typeof onClose === "function") {
            onClose(resultPayload);
          } else {
            navigate(-1);
          }
        }, 2000);
      } // delay to allow toast to become visible
    } catch (error) {
      console.error("Error linking payment:", error);
      alert("Error linking payment. See console for details.");
      setToastMessage("Error linking payment");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isEditingAmount && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingAmount]);

  const fetchPartiesTransactions = async (partyId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/${GET_PARTIAL_OR_UNPAID_PARTIES}?partyId=${partyId}`
      );
      const data = await response.json();
      setPartyTransactions(data ? data : []);
    } catch (error) {
      console.error("Error fetching parties report:", error);
      setPartyTransactions([]);
    }
  };

  useEffect(() => {
    if (selectedParty) {
      fetchPartiesTransactions(selectedParty.id);
    }
  }, [selectedParty]);

  // Clean up any pending toast-close timeout when component unmounts
  useEffect(() => {
    return () => {
      if (toastCloseTimeoutRef.current) {
        clearTimeout(toastCloseTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="link-payment-in-overlay">
      <div className="link-payment-in-modal">
        {/* Header */}
        <div className="link-payment-in-header">
          <h2>Link Payment To Txn</h2>
          <button
            type="button"
            className="link-payment-in-close-icon-button"
            title="Close"
            onClick={() => {
              if (typeof onClose === "function") {
                onClose();
              } else {
                // Fallback: navigate back if no onClose handler provided
                navigate(-1);
              }
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="link-payment-in-body">
          <div className="link-payment-in-form-group">
            <div className="link-payment-in-top">
              <div className="link-payment-in-party-block">
                <label className="link-payment-in-label-small">Party</label>
                <div className="link-payment-in-party-name">
                  {selectedParty ? selectedParty.partyName : "Select Party"}
                </div>
              </div>

              <div className="link-payment-in-received-block">
                <label className="link-payment-in-label-small link-payment-in-received-label">
                  Received
                </label>
                <div className="link-payment-in-received-value">
                  <input
                    id="link-payment-in-received-amount"
                    ref={inputRef}
                    type="text"
                    readOnly={!isEditingAmount}
                    value={receivedAmountState}
                    onChange={(e) => setReceivedAmountState(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setIsEditingAmount(false);
                      if (e.key === "Escape") setIsEditingAmount(false);
                    }}
                  />
                  <button
                    type="button"
                    className="link-payment-in-edit-amount"
                    title={isEditingAmount ? "Save" : "Edit"}
                    onClick={() => {
                      setIsEditingAmount((s) => !s);
                    }}
                  >
                    {isEditingAmount ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 21v-3l11-11 3 3L6 21H3z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="link-payment-in-reset-block">
                <button className="link-payment-in-reset-btn" title="Reset">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-3-6.7"></path>
                    <polyline points="21 3 21 9 15 9"></polyline>
                  </svg>
                  <span>RESET</span>
                </button>
              </div>
            </div>

            <div className="link-payment-in-separator" />

            <div className="link-payment-in-controls">
              <select className="link-payment-in-txn-filter">
                <option>All transactions</option>
              </select>
              <div className="link-payment-in-search-box">
                <input placeholder="Search" />
              </div>
            </div>

            <div className="link-payment-in-table">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Ref/Inv No.</th>
                    <th>Total</th>
                    <th>Balance</th>
                    <th>Linked Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {partyTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="link-payment-in-no-data">
                        {" "}
                        No transactions found for this party.
                      </td>
                    </tr>
                  ) : (
                    partyTransactions.map((txn, idx) => {
                      const key =
                        txn.transactionId ?? txn.id ?? txn.txnId ?? String(idx);
                      return (
                        <tr
                          key={key}
                          className={
                            selectedTransactions[key]
                              ? "link-payment-in-selected"
                              : ""
                          }
                          onClick={(e) => {
                            const tag = (
                              (e.target && e.target.tagName) ||
                              ""
                            ).toLowerCase();
                            // Allow toggle on row click, but skip if clicking on interactive elements
                            const isInteractive = [
                              "input",
                              "button",
                              "svg",
                              "path",
                              "select",
                              "a",
                            ].includes(tag);
                            if (!isInteractive) {
                              handleToggleSelect(
                                key,
                                !selectedTransactions[key]
                              );
                            }
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={!!selectedTransactions[key]}
                              onChange={(e) =>
                                handleToggleSelect(key, e.target.checked)
                              }
                            />
                          </td>
                          <td>{formatDate(txn.date)}</td>
                          <td>{txn.transactionType}</td>
                          <td>{txn.referenceNumber}</td>
                          <td className="link-payment-in-align-right">
                            {txn.partyTotal}
                          </td>
                          <td className="link-payment-in-align-right">
                            {txn.partyBalance}
                          </td>
                          <td className="link-payment-in-align-right">
                            {selectedTransactions[key] ? (
                              <input
                                ref={(el) =>
                                  (linkedInputRefs.current[key] = el)
                                }
                                type="text"
                                className="link-payment-in-linked-amount"
                                value={linkedAmounts[key] ?? ""}
                                onChange={(e) =>
                                  handleLinkedAmountChange(key, e.target.value)
                                }
                                onFocus={(e) => e.target.select()}
                              />
                            ) : (
                              <span className="link-payment-in-linked-placeholder">
                                {"0.00"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="link-payment-in-footer">
              <div className="link-payment-in-footer-left">
                Unused Amount : <strong>{unusedAmount}</strong>
              </div>
              <div className="link-payment-in-footer-actions">
                <button
                  className="link-payment-in-btn link-payment-in-cancel"
                  onClick={() => {
                    if (typeof onClose === "function") {
                      onClose();
                    } else {
                      navigate(-1);
                    }
                  }}
                >
                  CANCEL
                </button>
                <button
                  className="link-payment-in-btn link-payment-in-done"
                  onClick={handleDone}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "DONE"}
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

export default LinkPaymentIn;
