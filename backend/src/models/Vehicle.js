const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["hatchback", "sedan", "suv", "premium-suv", "tempo"],
      required: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    capacity: {
      type: String,
      required: true,
      trim: true,
    },
    acType: {
      type: String,
      trim: true,
    },
    badge: {
      type: String,
      trim: true,
    },
    badgeColor: {
      type: String,
      default: "bg-saffron-600",
    },
    pricePerKm: {
      type: Number,
      required: [true, "Price per km is required"],
    },
    localPrice: {
      type: Number,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
