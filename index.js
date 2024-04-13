const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

require('dotenv').config();

const table = process.env.TABLE_NAME;

const types = {
    noteType: 'note_type',
    dayType: 'day_type',
    teacherType: 'teacher_type',
    hometaskType: 'hometask_type'
};

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

const error = (err, res) => {
    console.error('Error executing query', err.stack);
    res.status(500).send({message: 'Error executing query'});
}

const manipulateQuery = (query, res) => {
    pool.query(query, (err) => {
        if (err) error(err, res);
        
        res.send({message: 'Success'});
    });
}

const createNote = (id, text) => `('${id}','${text}')::${types.noteType}`;
const createDay = (date, day) => `('${date}','${day}','{}','{}')::${types.dayType}`;
const createTeacher = (teacher) => {
    const { firstName, middleName, lastName, photoLink } = teacher;

    return `('${firstName}','${middleName}','${lastName}','${photoLink}')::${types.teacherType}`;
}
const createHometask = (hometask) => {
    const { subject, type, text, teacher, id } = hometask;

    return `('${subject}','${type}','${text}',${createTeacher(teacher)},'${id}')::${types.hometaskType}`;
}

const addOrDeleteNote = (req, res, action) => {
    const { weekId, dayIndex } = req.params;
    const { id, text } = req.body;
    const { dayType, noteType } = types;
    const note = createNote(id, text);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, days[${dayIndex}].hometasks, array_${action}(days[${dayIndex}].notes, ${note})::${noteType}[])::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res);
}

const addOrDeleteHometask = (req, res, action) => {
    const { weekId, dayIndex } = req.params;
    const { dayType, hometaskType } = types;
    const hometask = createHometask(req.body);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, array_${action}(days[${dayIndex}].hometasks, ${hometask})::${hometaskType}[], days[${dayIndex}].notes)::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res);
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
    const oldNote = createNote(oldId, oldText);
    const newNote = createNote(newId, newText);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, days[${dayIndex}].hometasks, array_replace(days[${dayIndex}].notes, ${oldNote}, ${newNote})::${noteType}[])::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res);
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
    const oldHometask = createHometask(hometaskToReplace);
    const newHometask = createHometask(hometskToInsert);

    const query = `
        UPDATE ${table}
        SET days[${dayIndex}] = (days[${dayIndex}].date, days[${dayIndex}].day, array_replace(days[${dayIndex}].hometasks, ${oldHometask}, ${newHometask})::${hometaskType}[], days[${dayIndex}].notes)::${dayType}
        WHERE id = ${weekId}
    `;

    manipulateQuery(query, res);
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running`);
});