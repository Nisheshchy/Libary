/** @format */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksAPI, borrowAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import "./Books.css";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null as any);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBook(id!);

      if (response.success && response.data) {
        setBook(response.data.book);
      } else {
        setError("Book not found");
      }
    } catch (err) {
      setError("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!book || book.available <= 0) return;

    try {
      setBorrowing(true);
      setError("");

      const response = await borrowAPI.borrowBook(book._id);

      if (response.success) {
        setSuccess("Book borrowed successfully!");
        // Refresh book data to update availability
        await loadBook();
      } else {
        setError(response.message || "Failed to borrow book");
      }
    } catch (err) {
      setError("Failed to borrow book");
    } finally {
      setBorrowing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/books/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const response = await booksAPI.deleteBook(id!);

      if (response.success) {
        navigate("/books");
      } else {
        setError("Failed to delete book");
      }
    } catch (err) {
      setError("Failed to delete book");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading book details..." />;
  }

  if (error && !book) {
    return (
      <div className="book-details">
        <div className="error-message">{error}</div>
        <button
          onClick={() => navigate("/books")}
          className="btn btn-secondary">
          Back to Books
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details">
        <div className="error-message">Book not found</div>
        <button
          onClick={() => navigate("/books")}
          className="btn btn-secondary">
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="book-details">
      <div className="book-details-card">
        {success && <div className="success-message">{success}</div>}

        {error && <div className="error-message">{error}</div>}

        <div className="book-details-header">
          <h1 className="book-details-title">{book.title}</h1>
          <p className="book-details-author">by {book.author}</p>
        </div>

        <div className="book-details-meta">
          <div className="book-meta-item">
            <span className="book-meta-label">ISBN</span>
            <span className="book-meta-value">{book.isbn}</span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Genre</span>
            <span className="book-meta-value">
              {book.genre || "Not specified"}
            </span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Publisher</span>
            <span className="book-meta-value">
              {book.publisher || "Not specified"}
            </span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Published Year</span>
            <span className="book-meta-value">
              {book.publishedYear || "Not specified"}
            </span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Language</span>
            <span className="book-meta-value">
              {book.language || "Not specified"}
            </span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Pages</span>
            <span className="book-meta-value">
              {book.pages || "Not specified"}
            </span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Total Copies</span>
            <span className="book-meta-value">{book.quantity}</span>
          </div>

          <div className="book-meta-item">
            <span className="book-meta-label">Available</span>
            <span
              className={`book-meta-value ${
                book.available > 0 ? "text-green-600" : "text-red-600"
              }`}>
              {book.available} copies
            </span>
          </div>
        </div>

        {book.description && (
          <div className="book-description">
            <h3>Description</h3>
            <p>{book.description}</p>
          </div>
        )}

        <div className="book-actions-section">
          <button
            onClick={() => navigate("/books")}
            className="btn btn-secondary">
            ← Back to Books
          </button>

          {user?.role === "borrower" && book.available > 0 && (
            <button
              onClick={handleBorrow}
              disabled={borrowing}
              className="btn btn-primary">
              {borrowing ? "Borrowing..." : "📚 Borrow Book"}
            </button>
          )}

          {user?.role === "librarian" && (
            <>
              <button onClick={handleEdit} className="btn btn-primary">
                ✏️ Edit Book
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                🗑️ Delete Book
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
