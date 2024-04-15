const express = require('express');
const router = express.Router();

const weeksController = require('../controllers/weeks.controller');

router.post('/', weeksController.addWeek);
router.get('/weekList', weeksController.getWeekList);

module.exports = router;