"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let movielist;
const router = express_1.default.Router();
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
});
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const options = {
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
};
const sessionStore = new mysqlStore(options);
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
// movielist를 인자로 전달하여 html 내에서 영화 포스터 이미지 리스트로 출력
router.get("/", (req, res) => {
    // res.sendFile(__dirname + '/html/home.html');
    let sql = 'select * from moviedetail';
    let login = false;
    let admin = false;
    connection.query(sql, (err, rows) => {
        if (err)
            console.log(err);
        else {
            movielist = rows;
            if (req.session.isLogined) {
                login = true;
            }
            if (req.session.user_id == 'admin') {
                admin = true;
            }
            res.render('home', { login: login, admin: admin, movielist: movielist });
        }
    });
});
module.exports = router;
