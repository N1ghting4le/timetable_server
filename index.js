const express = require('express');
const cors = require('cors');
const { pool, types, table } = require('./db');
require('dotenv').config();

const app = express();

const error = (err, res) => {
    console.error('Error executing query', err.stack);
    res.status(500).send({message: 'Error executing query'});
}

const manipulateQuery = (query, res, params) => {
    pool.query(query, params, (err) => {
        if (err) error(err, res);
        
        res.send({message: 'Success'});
    });
}

const createDay = (date, day) => `('${date}','${day}','{}','{}')::${types.dayType}`;
const createObj = (obj, counter, type) => {
    let str = '(';

    Object.entries(obj).forEach(item => {
        const [key, value] = item;

        if (typeof value === 'object') {
            str += `${createObj(value, counter, types[key + 'Type'])},`;
        } else {
            str += `$${counter[0]},`;
            counter[0]++;
        }
    });
    
    return str.slice(0, str.length - 1) + `)::${type}`;
}

const createArr = (obj) => {
    const arr = [];

    Object.values(obj).forEach(item => {
        if (typeof item === 'object') {
            arr.push(...createArr(item));
        } else {
            arr.push(item);
        }
    });

    return arr;
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

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/', (req, res) => {
    const str = req.body.days.reduce((str, item) => {
        const { date, day } = item;

        return str + `${createDay(date, day)},`;
    }, '');

    const query = `
        INSERT INTO ${table} (days) 
        VALUES 
        (ARRAY[$1]::${types.dayType}[]);
    `;

    manipulateQuery(query, res, [str.slice(0, str.length - 1)]);
});

app.get('/weekList', (req, res) => {
    const query = `SELECT id, array_to_json(days) AS days FROM ${table} ORDER BY id ASC`;

    pool.query(query, (err, response) => {
        if (err) error(err, res);
        
        res.send(response.rows);
    });
});

app.post('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    addOrDelete(req, res, 'append', 'noteType');
});

app.delete('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    addOrDelete(req, res, 'remove', 'noteType');
});

app.patch('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    update(req, res, 'noteType');
});

app.post('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    addOrDelete(req, res, 'append', 'hometaskType');
});

app.delete('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    addOrDelete(req, res, 'remove', 'hometaskType');
});

app.patch('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    update(req, res, 'hometaskType');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running`);
});

module.exports = app;