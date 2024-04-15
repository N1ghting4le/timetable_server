const error = (err, res) => {
    console.error('Error executing query', err.stack);
    res.status(500).send({message: 'Error executing query'});
}

module.exports = error;