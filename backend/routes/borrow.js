/** @format */

const express = require("express");
const { body, validationResult, query } = require("express-validator");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const {
  authenticateToken,
  requireLibrarian,
  requireOwnershipOrLibrarian,
} = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/borrow
// @desc    Borrow a book
// @access  Private (Authenticated users)
router.post(
  "/",
  authenticateToken,
  [
    body("bookId")
      .notEmpty()
      .withMessage("Book ID is required")
      .isMongoId()
      .withMessage("Invalid book ID format"),
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

      const { bookId } = req.body;
      const userId = req.user._id;

      // Find the book
      const book = await Book.findOne({ _id: bookId, isActive: true });
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      // Check if book is available
      if (!book.isAvailableForBorrow()) {
        return res.status(400).json({
          success: false,
          message: "No copies available for borrowing",
        });
      }

      // Check if user already has this book borrowed
      const existingBorrow = await Borrow.findOne({
        userId,
        bookId,
        status: { $in: ["borrowed", "overdue"] },
        isActive: true,
      });

      if (existingBorrow) {
        return res.status(400).json({
          success: false,
          message: "You have already borrowed this book",
        });
      }

      // Check borrowing limits (e.g., max 5 books per user)
      const activeBorrows = await Borrow.countDocuments({
        userId,
        status: { $in: ["borrowed", "overdue"] },
        isActive: true,
      });

      const MAX_BORROWS = 5;
      if (activeBorrows >= MAX_BORROWS) {
        return res.status(400).json({
          success: false,
          message: `You have reached the maximum borrowing limit of ${MAX_BORROWS} books`,
        });
      }

      // Create borrow record
      const borrow = new Borrow({
        userId,
        bookId,
      });

      // Save borrow record without transaction for standalone MongoDB
      await borrow.save();

      // Update book availability
      await book.borrowBook();

      // Populate the borrow record
      await borrow.populate([
        { path: "userId", select: "name email" },
        { path: "bookId", select: "title author isbn" },
      ]);

      res.status(201).json({
        success: true,
        message: "Book borrowed successfully",
        data: {
          borrow,
        },
      });
    } catch (error) {
      console.error("Borrow book error:", error);

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid book ID",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to borrow book",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/borrow/return
// @desc    Return a borrowed book
// @access  Private (Authenticated users)
router.post(
  "/return",
  authenticateToken,
  [
    body("borrowId")
      .notEmpty()
      .withMessage("Borrow ID is required")
      .isMongoId()
      .withMessage("Invalid borrow ID format"),
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

      const { borrowId } = req.body;
      const userId = req.user._id;

      // Find the borrow record
      const borrow = await Borrow.findOne({
        _id: borrowId,
        isActive: true,
      }).populate("bookId");

      if (!borrow) {
        return res.status(404).json({
          success: false,
          message: "Borrow record not found",
        });
      }

      // Check if user owns this borrow record or is a librarian
      if (
        borrow.userId.toString() !== userId.toString() &&
        req.user.role !== "librarian"
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only return your own borrowed books",
        });
      }

      // Check if book is already returned
      if (borrow.returnDate) {
        return res.status(400).json({
          success: false,
          message: "Book has already been returned",
        });
      }

      // Return the book without transaction for standalone MongoDB
      await borrow.returnBook();

      // Update book availability
      const book = await Book.findById(borrow.bookId._id);
      await book.returnBook();

      // Populate the updated borrow record
      await borrow.populate([
        { path: "userId", select: "name email" },
        { path: "bookId", select: "title author isbn" },
      ]);

      res.json({
        success: true,
        message: "Book returned successfully",
        data: {
          borrow,
        },
      });
    } catch (error) {
      console.error("Return book error:", error);

      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid borrow ID",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to return book",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/borrow/my-borrows
// @desc    Get current user's borrow history
// @access  Private (Authenticated users)
router.get(
  "/my-borrows",
  authenticateToken,
  [
    query("status")
      .optional()
      .isIn(["borrowed", "returned", "overdue", "all"])
      .withMessage("Invalid status filter"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
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

      const { status = "all", page = 1, limit = 20 } = req.query;
      const userId = req.user._id;

      // Build query
      let query = { userId, isActive: true };

      if (status !== "all") {
        if (status === "borrowed") {
          query.status = { $in: ["borrowed", "overdue"] };
        } else {
          query.status = status;
        }
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get borrows
      const borrows = await Borrow.find(query)
        .populate("bookId", "title author isbn")
        .sort({ borrowDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const totalBorrows = await Borrow.countDocuments(query);
      const totalPages = Math.ceil(totalBorrows / parseInt(limit));

      res.json({
        success: true,
        data: {
          borrows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalBorrows,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get user borrows error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch borrow history",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/borrow/records
// @desc    Get all borrow records (Librarians only)
// @access  Private (Librarian)
router.get(
  "/records",
  authenticateToken,
  requireLibrarian,
  [
    query("status")
      .optional()
      .isIn(["borrowed", "returned", "overdue", "all"])
      .withMessage("Invalid status filter"),
    query("userId")
      .optional()
      .isMongoId()
      .withMessage("Invalid user ID format"),
    query("bookId")
      .optional()
      .isMongoId()
      .withMessage("Invalid book ID format"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
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

      const {
        status = "all",
        userId,
        bookId,
        page = 1,
        limit = 50,
      } = req.query;

      // Build query
      let query = { isActive: true };

      if (status !== "all") {
        if (status === "borrowed") {
          query.status = { $in: ["borrowed", "overdue"] };
        } else {
          query.status = status;
        }
      }

      if (userId) {
        query.userId = userId;
      }

      if (bookId) {
        query.bookId = bookId;
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get borrow records
      const borrows = await Borrow.find(query)
        .populate("userId", "name email")
        .populate("bookId", "title author isbn")
        .sort({ borrowDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const totalBorrows = await Borrow.countDocuments(query);
      const totalPages = Math.ceil(totalBorrows / parseInt(limit));

      res.json({
        success: true,
        data: {
          borrows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalBorrows,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get borrow records error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch borrow records",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/borrow/overdue
// @desc    Get overdue books (Librarians only)
// @access  Private (Librarian)
router.get(
  "/overdue",
  authenticateToken,
  requireLibrarian,
  async (req, res) => {
    try {
      const overdueBooks = await Borrow.getOverdueBooks();

      res.json({
        success: true,
        data: {
          overdueBooks,
          count: overdueBooks.length,
        },
      });
    } catch (error) {
      console.error("Get overdue books error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch overdue books",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/borrow/stats
// @desc    Get borrowing statistics (Librarians only)
// @access  Private (Librarian)
router.get("/stats", authenticateToken, requireLibrarian, async (req, res) => {
  try {
    const stats = await Borrow.getBorrowStats();

    // Get additional statistics
    const totalActiveUsers = await Borrow.distinct("userId", {
      status: { $in: ["borrowed", "overdue"] },
      isActive: true,
    });

    const mostBorrowedBooks = await Borrow.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: "$bookId",
          borrowCount: { $sum: 1 },
        },
      },
      {
        $sort: { borrowCount: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $project: {
          title: "$book.title",
          author: "$book.author",
          borrowCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        activeUsers: totalActiveUsers.length,
        mostBorrowedBooks,
      },
    });
  } catch (error) {
    console.error("Get borrow stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch borrowing statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/borrow/renew/:id
// @desc    Renew a borrowed book
// @access  Private (Authenticated users)
router.post("/renew/:id", authenticateToken, async (req, res) => {
  try {
    const borrowId = req.params.id;
    const userId = req.user._id;

    // Find the borrow record
    const borrow = await Borrow.findOne({
      _id: borrowId,
      isActive: true,
    }).populate("bookId", "title author");

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found",
      });
    }

    // Check if user owns this borrow record or is a librarian
    if (
      borrow.userId.toString() !== userId.toString() &&
      req.user.role !== "librarian"
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only renew your own borrowed books",
      });
    }

    // Renew the book
    await borrow.renewBorrow();

    res.json({
      success: true,
      message: "Book renewed successfully",
      data: {
        borrow,
        newDueDate: borrow.dueDate,
      },
    });
  } catch (error) {
    console.error("Renew book error:", error);

    if (error.message.includes("Maximum renewal limit")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Cannot renew returned book")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid borrow ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to renew book",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
