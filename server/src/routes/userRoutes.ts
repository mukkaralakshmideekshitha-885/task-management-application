import { Router } from 'express';
import { getAllUsers } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getAllUsers);

export default router;
