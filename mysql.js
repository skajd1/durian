"use strict";
require('dotenv').config();
const mysql = require('mysql2/promise');
module.exports = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    connectTimeout: 5000,
    connectionLimit: 30 //default 10
});
