const format = require('pg-format');
const { pool, types, table } = require('./db');
const { createArr } = require('./creators');
const error = require('./error');

const manipulateQuery = (query, res, params) => {
    pool.query(query, params, (err) => {
        if (err) error(err, res);
        
        res.send({message: 'Success'});
    });
}

const addOrDeleteNote = (req, res, action) => {
    const { weekId, dayIndex } = req.params; 
    const { dayType, noteType } = types;

    const query = format(
        "UPDATE %s SET days[$1] = (days[$1].date,days[$1].day,days[$1].hometasks,array_%s(days[$1].notes,('%s','%s')::%s)::%s[])::%s WHERE id = $2",
        table, action, ...createArr(req.body, noteType), noteType, dayType
    );

    manipulateQuery(query, res, [dayIndex, weekId]);
}

const addOrDeleteHometask = (req, res, action) => {
    const { weekId, dayIndex } = req.params; 
    const { dayType, hometaskType } = types;

    const query = format(
        "UPDATE %s SET days[$1] = (days[$1].date,days[$1].day,array_%s(days[$1].hometasks,('%s','%s','%s',('%s','%s','%s','%s')::%s,'%s')::%s)::%s[],days[$1].notes)::%s WHERE id = $2",
        table, action, ...createArr(req.body, hometaskType), hometaskType, dayType
    );

    manipulateQuery(query, res, [dayIndex, weekId]);
}

const updateNote = (req, res) => {
    const { weekId, dayIndex } = req.params; 
    const { dayType, noteType } = types;
    const [toReplace, toInsert] = req.body;

    const query = format(
        "UPDATE %s SET days[$1] = (days[$1].date,days[$1].day,days[$1].hometasks,array_replace(days[$1].notes,('%s','%s')::%s,('%s','%s')::%s)::%s[])::%s WHERE id = $2",
        table, ...createArr(toReplace, noteType), ...createArr(toInsert, noteType), noteType, dayType
    );

    manipulateQuery(query, res, [dayIndex, weekId]);
}

const updateHometask = (req, res) => {
    const { weekId, dayIndex } = req.params; 
    const { dayType, hometaskType } = types;
    const [toReplace, toInsert] = req.body;

    const query = format(
        "UPDATE %s SET days[$1] = (days[$1].date,days[$1].day,array_replace(days[$1].hometasks,('%s','%s','%s',('%s','%s','%s','%s')::%s,'%s')::%s,('%s','%s','%s',('%s','%s','%s','%s')::%s,'%s')::%s)::%s[],days[$1].notes)::%s WHERE id = $2",
        table, ...createArr(toReplace, hometaskType), ...createArr(toInsert, hometaskType), hometaskType, dayType
    );

    manipulateQuery(query, res, [dayIndex, weekId]);
}

module.exports = {
    manipulateQuery,
    addOrDeleteNote,
    addOrDeleteHometask,
    updateNote,
    updateHometask
};