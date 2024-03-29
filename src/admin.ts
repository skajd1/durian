import express, { Express, Request, Response } from 'express';
require('dotenv').config();

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
    host : process.env.DB_HOST,
    port : 3306,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
}
const check = require('./check');
const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express.Router();
const bodyParser = require('body-parser');
const pool = require('./mysql');
const multer = require('multer');

// 좌석 초기화
const seat : Array<Array<Number>> = [];
for(let i = 0; i < 5 ; i++){
    let tmp : Array<Number> = []
    for(let j = 0; j < 12; j ++){
        tmp.push(0)
    }
    seat.push(tmp)
}
const err_msg :string = "<script>alert('잘못된 접근입니다.');document.location.href='/'</script>"


//파일 업로드 시, 파일 이름과 확장자 및 경로 지정
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
    secret : process.env.SESSION_KEY,
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))

//유저 DB 리스트 출력
router.get("/userdb", async (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    let sql_userdb = "select userid from userdb;"
    let conn;
    try{
        conn = await pool.getConnection();
        let [rows] = await conn.query(sql_userdb);
        conn.release();
        return res.render('user_db', {login : true, userid : rows});

    } catch(err) {
        console.error(err)
        if(conn){
            conn.release();
        }
    }

})


//리스트에서 유저를 선택하여 정보 조회 및 수정
router.get("/userdb/edit", async(req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    let uid : string = req.query.userid as string
    let sql_userdb : string = "select * from userdb where userid = ?";
    let params = [uid]
    let conn
    try {
        conn = await pool.getConnection();
        let [rows] = await conn.query(sql_userdb, params)
        conn.release();
        return res.render('user_edit_page', {login : true, userdata : rows[0]})
    } catch(err) {
        if(conn){
            conn.release();
        }
        console.error(err)
    }

    
    
})
// 유저 db 수정 post요청
router.post('/userdb/edit', async (req: Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    // 공백 검사 
    for (let key of Object.keys(req.body))
    {
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href=document.referrer</script>")
        }
    }
    let conn
    let uid : string = req.body.id
    let pw : string = req.body.password;
    let birth : string = req.body.year+'/' +req.body.month + '/' + req.body.day;
    let point : Number = req.body.point;
    let sql_userdb : string = "update userdb set password = ?, birth = STR_TO_DATE(?, '%Y/%m/%d') , point = ? where userid = ?;"
    let params : any = [pw, birth, point, uid];
    try {
        conn = await pool.getConnection();
        let [result] = await conn.query(sql_userdb,params)
        conn.release();
        return res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/admin/userdb'</script>")

    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }    
})

// 유저 db 삭제 요청
router.delete('/userdb/edit', async (req: Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    let conn
    let uid : string = req.body.id;
    let sql_userdb_delete : string = "delete from userdb where userid = ?";
    let params = [uid]

    try {
        conn = await pool.getConnection();
        await conn.query(sql_userdb_delete, params)
        conn.release();
    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }

})

// 영화 DB 리스트 출력
router.get("/moviedb", async (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    else{
        let conn
        let sql : string = "select movieid,title from moviedetail";
        
        try {
            conn = await pool.getConnection();
            let [rows] = await conn.query(sql)
            conn.release();
            return res.render('movie_db', {login : true, rows : rows});

        } catch(err)
        {
            console.error(err)
            if(conn){
                conn.release();
            }
        }

    }      
        
})
//영화 DB 수정 페이지 출력
router.get("/moviedb/edit/:id", async (req : Request, res : Response) => {
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    else {
        let conn;
        let sql = "select * from moviedetail where movieid=?"
        let params = [req.params.id];

        try {
            conn = await pool.getConnection();
            let [rows] : Array<Movie> = await conn.query(sql,params);
            conn.release();
            return res.render('movie_edit_page', {login : true, rows: rows})
        } catch(err)
        {
            console.error(err)
            if(conn){
                conn.release();
            }
        }
    }
})

