const format = require('pg-format');
const pool = require('../db');
const { manipulateQuery, error } = require('../utils');

const createHometask = (body) => {
    const { id, date, subject, type, text, groupNum, subgroup, teacherId } = body;

    return [ id, date, subject, type, text, groupNum, subgroup, teacherId ];
}

const hometasksController = {
    addHometask: async (req, res) => {
        const query = format("INSERT INTO hometasks VALUES (%L)", createHometask(req.body));

        const filesArray = JSON.parse(req.body.filesInfo).map((info, i) => {
            const { id, title } = info;

            return [id, req.body.id, null, title, req.files[i].buffer];
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

    updateHometask: async (req, res) => {
        const { id, teacherId, text } = req.body;

        const query = format(
            "UPDATE hometasks SET teacher_id=%L, hometask_text=%L WHERE hometask_id=%L",
            teacherId, text, id
        );

        const deletedFilesIds = JSON.parse(req.body.deletedFilesIds);
        const filesArray = JSON.parse(req.body.filesInfo).map((info, i) => {
            const { id: fileId, title } = info;

            return [fileId, id, null, title, req.files[i].buffer];
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

    deleteHometask: (req, res) => {
        const { id } = req.body;

        const query = format("DELETE FROM hometasks WHERE hometask_id=%L", id);

        manipulateQuery(query, res);
    }
};

module.exports = hometasksController;