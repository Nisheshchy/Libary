/** @format */

const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
    },
    borrowDate: {
      type: Date,
      required: [true, "Borrow date is required"],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      default: function () {
        // Default due date is 14 days from borrow date
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date;
      },
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
    renewalCount: {
      type: Number,
      default: 0,
      min: [0, "Renewal count cannot be negative"],
      max: [3, "Maximum 3 renewals allowed"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
borrowSchema.index({ userId: 1 });
borrowSchema.index({ bookId: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ borrowDate: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ returnDate: 1 });
borrowSchema.index({ userId: 1, status: 1 });

// Compound index for active borrows by user
borrowSchema.index({ userId: 1, status: 1, isActive: 1 });

// Pre-save middleware to update status based on dates
borrowSchema.pre("save", function (next) {
  const now = new Date();

  // If book is returned, set status to returned
  if (this.returnDate) {
    this.status = "returned";
  }
  // If due date has passed and book is not returned, mark as overdue
  else if (this.dueDate < now && this.status === "borrowed") {
    this.status = "overdue";
  }

  next();
});

// Static method to get active borrows for a user
borrowSchema.statics.getActiveBorrowsByUser = function (userId) {
  return this.find({
    userId,
    status: { $in: ["borrowed", "overdue"] },
    isActive: true,
  }).populate("bookId", "title author isbn");
};

// Static method to get borrow history for a user
borrowSchema.statics.getBorrowHistoryByUser = function (userId, options = {}) {
  return this.find({ userId, isActive: true })
    .populate("bookId", "title author isbn")
    .sort(options.sort || { borrowDate: -1 })
    .limit(options.limit || 50);
};

// Static method to get all active borrows (for librarians)
borrowSchema.statics.getAllActiveBorrows = function (options = {}) {
  return this.find({
    status: { $in: ["borrowed", "overdue"] },
    isActive: true,
  })
    .populate("userId", "name email")
    .populate("bookId", "title author isbn")
    .sort(options.sort || { borrowDate: -1 })
    .limit(options.limit || 100);
};

// Static method to get overdue books
borrowSchema.statics.getOverdueBooks = function (options = {}) {
  return this.find({
    status: "overdue",
    isActive: true,
  })
    .populate("userId", "name email")
    .populate("bookId", "title author isbn")
    .sort(options.sort || { dueDate: 1 })
    .limit(options.limit || 100);
};

// Static method to get borrow statistics
borrowSchema.statics.getBorrowStats = async function () {
  const stats = await this.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Instance method to check if borrow is overdue
borrowSchema.methods.isOverdue = function () {
  return !this.returnDate && this.dueDate < new Date();
};

// Instance method to calculate days overdue
borrowSchema.methods.getDaysOverdue = function () {
  if (!this.isOverdue()) return 0;

  const now = new Date();
  const diffTime = now - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Instance method to renew borrow (extend due date)
borrowSchema.methods.renewBorrow = function (days = 14) {
  if (this.renewalCount >= 3) {
    throw new Error("Maximum renewal limit reached");
  }

  if (this.returnDate) {
    throw new Error("Cannot renew returned book");
  }

  this.dueDate = new Date(this.dueDate.getTime() + days * 24 * 60 * 60 * 1000);
  this.renewalCount += 1;
  this.status = "borrowed"; // Reset from overdue if applicable

  return this.save();
};

// Instance method to return book
borrowSchema.methods.returnBook = function () {
  if (this.returnDate) {
    throw new Error("Book already returned");
  }

  this.returnDate = new Date();
  this.status = "returned";

  return this.save();
};

module.exports = mongoose.model("Borrow", borrowSchema);
