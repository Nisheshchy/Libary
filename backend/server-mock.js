/** @format */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
let mockBooks = [
  {
    _id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    available: 3,
    quantity: 5,
    genre: "Fiction",
    description: "A classic American novel set in the Jazz Age",
    publishedYear: 1925,
    publisher: "Scribner",
    language: "English",
    pages: 180,
  },
  {
    _id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    available: 2,
    quantity: 4,
    genre: "Fiction",
    description: "A gripping tale of racial injustice and childhood innocence",
    publishedYear: 1960,
    publisher: "J.B. Lippincott & Co.",
    language: "English",
    pages: 376,
  },
  {
    _id: "3",
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    available: 4,
    quantity: 6,
    genre: "Dystopian Fiction",
    description: "A dystopian social science fiction novel",
    publishedYear: 1949,
    publisher: "Secker & Warburg",
    language: "English",
    pages: 328,
  },
  {
    _id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    available: 1,
    quantity: 3,
    genre: "Romance",
    description: "A romantic novel of manners",
    publishedYear: 1813,
    publisher: "T. Egerton",
    language: "English",
    pages: 432,
  },
];

let mockUsers = [
  {
    _id: "1",
    name: "Test Librarian",
    email: "librarian@library.com",
    role: "librarian",
  },
  {
    _id: "2",
    name: "Test Borrower",
    email: "borrower@library.com",
    role: "borrower",
  },
];

let mockBorrowRecords = [
  {
    _id: "1",
    userId: "2",
    bookId: "1",
    borrowDate: new Date("2024-01-15"),
    dueDate: new Date("2024-01-29"),
    returnDate: null,
    status: "borrowed",
  },
];

// Auth routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "librarian@library.com" && password === "password123") {
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: mockUsers[0],
        token: "mock-jwt-token-librarian",
      },
    });
  } else if (email === "borrower@library.com" && password === "password123") {
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: mockUsers[1],
        token: "mock-jwt-token-borrower",
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;

  const newUser = {
    _id: String(mockUsers.length + 1),
    name,
    email,
    role: role || "borrower",
  };

  mockUsers.push(newUser);

  res.json({
    success: true,
    message: "Registration successful",
    data: {
      user: newUser,
      token: `mock-jwt-token-${newUser._id}`,
    },
  });
});

// Book routes
app.get("/api/books", (req, res) => {
  res.json({
    success: true,
    data: {
      books: mockBooks,
      total: mockBooks.length,
    },
  });
});

app.get("/api/books/:id", (req, res) => {
  const book = mockBooks.find((b) => b._id === req.params.id);
  if (book) {
    res.json({
      success: true,
      data: { book },
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }
});

app.post("/api/books", (req, res) => {
  const newBook = {
    _id: String(mockBooks.length + 1),
    ...req.body,
    available: req.body.quantity || 0,
  };

  mockBooks.push(newBook);

  res.json({
    success: true,
    message: "Book created successfully",
    data: { book: newBook },
  });
});

app.put("/api/books/:id", (req, res) => {
  const bookIndex = mockBooks.findIndex((b) => b._id === req.params.id);

  if (bookIndex !== -1) {
    mockBooks[bookIndex] = {
      ...mockBooks[bookIndex],
      ...req.body,
    };

    res.json({
      success: true,
      message: "Book updated successfully",
      data: { book: mockBooks[bookIndex] },
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }
});

app.delete("/api/books/:id", (req, res) => {
  const bookIndex = mockBooks.findIndex((b) => b._id === req.params.id);

  if (bookIndex !== -1) {
    const deletedBook = mockBooks.splice(bookIndex, 1)[0];

    res.json({
      success: true,
      message: "Book deleted successfully",
      data: { book: deletedBook },
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }
});

// Borrow routes
app.get("/api/borrow/records", (req, res) => {
  const recordsWithDetails = mockBorrowRecords.map((record) => {
    const book = mockBooks.find((b) => b._id === record.bookId);
    const user = mockUsers.find((u) => u._id === record.userId);

    return {
      ...record,
      book: book ? { title: book.title, author: book.author } : null,
      user: user ? { name: user.name, email: user.email } : null,
    };
  });

  res.json({
    success: true,
    data: { records: recordsWithDetails },
  });
});

app.post("/api/borrow", (req, res) => {
  const { bookId } = req.body;
  const book = mockBooks.find((b) => b._id === bookId);

  if (!book) {
    return res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }

  if (book.available <= 0) {
    return res.status(400).json({
      success: false,
      message: "Book not available",
    });
  }

  // Create borrow record
  const newRecord = {
    _id: String(mockBorrowRecords.length + 1),
    userId: "2", // Mock borrower
    bookId: bookId,
    borrowDate: new Date(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    returnDate: null,
    status: "borrowed",
  };

  mockBorrowRecords.push(newRecord);

  // Update book availability
  book.available -= 1;

  res.json({
    success: true,
    message: "Book borrowed successfully",
    data: { record: newRecord },
  });
});

app.post("/api/borrow/return", (req, res) => {
  const { recordId } = req.body;
  const record = mockBorrowRecords.find((r) => r._id === recordId);

  if (!record) {
    return res.status(404).json({
      success: false,
      message: "Borrow record not found",
    });
  }

  if (record.returnDate) {
    return res.status(400).json({
      success: false,
      message: "Book already returned",
    });
  }

  // Update record
  record.returnDate = new Date();
  record.status = "returned";

  // Update book availability
  const book = mockBooks.find((b) => b._id === record.bookId);
  if (book) {
    book.available += 1;
  }

  res.json({
    success: true,
    message: "Book returned successfully",
    data: { record },
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Library Management System API is running (Mock Mode)",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Mock Server running on port ${PORT}`);
  console.log("Mock data loaded with sample books and users");
  console.log("Demo credentials:");
  console.log("Librarian: librarian@library.com / password123");
  console.log("Borrower: borrower@library.com / password123");
});

module.exports = app;
