const format = require('pg-format');
const { manipulateQuery } = require('../utils');

const notesController = {
    addNote: (req, res) => {
        const { date, ...note } = req.body;

        const query = format("UPDATE days SET notes = array_append(notes, (%L)::note_type) WHERE date = %L", Object.values(note), date);
        
        manipulateQuery(query, res);
    },

    updateNote: (req, res) => {
        const { date, oldNote, newNote } = req.body;

        const query = format("UPDATE days SET notes = array_replace(notes, (%L)::note_type, (%L)::note_type) WHERE date = %L", Object.values(oldNote), Object.values(newNote), date);
        
        manipulateQuery(query, res);
    },

    deleteNote: (req, res) => {
        const { date, ...note } = req.body;

        const query = format("UPDATE days SET notes = array_remove(notes, (%L)::note_type) WHERE date = %L", Object.values(note), date);
        
        manipulateQuery(query, res);
    }
};

module.exports = notesController;