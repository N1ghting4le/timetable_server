const express = require('express');
const router = express.Router();

const notesController = require('../controllers/notes.controller');

router.post('/weekList/:weekId/days/:dayIndex/notes', notesController.addNote);
router.patch('/weekList/:weekId/days/:dayIndex/notes', notesController.updateNote);
router.delete('/weekList/:weekId/days/:dayIndex/notes', notesController.deleteNote);

module.exports = router;