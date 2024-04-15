const { addOrDelete, update } = require('../manipulators');

const type = 'noteType';

const notesController = {
    addNote: (req, res) => {
        addOrDelete(req, res, 'append', type);
    },

    updateNote: (req, res) => {
        update(req, res, type);
    },

    deleteNote: (req, res) => {
        addOrDelete(req, res, 'remove', type);
    }
};

module.exports = notesController;