const { addOrDeleteHometask, updateHometask } = require('../manipulators');

const hometasksController = {
    addHometask: (req, res) => {
        addOrDeleteHometask(req, res, 'append');
    },

    updateHometask: (req, res) => {
        updateHometask(req, res);
    },

    deleteHometask: (req, res) => {
        addOrDeleteHometask(req, res, 'remove');
    }
};

module.exports = hometasksController;