const format = require('pg-format');
const { manipulateQuery } = require('../utils');

const hometasksController = {
    addHometask: (req, res) => {
        const { date, hometask } = req.body;
        
        const query = format("UPDATE days SET hometasks = array_append(hometasks, (%L)::hometask_type) WHERE date = %L", Object.values(hometask), date);
        
        manipulateQuery(query, res);
    },

    updateHometask: (req, res) => {
        const { date, oldHometask, newHometask } = req.body;

        const query = format("UPDATE days SET hometasks = array_replace(hometasks, (%L)::hometask_type, (%L)::hometask_type) WHERE date = %L", Object.values(oldHometask), Object.values(newHometask), date);
        
        manipulateQuery(query, res);
    },

    deleteHometask: (req, res) => {
        const { date, hometask } = req.body;

        const query = format("UPDATE days SET hometasks = array_remove(hometasks, (%L)::hometask_type) WHERE date = %L", Object.values(hometask), date);
        
        manipulateQuery(query, res);
    }
};

module.exports = hometasksController;