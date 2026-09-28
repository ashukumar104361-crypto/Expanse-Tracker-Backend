const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/category-summary', dashboardController.getCategorySummary);
router.get('/monthly-summary', dashboardController.getMonthlySummary);

module.exports = router;
