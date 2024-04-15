const express = require('express');
const router = express.Router();

const hometasksController = require('../controllers/hometasks.controller');

router.post('/weekList/:weekId/days/:dayIndex/hometasks', hometasksController.addHometask);
router.patch('/weekList/:weekId/days/:dayIndex/hometasks', hometasksController.updateHometask);
router.delete('/weekList/:weekId/days/:dayIndex/hometasks', hometasksController.deleteHometask);

module.exports = router;