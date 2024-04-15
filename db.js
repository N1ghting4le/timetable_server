const { Pool } = require('pg');
 
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'weekList',
    password: 'Upstream228',
    port: 5328
});

const types = {
    noteType: 'note_type',
    dayType: 'day_type',
    teacherType: 'teacher_type',
    hometaskType: 'hometask_type'
};

const table = 'public."weekList"';

pool.connect((err) => {
    if (err) throw err;
    console.log("Connect to PostgreSQL successfully!");
});

module.exports = {
    pool,
    types,
    table
};