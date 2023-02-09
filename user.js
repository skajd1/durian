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
const pool = require('./mysql');
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.get("/", (req, res) => {
    if (req.session.isLogined) {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    else
        res.render('login', { login: false });
});
router.get("/login", (req, res) => {
    if (req.session.isLogined) {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    else
        res.render('login', { login: false });
});
router.get("/signin", (req, res) => {
    res.render('signin', { login: false });
});
router.get('/mypage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.session.isLogined) {
        //세션에 접속중인 유저 데이터 쿼리로 불러오기
        let uid = req.session.user_id;
        let sql = 'select * from userdb where userid = ?; ';
        let params = [uid, uid];
        let sql_paylogdb = 'select logid, title,poster_src,num_adult,payment,seat,paydate,num_teen,start_time,placename,date from paylogdb, moviedetail, movieentity,places where userid = ? and movieentity.placeid = places.placeid and movieentity.movieid = moviedetail.movieid and paylogdb.entityid = movieentity.entityid order by paydate desc;';
        let conn = yield pool.getConnection();
        try {
            let [rows] = yield conn.query(sql + sql_paylogdb, params);
            conn.release();
            return res.render('mypage', { login: true, uid: uid, birth: rows[0][0].birth, point: rows[0][0].point, log: rows[1] });
        }
        catch (err) {
            conn.release();
            console.error(err);
        }
    }
    else {
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>");
    }
}));
router.get('/mypage/resvdetail/:logid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>");
    }
    else {
        let logid = req.params.logid;
        let sql = 'select * from paylogdb, moviedetail, movieentity,places where logid = ? and movieentity.placeid = places.placeid and movieentity.movieid = moviedetail.movieid and paylogdb.entityid = movieentity.entityid;';
        let params = [logid];
        let conn = yield pool.getConnection();
        try {
            let [rows] = yield conn.query(sql, params);
            conn.release();
            return res.render('resvdetail', { login: true, log: rows[0] });
        }
        catch (err) {
            conn.release();
            console.error(err);
        }
    }
}));
// 로그아웃 시 세션 초기화
router.get('/logout', (req, res) => {
    if (req.session.isLogined) {
        req.session.destroy(() => {
            req.session;
        });
        res.redirect('/');
    }
    else
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
});
// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    else if (!check.checkBirth(req.body['year'])) {
        return res.send("<script>alert('올바른 생년월일을 입력하세요.');document.location.href='/user/signin'</script>");
    }
    else if (!(yield check.checkDup(req.body['id']))) {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else {
        let sql = 'insert into userdb (userid, password, birth, point) values (?,?,?,?)';
        let params = [req.body['id'], req.body['password'], (req.body['year'] + '-' + req.body['month'] + '-' + req.body['day']), 100000];
        let conn = yield pool.getConnection();
        try {
            let [result] = yield conn.query(sql, params);
            conn.release();
            return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
        }
        catch (err) {
            console.error(err);
            conn.release();
        }
    }
}));
router.post('/authentication', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body['id'] || !req.body['password']) {
        return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
    }
    let sql = "select * from userdb where userid = ?";
    let params = [req.body['id']];
    let conn = yield pool.getConnection();
    try {
        let [rows] = yield conn.query(sql, params);
        if (!rows[0]) {
            conn.release();
            return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
        }
        else if (rows[0].password !== req.body['password']) {
            conn.release();
            return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>");
        }
        else {
            conn.release();
            req.session.user_id = req.body['id'];
            req.session.isLogined = true;
            req.session.save(() => {
                res.redirect('/');
            });
        }
    }
    catch (err) {
        console.error(err);
        conn.release();
    }
}));
router.post('/edit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let sql = "select password from userdb where userid = ?";
    let params = [req.session.user_id];
    let conn = yield pool.getConnection();
    if (!req.body['ppassword'] || !req.body['npassword'] || !req.body['passwordv']) {
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/mypage'</script>");
    }
    else if (req.body['npassword'] !== req.body['passwordv']) {
        return res.send("<script>alert('확인 비밀번호가 일치하지 않습니다.');document.location.href='/user/mypage'</script>");
    }
    else if (!check.checkPw(req.body['npassword'])) {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/mypage'</script>");
    }
    else {
        try {
            let [rows] = yield conn.query(sql, params);
            if (rows[0].password !== req.body['ppassword']) {
                conn.release();
                return res.send("<script>alert('현재 비밀번호와 일치하지 않습니다.');document.location.href='/user/mypage'</script>");
            }
            else {
                let sql = "update userdb set password = ? where userid = ?";
                let params = [req.body['npassword'], req.session.user_id];
                let [result] = yield conn.query(sql, params);
                conn.release();
                return res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/user/mypage'</script>");
            }
        }
        catch (err) {
            console.error(err);
            conn.release();
        }
    }
}));
module.exports = router;
