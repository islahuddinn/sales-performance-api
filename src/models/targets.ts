import mongoose, { Document, Schema } from "mongoose";

export interface ITarget extends Document {
  user_id: mongoose.Types.ObjectId;
  month: number;
  year: number;
  target_amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema = new Schema<ITarget>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 12 
  },
  year: { 
    type: Number, 
    required: true, 
    min: 2020 
  },
  target_amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
TargetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure unique target per user per month/year
TargetSchema.index({ user_id: 1, month: 1, year: 1 }, { unique: true });

export const TargetModel = mongoose.model<ITarget>("Target", TargetSchema);
