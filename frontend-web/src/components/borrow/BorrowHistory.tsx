/** @format */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { borrowAPI, BorrowRecord } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import "./Borrow.css";

const BorrowHistory = () => {
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null as string | null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadBorrowHistory();
  }, []);

  const loadBorrowHistory = async () => {
    try {
      setLoading(true);
      const response = await borrowAPI.getMyBorrows();

      if (response.success && response.data) {
        setBorrows(response.data.borrows);
      } else {
        setError("Failed to load borrow history");
      }
    } catch (err) {
      setError("Failed to load borrow history");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId: string) => {
    try {
      setReturning(borrowId);
      setError("");

      const response = await borrowAPI.returnBook(borrowId);

      if (response.success) {
        setSuccess("Book returned successfully!");
        // Refresh the list
        await loadBorrowHistory();
      } else {
        setError(response.message || "Failed to return book");
      }
    } catch (err) {
      setError("Failed to return book");
    } finally {
      setReturning(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysOverdue = (borrowDate: string) => {
    const borrowed = new Date(borrowDate);
    const dueDate = new Date(borrowed.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return <LoadingSpinner message="Loading your borrow history..." />;
  }

  return (
    <div className="borrow-history">
      <div className="borrow-history-header">
        <h1>My Borrowed Books</h1>
        <p>Track your current and past book borrowings</p>
      </div>

      {success && <div className="success-message">{success}</div>}

      {error && <div className="error-message">{error}</div>}

      {borrows.length > 0 ? (
        <div className="borrow-list">
          {borrows.map((borrow: any) => {
            const overdueDays = borrow.returnDate
              ? 0
              : getDaysOverdue(borrow.borrowDate);
            const isOverdue = overdueDays > 0;

            return (
              <div
                key={borrow._id}
                className={`borrow-card ${isOverdue ? "overdue" : ""}`}>
                <div className="borrow-book-info">
                  <h3 className="borrow-book-title">
                    {borrow.bookId?.title || "Unknown Title"}
                  </h3>
                  <p className="borrow-book-author">
                    by {borrow.bookId?.author || "Unknown Author"}
                  </p>
                  <p className="borrow-book-isbn">
                    ISBN: {borrow.bookId?.isbn || "N/A"}
                  </p>
                </div>

                <div className="borrow-dates">
                  <div className="borrow-date-item">
                    <span className="borrow-date-label">Borrowed:</span>
                    <span className="borrow-date-value">
                      {formatDate(borrow.borrowDate)}
                    </span>
                  </div>

                  {borrow.returnDate ? (
                    <div className="borrow-date-item">
                      <span className="borrow-date-label">Returned:</span>
                      <span className="borrow-date-value">
                        {formatDate(borrow.returnDate)}
                      </span>
                    </div>
                  ) : (
                    <div className="borrow-date-item">
                      <span className="borrow-date-label">Due:</span>
                      <span
                        className={`borrow-date-value ${
                          isOverdue ? "overdue-text" : ""
                        }`}>
                        {formatDate(
                          new Date(
                            new Date(borrow.borrowDate).getTime() +
                              14 * 24 * 60 * 60 * 1000
                          ).toISOString()
                        )}
                        {isOverdue && ` (${overdueDays} days overdue)`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="borrow-status">
                  {borrow.returnDate ? (
                    <span className="status-badge returned">Returned</span>
                  ) : (
                    <span
                      className={`status-badge ${
                        isOverdue ? "overdue" : "active"
                      }`}>
                      {isOverdue ? "Overdue" : "Active"}
                    </span>
                  )}
                </div>

                <div className="borrow-actions">
                  <Link
                    to={`/books/${borrow.bookId?._id}`}
                    className="btn btn-secondary btn-sm">
                    View Book
                  </Link>

                  {!borrow.returnDate && (
                    <button
                      onClick={() => handleReturn(borrow._id)}
                      disabled={returning === borrow._id}
                      className="btn btn-primary btn-sm">
                      {returning === borrow._id
                        ? "Returning..."
                        : "Return Book"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No books borrowed yet</h3>
          <p>Start exploring our collection and borrow your first book!</p>
          <Link to="/books" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      )}

      <div className="borrow-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-stat-number">
              {borrows.filter((b: any) => !b.returnDate).length}
            </span>
            <span className="summary-stat-label">Currently Borrowed</span>
          </div>

          <div className="summary-stat">
            <span className="summary-stat-number">
              {borrows.filter((b: any) => b.returnDate).length}
            </span>
            <span className="summary-stat-label">Total Returned</span>
          </div>

          <div className="summary-stat">
            <span className="summary-stat-number">
              {
                borrows.filter(
                  (b: any) => !b.returnDate && getDaysOverdue(b.borrowDate) > 0
                ).length
              }
            </span>
            <span className="summary-stat-label">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowHistory;
