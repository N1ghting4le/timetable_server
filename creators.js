const format = require('pg-format');
const { types } = require('./db');

const createDay = (date, day, dayType) => format("('%s','%s','{}','{}')::%s,", date, day, dayType);

const createArr = (obj, type) => {
    const arr = [];

    Object.entries(obj).forEach(item => {
        const [key, value] = item;

        if (typeof value === 'object') {
            arr.push(...createArr(value, types[key + 'Type']));
        } else {
            arr.push(value);
        }
    });

    arr.push(type);

    return arr;
}

module.exports = { 
    createDay,
    createArr 
};