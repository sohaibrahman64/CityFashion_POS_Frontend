import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { BASE_URL, MENU } from "../Constants";
import {
  FaChartLine, FaBoxOpen, FaFileInvoice, FaUsers, FaCogs, FaUserShield,
  FaSignOutAlt, FaShoppingCart, FaMoneyBill, FaFileAlt, FaPlus, FaMinus, FaFileInvoiceDollar
} from "react-icons/fa";

const iconMap = {
  Dashboard: <FaChartLine />,
  Sales: <FaShoppingCart />,
  Products: <FaBoxOpen />,
  Inventory: <FaBoxOpen />,
  Invoices: <FaFileInvoice />,
  Purchase: <FaMoneyBill />,
  Expenses: <FaMoneyBill />,
  Reports: <FaFileAlt />,
  Customers: <FaUsers />,
  Users: <FaUserShield />,
  Settings: <FaCogs />,
  Suppliers: <FaUsers />,
  Logout: <FaSignOutAlt />
};

const Sidebar = ({ roleId }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${MENU}`, {
          params: { roleId }
        });
        if (response.data) {
          setMenuItems(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again later.");
        setMenuItems([]);
      }
    };

    if (roleId) {
      fetchMenu();
    }
  }, [roleId]);

  const toggleMenuItem = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleMenuItemClick = (item) => {
    if (item.children?.length > 0) {
      toggleMenuItem(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenu = (items) =>
    items.map((item) => (
      <div key={item.id} className="menu-item">
        <div
          className={`menu-label${location.pathname === item.path ? " active" : ""}`}
          onClick={() => handleMenuItemClick(item)}
          style={{ cursor: "pointer" }}
        >
          {iconMap[item.name] || <FaFileInvoiceDollar />}
          <span className="menu-text">{item.name}</span>
          {item.children?.length > 0 && (
            <span className="menu-arrow">
              {expandedItems.has(item.id) ? <FaMinus /> : <FaPlus />}
            </span>
          )}
        </div>
        {item.children?.length > 0 && expandedItems.has(item.id) && (
          <div className="submenu">{renderMenu(item.children)}</div>
        )}
      </div>
    ));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">RetailStack</div>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <nav className="menu">{renderMenu(menuItems)}</nav>
      )}
    </aside>
  );
};

export default Sidebar;
