/** @format */

const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character long"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      minlength: [1, "Author name must be at least 1 character long"],
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          // ISBN-10 or ISBN-13 format validation
          const isbn10 = /^(?:\d{9}[\dX]|\d{10})$/;
          const isbn13 = /^(?:\d{13}|\d{3}-\d{10})$/;
          const cleanISBN = v.replace(/[-\s]/g, "");
          return isbn10.test(cleanISBN) || isbn13.test(cleanISBN);
        },
        message: "Please enter a valid ISBN format",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    available: {
      type: Number,
      required: [true, "Available copies count is required"],
      min: [0, "Available copies cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Available copies must be a whole number",
      },
    },
    genre: {
      type: String,
      trim: true,
      maxlength: [50, "Genre cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    publishedYear: {
      type: Number,
      min: [1000, "Published year must be valid"],
      max: [new Date().getFullYear(), "Published year cannot be in the future"],
      validate: {
        validator: Number.isInteger,
        message: "Published year must be a whole number",
      },
    },
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, "Publisher name cannot exceed 100 characters"],
    },
    language: {
      type: String,
      trim: true,
      default: "English",
      maxlength: [30, "Language cannot exceed 30 characters"],
    },
    pages: {
      type: Number,
      min: [1, "Pages must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Pages must be a whole number",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
bookSchema.index({ title: "text", author: "text" }); // Text search
bookSchema.index({ isbn: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ available: 1 });

// Validate that available copies don't exceed total quantity
bookSchema.pre("save", function (next) {
  if (this.available > this.quantity) {
    next(new Error("Available copies cannot exceed total quantity"));
  } else {
    next();
  }
});

// Static method to search books by title or author
bookSchema.statics.searchBooks = function (searchTerm, options = {}) {
  const query = {
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: "i" } },
      { author: { $regex: searchTerm, $options: "i" } },
    ],
  };

  return this.find(query)
    .sort(options.sort || { title: 1 })
    .limit(options.limit || 50);
};

// Static method to get available books
bookSchema.statics.getAvailableBooks = function (options = {}) {
  return this.find({ isActive: true, available: { $gt: 0 } })
    .sort(options.sort || { title: 1 })
    .limit(options.limit || 50);
};

// Static method to get books by genre
bookSchema.statics.getBooksByGenre = function (genre, options = {}) {
  return this.find({ isActive: true, genre: new RegExp(genre, "i") })
    .sort(options.sort || { title: 1 })
    .limit(options.limit || 50);
};

// Instance method to check if book is available for borrowing
bookSchema.methods.isAvailableForBorrow = function () {
  return this.isActive && this.available > 0;
};

// Instance method to borrow book (decrease available count)
bookSchema.methods.borrowBook = function () {
  if (this.available > 0) {
    this.available -= 1;
    return this.save();
  } else {
    throw new Error("No copies available for borrowing");
  }
};

// Instance method to return book (increase available count)
bookSchema.methods.returnBook = function () {
  if (this.available < this.quantity) {
    this.available += 1;
    return this.save();
  } else {
    throw new Error("Cannot return more books than total quantity");
  }
};

module.exports = mongoose.model("Book", bookSchema);
