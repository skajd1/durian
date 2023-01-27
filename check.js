"use strict";
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
});
//데이터 존재 여부 확인
function checkExist(data) {
    if (!data)
        return false;
    else
        return true;
}
//아이디 유효성 검증
function checkId(id) {
    let idRegExp = /^[a-z0-9]{4,16}$/;
    if (!idRegExp.test(id))
        return false;
    else
        return true;
}
//비밀번호 유효성 검증
function checkPw(pw) {
    let pwRegExp = /^[a-zA-z0-9]{4,16}$/;
    if (!pwRegExp.test(pw))
        return false;
    else
        return true;
}
//DB 쿼리 중복 검사 TODO FIX
function checkDup(id) {
    return new Promise((resolve, reject) => {
        let sql = 'select userid from userdb where userid = ?';
        let params = [id];
        connection.query(sql, params, (err, rows) => {
            if (err)
                console.log(err);
            else {
                resolve(!(rows.length));
            }
        });
    });
}
//생년월일 유효성 검사
function checkBirth(year) {
    if (year.length != 4 || Number(year) < 1900 || Number(year) >= 2024) {
        return false;
    }
    else
        return true;
}
module.exports = { checkExist, checkId, checkPw, checkDup, checkBirth };
