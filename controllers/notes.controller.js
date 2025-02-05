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

        const filesArray = JSON.parse(req.body.filesInfo).map((info, i) => {
            const { id, title } = info;

            return [id, null, req.body.id, title, req.files[i].buffer];
        });
        
        if (!filesArray.length) return manipulateQuery(query, res);

        const fileQuery = format("INSERT INTO files VALUES %L", filesArray);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(query);
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

    updateNote: async (req, res) => {
        const { id, text } = req.body;
        const query = format("UPDATE notes SET note_text=%L WHERE note_id=%L", text, id);
        const deletedFilesIds = JSON.parse(req.body.deletedFilesIds);

        const filesArray = JSON.parse(req.body.filesInfo).map((info, i) => {
            const { id: fileId, title } = info;

            return [fileId, null, id, title, req.files[i].buffer];
        });
        
        const client = await pool.connect();

        try {
            await client.query("BEGIN");
            await client.query(query);

            if (filesArray.length) {
                const insertFileQuery = format("INSERT INTO files VALUES %L", filesArray);
                await client.query(insertFileQuery);
            }
            
            if (deletedFilesIds.length) {
                const deleteFileQuery = format("DELETE FROM files WHERE file_id IN (%L)", deletedFilesIds);
                await client.query(deleteFileQuery);
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

    deleteNote: (req, res) => {
        const { id } = req.body;

        const query = format("DELETE FROM notes WHERE note_id=%L", id);
        
        manipulateQuery(query, res);
    }
};

module.exports = notesController;