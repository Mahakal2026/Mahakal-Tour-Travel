import mongoose, { Document, Schema } from "mongoose";

export interface IPackage extends Document {
  name: string;
  description: string;
  duration: string;
  price: number;
  priceLabel?: string;
  inclusions: string[];
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    priceLabel: {
      type: String,
      trim: true,
    },
    inclusions: {
      type: [String],
      required: [true, "At least one inclusion is required"],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one inclusion is required",
      },
    },
    image: {
      type: String,
      required: [true, "Package image is required"],
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

// Indexes
PackageSchema.index({ isActive: 1 });
PackageSchema.index({ createdAt: -1 });

export const TourPackage = mongoose.model<IPackage>("Package", PackageSchema);
export default TourPackage;
