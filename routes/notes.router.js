const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notes.controller');

router.post('/', notesController.addNote);
router.patch('/', notesController.updateNote);
router.delete('/', notesController.deleteNote);

module.exports = router;