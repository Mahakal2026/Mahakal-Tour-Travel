import mongoose, { Document, Schema } from "mongoose";

export interface ITokenBlocklist extends Document {
  token: string;
  expiresAt: Date;
}

const TokenBlocklistSchema = new Schema<ITokenBlocklist>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: MongoDB will automatically delete documents once their `expiresAt` time has passed.
TokenBlocklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlocklist = mongoose.model<ITokenBlocklist>("TokenBlocklist", TokenBlocklistSchema);
export default TokenBlocklist;
