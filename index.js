const express = require('express');
const cors = require('cors');
const weeksRouter = require('./routes/weeks.router');
const notesRouter = require('./routes/notes.router');
const hometasksRouter = require('./routes/hometasks.router');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', weeksRouter);
app.use('/', notesRouter);
app.use('/', hometasksRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running`);
});

module.exports = app;