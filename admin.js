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
const check = require('./check');
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express_1.default.Router();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
});
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const error = file.mimetype === 'image/jpeg' || 'image/png'
            ? null
            : new Error('wrong file');
        cb(error, 'static_image/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
const upload = multer({
    storage: storage
});
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.get("/userdb", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    else
        res.render('user_db', { login: true });
});
router.get("/moviedb", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    else
        res.render('movie_db', { login: true });
});
router.get("/moviedb/post", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    else
        res.render('post_movie', { login: true });
});
router.post('/moviedb/post', upload.single('image'), (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    for (let key of Object.keys(req.body)) {
        if (!(check.checkExist(req.body[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/moviedb/post'</script>");
        }
    }
    let sql = "insert into moviedetail (title, content, age, runningTime, poster_src) values(?,?,?,?,?)";
    let params = [req.body.title, req.body.content, req.body.age, Number(req.body.hour) + Number(req.body.minute) / 60, '/static_image/' + req.file.filename];
    connection.query(sql, params, (err) => {
        if (err)
            throw err;
        else {
            res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/moviedb'</script>");
        }
    });
});
module.exports = router;
