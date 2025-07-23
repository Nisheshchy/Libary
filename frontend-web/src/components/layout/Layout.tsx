/** @format */

import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["borrower", "librarian"],
    },
    {
      path: "/books",
      label: "Browse Books",
      icon: "📚",
      roles: ["borrower", "librarian"],
    },
    {
      path: "/books/new",
      label: "Add Book",
      icon: "➕",
      roles: ["librarian"],
    },
    {
      path: "/my-books",
      label: "My Books",
      icon: "📖",
      roles: ["borrower"],
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "👤",
      roles: ["borrower", "librarian"],
    },
    {
      path: "/about",
      label: "About",
      icon: "ℹ️",
      roles: ["borrower", "librarian"],
    },
    {
      path: "/contact",
      label: "Contact",
      icon: "📞",
      roles: ["borrower", "librarian"],
    },
  ];

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || "borrower")
  );

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar">
              ☰
            </button>
            <Link to="/dashboard" className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">Library System</span>
            </Link>
          </div>

          <div className="header-right">
            <div className="user-info">
              <span className="user-name">Welcome, {user?.name}</span>
              <span className="user-role">
                {user?.role === "librarian" ? "📋 Librarian" : "👤 Borrower"}
              </span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredNavItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={closeSidebar}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
