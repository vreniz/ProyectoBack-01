import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Name: { type: String, required: true },
    LastName: { type: String, required: true },
    reserveDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true }
});

export const Reservation = mongoose.model('Reservation', ReservationSchema);
