import express, { Express, Request, Response } from 'express';
//user 객체 타입 지정
type User = {
    id : string,
    password : string,
    birth : string,
    point : number,
    reserve : number
}
const session = require('express-session');
const options = {
    host : 'localhost',
    port : 3306,
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
}
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express.Router();
const bodyParser = require('body-parser');
const check = require('./check');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
});
router.use(session({
    secret : "keykey",
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))

router.get("/", (req : Request, res : Response) =>{
    if(req.session.isLogined){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('login', {login : false});
})
router.get("/login", (req : Request, res : Response) =>{
    if(req.session.isLogined){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('login', {login : false});
})
router.get("/signin", (req : Request, res : Response) =>{
    res.render('signin', {login : false})
})
router.get('/mypage', (req : Request, res : Response) =>{
    if(req.session.isLogined){
        //세션에 접속중인 유저 데이터 쿼리로 불러오기
        let uid :string = req.session.user_id;
        let sql : string = 'select * from userdb where id = ?';
        let params : Array<string> = [uid];
        connection.query(sql, params, (err : any, rows : Array<User>, fields : any) => {
            if (err) console.log(err);
            else
            {
                res.render('mypage', { login : true, uid : uid, birth : rows[0].birth, point : rows[0].point});
            }
        })

    }
    else{
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>")
    }
    
})
router.get('/logout', (req : Request, res : Response) =>{
    if(req.session.isLogined){
        req.session.destroy( () => {
           req.session;
        })
        res.redirect('/');
    }
    else res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
})



// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', (req: Request, res : Response) =>{
    for (let key of Object.keys(req.body))
    {
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/user/signin'</script>")
        }
    }
    if (!(check.checkId(req.body['id'])))
    {
        return res.send("<script>alert('아이디가 올바르지 않은 형식입니다. ');document.location.href='/user/signin'</script>")
    }
    else if (req.body['password']!==req.body['passwordv'])
    {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkPw(req.body['password']))
    {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/signin'</script>");
    }
    else if (!check.yourFunction(req.body['id']))
    {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkBirth(req.body['year']))
    {
        return res.send("<script>alert('올바른 생년월일을 입력하세요.');document.location.href='/user/signin'</script>");
    }

    else{
        let sql : string = 'insert into userdb (id, password, birth, point) values (?,?,?,?)';
        let params : Array<User> = [req.body['id'], req.body['password'], (req.body['year']+'-'+req.body['month']+'-' +req.body['day']),100000];
        connection.query(sql,params, (err : any) =>{
            if (err) console.log(err);
            else return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
        })
    }   

})

router.post('/authentication', (req : Request, res : Response) => {
    if(!req.body['id'] || !req.body['password'])
    {
        return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
    }
    let sql :string= "select * from userdb where id = ?";
    let params : Array<string> = [req.body['id']]
    connection.query(sql, params, (err : any, rows : Array<User>, fields : any) =>{
        if(err) throw err;
        else{
            if(!rows[0])
            {
                return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
            }
            else if (rows[0].password !== req.body['password'])
            {
                return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>"); 
            }
            else {
                req.session.user_id = req.body['id'];
                req.session.isLogined = true;
                req.session.save( ()=> {
                    res.redirect('/')
                })
            }
        }
    })
})
router.post('/edit', (req : Request, res: Response) => {
    let sql : string = "select password from userdb where id = ?"
    let params : Array<string> = [req.session.user_id]
    if(!req.body['ppassword'] || !req.body['npassword'] || !req.body['passwordv'])
    {
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/mypage'</script>");
    }
    else if (req.body['npassword'] !== req.body['passwordv'])
    {
        return res.send("<script>alert('확인 비밀번호가 일치하지 않습니다.');document.location.href='/user/mypage'</script>"); 
    }
    else if (!check.checkPw(req.body['npassword']))
    {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/mypage'</script>");
    }
    connection.query(sql, params, (err:any, rows : Array<User>, fields : any) =>{
        if (err) throw err;
        else{
            if (rows[0].password !== req.body['ppassword'])
            {

                return res.send("<script>alert('현재 비밀번호와 일치하지 않습니다.');document.location.href='/user/mypage'</script>"); 
            }
            else
            {
                let sql : string = "update userdb set password = ? where id = ?";
                let params : Array<string> = [req.body['npassword'], req.session.user_id];
                connection.query(sql, params, (err:any)=>{
                    if (err) throw err;
                    else{
                        res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/user/mypage'</script>");
                    }
                })
            }
        }
    })

})


module.exports = router;
