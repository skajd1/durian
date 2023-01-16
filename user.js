"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const session = require('express-session');
const options = {
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
};
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express_1.default.Router();
const bodyParser = require('body-parser');
const check = require('./check');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
});
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.get("/", (req, res) => {
    res.render('login', { login: false });
});
router.get("/login", (req, res) => {
    res.render('login', { login: false });
});
router.get("/signin", (req, res) => {
    res.render('signin', { login: false });
});
router.get('/mypage', (req, res) => {
    if (req.session.isLogined) {
        res.render('mypage', { login: true });
    }
    else {
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>");
    }
});
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        req.session;
    });
    res.render('home', { login: false });
});
// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', (req, res) => {
    for (let key of Object.keys(req.body)) {
        if (!(check.checkExist(req.body[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/user/signin'</script>");
        }
    }
    if (!(check.checkId(req.body['id']))) {
        return res.send("<script>alert('아이디가 올바르지 않은 형식입니다. ');document.location.href='/user/signin'</script>");
    }
    else if (req.body['password'] !== req.body['passwordv']) {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkPw(req.body['password'])) {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkDup(req.body['id'])) {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkBirth(req.body['year'])) {
        return res.send("<script>alert('올바른 생년월일을 입력하세요.');document.location.href='/user/signin'</script>");
    }
    else {
        let sql = 'insert into userdb (id, password, birth, point, reserve) values (?,?,?,?,?)';
        let params = [req.body['id'], req.body['password'], (req.body['year'] + '-' + req.body['month'] + '-' + req.body['day']), 100000, null];
        connection.query(sql, params, (err, rows, fields) => {
            if (err)
                console.log(err);
            else
                return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
        });
    }
});
router.post('/authentication', (req, res) => {
    if (!req.body['id'] || !req.body['password']) {
        return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
    }
    let sql = "select * from userdb where id = ?";
    let params = [req.body['id']];
    connection.query(sql, params, (err, rows, fields) => {
        if (err)
            throw err;
        else {
            if (!rows[0]) {
                return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
            }
            else if (rows[0].password !== req.body['password']) {
                return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>");
            }
            else {
                // res.send("<script>alert('반갑습니다.');document.location.href='/home'</script>");
                req.session.isLogined = true;
                req.session.save(() => {
                    res.render('home', { login: true });
                });
            }
        }
    });
});
module.exports = router;
