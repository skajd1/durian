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

//데이터 존재 여부 확인
function checkExist(data : any) : boolean
{
    if (!data)return false;
    else return true;
}
//아이디 유효성 검증
function checkId(id : string) : boolean
{
    let idRegExp : RegExp = /^[a-z0-9]{4,16}$/;
    if (!idRegExp.test(id)) return false;
    else return true;
}
//비밀번호 유효성 검증
function checkPw(pw : string) : boolean
{
    let pwRegExp : RegExp = /^[a-zA-z0-9]{4,16}$/;
    if (!pwRegExp.test(pw)) return false;
    else return true;
}
//DB 쿼리 중복 검사 TODO FIX
function checkDup(id : string)
{
    return new Promise((resolve, reject) =>{
        let sql : string = 'select userid from userdb where userid = ?'
        let params : Array<string>= [id]
        connection.query(sql,params,(err:any, rows:UserID[] ) =>{
            if(err) console.log(err);
            else
            {
                resolve(!(rows.length))
            }       
        })

    })
    
}
//생년월일 유효성 검사
function checkBirth(year : string) : boolean
{
    if(year.length != 4 || Number(year) < 1900 || Number(year) >= 2024)
    {
        return false;
    }
    else return true;
}


module.exports = {checkExist,checkId,checkPw,checkDup,checkBirth};