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

router.post('/', createTask);              
router.get('/', getAllTasks);            
router.get('/:taskId',getTaskById)
router.put('/:taskId/complete', markTaskCompleted);
router.delete('/:taskId', deleteTask);


module.exports = router;
