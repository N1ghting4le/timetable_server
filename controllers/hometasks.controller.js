const format = require('pg-format');
const { manipulateQuery } = require('../utils');

const hometasksController = {
    addHometask: (req, res) => {
        const query = format("INSERT INTO hometasks VALUES (%L)", Object.values(req.body));
        
        manipulateQuery(query, res);
    },

    updateHometask: (req, res) => {
        const { id, teacherId, text } = req.body;

        const query = format("UPDATE hometasks SET teacher_id=%L, hometask_text=%L WHERE hometask_id=%L", teacherId, text, id);
        
        manipulateQuery(query, res);
    },

    deleteHometask: (req, res) => {
        const { id } = req.body;

        const query = format("DELETE FROM hometasks WHERE hometask_id=%L", id);
        
        manipulateQuery(query, res);
    }
};

module.exports = hometasksController;