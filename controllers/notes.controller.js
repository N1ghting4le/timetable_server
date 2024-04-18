const { addOrDeleteNote, updateNote } = require('../manipulators');

const notesController = {
    addNote: (req, res) => {
        addOrDeleteNote(req, res, 'append');
    },

    updateNote: (req, res) => {
        updateNote(req, res);
    },

    deleteNote: (req, res) => {
        addOrDeleteNote(req, res, 'remove');
    }
};

module.exports = notesController;