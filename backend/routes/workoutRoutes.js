const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', workoutController.getWorkouts);
router.post('/', workoutController.createWorkout);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);
router.post('/complete', workoutController.completeWorkout);
router.post('/reset-split', workoutController.resetSplit);

module.exports = router;
