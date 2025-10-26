import React, { useState, useEffect } from "react";
//import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import LoginPage from "./login/LoginPage";
import "./App.css";
import axios from "axios";
import { BASE_URL, MENU, GET_ALL_ACTIVE_MENUS } from "./Constants";
import DynamicRoutes from "./routes/DynamicRoutes";

const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setIsAuthenticated(true);
    }
  }, []);

  // useEffect(() => {
  //   const roleId = localStorage.getItem("roleId") || 1;
  //   //if (isAuthenticated && roleId) {
  //   const fetchMenu = async () => {
  //     try {
  //       const response = await axios.get(`${BASE_URL}/${MENU}`, {
  //         params: { roleId }
  //       });
  //       if (response.data) {
  //         setMenuData(response.data);
  //         setError(null);
  //         // Set the first menu item as selected by default
  //         if (response.data.length > 0) {
  //           setSelectedMenuItem(response.data[0]);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Failed to fetch menu:", err);
  //       setError("Failed to load menu. Please try again later.");
  //       setMenuData([]);
  //     }
  //   };
  //   fetchMenu();
  //   //}
  // }, [localStorage.getItem('roleId')]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${GET_ALL_ACTIVE_MENUS}`);
        if (response.ok) {
          const data = await response.json();
          setMenuData(data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        setError("Failed to load menu. Please try again later.");
        setMenuData([]);
      }
    };
    fetchMenu();
  }, []);

  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item);
  };

  return (
    <Router>
      <Routes>
        {/* Redirect root hash '/' to '/home' */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <LoginPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/*"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <div className="app-layout">
                <Sidebar roleId={localStorage.getItem("roleId") || 1} onMenuItemClick={handleMenuItemClick} />
                <main className="main-content">
                  <DynamicRoutes menuData={menuData} />
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
