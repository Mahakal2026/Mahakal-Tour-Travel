const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 15,
    },
    pickup: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    drop: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    date: {
      type: String,
      trim: true,
    },
    vehicle: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    source: {
      type: String,
      enum: [
        "hero-form",
        "contact-form",
        "fare-calculator",
        "vehicle-inquiry",
        "package-inquiry",
      ],
      default: "hero-form",
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup job (find leads older than 7 days)
leadSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Lead", leadSchema);
