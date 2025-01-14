const express = require('express');
const upload = require('../upload');
const router = express.Router();

const notesController = require('../controllers/notes.controller');

router.post('/', upload.array('files'), notesController.addNote);
router.patch('/', upload.array('files'), notesController.updateNote);
router.delete('/', notesController.deleteNote);

module.exports = router;