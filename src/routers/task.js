import express from 'express';
import { createTask, getAllTasks, getUserTasks, getTaskById, updateTask, deleteTask } from '../controller/task.js';
import { authenticateUser, checkRoles } from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Create a new task
router.post('/', authenticateUser, checkRoles("user"), upload.single('image'), createTask); 

// Get all tasks
router.get('/', getAllTasks); 

// Get tasks for a specific user
router.get('/user/:userId', authenticateUser, checkRoles("user"), getUserTasks); 

 // Get a task by ID
router.get('/:id', authenticateUser, checkRoles("user"), getTaskById);

// Update a task
router.put('/:id', authenticateUser, checkRoles("user"), upload.single('image'), updateTask); 

// Delete a task
router.delete('/:id', authenticateUser, checkRoles("user"), deleteTask); 

export default router;
