require('core-js/proposals/array-grouping-v2');
const format = require('pg-format');
const pool = require('../db');
const { manipulateQuery, error} = require('../utils');

const daysController = {
    setDays: (req, res) => {
        const query = format("TRUNCATE TABLE days CASCADE; TRUNCATE TABLE notes; TRUNCATE TABLE hometasks; INSERT INTO days VALUES %L", req.body.map(item => Object.values(item)));
        
        manipulateQuery(query, res);
    },

    getDays: (req, res) => {
        const groupNum = req.params.groupNum;

        const query = format(`
            SELECT
                to_json(date) AS date,
                name,
                week_num AS week,
                COALESCE(json_agg(json_build_object('id', note_id, 'text', note_text)) FILTER (WHERE note_id IS NOT NULL AND note_group_num=%L), '[]') AS notes,
                COALESCE(json_agg(json_build_object('id', hometask_id, 'text', hometask_text, 'subject', subject, 'type', type, 'teacher', teacher)) FILTER (WHERE hometask_id IS NOT NULL AND hometask_group_num=%L), '[]') AS hometasks
            FROM
                days
            LEFT JOIN
                notes ON days.date = notes.day_date
            LEFT JOIN
	            hometasks ON days.date = hometasks.day_date
            GROUP BY
                date
            ORDER BY
                CAST(date AS date) ASC;
        `, groupNum, groupNum);

        pool.query(query, (err, response) => {
            if (err) error(err, res);
            
            res.send(Object.values(Object.groupBy(response.rows, ({ week }) => week)));
        });
    }
};

module.exports = daysController;