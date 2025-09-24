import mongoose, { Document, Schema } from "mongoose";

export interface ISale extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  commission: number;
}

const SaleSchema = new Schema<ISale>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  commission: { type: Number, default: 0 },
});

export const SalesModel = mongoose.model<ISale>("Sale", SaleSchema);
