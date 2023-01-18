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
router.post('/moviedb/post', (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
    }
    for (let key of Object.keys(req.body)) {
        if (!(check.checkExist(req.body[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/moviedb/post'</script>");
        }
    }
});
module.exports = router;
