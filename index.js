const express = require('express');
const cors = require('cors');
const weeksRouter = require('./routes/weeks.router');
const notesRouter = require('./routes/notes.router');
const hometasksRouter = require('./routes/hometasks.router');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', weeksRouter);
app.use('/', notesRouter);
app.use('/', hometasksRouter);

const port = 3001;
const host = 'localhost';

app.listen(port, host, () => {
    console.log(`Server launched: http://${host}:${port}`);
});