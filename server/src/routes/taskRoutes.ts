import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
