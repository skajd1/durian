import express, { Express, Request, Response } from 'express';

//user 객체 타입 지정
type UserID = {
    id : string
}
type User = {
    id : string,
    password : string,
    birth : string,
    point : number,
    reserve : number
}

const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
});

connection.connect();
connection.query('select id from userdb', (err :any  , rows : Array<any>, fields : any) => {
    if(err) throw err;
    for(let row of rows)
    console.log(row.id);
})
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))

router.get("/", (req : Request, res : Response) =>{
    res.sendFile(__dirname + '/html/login.html');
})
router.get("/login", (req : Request, res : Response) =>{
    res.sendFile(__dirname + '/html/login.html');
})
router.get("/signin", (req : Request, res : Response) =>{
    res.sendFile(__dirname + '/html/signin.html')
})
router.get('/mypage', (req : Request, res : Response) =>{
    res.sendFile(__dirname + '/html/mypage.html');
  })


// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', (req: Request, res : Response) =>{
    // res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    const {id, password, passwordv, year, month, day}= req.body;
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
    })


    if (!id || !password || !passwordv || !year || !month || !day){
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/signin'</script>");
    }
    else if(password!==passwordv)
    {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if(id_list.find(id_in_db =>  id_in_db=== id))
    {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else if((year).length !== 4)
    {
        return res.send("<script>alert('올바른 생년월일을 입력해주세요.');document.location.href='/user/signin'</script>");
    }

    else
    {
        let sql : string = 'insert into userdb (id, password, birth, point, reserve) values (?,?,?,?,?)';
        let params : Array<User> = [id, password, (year+'-'+month+'-' +day),100000,null];
        connection.query(sql,params, (err : any, rows : User, fields : any) =>{
            if (err) console.log(err);
            else return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
        })       
       
    }

})
// router.post('/authentication', (req : Request, res : Response) => {
//     const {id,password} = req.body;
//     if(!id || !password)
//     {
//         return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
//     }
//     else if (users.find(user_in_db=>user_in_db.id === id))
//     {
//         if (users.find(user_in_db=>user_in_db.id === id).password === password){
//             return res.send("<script>alert('반갑습니다.');document.location.href='/home'</script>");
//         }
//         else {
//             return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>");
//         }
//     }
//     else 
//     {
//         return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
//     }
// })






module.exports = router;
