const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', nutritionController.getNutrition);
router.post('/meal', nutritionController.addMeal);
router.put('/meal/:id', nutritionController.updateMeal);
router.delete('/meal/:id', nutritionController.deleteMeal);
router.get('/foods/search', nutritionController.searchFoods);

module.exports = router;
