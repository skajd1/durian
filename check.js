"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pool = require('./mysql');
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
    return __awaiter(this, void 0, void 0, function* () {
        let sql = 'select userid from userdb where userid = ?';
        let params = [id];
        let conn;
        try {
            conn = yield pool.getConnection();
            let [rows] = yield conn.query(sql, params);
            conn.release();
            return (!(rows.length));
        }
        catch (err) {
            console.error(err);
            if (conn) {
                conn.release();
            }
        }
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
