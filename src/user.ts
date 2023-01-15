import express, { Express, Request, Response } from 'express';

//user 객체 타입 지정
type User = {
    id : string,
    password : string,
    passwordv : string,
    year : string,
    month : string,
    day : string
    point : number
}
// 임시 유저 데이터베이스
const users : Array<User> = [{
    id : 'test',
    password : 'test',
    passwordv : 'test',
    year : '1998',
    month : '1',
    day : '2',
    point : 100000
}];
const router = express.Router();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parse');
const expressSession = require('express-session');

router.use(cookieParser())
router.use(expressSession({
    secret : 'my key',
    resave : true,
    saveUninitialized : true
}));
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
    const user : User = req.body;
    if (!user.id || !user.password || !user.passwordv || !user.year || !user.month || !user.day){
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/signin'</script>");
    }
    else if(users.find(user_in_db => user_in_db.id === user.id))
    {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else if(user.password!==user.passwordv)
    {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if((user.year).length !== 4)
    {
        return res.send("<script>alert('올바른 생년월일을 입력해주세요.');document.location.href='/user/signin'</script>");
    }

    else
    {
        user.point = 100000
        users.push(user);
        console.log(user)
        return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
    }

})
router.post('/authentication', (req : Request, res : Response) => {
    const {id,password} = req.body;
    if(!id || !password)
    {
        return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
    }
    else if (users.find(user_in_db=>user_in_db.id === id))
    {
        if (users.find(user_in_db=>user_in_db.id === id).password === password){
            return res.send("<script>alert('반갑습니다.');document.location.href='/home'</script>");
        }
        else {
            return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>");
        }
    }
    else 
    {
        return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
    }
})






module.exports = router;
