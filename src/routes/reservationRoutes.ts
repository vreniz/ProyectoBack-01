import express from 'express';
import {
    createReservation,
    getReservationsByUserNameAndLastName
} from '../controllers/reservationController';
import{getReservationHistoryByBook,getReservationHistoryByUser} from '../controllers/reservationController';


const router = express.Router();

router.post('/create', createReservation);
//router.get('/user/:userId', getUserReservations);
//router.get('/book/:bookId', getBookReservations);
//router.get('/book/name/:bookName', getReservationsByBookName); // Nueva ruta para buscar por nombre de libro
router.get('/user/name/:name/lastName/:lastName', getReservationsByUserNameAndLastName); // Nueva ruta para buscar por nombre y apellido de usuario
router.get('/book/history/:bookId?', getReservationHistoryByBook);
router.get('/book/history/name/:bookName?', getReservationHistoryByBook);
router.get('/user/history/:userId?', getReservationHistoryByUser);
router.get('/user/history/name/:name/lastName/:lastName', getReservationHistoryByUser);



export default router;
