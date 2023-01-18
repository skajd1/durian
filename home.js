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
            res.render('home', { login: login, admin: admin, movielist: movielist, pagemove: pagemove, showPage: showPage });
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
    console.log(Page);
}
function showPage(page_now) {
    for (let i = page_now * 3 - 3; i < page_now * 3; i++) {
        // 포스터 속성 movielist[i] 로 변경 
    }
}
module.exports = router;
