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
// function checkDup(id : string) : boolean
// {
//     let id_list : Array<string> = [];
//     let sql : string = 'select id from userdb'
//     connection.query(sql, (err :any  , rows : UserID[], fields : any) => {
//         if(err) throw err;
//         else
//         {
//             for(let i = 0; i < rows.length; i ++)
//             {
//                 id_list.push(rows[i].id)
//             }
//         }         
//     });
//     if(id_list.find(id_in_db=> id_in_db === id))
//     {
//         return false;
//     }
//     else return true;
//     // let sql : string = 'select id from userdb where id = ?'
//     // let params : Array<string>= [id]
//     // connection.query(sql,params,(err:any, rows:UserID[] ) =>{
//     //     if(err) console.log(err);
//     //     else{
//     //         if(rows.length==1)
//     //         {
//     //             check = false;
//     //         }
//     //     }
//     // })
//     // return check;
// }
function checkDup(id) {
    return new Promise((resolve, reject) => {
        let sql = 'select id from userdb where id = ?';
        let params = [id];
        connection.query(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else {
                if (rows.length == 1) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            }
        });
    });
}
function yourFunction(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const check = yield checkDup(id);
        return check;
    });
}
function checkBirth(year) {
    if (year.length != 4 || Number(year) < 1900 || Number(year) >= 2024) {
        return false;
    }
    else
        return true;
}
module.exports = { checkExist, checkId, checkPw, checkDup, checkBirth, yourFunction };
