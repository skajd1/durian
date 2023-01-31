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
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/'</script>")
    }
    else {
        let movielist : Array<Movie>
        let placelist : Array<string>
        let placeid = req.query['select-place']
        let date = req.query['select-date']
        let movieid = req.query['movie-id']

        let sql_moviedetail : string = "select * from moviedetail; "

        // let sql_selected_movie : string = "select title,age, runningTime, poster_src from moviedetail where movieid = ?; "
        // let params_detail : Array<any> = [movieid]
        
        let sql_places : string = "select placename from places"
        // let params_place : Array<any> = [placeid]
        let conn = await pool.getConnection();
        try{
            let [rows] = await conn.query(sql_moviedetail + sql_places)
            movielist = rows[0]
            placelist = rows[1]        
            conn.release();
            return res.render('pay', {login : true, movielist : movielist, placelist : placelist });

        } catch(err) {
            console.error(err)
            conn.release();
        }
       
    }
})








module.exports = router;
