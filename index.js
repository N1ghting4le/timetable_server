const express = require('express');
const cors = require('cors');
const { pool, types, table } = require('./db');

const app = express();

require('dotenv').config();

const error = (err, res) => {
    console.error('Error executing query', err.stack);
    res.status(500).send({message: 'Error executing query'});
}

const manipulateQuery = (query, res, ...params) => {
    pool.query(query, params, (err) => {
        if (err) error(err, res);
        
        res.send({message: 'Success'});
    });
}

const createNote = (id, num) => `('${id}',$${num})::${types.noteType}`;
const createDay = (date, day) => `('${date}','${day}','{}','{}')::${types.dayType}`;
const createTeacher = (teacher) => {
    const { firstName, middleName, lastName, photoLink } = teacher;

    return `('${firstName}','${middleName}','${lastName}','${photoLink}')::${types.teacherType}`;
}
const createHometask = (hometask, num) => {
    const { subject, type, teacher, id } = hometask;

    return `('${subject}','${type}',$${num},${createTeacher(teacher)},'${id}')::${types.hometaskType}`;
}

const addOrDeleteNote = (req, res, action) => {
    const { weekId, dayIndex } = req.params;
    const { id, text } = req.body;
    const { dayType, noteType } = types;
    const note = createNote(id, 1);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, days[${dayIndex}].hometasks, array_${action}(days[${dayIndex}].notes, ${note})::${noteType}[])::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, text);
}

const addOrDeleteHometask = (req, res, action) => {
    const { weekId, dayIndex } = req.params;
    const { dayType, hometaskType } = types;
    const hometask = createHometask(req.body, 1);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, array_${action}(days[${dayIndex}].hometasks, ${hometask})::${hometaskType}[], days[${dayIndex}].notes)::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, req.body.text);
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
        (ARRAY[${str.slice(0, str.length - 1)}]::${types.dayType}[]);
    `;

    manipulateQuery(query, res);
});

app.get('/weekList', (req, res) => {
    const query = `SELECT id, array_to_json(days) AS days FROM ${table} ORDER BY id ASC`;

    pool.query(query, (err, response) => {
        if (err) error(err, res);
        
        res.send(response.rows);
    });
});

app.post('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    addOrDeleteNote(req, res, 'append');
});

app.delete('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    addOrDeleteNote(req, res, 'remove');
});

app.patch('/weekList/:weekId/days/:dayIndex/notes', (req, res) => {
    const { weekId, dayIndex } = req.params; 
    const [noteToReplace, noteToInsert] = req.body;
    const { noteType, dayType } = types;
    const { id: oldId, text: oldText } = noteToReplace;
    const { id: newId, text: newText } = noteToInsert;
    const oldNote = createNote(oldId, 1);
    const newNote = createNote(newId, 2);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, days[${dayIndex}].hometasks, array_replace(days[${dayIndex}].notes, ${oldNote}, ${newNote})::${noteType}[])::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, oldText, newText);
});

app.post('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    addOrDeleteHometask(req, res, 'append');
});

app.delete('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    addOrDeleteHometask(req, res, 'remove');
});

app.patch('/weekList/:weekId/days/:dayIndex/hometasks', (req, res) => {
    const { weekId, dayIndex } = req.params; 
    const [hometaskToReplace, hometskToInsert] = req.body;
    const { hometaskType, dayType } = types;
    const oldHometask = createHometask(hometaskToReplace, 1);
    const newHometask = createHometask(hometskToInsert, 2);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, array_replace(days[${dayIndex}].hometasks, ${oldHometask}, ${newHometask})::${hometaskType}[], days[${dayIndex}].notes)::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res, hometaskToReplace.text, hometskToInsert.text);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running`);
});

module.exports = app;