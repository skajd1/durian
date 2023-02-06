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
const check = require('./check');
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
router.get('/selectseat', async (req: Request, res: Response) =>{
    if(!req.session.isLogined){
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else{
        let movieid : Number = Number(req.query['select-movie'])
        let placeid : Number = Number(req.query['select-place'])
        let date : string = req.query['select-date'] as string
        let time : string = req.query['select-time'] as string
        let day : Array<string> = ['(일)','(월)', '(화)', '(수)', '(목)', '(금)', '(토)']
        let dd :string = day[new Date(date).getDay()]
        if(!movieid || !placeid || !date || !time){
            return res.send("<script>alert('선택되지 않은 사항이 있습니다.');document.location.href=document.referrer</script>")
        }

        let conn = await pool.getConnection();

        try{
            // 영화 상세 정보 (영화 이름, age, 러닝타임, img소스)
            // 영화 개체 정보 (좌석 현황)
            let sql_moviedetail : string = "select * from moviedetail where movieid = ?; "
            let parmas_moviedetail : Array<any> = [movieid]

            let sql_movieentity : string = "select entityid,seatStatus,placename from places,movieentity where start_time = ? and date = STR_TO_DATE(?,'%Y-%m-%d') and movieentity.placeid = ? and places.placeid = ?"
            let params_movieentity :Array<any> = [Number(time[4])+1, date, placeid, placeid]

            let [rows] = await conn.query(sql_moviedetail + sql_movieentity, parmas_moviedetail.concat(params_movieentity))
            let seat_status = JSON.parse(rows[1][0].seatStatus)
            

            conn.release();
            return res.render('selectseat', {login : true, moviedetail : rows[0][0], movieentity : rows[1][0], date : date, dd:dd, time : time,seat_status : seat_status})
        } catch(err) {

            console.error(err)
            conn.release();
        }
    }
})
router.post('/selectseat', async (req: Request, res: Response) =>{
    if(!req.session.isLogined){
        return res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else{
        let data = req.body
        let movieid :number = Number(data.movieid)
        let placeid :number = Number(data.placeid)
        let date :string = data.date
        let time :string = data.time
        let seat :Array<string> = data['select-seat']
        let entityid : number = Number(data.entityid)
        let userid :string = req.session.user_id

        let num_adult : number = data['select-adult']
        let num_teen : number = data['select-teen']
        let price : number = num_adult * 20000 + num_teen * 10000
        
        let conn = await pool.getConnection();
        try{
            let sql_userdb : string = 'select point from userdb where userid = ?'
            let params_userdb : Array<string> = [userid]
            let [userdb] : any = await conn.query(sql_userdb,params_userdb)

            let sql_movieentity : string = 'select seatStatus from movieentity where entityid = ?'
            let params_movieentity : Array<number> = [entityid]
            let [movieentity] : any = await conn.query(sql_movieentity,params_movieentity)

            let seat_status = JSON.parse(movieentity[0].seatStatus)
            //선택한 좌석이 이미 예약되어있는 지
            for(let s of seat){
                if(seat_status[s[0]][s[1]])
                {
                    return res.send("<script>alert('선택한 좌석이 이미 예약되어있습니다.');document.location.href='/'</script>")
                }
            }
            //결제 금액이 충분한 지
            if (price > userdb[0].point){
                return res.send("<script>alert('결제 금액이 부족합니다.');document.location.href='/'</script>")
            }
            
            else{

                // 1. paylogdb 릴레이션 생성 및 2. movieentity 좌석 현황 업데이트 및 3. userdb 포인트 차감
                // nop : Array [num_adult,num_teen]
                // payment : price
                // seat : seat
                // userid : userid
                // entityid : entityid
                // let sql_paylogdb : string = "insert into paylogdb (nop,payment,seat,userid,entityid) values (?,?,?,?,?)"
                // let params_paylogdb : Array<any> = [[num_adult,num_teen],price,seat,userid,entityid]

                // let sql_movieentity : string = "update movieentity set seatStatus = ? where entityid = ?"
                // let params_movieentity : Array<any> = [JSON.stringify(seat),entityid]

                // let sql_userdb : string = "update userdb set point = point - ? where userid = ?"
                // let params_userdb : Array<any> = [price,userid]

                // await conn.query(sql_paylogdb + sql_movieentity + sql_userdb, params_paylogdb.concat(params_movieentity).concat(params_userdb))

                conn.release();
                return res.send("성공")
            }
            

        }catch (err) {
            console.error(err)
            conn.release();
        }
    }
})



module.exports = router;
