/** @format */

const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Book = require("../models/Book");
const {
  authenticateToken,
  requireLibrarian,
  optionalAuth,
} = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with optional search and filtering
// @access  Public (but enhanced for authenticated users)
router.get(
  "/",
  [
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term too long"),
    query("genre")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Genre filter too long"),
    query("author")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Author filter too long"),
    query("available")
      .optional()
      .isBoolean()
      .withMessage("Available must be true or false"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  optionalAuth,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        search,
        genre,
        author,
        available,
        page = 1,
        limit = 20,
        sort = "title",
      } = req.query;

      // Build query
      let query = { isActive: true };

      // Search by title or author
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ];
      }

      // Filter by genre
      if (genre) {
        query.genre = { $regex: genre, $options: "i" };
      }

      // Filter by author
      if (author) {
        query.author = { $regex: author, $options: "i" };
      }

      // Filter by availability
      if (available === "true") {
        query.available = { $gt: 0 };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build sort object
      let sortObj = {};
      switch (sort) {
        case "title":
          sortObj = { title: 1 };
          break;
        case "author":
          sortObj = { author: 1 };
          break;
        case "newest":
          sortObj = { createdAt: -1 };
          break;
        case "oldest":
          sortObj = { createdAt: 1 };
          break;
        default:
          sortObj = { title: 1 };
      }

      // Execute query
      const books = await Book.find(query)
        .populate("createdBy", "name")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const totalBooks = await Book.countDocuments(query);
      const totalPages = Math.ceil(totalBooks / parseInt(limit));

      res.json({
        success: true,
        data: {
          books,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalBooks,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get books error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch books",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/books/search/suggestions
// @desc    Get search suggestions for books
// @access  Public
router.get("/search/suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
        },
      });
    }

    // Get title and author suggestions
    const titleSuggestions = await Book.distinct("title", {
      title: { $regex: q, $options: "i" },
      isActive: true,
    }).limit(5);

    const authorSuggestions = await Book.distinct("author", {
      author: { $regex: q, $options: "i" },
      isActive: true,
    }).limit(5);

    const suggestions = [
      ...titleSuggestions.map((title) => ({ type: "title", value: title })),
      ...authorSuggestions.map((author) => ({ type: "author", value: author })),
    ].slice(0, 10);

    res.json({
      success: true,
      data: {
        suggestions,
      },
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("createdBy", "name");

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
      success: true,
      data: {
        book,
      },
    });
  } catch (error) {
    console.error("Get book error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/books
// @desc    Create a new book (Librarians only)
// @access  Private (Librarian)
router.post(
  "/",
  authenticateToken,
  requireLibrarian,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("author")
      .trim()
      .notEmpty()
      .withMessage("Author is required")
      .isLength({ max: 100 })
      .withMessage("Author name cannot exceed 100 characters"),
    body("isbn")
      .trim()
      .notEmpty()
      .withMessage("ISBN is required")
      .matches(/^(?:\d{9}[\dX]|\d{10}|\d{13}|\d{3}-\d{10})$/)
      .withMessage("Please enter a valid ISBN format"),
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("available")
      .isInt({ min: 0 })
      .withMessage("Available copies must be a non-negative integer"),
    body("genre")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Genre cannot exceed 50 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
    body("publishedYear")
      .optional()
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage("Published year must be valid"),
    body("publisher")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Publisher name cannot exceed 100 characters"),
    body("language")
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage("Language cannot exceed 30 characters"),
    body("pages")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const bookData = {
        ...req.body,
        createdBy: req.user._id,
      };

      // Validate that available copies don't exceed quantity
      if (bookData.available > bookData.quantity) {
        return res.status(400).json({
          success: false,
          message: "Available copies cannot exceed total quantity",
        });
      }

      // Check if ISBN already exists
      const existingBook = await Book.findOne({ isbn: bookData.isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }

      const book = new Book(bookData);
      await book.save();

      // Populate createdBy field
      await book.populate("createdBy", "name");

      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: {
          book,
        },
      });
    } catch (error) {
      console.error("Create book error:", error);

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create book",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   PUT /api/books/:id
// @desc    Update a book (Librarians only)
// @access  Private (Librarian)
router.put(
  "/:id",
  authenticateToken,
  requireLibrarian,
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty")
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
    body("author")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Author cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Author name cannot exceed 100 characters"),
    body("isbn")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("ISBN cannot be empty")
      .matches(/^(?:\d{9}[\dX]|\d{10}|\d{13}|\d{3}-\d{10})$/)
      .withMessage("Please enter a valid ISBN format"),
    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    body("available")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Available copies must be a non-negative integer"),
    body("genre")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Genre cannot exceed 50 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
    body("publishedYear")
      .optional()
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage("Published year must be valid"),
    body("publisher")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Publisher name cannot exceed 100 characters"),
    body("language")
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage("Language cannot exceed 30 characters"),
    body("pages")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Pages must be a positive integer"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const bookId = req.params.id;
      const updateData = { ...req.body, updatedBy: req.user._id };

      // Find the book
      const existingBook = await Book.findOne({ _id: bookId, isActive: true });
      if (!existingBook) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      // If ISBN is being updated, check for duplicates
      if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
        const duplicateBook = await Book.findOne({ isbn: updateData.isbn });
        if (duplicateBook) {
          return res.status(400).json({
            success: false,
            message: "A book with this ISBN already exists",
          });
        }
      }

      // Validate that available copies don't exceed quantity
      const newQuantity = updateData.quantity || existingBook.quantity;
      const newAvailable = updateData.available || existingBook.available;

      if (newAvailable > newQuantity) {
        return res.status(400).json({
          success: false,
          message: "Available copies cannot exceed total quantity",
        });
      }

      // Update the book
      const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
        new: true,
        runValidators: true,
      }).populate("createdBy updatedBy", "name");

      res.json({
        success: true,
        message: "Book updated successfully",
        data: {
          book: updatedBook,
        },
      });
    } catch (error) {
      console.error("Update book error:", error);

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "A book with this ISBN already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update book",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   DELETE /api/books/:id
// @desc    Delete a book (Librarians only)
// @access  Private (Librarian)
router.delete("/:id", authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book
    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book has active borrows
    const Borrow = require("../models/Borrow");
    const activeBorrows = await Borrow.find({
      bookId,
      status: { $in: ["borrowed", "overdue"] },
      isActive: true,
    });

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete book with active borrows. Please wait for all copies to be returned.",
      });
    }

    // Soft delete the book
    book.isActive = false;
    book.updatedBy = req.user._id;
    await book.save();

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
