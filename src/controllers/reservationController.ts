import { Request, Response } from 'express';
import { Reservation } from '../models/reservationModel';
import { Book } from '../models/bookModel';
import { User } from '../models/userModel';
import mongoose from 'mongoose';

export const createReservation = async (req: Request, res: Response): Promise<void> => {
    const { userId, bookId, deliveryDate } = req.body;

    // Verificar que userId y bookId sean ObjectId válidos
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
        res.status(400).json({ message: 'El ID de usuario o libro no es válido' });
        return;
    }

    try {
        // Obtener información del usuario
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        // Obtener información del libro
        const book = await Book.findById(bookId);
        if (!book) {
            res.status(404).json({ message: 'Libro no encontrado' });
            return;
        }

        // Verificar si hay copias disponibles
        if (book.numberofcopies <= 0) {
            res.status(400).json({ message: 'No hay copias disponibles del libro' });
            return;
        }

        // Crear la reserva
        const reservation = new Reservation({
            user: user._id,
            book: book._id,
            Name: user.name, // Añadir nombre del usuario
            LastName: user.lastName, // Añadir apellido del usuario
            deliveryDate
        });
        await reservation.save();

        // Disminuir el número de copias disponibles del libro en 1
        book.numberofcopies -= 1;
        await book.save();

        // Actualizar las referencias en los modelos de Book y User
        await Book.findByIdAndUpdate(bookId, { $push: { reservations: reservation._id } });
        await User.findByIdAndUpdate(userId, { $push: { reservations: reservation._id } });

        res.status(201).json({ message: 'Reserva creada exitosamente', reservation });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la reserva', error });
    }
};

export const getReservationsByUserNameAndLastName = async (req: Request, res: Response): Promise<void> => {
    const { name, lastName } = req.params;

    try {
        const user = await User.findOne({ name, lastName });
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        const reservations = await Reservation.find({ user: user._id }).populate('book');
        res.status(200).json({ reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las reservas del usuario', error });
    }
};

export const getReservationHistoryByUser = async (req: Request, res: Response): Promise<void> => {
    const { userId, name, lastName } = req.params;

    try {
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (name && lastName) {
            user = await User.findOne({ name, lastName });
        }

        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        const reservations = await Reservation.find({ user: user._id })
            .populate('book', 'title')
            .select('reserveDate deliveryDate');
        
        res.status(200).json({ userName: `${user.name} ${user.lastName}`, reservations });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial de reservas del usuario', error });
    }
};

// Define un tipo específico para la reserva con la población del usuario
interface PopulatedReservation {
    user: {
        name: string;
        lastName: string;
    };
    reserveDate: Date;
    deliveryDate: Date;
}

export const getReservationHistoryByBook = async (req: Request, res: Response): Promise<void> => {
    const { bookId, bookName } = req.params;

    try {
        let book;
        if (bookId) {
            book = await Book.findById(bookId);
        } else if (bookName) {
            book = await Book.findOne({ title: new RegExp(`^${bookName}$`, 'i') });
        }

        if (!book) {
            res.status(404).json({ message: 'Libro no encontrado' });
            return;
        }

        const reservations = await Reservation.find({ book: book._id })
            .populate<{ user: { name: string; lastName: string } }>('user', 'name lastName') // Especifica el tipo de población
            .select('reserveDate deliveryDate user')
            .lean<PopulatedReservation[]>(); // Usa el tipo definido

        const formattedReservations = reservations.map(reservation => ({
            user: {
                name: reservation.user?.name || '',
                lastName: reservation.user?.lastName || ''
            },
            reserveDate: reservation.reserveDate,
            deliveryDate: reservation.deliveryDate
        }));

        res.status(200).json({ bookTitle: book.title, reservations: formattedReservations });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial de reservas del libro', error });
    }
};
