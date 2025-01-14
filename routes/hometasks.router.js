const express = require('express');
const upload = require('../upload');
const router = express.Router();

const hometasksController = require('../controllers/hometasks.controller');

router.post('/', upload.array('files'), hometasksController.addHometask);
router.patch('/', upload.array('files'), hometasksController.updateHometask);
router.delete('/', hometasksController.deleteHometask);

module.exports = router;