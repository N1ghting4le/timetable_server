const pool = require('./db');

const error = (err, res) => {
    console.error(err.stack);
    res.status(500).send({ message: "Error executing query" });
}

const manipulateQuery = (query, res) => {
    pool.query(query, (err) => {
        if (err) error(err, res);
        
        res.send({ message: "Success" });
    });
}

module.exports = { 
    error,
    manipulateQuery 
};