import mongoose, { Document, Schema } from "mongoose";

export interface IBookingInquiry extends Document {
  name?: string;
  phone?: string;
  vehicle: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";
  tripType: "local" | "one-way" | "outstation-round" | "package-inquiry" | "general-contact";
  routeOrPackage?: string;
  estimatedFare?: number;
  vehicleId?: string;
  km?: number;
  days?: number;
  rawMessage: string;
  status: "pending" | "confirmed" | "cancelled";
  source: string;
  createdAt: Date;
}

const BookingInquirySchema = new Schema<IBookingInquiry>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      set: (v?: string) => {
        if (!v) return v;
        const digits = v.replace(/[^\d]/g, "");
        return digits.length >= 10 ? digits.slice(-10) : v;
      },
      validate: {
        validator: function (v: string) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 10-digit Indian phone number!`,
      },
    },
    vehicle: {
      type: String,
      required: [true, "Vehicle selection is required"],
      enum: ["hatchback", "sedan", "suv", "premium-suv", "tempo"],
    },
    tripType: {
      type: String,
      required: [true, "Trip type is required"],
      enum: ["local", "one-way", "outstation-round", "package-inquiry", "general-contact"],
    },
    routeOrPackage: {
      type: String,
      trim: true,
    },
    estimatedFare: {
      type: Number,
      min: 0,
    },
    vehicleId: {
      type: String,
      trim: true,
    },
    km: {
      type: Number,
      min: 0,
    },
    days: {
      type: Number,
      min: 1,
    },
    rawMessage: {
      type: String,
      required: [true, "Raw message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    source: {
      type: String,
      default: "website",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// TTL Index for auto-deletion after 7 Days
BookingInquirySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Compound Index for fast paginated and status-filtered admin listing queries
BookingInquirySchema.index({ status: 1, createdAt: -1 });

export const BookingInquiry = mongoose.model<IBookingInquiry>("BookingInquiry", BookingInquirySchema);
export default BookingInquiry;
