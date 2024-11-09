import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: String,
    publicationDate: Date,
    publisher: String,
    availability: { type: Boolean, required: true }, // Campo de disponibilidad agregado
    numberofcopies: { type: Number, required: true, default: 1 }, // Campo de cantidad de ejemplares agregado
    isActive: { type: Boolean, default: true }, // Soft delete
    reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }]
});

export const Book = mongoose.model('Book', BookSchema);
