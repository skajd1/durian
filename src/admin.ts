import express, { Express, Request, Response } from 'express';
import { request } from 'http';

type Movie={
    id : number,
    title : string,
    content : string,
    age : number,
    runningTime : number,
    poster_src : string
}

const session = require('express-session');
const options = {
    host : 'localhost',
    port : 3306,
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
}
const check = require('./check');
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express.Router();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'admin',
    password : 'admin',
    database : 'moviedb'
});
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req : any, file : any, cb:any) {
        const error = file.mimetype === 'image/jpeg' || 'image/png'
          ? null
          : new Error('wrong file');
        cb(error, 'static_image/');
    },
    filename : (req : any, file : any, cb:any) =>{
        cb(null, Date.now() + file.originalname)
    }
    
})
const upload = multer({
    storage : storage
})
router.use(session({
    secret : "keykey",
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))

router.get("/userdb", (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('user_db', {login : true});
})








router.get("/moviedb", (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else{
        let sql : string = "select id,title from moviedetail";
        connection.query(sql, (err : any, rows : Array<Movie>) =>{
            if (err) console.log(err);
            else {

                res.render('movie_db', {login : true, rows : rows});
            }
        })

    }      
        
})
router.get("/moviedb/edit/:id", (req : Request, res : Response) => {
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else {
        let sql = "select * from moviedetail where id=?"
        let params = [req.params.id];
        connection.query(sql,params, (err: any, rows: Array<Movie>)=>{
            if(err) console.log(err)
            else{
                res.render('movie_edit_page', {login : true, rows: rows})
            }
        })
    }
})
router.post("/moviedb/edit/:id", (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else{
        
    }
})



router.get("/moviedb/post", (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('post_movie', {login : true});
})




router.post('/moviedb/post', upload.single('image'), (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    for (let key of Object.keys(req.body))
    {
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/moviedb/post'</script>")
        }
    }
    let sql :string = "insert into moviedetail (title, content, age, runningTime, poster_src) values(?,?,?,?,?)";
    let params :Array<any>= [req.body.title, req.body.content, req.body.age, Number(req.body.hour) + Number(req.body.minute)/60 ,'/static_image/'+req.file.filename];
    connection.query(sql, params, (err : any) =>{
        if (err) throw err;
        else{
            res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/moviedb'</script>")
        }
    })
})

module.exports = router;
