/** @format */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

let mongoServer;

const setupDatabase = async () => {
  try {
    let mongoUri;
    
    // Check if we have a real MongoDB URI in environment variables
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'memory') {
      // Use real MongoDB (Atlas or local)
      mongoUri = process.env.MONGODB_URI;
      console.log("Connecting to MongoDB...");
    } else {
      // Use MongoDB Memory Server for development
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log("Starting MongoDB Memory Server...");
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'memory') {
      console.log("Connected to MongoDB");
    } else {
      console.log("Connected to MongoDB Memory Server");
    }

    // Only seed data if using memory server or if SEED_DATA is true
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'memory' || process.env.SEED_DATA === 'true') {
      await seedDatabase();
    }

    return mongoUri;
  } catch (error) {
    console.error("Database setup error:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }

    // Clear existing data (only for development)
    await User.deleteMany({});
    await Book.deleteMany({});
    await Borrow.deleteMany({});

    // Create users (let the model handle password hashing)
    const librarian = new User({
      name: "Test Librarian",
      email: "librarian@library.com",
      password: "password123",
      role: "librarian",
    });

    const borrower = new User({
      name: "Test Borrower",
      email: "borrower@library.com",
      password: "password123",
      role: "borrower",
    });

    await librarian.save();
    await borrower.save();

    // Create books
    const books = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0743273565",
        quantity: 5,
        available: 3,
        genre: "Fiction",
        description: "A classic American novel set in the Jazz Age",
        publishedYear: 1925,
        publisher: "Scribner",
        language: "English",
        pages: 180,
        createdBy: librarian._id,
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0061120084",
        quantity: 4,
        available: 2,
        genre: "Fiction",
        description: "A gripping tale of racial injustice and childhood innocence",
        publishedYear: 1960,
        publisher: "J.B. Lippincott & Co.",
        language: "English",
        pages: 376,
        createdBy: librarian._id,
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0451524935",
        quantity: 6,
        available: 4,
        genre: "Dystopian Fiction",
        description: "A dystopian social science fiction novel",
        publishedYear: 1949,
        publisher: "Secker & Warburg",
        language: "English",
        pages: 328,
        createdBy: librarian._id,
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "978-0141439518",
        quantity: 3,
        available: 1,
        genre: "Romance",
        description: "A romantic novel of manners",
        publishedYear: 1813,
        publisher: "T. Egerton",
        language: "English",
        pages: 432,
        createdBy: librarian._id,
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0316769174",
        quantity: 3,
        available: 3,
        genre: "Fiction",
        description: "A controversial novel about teenage rebellion",
        publishedYear: 1951,
        publisher: "Little, Brown and Company",
        language: "English",
        pages: 277,
        createdBy: librarian._id,
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        author: "J.K. Rowling",
        isbn: "978-0747532699",
        quantity: 8,
        available: 6,
        genre: "Fantasy",
        description: "The first book in the Harry Potter series",
        publishedYear: 1997,
        publisher: "Bloomsbury",
        language: "English",
        pages: 223,
        createdBy: librarian._id,
      },
    ];

    const savedBooks = await Book.insertMany(books);

    // Create some borrow records
    const borrowRecords = [
      {
        userId: borrower._id,
        bookId: savedBooks[0]._id, // The Great Gatsby
        borrowDate: new Date("2024-01-15"),
        dueDate: new Date("2024-01-29"),
        status: "borrowed",
      },
      {
        userId: borrower._id,
        bookId: savedBooks[1]._id, // To Kill a Mockingbird
        borrowDate: new Date("2024-01-10"),
        dueDate: new Date("2024-01-24"),
        returnDate: new Date("2024-01-22"),
        status: "returned",
      },
      {
        userId: borrower._id,
        bookId: savedBooks[2]._id, // 1984
        borrowDate: new Date("2024-01-20"),
        dueDate: new Date("2024-02-03"),
        status: "borrowed",
      },
      {
        userId: borrower._id,
        bookId: savedBooks[3]._id, // Pride and Prejudice
        borrowDate: new Date("2024-01-05"),
        dueDate: new Date("2024-01-19"),
        returnDate: new Date("2024-01-18"),
        status: "returned",
      },
    ];

    await Borrow.insertMany(borrowRecords);

    console.log("Database seeded successfully!");
    console.log(`Created ${books.length} books`);
    console.log(`Created 2 users (1 librarian, 1 borrower)`);
    console.log(`Created ${borrowRecords.length} borrow records`);
  } catch (error) {
    console.error("Database seeding error:", error);
    throw error;
  }
};

const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }
};

module.exports = { setupDatabase, closeDatabase, seedDatabase };
