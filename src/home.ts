import express, { Express, Request, Response } from 'express';
type Movie={
    title : string,
    content : string,
    age : number,
    runningTime : number,
    poster_src : string
}
const router = express.Router()
const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
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
router.get("/", (req : Request, res : Response) =>{
    // res.sendFile(__dirname + '/html/home.html');
    let sql :string = 'select * from moviedetail'
    let params : Array<string> = [];
    let movielist : Array<Movie>;
    connection.query(sql, (err : any, rows : Array<Movie>) => {
        if (err) console.log(err)
        else{
            movielist = rows;
            if(!req.session.isLogined)
            {
                res.render('home', {login : false,admin : false, movielist : movielist})
            }
            else 
            {   
                if(req.session.user_id === 'admin')
                {   
                    res.render('home', {login : true, admin: true, movielist : movielist})
                }
                else
                {        
                    res.render('home', {login : true, admin: false, movielist : movielist})
                }
            }


        }
    })
})

module.exports = router;
