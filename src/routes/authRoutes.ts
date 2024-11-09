import express from 'express';
import { registerUser, loginUser, softDeleteUser } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { updateUserRole } from '../controllers/userController';
import { forceUpdateUserRole } from '../controllers/userController';
import { assignPermissions } from '../controllers/userController'; // Asegúrate de que la ruta sea la correcta
import { authorizeRole } from '../middlewares/authMiddleware';
import { updateUser } from '../controllers/userController';
import { getUserPermissions } from '../controllers/userController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser as express.RequestHandler);
router.delete('/:userId', authenticateToken, softDeleteUser as express.RequestHandler);
router.patch('/updateRole/:userId', authenticateToken, updateUserRole as express.RequestHandler);
router.patch('/forceUpdateRole/:userId', authenticateToken, forceUpdateUserRole);
router.patch('/assignPermissions/:userId', authenticateToken, assignPermissions);
router.put('/update/:userId', authenticateToken, updateUser as express.RequestHandler);
router.get('/permissions/:userId', getUserPermissions);

export default router;
