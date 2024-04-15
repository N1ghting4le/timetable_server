const { types } = require('./db');

const createDay = (date, day, dayType) => `('${date}','${day}','{}','{}')::${dayType}`;
const createObj = (obj, counter, type) => {
    let str = '(';

    Object.entries(obj).forEach(item => {
        const [key, value] = item;

        if (typeof value === 'object') {
            str += `${createObj(value, counter, types[key + 'Type'])},`;
        } else {
            str += `$${counter[0]},`;
            counter[0]++;
        }
    });
    
    return str.slice(0, str.length - 1) + `)::${type}`;
}

const createArr = (obj) => {
    const arr = [];

    Object.values(obj).forEach(item => {
        if (typeof item === 'object') {
            arr.push(...createArr(item));
        } else {
            arr.push(item);
        }
    });

    return arr;
}

module.exports = { 
    createDay, 
    createObj, 
    createArr 
};