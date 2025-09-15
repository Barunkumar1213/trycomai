import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires authentication)
router.get('/me', auth, getCurrentUser);

export const createAuthRouter = () => router;
