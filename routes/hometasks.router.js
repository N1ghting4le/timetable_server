const express = require('express');
const router = express.Router();

const hometasksController = require('../controllers/hometasks.controller');

router.post('/', hometasksController.addHometask);
router.patch('/', hometasksController.updateHometask);
router.delete('/', hometasksController.deleteHometask);

module.exports = router;