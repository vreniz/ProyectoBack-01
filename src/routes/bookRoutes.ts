import express from 'express';
import { createBook, softDeleteBook, assignPermissions } from '../controllers/bookController';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware';
import { checkPermissions } from '../middlewares/permissionMiddleware';
import { searchBook } from '../controllers/bookController';
import { Book } from '../models/bookModel';
import { updateBook } from '../controllers/bookController';

const router = express.Router();

router.post('/create', authenticateToken, checkPermissions(['create:book']), createBook);
router.delete('/:bookId', authenticateToken, checkPermissions(['disable:book']), softDeleteBook);
router.get('/search', searchBook);
router.get('/search/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id);
        if (!book) {
            res.status(404).json({ message: 'Libro no encontrado' });
        } else {
            res.status(200).json({ book });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el libro', error });
    }
});
router.put('/update/:bookId', authenticateToken, checkPermissions(['update:book']), updateBook);


export default router;
