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
router.get("/", (req, res) => {
    // res.sendFile(__dirname + '/html/home.html');
    let sql = 'select * from moviedetail';
    let params = [];
    connection.query(sql, (err, rows) => {
        if (err)
            console.log(err);
        else {
            movielist = rows;
            if (!req.session.isLogined) {
                res.render('home', { login: false, admin: false, movielist: movielist });
            }
            else {
                if (req.session.user_id === 'admin') {
                    res.render('home', { login: true, admin: true, movielist: movielist });
                }
                else {
                    res.render('home', { login: true, admin: false, movielist: movielist });
                }
            }
        }
    });
});
function pagemove(dir, Page, pages) {
    Page += dir;
    if (Page > pages) {
        Page = 1;
    }
    else if (Page == 0) {
        Page = pages;
    }
    showPage(Page);
}
function showPage(page_now) {
    for (let i = page_now * 3 - 3; i < page_now * 3; i++) {
        // 포스터 속성 movielist[i] 로 변경 
    }
}
module.exports = router;
