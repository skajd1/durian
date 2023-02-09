import express, { Express, Request, Response } from 'express';
require('dotenv').config();
type Movie={
    title : string,
    content : string,
    age : number,
    runningTime : number,
    poster_src : string
}
let movielist : Array<Movie>;
const router = express.Router()
const pool = require('./mysql');

const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const options = {
    host : process.env.DB_HOST,
    port : process.env.DB_PORTNUM,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
}

const sessionStore = new mysqlStore(options);
router.use(session({
    secret : process.env.SESSION_KEY,
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))

// movielist를 인자로 전달하여 html 내에서 영화 포스터 이미지 리스트로 출력
router.get("/", async(req : Request, res : Response) =>{
    let conn = await pool.getConnection();
    // res.sendFile(__dirname + '/html/home.html');
    let sql :string = "select * from moviedetail; ";
    let sql_places : string = "select * from places;";
    let login : boolean = false
    let admin : boolean = false

    try{
        let [rows] = await conn.query(sql + sql_places);
        conn.release();
        
        movielist = rows[0];
        if(req.session.isLogined){
            login = true
        }
        if(req.session.user_id == 'admin'){
            admin = true;
        }
        return res.render('home', {login : login, admin: admin, movielist : movielist, places : rows[1]})
    } catch(err) {
        console.error(err)
        conn.release();
    }
    
})


module.exports = router;
