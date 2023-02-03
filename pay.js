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
const router = express_1.default.Router();
const session = require('express-session');
const options = {
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'admin',
    database: 'moviedb',
};
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const bodyParser = require('body-parser');
const pool = require('./mysql');
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
// home 모달 윈도우에서 get요청
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>");
    }
    else {
        let movielist;
        let placelist;
        let placeid = req.query['select-place'];
        let date = req.query['select-date'];
        let movieid = req.query['movie-id'];
        let sql_moviedetail = "select * from moviedetail; ";
        let sql_places = "select * from places";
        let sql_table = "select time1, time2, time3, time4, time5 from timetable where placeid = ? and date = STR_TO_DATE(?,'%Y-%m-%d'); ";
        let params_table = [placeid, date];
        let conn = yield pool.getConnection();
        try {
            let err;
            let [rows] = yield conn.query(sql_moviedetail + sql_places);
            movielist = rows[0];
            placelist = rows[1];
            let [time] = yield conn.query(sql_table, params_table);
            if (!time.length) {
                err = "선택한 극장 / 날짜에 상영중인 영화가 없습니다. 다른 극장 / 날짜를 선택해주세요.";
            }
            conn.release();
            return res.render('pay', { login: true, movielist: movielist, placelist: placelist, placeid: placeid, movieid: movieid, date: date, err: err });
        }
        catch (err) {
            console.error(err);
            conn.release();
        }
    }
}));
// router.post('/', async (req: Request, res: Response) =>{
//     if(!req.session.isLogined){
//         return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
//     }
//     else{
//         console.log(req.body)
//         let conn = await pool.getConnection();
//         try{
//             conn.release();
//         } catch(err) {
//             console.error(err)
//             conn.release();
//         }
//     }
// })
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>");
    }
    else {
        let data = req.body;
        let movieid = data.movieid;
        let placeid = data.placeid;
        let date = data.date;
        let conn = yield pool.getConnection();
        try {
            let sql_table = "select time1, time2, time3, time4, time5 from timetable where placeid = ? and date = STR_TO_DATE(?,'%Y-%m-%d');";
            let params_table = [placeid, date];
            let [times] = yield conn.query(sql_table, params_table);
            conn.release();
            return res.send(times);
        }
        catch (err) {
            console.error(err);
            conn.release();
        }
    }
}));
module.exports = router;