//영화 DB수정 서버사이드
router.post("/moviedb/edit/:id",upload.single('image'), async (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    else{
        for (let key of Object.keys(req.body))
        {
            if(!(check.checkExist(req.body[key])))
            {
                return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href=document.referrer</script>")
            }
        }
        if(!req.file){
            return res.send("<script>alert('이미지 등록에 실패하였습니다.');document.location.href=document.referrer</script>")
        }
        if(Number(req.body.hour) + Number(req.body.minute)/60 > 4){
            return res.send("<script>alert('최대 상영시간은 4시간 입니다.');document.location.href=document.referrer</script>")      
        }
        // update로 변경
        let sql :string = "update moviedetail set title = ?, content = ?, age = ?, runningTime = ?, poster_src = ? where movieid = ?";
        let params :Array<any>= [req.body.title, req.body.content, req.body.age, Number(req.body.hour) + Number(req.body.minute)/60 ,'/static_image/'+req.file.filename, req.body.id];
        let conn
        try {
            conn = await pool.getConnection();
            let [result] = await conn.query(sql,params);
            conn.release();
            return res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/admin/moviedb'</script>")
        } catch(err){
            console.error(err)
            if(conn){
                conn.release();
            }
        }
    }
})
//delete 메소드로 요청받아서 해당 영화 삭제
router.delete('/moviedb/edit/:id', async (req : Request, res: Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    let conn
    let sql = "delete from moviedetail where movieid = ?"
    let params = [req.body.id]

    try {
        conn = await pool.getConnection();
        let [result]= await conn.query(sql,params)
        conn.release();
        return  res.send("<script>alert('삭제가 완료되었습니다.');document.location.href='/admin/moviedb'</script>")
    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }    
})

// 영화 DB 리스트 
router.get("/moviedb/post", async (req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    else res.render('post_movie', {login : true});
})

// 영화 DB 최초 등록
// DB 등록 시 넘어오는 파라미터 정보 유효성 검증 및 쿼리
router.post('/moviedb/post', upload.single('image'), async(req : Request, res : Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }    
    for (let key of Object.keys(req.body))
    {   
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/moviedb/post'</script>")
        }
    }
    if(!req.file){
        return res.send("<script>alert('이미지 등록에 실패하였습니다.');document.location.href='/admin/moviedb/post'</script>")
    }
    if(Number(req.body.hour) + Number(req.body.minute)/60 > 4){
        return res.send("<script>alert('최대 상영시간은 4시간 입니다.');document.location.href='/admin/moviedb/post'</script>")      
    }
    let conn
    let sql :string = "insert into moviedetail (title, content, age, runningTime, poster_src) values(?,?,?,?,?)";
    let params :Array<any>= [req.body.title, req.body.content, req.body.age, Number(req.body.hour) + Number(req.body.minute)/60 ,'/static_image/'+req.file.filename];

    try {
        conn = await pool.getConnection();
        let [result] = await conn.query(sql, params);
        conn.release();
        return res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/moviedb'</script>")
    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }
})

// 타임테이블을 확인할 극장 목록 sql로 전송
router.get('/selectdate', async(req : Request, res : Response) => {
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    else {
        let conn
        let sql_places : string = "select * from places;";
        try {
            conn = await pool.getConnection();
            let [rows] = await conn.query(sql_places)
            conn.release();
            return res.render('select_date', {login : true, places : rows})
        } catch(err)
        {
            console.error(err)
            if(conn){
                conn.release();
            }
        }   
    }
})


