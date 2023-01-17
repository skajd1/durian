const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
});

type UserID = {
    id : string
}
type User = {
    id : string,
    password : string,
    birth : string,
    point : number,
}


function checkExist(data : any) : boolean
{
    if (!data)return false;
    else return true;
}
function checkId(id : string) : boolean
{
    let idRegExp : RegExp = /^[a-z0-9]{4,16}$/;
    if (!idRegExp.test(id)) return false;
    else return true;
}
function checkPw(pw : string) : boolean
{
    let pwRegExp : RegExp = /^[a-zA-z0-9]{4,16}$/;
    if (!pwRegExp.test(pw)) return false;
    else return true;
}
function checkDup(id : string) : boolean
{
    let id_list : Array<string> = [];
    let sql : string = 'select id from userdb'
    connection.query(sql, (err :any  , rows : UserID[], fields : any) => {
        if(err) throw err;
        else
        {
            for(let i = 0; i < rows.length; i ++)
            {
                id_list.push(rows[i].id)
            }
        }         
    });
    if(id_list.find(id_in_db=> id_in_db === id))
    {
        return false;
    }
    else return true;
}
function checkBirth(year : string) : boolean
{
    if(year.length != 4 || Number(year) < 1900 || Number(year) >= 2024)
    {
        return false;
    }
    else return true;
}


module.exports = {checkExist,checkId,checkPw,checkDup,checkBirth};