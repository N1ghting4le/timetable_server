const fs = require('fs');
const format = require('pg-format');
const pool = require('../db');
const { manipulateQuery, error } = require('../utils');

const createNote = (body) => {
    const { id, date, text, groupNum } = body;

    return [ id, date, text, groupNum ];
}

const notesController = {
    addNote: async (req, res) => {
        const query = format("INSERT INTO notes VALUES (%L)", createNote(req.body));
        
        if (!req.files[0].size) {
            fs.unlinkSync(req.files[0].path);
            return manipulateQuery(query, res);
        }

        const filesInfo = JSON.parse(req.body.filesInfo);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(query);

            for (let i = 0; i < filesInfo.length; i++) {
                const { id, title } = filesInfo[i];
                const { path } = req.files[i];
                const fileData = fs.readFileSync(path);

                const fileQuery = format(
                    "INSERT INTO files VALUES (%L)", [id, null, req.body.id, title, fileData]
                );
                
                fs.unlinkSync(path);
                await client.query(fileQuery);
            }

            await client.query("COMMIT");
            res.send({ message: "Success" });
        } catch (e) {
            await client.query("ROLLBACK");
            error(e, res);
        } finally {
            client.release();
        }
    },

    updateNote: async (req, res) => {
        const { id, text } = req.body;

        const query = format("UPDATE notes SET note_text=%L WHERE note_id=%L", text, id);
        
        if (!req.files[0].size) {
            fs.unlinkSync(req.files[0].path);
            return manipulateQuery(query, res);
        }

        const filesInfo = JSON.parse(req.body.filesInfo);
        const deletedFilesIds = JSON.parse(req.body.deletedFilesIds);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(query);

            for (let i = 0; i < filesInfo.length; i++) {
                const { id: fileId, title } = filesInfo[i];
                const { path } = req.files[i];
                const fileData = fs.readFileSync(path);

                const fileQuery = format(
                    "INSERT INTO files VALUES (%L)", [fileId, null, id, title, fileData]
                );
                
                fs.unlinkSync(path);
                await client.query(fileQuery);
            }

            const fileQuery = format("DELETE FROM files WHERE file_id IN (%L)", deletedFilesIds);

            await client.query(fileQuery);
            await client.query("COMMIT");
            res.send({ message: "Success" });
        } catch (e) {
            await client.query("ROLLBACK");
            error(e, res);
        } finally {
            client.release();
        }
    },

    deleteNote: (req, res) => {
        const { id } = req.body;

        const query = format("DELETE FROM notes WHERE note_id=%L", id);
        
        manipulateQuery(query, res);
    }
};

module.exports = notesController;