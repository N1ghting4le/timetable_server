const express = require('express');
const cors = require('cors');
const daysRouter = require('./routes/days.router');
const notesRouter = require('./routes/notes.router');
const hometasksRouter = require('./routes/hometasks.router');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/days', daysRouter);
app.use('/notes', notesRouter);
app.use('/hometasks', hometasksRouter);

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Server is running`);
});

module.exports = app;