/** @format */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import "./Books.css";

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publisher: "",
    publishedYear: "",
    language: "",
    pages: "",
    quantity: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadBook();
    }
  }, [isEdit, id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBook(id!);

      if (response.success && response.data) {
        const book = response.data.book;
        setFormData({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          genre: book.genre || "",
          publisher: book.publisher || "",
          publishedYear: book.publishedYear
            ? book.publishedYear.toString()
            : "",
          language: book.language || "",
          pages: book.pages ? book.pages.toString() : "",
          quantity: book.quantity ? book.quantity.toString() : "",
          description: book.description || "",
        });
      } else {
        setError("Book not found");
      }
    } catch (err) {
      setError("Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title.trim() ||
      !formData.author.trim() ||
      !formData.isbn.trim()
    ) {
      setError("Title, Author, and ISBN are required");
      return;
    }

    if (formData.quantity && parseInt(formData.quantity) < 0) {
      setError("Quantity must be a positive number");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const bookData = {
        ...formData,
        publishedYear: formData.publishedYear
          ? parseInt(formData.publishedYear)
          : undefined,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
      };

      let response;
      if (isEdit) {
        response = await booksAPI.updateBook(id!, bookData);
      } else {
        response = await booksAPI.createBook(bookData);
      }

      if (response.success) {
        setSuccess(`Book ${isEdit ? "updated" : "created"} successfully!`);
        setTimeout(() => {
          if (isEdit) {
            navigate(`/books/${id}`);
          } else {
            navigate("/books");
          }
        }, 1500);
      } else {
        setError(
          response.message || `Failed to ${isEdit ? "update" : "create"} book`
        );
      }
    } catch (err) {
      setError(`Failed to ${isEdit ? "update" : "create"} book`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading book details..." />;
  }

  return (
    <div className="book-form">
      <div className="book-form-card">
        <div className="book-form-header">
          <h1>{isEdit ? "Edit Book" : "Add New Book"}</h1>
          <p>
            {isEdit
              ? "Update book information"
              : "Add a new book to the library collection"}
          </p>
        </div>

        {success && <div className="success-message">{success}</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="book-form-grid">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter author name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN *</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter ISBN"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter genre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publisher">Publisher</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter publisher"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publishedYear">Published Year</label>
              <input
                type="number"
                id="publishedYear"
                name="publishedYear"
                value={formData.publishedYear}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter year"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <input
                type="text"
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter language"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pages">Pages</label>
              <input
                type="number"
                id="pages"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter page count"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter quantity"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter book description"
              rows={4}
            />
          </div>

          <div className="book-form-actions">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/books/${id}` : "/books")}
              className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Book"
                : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
