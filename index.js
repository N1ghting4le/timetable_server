const express = require('express');
const cors = require('cors');
const daysRouter = require('./routes/days.router');
const notesRouter = require('./routes/notes.router');
const hometasksRouter = require('./routes/hometasks.router');
const pool = require("./db");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/days', daysRouter);
app.use('/notes', notesRouter);
app.use('/hometasks', hometasksRouter);

app.get('/download/:fileId', async (req, res) => {
    const fileId = req.params.fileId;

    try {
        const result = await pool.query('SELECT title, content FROM files WHERE file_id = $1', [fileId]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('File not found');
        }

        const file = result.rows[0];

        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(file.title)}"`,
            'Content-Type': 'application/octet-stream',
            'Content-Length': file.content.length
        });

        res.send(file.content);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Server is running`);
});

module.exports = app;