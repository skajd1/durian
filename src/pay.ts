import { time } from 'console';
import express, { Express, Request, Response } from 'express';
type Movie={
    movieid : number,
    title : string,
    content : string,
    age : number,
    runningTime : number,
    poster_src : string
}

const router = express.Router();
const session = require('express-session');
const options = {
    host : 'localhost',
    port : 3306,
    user : 'admin',
    password : 'admin',
    database : 'moviedb',

}
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const bodyParser = require('body-parser');
const pool = require('./mysql');

router.use(session({
    secret : "keykey",
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))


// home 모달 윈도우에서 get요청
router.get('/', async (req : Request, res : Response)=>{
    if(!req.session.isLogined){
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else {
        let movielist : Array<Movie>
        let placelist : Array<string>

        let placeid : string = req.query['select-place'] as string
        let date :string = req.query['select-date'] as string
        let movieid :string = req.query['movie-id'] as string

        let sql_moviedetail : string = "select * from moviedetail; "
        let sql_places : string = "select * from places"

        let sql_table : string = "select time1, time2, time3, time4, time5 from timetable where placeid = ? and date = STR_TO_DATE(?,'%Y-%m-%d'); "
        let params_table : Array<string|string>  = [placeid, date]
        
        
        let conn = await pool.getConnection();
        try{
            let err
            let [rows] = await conn.query(sql_moviedetail + sql_places)
            movielist = rows[0]
            placelist = rows[1]

            let [time] = await conn.query(sql_table,params_table)
            
            if(!time.length){ 
                err = "선택한 극장 / 날짜에 상영중인 영화가 없습니다. 다른 극장 / 날짜를 선택해주세요."
            }

            conn.release();
            return res.render('pay', {login : true, movielist : movielist, placelist : placelist, placeid : placeid, movieid : movieid, date : date, err:err});

        } catch(err) {
            console.error(err)
            conn.release();
        }
        
       
    }
})
router.get('/selectseat', async (req: Request, res: Response) =>{
    if(!req.session.isLogined){
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else{
        let conn = await pool.getConnection();

        try{

            conn.release();
            return res.send(req.query)
        } catch(err) {

            console.error(err)
            conn.release();
        }
    }
})
router.post('/', async (req: Request, res: Response) =>{
    if(!req.session.isLogined){
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else{
        let data = req.body
        let movieid :string = data.movieid
        let placeid :string = data.placeid
        let date :string = data.date
        
        let conn = await pool.getConnection();

        try{
            let sql_table :string = "select time1, time2, time3, time4, time5 from timetable where placeid = ? and date = STR_TO_DATE(?,'%Y-%m-%d');"
            let params_table : Array<string> = [placeid,date]
            let [times] : any = await conn.query(sql_table,params_table)
            conn.release();
            return res.send(times)

        } catch(err) {

            console.error(err)
            conn.release();
        }
    }
})


module.exports = router;
