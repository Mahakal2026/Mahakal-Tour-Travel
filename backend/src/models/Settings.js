const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      default: "6269643919",
    },
    whatsappNumber: {
      type: String,
      default: "916269643919",
    },
    email: {
      type: String,
      default: "mahakaltt.gwalior@gmail.com",
    },
    address: {
      street: { type: String, default: "Kampoo, Lashkar" },
      city: { type: String, default: "Gwalior" },
      state: { type: String, default: "Madhya Pradesh" },
      pincode: { type: String, default: "474001" },
    },
    businessHours: {
      type: String,
      default: "24/7 Car Rental Assistance",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
