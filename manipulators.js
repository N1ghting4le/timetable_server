const { pool, types, table } = require('./db');
const { createArr, createObj } = require('./creators');
const error = require('./error');

const manipulateQuery = (query, res, params) => {
    pool.query(query, params, (err) => {
        if (err) error(err, res);
        
        res.send({message: 'Success'});
    });
}

const addOrDelete = (req, res, action, type) => {
    const { weekId, dayIndex } = req.params; 
    const { dayType } = types;
    const counter = [3];
    const obj = createObj(req.body, counter, types[type]);

    const query = `
        UPDATE ${table}
        SET days[$1] = (
            days[$1].date,
            days[$1].day,
            ${type === 'hometaskType' ? `array_${action}(days[$1].hometasks, ${obj})::${types[type]}[]` : `days[$1].hometasks`},
            ${type === 'noteType' ? `array_${action}(days[$1].notes, ${obj})::${types[type]}[]` : `days[$1].notes`}
        )::${dayType} WHERE id = $2
    `;

    manipulateQuery(query, res, [dayIndex, weekId, ...createArr(req.body)]);
}

const update = (req, res, type) => {
    const { weekId, dayIndex } = req.params; 
    const [objToReplace, objToInsert] = req.body;
    const { dayType } = types;
    const counter = [3];
    const oldObj = createObj(objToReplace, counter, types[type]);
    const newObj = createObj(objToInsert, counter, types[type]);

    const query = `
        UPDATE ${table}
        SET days[$1] = (
            days[$1].date, 
            days[$1].day, 
            ${type === 'hometaskType' ? `array_replace(days[$1].hometasks, ${oldObj}, ${newObj})::${types[type]}[]` : `days[$1].hometasks`}, 
            ${type === 'noteType' ? `array_replace(days[$1].notes, ${oldObj}, ${newObj})::${types[type]}[]` : `days[$1].notes`}
        )::${dayType} WHERE id = $2
    `;

    manipulateQuery(query, res, [dayIndex, weekId, ...createArr(objToReplace), ...createArr(objToInsert)]);
}

module.exports = {
    manipulateQuery,
    addOrDelete,
    update
};