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
    const counter = [1];
    const obj = createObj(req.body, counter, types[type]);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (
            days[${dayIndex}].date,
            days[${dayIndex}].day,
            ${type === 'noteType' ? `days[${dayIndex}].hometasks` : `array_${action}(days[${dayIndex}].hometasks, ${obj})::${types[type]}[]`},
            ${type === 'noteType' ? `array_${action}(days[${dayIndex}].notes, ${obj})::${types[type]}[]` : `days[${dayIndex}].notes`}
        )::${dayType} WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, createArr(req.body));
}

const update = (req, res, type) => {
    const { weekId, dayIndex } = req.params; 
    const [objToReplace, objToInsert] = req.body;
    const { dayType } = types;
    const counter = [1];
    const oldObj = createObj(objToReplace, counter, types[type]);
    const newObj = createObj(objToInsert, counter, types[type]);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (
            days[${dayIndex}].date, 
            days[${dayIndex}].day, 
            ${type === 'noteType' ? `days[${dayIndex}].hometasks` : `array_replace(days[${dayIndex}].hometasks, ${oldObj}, ${newObj})::${types[type]}[]`}, 
            ${type === 'noteType' ? `array_replace(days[${dayIndex}].notes, ${oldObj}, ${newObj})::${types[type]}[]` : `days[${dayIndex}].notes`}
        )::${dayType} WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, [...createArr(objToReplace), ...createArr(objToInsert)]);
}

module.exports = {
    manipulateQuery,
    addOrDelete,
    update
};