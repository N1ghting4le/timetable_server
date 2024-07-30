const express = require('express');
const router = express.Router();

const daysController = require('../controllers/days.controller');

router.post('/', daysController.setDays);
router.get('/:groupNum', daysController.getDays);

module.exports = router;