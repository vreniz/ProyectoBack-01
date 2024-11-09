import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    permissions: { type: [String], default: [] },
    register_date: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }]
});

export const User = mongoose.model('User', UserSchema);
