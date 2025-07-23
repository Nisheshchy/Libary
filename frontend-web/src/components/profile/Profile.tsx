/** @format */

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-role">
              {user?.role === "librarian" ? "📚 Librarian" : "👤 Borrower"}
            </p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-view">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Full Name</label>
                  <span>{user?.name}</span>
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <span>{user?.email}</span>
                </div>

                <div className="profile-field">
                  <label>Role</label>
                  <span className="role-badge">
                    {user?.role === "librarian" ? "Librarian" : "Borrower"}
                  </span>
                </div>

                <div className="profile-field">
                  <label>Member Since</label>
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <h3>Account Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">
                    {user?.role === "librarian" ? "∞" : "5"}
                  </span>
                  <span className="stat-label">
                    {user?.role === "librarian"
                      ? "Books Managed"
                      : "Books Borrowed"}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Currently Borrowed</span>
                </div>

                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Overdue Books</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