// 날짜와 극장 ID 받아서 select 후 없으면 타임테이블 생성
router.get('/posttable', async(req : Request, res : Response) => {
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)   
    }
    for (let key of Object.keys(req.query))
    {   
        if(!(check.checkExist(req.query[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/admin/selectdate'</script>")
        }
    }
    res.setHeader('Cache-Control', 'no-store')
    let conn
    let sql_timetable : string = "select time1,time2,time3,time4,time5 from timetable where placeid = ? and date = STR_TO_DATE(?, '%Y-%m-%d'); " ;
    let sql_moviedetail : string = "select movieid,title from moviedetail;"; // 수정
    let placeid :any=req.query['select-place'],
    date :any = req.query['select-date'];
    let params :Array<string> = [placeid,date];
    let sql_places : string = "select placename from places where placeid = ?"
    let params_places : Array<string> = [placeid]
    let place : string
    let moviedetail : any = {}
    // 이미 타임테이블이 존재하면 그대로 정보를 전송하고, 없으면 타임테이블 생성후 default rows 선언해서 전송 
    try {
        conn = await pool.getConnection();
        let [placename] = await conn.query(sql_places, params_places);
        let [rows] = await conn.query(sql_timetable + sql_moviedetail,params);
        
        place = placename[0]['placename']
        for (let i = 0; i< rows[1].length; i ++){
            moviedetail[rows[1][i]['movieid']] = rows[1][i]['title']    
        }
        
        if(!rows[0].length)
        {   
            rows[0] = [{time1 : 0, time2:0, time3:0, time4:0, time5:0}]
            let sql : string = "insert into timetable (placeid, date) values(?, STR_TO_DATE(?, '%Y-%m-%d'));"
            let [result] = await conn.query(sql, params)
        }
            conn.release();
            return res.render('post_entity', {login : true, timetable : rows[0],movielist: rows[1] ,moviedetail : moviedetail, placeid : placeid, selected_place : place, selected_date : date})
        
    } catch(err) {
        console.error(err)
        if(conn){
            conn.release();
        }
    }
})



// movieentity 및 timetable 등록, 
router.post('/posttable', async(req : Request, res : Response) => {
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    for (let key of Object.keys(req.body))
    {   
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href=document.referrer</script>")
        }
    }
    
    let conn
    let date : string = req.body['select-date']
    let movieId :string = req.body['select-movie']
    let placeId :string = req.body['select-place']
    let time : Number = Number(req.body['select-time']) + 1
    let sql_timetable : string = "update timetable set time" + time + "=" + movieId +" where placeid = ? and date = STR_TO_DATE(?, '%Y-%m-%d' ); "
    let params_timetable : Array<string> = [placeId, date];
    let sql_movieentity : string = "insert into movieentity (start_time,placeid,movieid,seatStatus,date) values (?,?,?,?,STR_TO_DATE(?, '%Y-%m-%d'));"
    let params_movieentity : Array<any> = [time, placeId, movieId, JSON.stringify(seat), date]
    
    try {
        conn = await pool.getConnection();
        let [result] = await conn.query(sql_timetable, params_timetable)
        let [result2] = await conn.query(sql_movieentity, params_movieentity)
        conn.release();
        return res.send("<script>alert('등록이 완료되었습니다.');document.location.href='/admin/selectdate'</script>")
    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }
    
})


// 타임테이블에 등록된 개체 삭제
router.delete('/posttable',async (req : Request, res: Response) =>{
    if(req.session.user_id !== 'admin' ){
        return res.send(err_msg)
    }
    let conn
    let time : Number = req.body.time
    let placeid : Number = Number(req.query['select-place'])
    let date = req.query['select-date']
    let sql_setTimeTable = "update timetable set time" +time + "= 0 where placeid = ? and date = STR_TO_DATE(?, '%Y-%m-%d' ); ";
    let sql_deleteEntity = "delete from movieentity where placeid = ? and date = STR_TO_DATE(?, '%Y-%m-%d' ) and start_time = ? ";
    let params_timetable = [placeid, date];
    let params_entity = [placeid, date, time];
    try {
        conn = await pool.getConnection();
        let [result] = await conn.query(sql_setTimeTable , params_timetable);
        let [result2] = await conn.query(sql_deleteEntity , params_entity);
        conn.release();
        return;
    } catch(err)
    {
        console.error(err)
        if(conn){
            conn.release();
        }
    }      
})


module.exports = router;
