import { Response } from 'express';
import { CustomRequest } from '../middlewares/authMiddleware';
import { Book } from '../models/bookModel';
import { User } from '../models/userModel'; // Asegúrate de que la ruta sea correcta
import { Request} from 'express';

interface AssignPermissionsRequest extends CustomRequest {
    params: {
        userId: string;
    };
    body: {
        permissions: string[];
    };
}

export const createBook = async (req: CustomRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(403).json({ message: 'No tienes permiso para crear libros' });
        return;
    }

    if (req.user.role !== 'admin' && !req.user.permissions.includes('create:book')) {
        res.status(403).json({ message: 'No tienes permiso para crear libros' });
        return;
    }

    const { title, author, genre, publicationDate, publisher, availability,numberofcopies } = req.body;

    try {
        const book = new Book({ title, author, genre, publicationDate, publisher, availability,numberofcopies });
        await book.save();

        res.status(201).json({ message: 'Libro creado exitosamente', book });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el libro', error });
    }
};


export const assignPermissions = async (req: CustomRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { permissions } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        user.permissions = permissions;
        await user.save();

        res.status(200).json({
            message: 'Permisos asignados exitosamente',
            user: {
                id: user._id,
                permissions: user.permissions
            }
        });
    } catch (error) {
        console.error('Detalles del error:', error);
        res.status(500).json({ message: 'Error al asignar permisos', error });
    }
};

interface AssignPermissionsRequest extends CustomRequest {
    params: {
        userId: string;
    };
    body: {
        permissions: string[];
    };
}
interface SearchQuery {
    author?: string;
    genre?: string;
    publicationDate?: string;
    title?: string;
    publisher?: string;
    availability?: string;
}

export const searchBook = async (req: Request<{}, {}, {}, SearchQuery>, res: Response): Promise<void> => {
    const { author, genre, publicationDate, title, publisher, availability } = req.query;

    try {
        // Construcción de filtros dinámicos
        const filterParams = {
            author: author ? new RegExp(author, 'i') : undefined,
            genre: genre ? genre : undefined,
            publicationDate: publicationDate ? new Date(publicationDate) : undefined,
            title: title ? new RegExp(title, 'i') : undefined,
            publisher: publisher ? new RegExp(publisher, 'i') : undefined,
            availability: availability ? availability === 'true' : undefined,
            isActive: true // Excluir libros inhabilitados
        };

        // Remover parámetros no definidos
        const filter = Object.fromEntries(Object.entries(filterParams).filter(([_, v]) => v !== undefined));

        // Búsqueda con filtros
        const books = await Book.find(filter);
        if (books.length === 0) {
            res.status(404).json({ message: "No se encontraron libros con esos criterios." });
            return;
        }

        res.status(200).json({ books });
    } catch (error) {
        console.error('Error en la búsqueda de libros:', error);
        res.status(500).json({ message: 'Error al buscar libros', error });
    }
};
export const updateBook = async (req: CustomRequest, res: Response): Promise<void> => {
    const { bookId } = req.params;
    const { title, author, genre, publicationDate, publisher, availability } = req.body;

    if (!req.user) {
        res.status(403).json({ message: 'No estás autorizado' });
        return;
    }

    // Verificar si el usuario tiene el permiso de modificar libros
    if (!req.user.permissions.includes('update:book')) {
        res.status(403).json({ message: 'No tienes permiso para actualizar libros' });
        return;
    }

    try {
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { title, author, genre, publicationDate, publisher, availability },
            { new: true }
        );
        if (!updatedBook) {
            res.status(404).json({ message: 'Libro no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Libro actualizado exitosamente', book: updatedBook });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el libro', error });
    }
};
export const softDeleteBook = async (req: CustomRequest, res: Response): Promise<void> => {
    const { bookId } = req.params;

    // Verifica que el usuario tenga permisos para inhabilitar libros
    if (req.user?.permissions.includes('disable:book')) {
        try {
            await Book.findByIdAndUpdate(bookId, { isActive: false });
            res.status(200).json({ message: 'Libro inhabilitado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al inhabilitar el libro', error });
        }
    } else {
        res.status(403).json({ message: 'No tienes permiso para inhabilitar libros' });
    }
};
