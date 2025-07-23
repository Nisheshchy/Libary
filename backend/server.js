/** @format */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { setupDatabase } = require("./database/mongodb-setup");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Initialize database and start server
const startServer = async () => {
  try {
    // Setup database with seed data
    const mongoUri = await setupDatabase();
    console.log("Database initialized with seed data");

    // Import routes after database is connected
    const authRoutes = require("./routes/auth");
    const bookRoutes = require("./routes/books");
    const borrowRoutes = require("./routes/borrow");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/borrow", borrowRoutes);

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({
        status: "OK",
        message: "Library Management System API is running",
        database: "MongoDB Memory Server",
        timestamp: new Date().toISOString(),
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Something went wrong",
      });
    });

    // 404 handler
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`MongoDB URI: ${mongoUri}`);
      console.log("Demo credentials:");
      console.log("Librarian: librarian@library.com / password123");
      console.log("Borrower: borrower@library.com / password123");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  const { closeDatabase } = require("./database/mongodb-setup");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  const { closeDatabase } = require("./database/mongodb-setup");
  await closeDatabase();
  process.exit(0);
});

startServer();
