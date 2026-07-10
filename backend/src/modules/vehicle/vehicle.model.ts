import mongoose, { Document, Schema } from "mongoose";

export interface IOutstationTier {
  days: number;
  minKm: number;
  price: number;
}

export interface IVehicle extends Document {
  name: string;
  type: "sedan" | "suv" | "premium-suv" | "tempo";
  capacity: string;
  acType: "AC" | "Non-AC";
  pricePerKm: number;
  localPrice?: number;
  subtitle?: string;
  image: string;
  isActive: boolean;
  outstationTiers?: IOutstationTier[];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: ["sedan", "suv", "premium-suv", "tempo"],
        message: "Type must be one of: sedan, suv, premium-suv, tempo",
      },
    },
    capacity: {
      type: String,
      required: [true, "Vehicle capacity is required"],
      trim: true,
    },
    acType: {
      type: String,
      required: [true, "AC Type is required"],
      enum: {
        values: ["AC", "Non-AC"],
        message: "AC type must be AC or Non-AC",
      },
    },
    pricePerKm: {
      type: Number,
      required: [true, "Price per KM is required"],
      min: [0, "Price per KM cannot be negative"],
    },
    localPrice: {
      type: Number,
      min: [0, "Local price cannot be negative"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [100, "Subtitle cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Vehicle image is required"],
    },
    outstationTiers: {
      type: [
        {
          days: { type: Number, required: true },
          minKm: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
      default: [],
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

// Indexes for fast lookup
VehicleSchema.index({ isActive: 1 });
VehicleSchema.index({ createdAt: -1 });

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
export default Vehicle;
