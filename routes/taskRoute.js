const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getAllTasks,
  markTaskCompleted,
  deleteTask,
  getTaskById,
} = require('../controller/taskController');

router.use(protect);

router.post('/', createTask);               // Create new task
router.get('/', getAllTasks);               // List all tasks for user
router.get('/:taskId',getTaskById)
router.put('/:taskId/complete', markTaskCompleted); // Mark as completed (and handle recurring)
router.delete('/:taskId', deleteTask);      // Delete a task


module.exports = router;
