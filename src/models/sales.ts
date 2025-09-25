import mongoose, { Document, Schema } from "mongoose";

export interface ISale extends Document {
  user_id: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  product_category: 'software' | 'hardware' | 'consulting' | 'support';
  commission_rate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { 
    type: Number, 
    required: true, 
    min: 0,
    validate: {
      validator: function(v: number) {
        return Number(v.toFixed(2)) === v;
      },
      message: 'Amount must have at most 2 decimal places'
    }
  },
  date: { type: Date, required: true },
  product_category: { 
    type: String, 
    required: true, 
    enum: ['software', 'hardware', 'consulting', 'support'] 
  },
  commission_rate: { 
    type: Number, 
    min: 0, 
    max: 20,
    default: 5
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
SaleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const SalesModel = mongoose.model<ISale>("Sale", SaleSchema);
