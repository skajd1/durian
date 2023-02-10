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
require('dotenv').config();
let movielist;
const router = express_1.default.Router();
const pool = require('./mysql');
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const options = {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
const sessionStore = new mysqlStore(options);
router.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
// movielist를 인자로 전달하여 html 내에서 영화 포스터 이미지 리스트로 출력
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let conn;
    // res.sendFile(__dirname + '/html/home.html');
    let sql = "select * from moviedetail; ";
    let sql_places = "select * from places;";
    let login = false;
    let admin = false;
    try {
        conn = yield pool.getConnection();
        let [rows] = yield conn.query(sql + sql_places);
        conn.release();
        movielist = rows[0];
        if (req.session.isLogined) {
            login = true;
        }
        if (req.session.user_id == 'admin') {
            admin = true;
        }
        return res.render('home', { login: login, admin: admin, movielist: movielist, places: rows[1] });
    }
    catch (err) {
        console.error(err);
        if (conn) {
            conn.release();
        }
    }
}));
module.exports = router;
