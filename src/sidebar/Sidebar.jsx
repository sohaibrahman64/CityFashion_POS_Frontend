import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { BASE_URL, MENU, GET_ALL_ACTIVE_MENUS } from "../Constants";
import {
  FaHome,
  FaChartLine,
  FaBoxOpen,
  FaFileInvoice,
  FaUsers,
  FaCogs,
  FaUserShield,
  FaSignOutAlt,
  FaShoppingCart,
  FaMoneyBill,
  FaFileAlt,
  FaPlus,
  FaMinus,
  FaFileInvoiceDollar,
  FaHandHoldingUsd,
  FaBarcode,
  FaFileContract,
  FaBuilding,
  FaUserPlus,
  FaFileImport, 
  FaListAlt,
  FaRupeeSign,
  FaDesktop,
  FaListUl,
  FaInbox,
  FaJediOrder,
  FaReceipt,
  FaCreditCard,
  FaDollarSign,
  FaHandshake,
  FaPersonBooth,
  FaServicestack,
  FaProductHunt,
  FaShoppingBasket,
  FaPercent,
  FaMoneyBillWave
} from "react-icons/fa";
import Home from "../home/Home";
import SalesDashboard from "../sales/SalesDashboard";
import ItemsDashboard from "../items/ItemsDashboard";
import BarcodeGenerator from "../settings/BarcodeGenerator";
import ReportsDashboard from "../reports/ReportsDashboard";
import MyBusiness from "../settings/MyBusiness";
import Logout from "../login/LogoutPage";
import ItemCategoriesDashboard from "../items/ItemCategoriesDashboard";
import EstimateQuotationDashboard from "../sales/EstimateQuotationDashboard";

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
  Logout: <FaSignOutAlt />,
};

const iconMapNew = {
  Home: <FaHome />,
  Parties: <FaUsers />,
  SalesDashboard: <FaRupeeSign />,
  NewSalesNew: <FaFileInvoice />,
  NewSalesPOS: <FaDesktop />,
  EstimateQuotationDashboard: <FaListUl />,
  ProformaInvoiceDashboard: <FaInbox />,
  PaymentInDashboard: <FaDollarSign />,
  SalesOrderDashboard: <FaJediOrder />,
  DeliveryChallanDashboard: <FaReceipt />,
  SalesReturnDashboard: <FaCreditCard />,
  ItemsDashboard: <FaBoxOpen />,
  PurchaseDashboard: <FaHandHoldingUsd />,
  ExpensesDashboard: <FaMoneyBill />,
  PaymentOutDashboard: <FaDollarSign />,
  BarcodeGenerator: <FaBarcode />,
  ReportsDashboard: <FaFileContract />,
  TransactionsReport: <FaHandshake />,
  PartyReport: <FaPersonBooth />,
  GSTReport: <FaServicestack />,
  ItemsReport: <FaShoppingBasket />,
  TaxReport: <FaPercent />,
  ExpensesReport: <FaMoneyBillWave />,
  SalesPurchaseOrderReport: <FaFileContract />,
  BulkImportItems: <FaFileImport />,
  ItemCategoriesDashboard: <FaListAlt />,
  MyBusiness: <FaBuilding />,
  Logout: <FaSignOutAlt />,
};

const Sidebar = ({ roleId, onMenuItemClick }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /* useEffect(() => {
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
  }, [roleId]); */

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${GET_ALL_ACTIVE_MENUS}`);
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again later.");
        setMenuItems([]);
      }
    };
    fetchMenu();
  }, []);

  const toggleMenuItem = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleMenuItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    if (item.children?.length > 0) {
      toggleMenuItem(item.id);
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const renderMenu = (items) =>
    items.map((item) => (
      <div key={item.id} className="menu-item">
        <div
          className={`menu-label${
            location.pathname === item.path ? " active" : ""
          }`}
          onClick={() => handleMenuItemClick(item)}
          style={{ cursor: "pointer" }}
        >
          {iconMapNew[item.filename] || <FaFileInvoiceDollar />}
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
    <aside className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">
          {isExpanded ? "RetailStack" : "RS"}
        </span>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {isExpanded ? <FaMinus /> : <FaPlus />}
        </button>
      </div>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <nav className="menu">{renderMenu(menuItems)}</nav>
      )}
    </aside>
  );
};

export default Sidebar;
