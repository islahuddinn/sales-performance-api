import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  region: 'north' | 'south' | 'east' | 'west';
  hire_date: Date;
  status: 'active' | 'inactive';
  current_region_start_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true },
  region: { 
    type: String, 
    required: true, 
    enum: ['north', 'south', 'east', 'west'] 
  },
  hire_date: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'inactive'],
    default: 'active'
  },
  current_region_start_date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
