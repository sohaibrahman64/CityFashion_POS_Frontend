import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NewSalesNew from "../sales/NewSalesNew";
import PastSales from "../sales/PastSales";
import AddNewProductNew from "../product/AddNewProductNew";
import ProductList from "../product/ProductList";
import BulkImportProducts from "../product/BulkImport";
import AllInvoices from "../invoices/AllInvoices";
import ShareViaWhatsApp from "../invoices/ShareViaWhatsApp";
import PrintDownloadInvoice from "../invoices/PrintDownloadInvoice";
import AddPurchase from "../purchase/AddPurchase";
import PurchaseHistory from "../purchase/PurchaseHistory";
import AddExpenses from "../expenses/AddExpenses";
import ViewExpenses from "../expenses/ViewExpenses";
import DailyMonthly from "../reports/DailyMonthly";
import GST from "../reports/GST";
import StockReport from "../reports/StockReport";
import AddCustomer from "../customers/AddCustomer";
import CustomersList from "../customers/CustomersList";
import ShopDetails from "../settings/ShopDetails";
import TaxGST from "../settings/TaxGST";
import AddNewUser from "../users/AddNewUser";
import SetRoles from "../users/SetRoles";
import ProductCategories from "../settings/ProductCategories";
import AddInventory from "../inventory/AddInventory";
import InventoryList from "../inventory/InventoryList";
import InventoryAdjustment from "../inventory/InventoryAdjustment";
import InventoryMovements from "../inventory/InventoryMovements";
import InventoryReports from "../inventory/InventoryReports";
import LowInventoryAlerts from "../inventory/LowInventoryAlerts";
import AddSupplier from "../suppliers/AddSupplier";
import SuppliersList from "../suppliers/SuppliersList";
import BarcodeGenerator from "../settings/BarcodeGenerator";
import ProductTransactions from "../product/ProductTransactions";

const routeComponentMap = {
  "/dashboard": <Dashboard />,
  "/sales/new": <NewSalesNew />,
  "/sales/history": <PastSales />,
  "/products/add": <AddNewProductNew />,
  "/products/transactions": <ProductTransactions />,
  "/products/import": <BulkImportProducts />,
  "/invoices/all": <AllInvoices />,
  "/invoices/share": <ShareViaWhatsApp />,
  "/invoice/print": <PrintDownloadInvoice />,
  "/purchase/add": <AddPurchase />,
  "/purchase/history": <PurchaseHistory />,
  "/expenses/add": <AddExpenses />,
  "/expenses/view": <ViewExpenses />,
  "/reports/daily-monthly": <DailyMonthly />,
  "/reports/gst": <GST />,
  "/reports/stock": <StockReport />,
  "/customers/add": <AddCustomer />,
  "/customers/list": <CustomersList />,
  "/settings/shop": <ShopDetails />,
  "/settings/gst": <TaxGST />,
  "/users/add": <AddNewUser />,
  "/users/roles": <SetRoles />,
  "/settings/categories": <ProductCategories />,
  "/inventory/add": <AddInventory />,
  "/inventory/list": <InventoryList />,
  "/inventory/adjustment": <InventoryAdjustment />,
  "/inventory/movements": <InventoryMovements />,
  "/inventory/reports": <InventoryReports />,
  "/inventory/alerts": <LowInventoryAlerts />,
  "/suppliers/add": <AddSupplier />,
  "/suppliers/list": <SuppliersList />,
  "/settings/barcodegen": <BarcodeGenerator />
};


const renderRoutes = (menuItems = []) => {
  const routes = [];

  const traverse = (items) => {
    items.forEach((item) => {
      if (item.path && routeComponentMap[item.path]) {
        routes.push(
          <Route key={item.path} path={item.path} element={routeComponentMap[item.path]} />
        );
      }
      if (item.children?.length > 0) {
        traverse(item.children);
      }
    });
  };

  traverse(menuItems);
  return routes;
};

const DynamicRoutes = ({ menuData }) => {
  console.log("menuData", menuData);
  return (
    <Routes>
      {renderRoutes(menuData)}
      <Route path="*" element={<h3>404 - Page Not Found</h3>} />
    </Routes>
  );
};

export default DynamicRoutes;
