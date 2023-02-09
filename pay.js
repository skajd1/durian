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
const router = express_1.default.Router();
const session = require('express-session');
const options = {
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const bodyParser = require('body-parser');
const pool = require('./mysql');
router.use(session({
    secret: process.env.SESSION_KEY,
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
router.get('/gettime', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>");
    }
    else {
        let data = req.query;
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
router.get('/selectseat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>");
    }
    else {
        let movieid = Number(req.query['select-movie']);
        let placeid = Number(req.query['select-place']);
        let date = req.query['select-date'];
        let time = req.query['select-time'];
        let day = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)'];
        let dd = day[new Date(date).getDay()];
        if (!movieid || !placeid || !date || !time) {
            return res.send("<script>alert('선택되지 않은 사항이 있습니다.');document.location.href=document.referrer</script>");
        }
        let conn = yield pool.getConnection();
        try {
            // 영화 상세 정보 (영화 이름, age, 러닝타임, img소스)
            // 영화 개체 정보 (좌석 현황)
            let sql_moviedetail = "select * from moviedetail where movieid = ?; ";
            let parmas_moviedetail = [movieid];
            let sql_movieentity = "select entityid,seatStatus,placename from places,movieentity where start_time = ? and date = STR_TO_DATE(?,'%Y-%m-%d') and movieentity.placeid = ? and places.placeid = ?";
            let params_movieentity = [Number(time[4]) + 1, date, placeid, placeid];
            let [rows] = yield conn.query(sql_moviedetail + sql_movieentity, parmas_moviedetail.concat(params_movieentity));
            let seat_status = JSON.parse(rows[1][0].seatStatus);
            conn.release();
            return res.render('selectseat', { login: true, moviedetail: rows[0][0], movieentity: rows[1][0], date: date, dd: dd, time: time, seat_status: seat_status });
        }
        catch (err) {
            console.error(err);
            conn.release();
        }
    }
}));
router.post('/selectseat', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.isLogined) {
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>");
    }
    else {
        let data = req.body;
        let movieid = Number(data.movieid);
        let placeid = Number(data.placeid);
        let date = data.date;
        let time = data.time;
        let seat = data['select-seat'] ? data['select-seat'] : [];
        seat = Array.isArray(seat) ? seat : [seat];
        let entityid = Number(data.entityid);
        let userid = req.session.user_id;
        let num_adult = Number(data['select-adult']);
        let num_teen = Number(data['select-teen']);
        let price = num_adult * 20000 + num_teen * 10000;
        // 인원 선택 안했을 때
        if (num_adult == 0 && num_teen == 0) {
            return res.send("<script>alert('인원을 선택해주세요.');document.location.href=document.referrer</script>");
        }
        // 좌석 선택 안했을 때
        if (seat.length != num_adult + num_teen) {
            return res.send("<script>alert('관람 인원과 선택 좌석 수가 일치하지 않습니다.');document.location.href=document.referrer</script>");
        }
        let conn = yield pool.getConnection();
        try {
            let sql_movieentity = 'select seatStatus from movieentity where entityid = ?';
            let params_movieentity = [entityid];
            let [movieentity] = yield conn.query(sql_movieentity, params_movieentity);
            let seat_status = JSON.parse(movieentity[0].seatStatus);
            let sql_userdb = 'select point from userdb where userid = ?';
            let params_userdb = [userid];
            let [userdb] = yield conn.query(sql_userdb, params_userdb);
            //선택한 좌석이 이미 예약되어있는 지 (나보다 먼저 동일한 좌석에 예매하려 할 때)
            for (let s of seat) {
                if (seat_status[s.split(',')[0]][s.split(',')[1]]) {
                    conn.release();
                    return res.send("<script>alert('선택한 좌석이 이미 예약되어있습니다.');document.location.href='/'</script>");
                }
                else {
                    seat_status[s.split(',')[0]][s.split(',')[1]] = 1;
                }
            }
            //결제 금액이 충분한 지
            if (price > userdb[0].point) {
                conn.release();
                return res.send("<script>alert('결제 금액이 부족합니다.');document.location.href='/'</script>");
            }
            else {
                // 1. paylogdb 릴레이션 생성 및 2. movieentity 좌석 현황 업데이트 및 3. userdb 포인트 차감
                let seatArray = [];
                for (let s of seat) {
                    seatArray.push(String.fromCharCode(65 + Number(s.split(',')[0])) + (Number(s.split(',')[1]) + 1));
                }
                let sql_paylogdb = "insert into paylogdb (num_adult,num_teen,payment,seat,userid,entityid) values (?,?,?,?,?,?); ";
                let params_paylogdb = [num_adult, num_teen, price, seatArray.toString(), userid, entityid];
                let sql_movieentity = "update movieentity set seatStatus = ? where entityid = ?; ";
                let params_movieentity = [JSON.stringify(seat_status), entityid];
                let sql_userdb = "update userdb set point = point - ? where userid = ?;";
                let params_userdb = [price, userid];
                yield conn.beginTransaction();
                yield conn.query(sql_paylogdb + sql_movieentity + sql_userdb, params_paylogdb.concat(params_movieentity).concat(params_userdb));
                yield conn.commit();
                conn.release();
                return res.send("<script>alert('결제가 완료되었습니다.');document.location.href='/'</script>");
            }
        }
        catch (err) {
            console.error(err);
            if (!conn) {
                yield conn.rollback();
                conn.release();
            }
        }
    }
}));
module.exports = router;
