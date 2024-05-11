require('core-js/proposals/array-grouping-v2');
const format = require('pg-format');
const pool = require('../db');
const { manipulateQuery, error} = require('../utils');

const daysController = {
    setDays: (req, res) => {
        const query = format("TRUNCATE TABLE days; INSERT INTO days VALUES %L", req.body.map(item => Object.values(item)));
        
        manipulateQuery(query, res);
    },

    getDays: (req, res) => {
        const query = "SELECT *, to_json(date) AS date, array_to_json(notes) AS notes, array_to_json(hometasks) AS hometasks FROM days ORDER BY CAST(date AS date) ASC";

        pool.query(query, (err, response) => {
            if (err) error(err, res);
            
            res.send(Object.values(Object.groupBy(response.rows, ({ week }) => week)));
        });
    }
};

module.exports = daysController;