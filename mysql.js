"use strict";
const mysql = require('mysql2/promise');
module.exports = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb',
    multipleStatements: true,
    connectTimeout: 5000,
    connectionLimit: 30 //default 10
});
