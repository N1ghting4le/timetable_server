const format = require('pg-format');
const { pool, types, table } = require('../db');
const { createDay } = require('../creators');
const { manipulateQuery } = require('../manipulators');
const error = require('../error');

const weeksController = {
    addWeek: (req, res) => {
        const { dayType } = types;

        const str = req.body.days.reduce((str, item) => {
            const { date, day } = item;

            return str + createDay(date, day, dayType);
        }, '');

        const query = format("INSERT INTO %s (days) VALUES (ARRAY[%s]::%s[]);", table, str.slice(0, str.length - 1), dayType);

        manipulateQuery(query, res, []);
    },

    getWeekList: (req, res) => {
        const query = format("SELECT id, array_to_json(days) AS days FROM %s ORDER BY id ASC", table);

        pool.query(query, (err, response) => {
            if (err) error(err, res);
            
            res.send(response.rows);
        });
    }
};

module.exports = weeksController;