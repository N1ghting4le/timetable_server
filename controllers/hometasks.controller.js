const { addOrDelete, update } = require('../manipulators');

const type = 'hometaskType';

const hometasksController = {
    addHometask: (req, res) => {
        addOrDelete(req, res, 'append', type);
    },

    updateHometask: (req, res) => {
        update(req, res, type);
    },

    deleteHometask: (req, res) => {
        addOrDelete(req, res, 'remove', type);
    }
};

module.exports = hometasksController;