require('core-js/proposals/array-grouping-v2');
const format = require('pg-format');
const pool = require('../db');
const { manipulateQuery, error} = require('../utils');

const daysController = {
    setDays: (req, res) => {
        const query = format(`
            TRUNCATE TABLE days CASCADE;
            TRUNCATE TABLE notes CASCADE;
            TRUNCATE TABLE hometasks CASCADE;
            INSERT INTO days VALUES %L
        `, req.body.map(item => Object.values(item)));
        
        manipulateQuery(query, res);
    },

    getDays: (req, res) => {
        const groupNum = req.params.groupNum;

        const query = format(`
            SELECT
                to_json(date) AS date,
                name,
                week_num AS week,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', note_id,
                            'text', note_text,
                            'files', (
                                SELECT COALESCE(
                                    json_agg(json_build_object('id', file_id, 'title', title)),
                                    '[]'
                                )
                                FROM files
                                WHERE files.note_id = notes.note_id
                            )
                        )
                    ) FILTER (WHERE note_group_num = %L), '[]'
                ) AS notes,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', hometask_id,
                            'text', hometask_text,
                            'subject', subject,
                            'type', type,
                            'teacherId', teacher_id,
                            'subgroup', subgroup,
                            'files', (
                                SELECT COALESCE(
                                    json_agg(json_build_object('id', file_id, 'title', title)),
                                    '[]'
                                )
                                FROM files
                                WHERE files.hometask_id = hometasks.hometask_id
                            )
                        )
                    ) FILTER (WHERE hometask_group_num = %L), '[]'
                ) AS hometasks
            FROM
                days
            LEFT JOIN
                notes ON days.date = notes.day_date
            LEFT JOIN
                hometasks ON days.date = hometasks.day_date
            GROUP BY
                date, name, week_num
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