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
function pagemove(dir : number,Page : number, pages : number):void{
    Page += dir;
    if (Page > pages){
		Page = 1
	}
	else if (Page ==0 ){
		Page = pages
	}
	showPage(Page)

}
function showPage(page_now : number) : void{
    for(let i = page_now *3 - 3; i<page_now*3; i++){
        // 포스터 속성 movielist[i] 로 변경 
    }

}


module.exports = router;
