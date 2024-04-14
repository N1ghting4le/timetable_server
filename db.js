const { Pool } = require('pg');
require('dotenv').config();
 
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

const types = {
    noteType: 'note_type',
    dayType: 'day_type',
    teacherType: 'teacher_type',
    hometaskType: 'hometask_type'
};

const table = process.env.TABLE_NAME;

pool.connect((err) => {
    if (err) throw err;
    console.log("Connect to PostgreSQL successfully!");
});

module.exports = {
    pool,
    types,
    table
};