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
    database: 'moviedb',
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
    database: 'moviedb',
    multipleStatements: true
});
const multer = require('multer');
const seat = [];
for (let i = 0; i < 5; i++) {
    let tmp = [];
    for (let j = 0; j < 12; j++) {
        tmp.push(0);
    }
    seat.push(tmp);
}
const err_msg = "<script>alert('잘못된 접근입니다.');document.location.href='/'</script>";
//파일 업로드 시, 파일 이름과 확장자 및 경로 지정
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
//유저 DB 리스트 출력
router.get("/userdb", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else
        res.render('user_db', { login: true });
});
// 영화 DB 리스트 출력
router.get("/moviedb", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else {
        let sql = "select movieid,title from moviedetail";
        connection.query(sql, (err, rows) => {
            if (err)
                console.log(err);
            else {
                res.render('movie_db', { login: true, rows: rows });
            }
        });
    }
});
//영화 DB 수정 페이지 레이아웃
router.get("/moviedb/edit/:id", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else {
        let sql = "select * from moviedetail where movieid=?";
        let params = [req.params.id];
        connection.query(sql, params, (err, rows) => {
            if (err)
                console.log(err);
            else {
                res.render('movie_edit_page', { login: true, rows: rows });
            }
        });
    }
});
//영화 DB수정 서버사이드 TODO
router.post("/moviedb/edit/:id", upload.single('image'), (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else {
        for (let key of Object.keys(req.body)) {
            if (!(check.checkExist(req.body[key]))) {
                return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href=document.referrer</script>");
            }
        }
        if (!req.file) {
            return res.send("<script>alert('이미지 등록에 실패하였습니다.');document.location.href=document.referrer</script>");
        }
        if (Number(req.body.hour) + Number(req.body.minute) / 60 > 4) {
            return res.send("<script>alert('최대 상영시간은 4시간 입니다.');document.location.href=document.referrer</script>");
        }
        // update로 변경
        let sql = "update moviedetail set title = ?, content = ?, age = ?, runningTime = ?, poster_src = ? where movieid = ?";
        let params = [req.body.title, req.body.content, req.body.age, Number(req.body.hour) + Number(req.body.minute) / 60, '/static_image/' + req.file.filename, req.body.id];
        connection.query(sql, params, (err) => {
            if (err)
                throw err;
            else {
                res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/admin/moviedb'</script>");
            }
        });
    }
});
//delete 메소드로 요청받아서 해당 영화 삭제
router.delete('/moviedb/edit/:id', (req, res) => {
    let sql = "delete from moviedetail where movieid = ?";
    let params = [req.body.id];
    connection.query(sql, params, (err) => {
        if (err)
            console.log(err);
        else {
            res.send("<script>alert('삭제가 완료되었습니다.');document.location.href='/admin/moviedb'</script>");
        }
    });
});
// 영화 DB 리스트 
router.get("/moviedb/post", (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else
        res.render('post_movie', { login: true });
});
// 영화 DB 최초 등록
// DB 등록 시 넘어오는 파라미터 정보 유효성 검증 및 쿼리
router.post('/moviedb/post', upload.single('image'), (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    for (let key of Object.keys(req.body)) {
        if (!(check.checkExist(req.body[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/moviedb/post'</script>");
        }
    }
    if (!req.file) {
        return res.send("<script>alert('이미지 등록에 실패하였습니다.');document.location.href='/admin/moviedb/post'</script>");
    }
    if (Number(req.body.hour) + Number(req.body.minute) / 60 > 4) {
        return res.send("<script>alert('최대 상영시간은 4시간 입니다.');document.location.href='/admin/moviedb/post'</script>");
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
// 타임테이블을 확인할 극장 목록 sql로 전송
router.get('/selectdate', (req, res) => {
    let sql_places = "select * from places;";
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    else {
        connection.query(sql_places, (err, rows) => {
            if (err)
                console.log(err);
            else {
                res.render('select_date', { login: true, places: rows });
            }
        });
    }
});
// 날짜와 극장 ID 받아서 select 후 없으면 타임테이블 생성
router.get('/posttable', (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    for (let key of Object.keys(req.query)) {
        if (!(check.checkExist(req.query[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/selectdate'</script>");
        }
    }
    let sql_timetable = "select time1,time2,time3,time4,time5 from timetable where placeid = ? and date = STR_TO_DATE(?, '%d/%m/%Y'); ";
    let sql_moviedetail = "select movieid,title from moviedetail;"; // 수정
    let placeid = req.query['select-place'], date = req.query['select-date'];
    let params = [placeid, date];
    let sql_places = "select placename from places where placeid = ?";
    let params_places = [placeid];
    let place;
    connection.query(sql_places, params_places, (err, placename) => {
        if (err)
            console.log(err);
        place = placename[0]['placename'];
    });
    // 이미 타임테이블이 존재하면 그대로 정보를 전송하고, 없으면 타임테이블 생성후 default rows 선언해서 전송 
    connection.query(sql_timetable + sql_moviedetail, params, (err, rows) => {
        let moviedetail = {};
        for (let i = 0; i < rows[1].length; i++) {
            moviedetail[rows[1][i]['movieid']] = rows[1][i]['title'];
        }
        if (err)
            console.log(err);
        else {
            if (!rows[0].length) {
                rows[0] = [{ time1: 0, time2: 0, time3: 0, time4: 0, time5: 0 }];
                let sql = "insert into timetable (placeid, date) values(?, STR_TO_DATE(?, '%d/%m/%Y'));";
                connection.query(sql, params, (err) => {
                    if (err)
                        console.log(err);
                    else {
                        res.render('post_entity', { login: true, timetable: rows[0], movielist: rows[1], moviedetail: moviedetail, placeid: placeid, selected_place: place, selected_date: date });
                    }
                });
            }
            res.render('post_entity', { login: true, timetable: rows[0], movielist: rows[1], moviedetail: moviedetail, placeid: placeid, selected_place: place, selected_date: date });
        }
    });
});
// movieentity 및 timetable 등록, 
router.post('/posttable', (req, res) => {
    if (req.session.user_id !== 'admin') {
        res.send(err_msg);
    }
    for (let key of Object.keys(req.body)) {
        if (!(check.checkExist(req.body[key]))) {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href=document.referrer</script>");
        }
    }
    let date = req.body['select-date'];
    let movieId = req.body['select-movie'];
    let placeId = req.body['select-place'];
    let time = Number(req.body['select-time']) + 1;
    let sql_timetable = "update timetable set time" + time + "=" + movieId + " where placeid = ? and date = STR_TO_DATE(?, '%d/%m/%Y' ); ";
    let params_timetable = [placeId, date];
    let sql_movieentity = "insert into movieentity (start_time,placeid,movieid,seatStatus,date) values (?,?,?,?,STR_TO_DATE(?, '%d/%m/%Y'));";
    let params_movieentity = [time, placeId, movieId, JSON.stringify(seat), date];
    connection.query(sql_timetable, params_timetable, (err) => {
        if (err)
            console.log(err);
        else {
            connection.query(sql_movieentity, params_movieentity, (err) => {
                if (err)
                    console.log(err);
                else {
                    res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/selectdate'</script>");
                }
            });
        }
    });
    // movieentity 등록 -> 타임테이블을 등록할 때 movieID가 아닌 entityId를 넣어준다
    // let entityId : Number ;
    // connection.query(sql_movieentity, params_movieentity, (err:any) =>{
    //     if(err) console.log(err)
    //     else{
    //         let sql_getentity : string = "select entityid from movieentity where start_time = ? and placeid = ? and date = STR_TO_DATE(?, '%d/%m/%Y'); "
    //         let params : Array<any> = [time, placeId, date]
    //         connection.query(sql_getentity, params, (err:any, rows : Array<any>)=>{
    //             if(err) console.log(err)
    //             else{
    //                 entityId = rows[0].entityid
    //             }
    //             connection.query(sql_timetable, params_timetable, (err:any) => {
    //                 res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/selectdate'</script>")
    //             })
    //         })
    //     }     
    // })
});
// 타임테이블에서 time = 0으로 되돌리기
// movieentity 삭제
// TODO
router.delete('/posttable', (req, res) => {
    let time = req.body.time;
    let placeid = Number(req.query['select-place']);
    let date = req.query['select-date'];
    let sql_setTimeTable = "update timetable set time" + time + "= 0 where placeid = ? and date = STR_TO_DATE(?, '%d/%m/%Y' ); ";
    let sql_deleteEntity = "delete from movieentity where placeid = ? and date = STR_TO_DATE(?, '%d/%m/%Y' ) and start_time = ? ";
    let params_timetable = [placeid, date];
    let params_entity = [placeid, date, time];
    connection.query(sql_setTimeTable, params_timetable, (err) => {
        if (err)
            console.log(err);
        else {
            connection.query(sql_deleteEntity, params_entity, (err) => {
                if (err)
                    console.log(err);
            });
        }
    });
});
module.exports = router;
