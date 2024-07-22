const format = require('pg-format');
const { manipulateQuery } = require('../utils');

const notesController = {
    addNote: (req, res) => {
        const query = format("INSERT INTO notes VALUES (%L)", Object.values(req.body));
        
        manipulateQuery(query, res);
    },

    updateNote: (req, res) => {
        const { id, text } = req.body;

        const query = format("UPDATE notes SET note_text=%L WHERE note_id=%L", text, id);
        
        manipulateQuery(query, res);
    },

    deleteNote: (req, res) => {
        const { id } = req.body;

        const query = format("DELETE FROM notes WHERE note_id=%L", id);
        
        manipulateQuery(query, res);
    }
};

module.exports = notesController;