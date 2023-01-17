"use strict";
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
});
function checkExist(data) {
    if (!data)
        return false;
    else
        return true;
}
function checkId(id) {
    let idRegExp = /^[a-z0-9]{4,16}$/;
    if (!idRegExp.test(id))
        return false;
    else
        return true;
}
function checkPw(pw) {
    let pwRegExp = /^[a-zA-z0-9]{4,16}$/;
    if (!pwRegExp.test(pw))
        return false;
    else
        return true;
}
function checkDup(id) {
    let id_list = [];
    let sql = 'select id from userdb';
    connection.query(sql, (err, rows, fields) => {
        if (err)
            throw err;
        else {
            for (let i = 0; i < rows.length; i++) {
                id_list.push(rows[i].id);
            }
        }
    });
    if (id_list.find(id_in_db => id_in_db === id)) {
        return false;
    }
    else
        return true;
}
function checkBirth(year) {
    if (year.length != 4 || Number(year) < 1900 || Number(year) >= 2024) {
        return false;
    }
    else
        return true;
}
module.exports = { checkExist, checkId, checkPw, checkDup, checkBirth };
