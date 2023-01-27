import express, { Express, Request, Response } from 'express';
type Movie={
    title : string,
    content : string,
    age : number,
    runningTime : number,
    poster_src : string
}
let movielist : Array<Movie>;
const router = express.Router()
const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb',
    multipleStatements: true
});
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const options = {
    host : 'localhost',
    port : 3306,
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
}
const sessionStore = new mysqlStore(options);
router.use(session({
    secret : "keykey",
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))

// movielist를 인자로 전달하여 html 내에서 영화 포스터 이미지 리스트로 출력
router.get("/", (req : Request, res : Response) =>{
    // res.sendFile(__dirname + '/html/home.html');
    let sql :string = "select * from moviedetail; ";
    let sql_places : string = "select * from places;";
    let login : boolean = false
    let admin : boolean = false
    connection.query(sql + sql_places, (err : any, rows : Array<any>) => {
        if (err) console.log(err)
        else{
            movielist = rows[0];
            if(req.session.isLogined){
                login = true
            }
            if(req.session.user_id == 'admin'){
                admin = true;
            }
            res.render('home', {login : login, admin: admin, movielist : movielist, places : rows[1]})

        }
    })
})


module.exports = router;
