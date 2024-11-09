import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import dotenv from 'dotenv';
import reservationRoutes from './routes/reservationRoutes';
dotenv.config();


const SERVER_VERSION = '/api/v1/';

export default function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use(SERVER_VERSION + 'auth', authRoutes);
    app.use(SERVER_VERSION + 'books', bookRoutes);
    app.use(SERVER_VERSION + 'reservations', reservationRoutes);

    app.use((req, res) => {
        res.status(404).json({ message: 'Route not found.' });
    });

    return app;
}