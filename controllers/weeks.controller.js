const { pool, types, table } = require('../db');
const { createDay } = require('../creators');
const { manipulateQuery } = require('../manipulators');
const error = require('../error');

const weeksController = {
    addWeek: (req, res) => {
        const { dayType } = types;

        const str = req.body.days.reduce((str, item) => {
            const { date, day } = item;

            return str + `${createDay(date, day, dayType)},`;
        }, '');

        const query = `
            INSERT INTO ${table} (days) 
            VALUES 
            (ARRAY[$1]::${dayType}[]);
        `;

        manipulateQuery(query, res, [str.slice(0, str.length - 1)]);
    },

    getWeekList: (req, res) => {
        const query = `SELECT id, array_to_json(days) AS days FROM ${table} ORDER BY id ASC`;

        pool.query(query, (err, response) => {
            if (err) error(err, res);
            
            res.send(response.rows);
        });
    }
};

module.exports = weeksController;