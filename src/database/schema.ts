import { Schema } from 'mongoose';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const salesSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    commission: { type: Number, default: 0 }
});

const targetSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetAmount: { type: Number, required: true },
    period: { type: String, required: true } // e.g., 'monthly', 'quarterly'
});

export { userSchema, salesSchema, targetSchema };