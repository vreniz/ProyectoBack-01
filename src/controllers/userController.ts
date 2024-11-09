import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel';
import { Types } from 'mongoose';
import { CustomRequest } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';


export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, lastName, email, password, role } = req.body;

    try {
        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'El usuario ya existe' });
            return;
        }

        // Hashear la contraseña con bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear una fecha de registro
        const registerDate = new Date();

        // Crear el nuevo usuario
        const newUser = new User({
            name,
            lastName,
            email,
            password: hashedPassword,
            role,
            register_date: registerDate,
            permissions: [] // Ajustable según necesidades
        });

        // Guardar el usuario en la base de datos
        await newUser.save();

        // Respuesta de éxito
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser._id,
                username: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
};


export const loginUser = async (req: CustomRequest, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Incluye los permisos en el token
    const token = jwt.sign(
        { id: user._id, role: user.role, permissions: user.permissions },
        process.env.JWT_SECRET || '',
        { expiresIn: '1h' }
    );

    res.status(200).json({ token });
};

export const softDeleteUser = async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    if (req.user?.id === userId || req.user?.role === 'admin') {
        await User.findByIdAndUpdate(userId, { isActive: false });
        res.status(200).json({ message: 'Usuario inhabilitado' });
    } else {
        res.status(403).json({ message: 'No tienes permiso' });
    }
};
export const updateUserRole = async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body; // role should be one of ['user', 'admin']

    if (req.user?.role === 'admin') {
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (user) {
            res.status(200).json({ message: 'Role updated successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } else {
        res.status(403).json({ message: 'No tienes permiso para actualizar roles' });
    }
};
export const forceUpdateUserRole = async (req: CustomRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body; // role should be one of ['user', 'admin']

    try {
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (user) {
            res.status(200).json({ message: 'Role updated successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role', error });
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


// Función de asignación de permisos corregida
export const assignPermissions = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { permissions } = req.body;

    try {
        // Verifica si el ID es un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'ID de usuario no válido' });
            return;
        }

        // Busca al usuario
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        // Agrega los nuevos permisos al array existente sin duplicados
        const updatedPermissions = Array.from(new Set([...user.permissions, ...permissions]));

        // Actualiza los permisos del usuario
        user.permissions = updatedPermissions;
        await user.save();

        res.status(200).json({
            message: 'Permisos asignados exitosamente',
            user: {
                id: user._id,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        console.error('Error al asignar permisos:', error);
        res.status(500).json({ message: 'Error al asignar permisos', error });
    }
};
export const updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { name, lastName, email } = req.body;

    if (!req.user) {
        res.status(403).json({ message: 'No estás autorizado' });
        return;
    }

    // Solo el usuario mismo o un usuario con permisos puede actualizar
    if (req.user.id !== userId && !req.user.permissions.includes('update:user')) {
        res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
        return;
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { name, lastName, email }, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
};
export const getUserPermissions = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId, 'permissions');
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        res.status(200).json({ permissions: user.permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los permisos del usuario', error });
    }
};