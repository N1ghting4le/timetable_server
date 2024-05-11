const format = require('pg-format');
const { manipulateQuery } = require('../utils');

const notesController = {
    addNote: (req, res) => {
        const { date, ...note } = req.body;

        const query = format("UPDATE days SET notes = array_append(notes, (%L)::note_type) WHERE date = %L", Object.values(note), date);
        
        manipulateQuery(query, res);
    },

    updateNote: (req, res) => {
        const { date, index, ...note } = req.body;

        const query = format("UPDATE days SET notes[%s] = (%L)::note_type WHERE date = %L", index, Object.values(note), date);
        
        manipulateQuery(query, res);
    },

    deleteNote: (req, res) => {
        const { date, ...note } = req.body;

        const query = format("UPDATE days SET notes = array_remove(notes, (%L)::note_type) WHERE date = %L", Object.values(note), date);
        
        manipulateQuery(query, res);
    }
};

module.exports = notesController;