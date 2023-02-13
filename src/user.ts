import express, { Express, Request, Response } from 'express';
require('dotenv').config();
//user 객체 타입 지정
type User = {
    id : string,
    password : string,
    birth : string,
    point : number,
    reserve : number
}
const session = require('express-session');
const options = {
    host : process.env.DB_HOST,
    port : 3306,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
}


const mysqlStore = require('express-mysql-session')(session);
const sessionStore = new mysqlStore(options);
const router = express.Router();
const bodyParser = require('body-parser');
const check = require('./check');
const pool = require('./mysql');

router.use(session({
    secret : process.env.SESSION_KEY,
    resave : false,
    saveUnitialized : true,
    store : sessionStore
}))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({extended : false}))

router.get("/", (req : Request, res : Response) =>{
    if(req.session.isLogined){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('login', {login : false});
})
router.get("/login", (req : Request, res : Response) =>{
    if(req.session.isLogined){
        res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>")
    }
    else res.render('login', {login : false});
})
router.get("/signin", (req : Request, res : Response) =>{
    res.render('signin', {login : false})
})
router.get('/mypage', async (req : Request, res : Response) =>{
    if(req.session.isLogined){
        //세션에 접속중인 유저 데이터 쿼리로 불러오기
        let uid :string = req.session.user_id;
        let sql : string = 'select * from userdb where userid = ?; ';
        let params : Array<string> = [uid,uid];
        let sql_paylogdb : string = 'select logid, title,poster_src,num_adult,payment,seat,paydate,num_teen,start_time,placename,date from paylogdb, moviedetail, movieentity,places where userid = ? and movieentity.placeid = places.placeid and movieentity.movieid = moviedetail.movieid and paylogdb.entityid = movieentity.entityid order by paydate desc;';
        let conn
        try {
            conn = await pool.getConnection()
            let [rows] = await conn.query(sql + sql_paylogdb, params);
            conn.release();
            
            return res.render('mypage', { login : true, uid : uid, birth : rows[0][0].birth, point : rows[0][0].point, log:rows[1]});

        } catch(err){
            if(conn){
                conn.release();
            }
            console.error(err)
        }
    }
    else{
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>")
    }

})
router.get('/mypage/resvdetail/:logid', async (req : Request, res : Response) =>{
    if(!req.session.isLogined){
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>")
    }
    else{
        let logid : string = req.params.logid;
        let sql : string = 'select * from paylogdb, moviedetail, movieentity,places where logid = ? and movieentity.placeid = places.placeid and movieentity.movieid = moviedetail.movieid and paylogdb.entityid = movieentity.entityid;';
        let params : Array<string> = [logid];
        let conn
        let cancel = true;
        res.setHeader('Cache-Control', 'no-store')
        try {
            conn = await pool.getConnection();
            let [rows] = await conn.query(sql, params);
            let dd = rows[0].date;
            let date = dd.getFullYear() + '-' + (dd.getMonth()+1) + '-' + dd.getDate() + ' ' + (6+(rows[0].start_time-1) * 4) +':00'
            
            if (new Date(date) < new Date())
            {
                cancel = false;
            }
            conn.release();
            return res.render('resvdetail', { login : true, log : rows[0], cancel : cancel});

        } catch(err){
            if(conn){
                conn.release();
            }
            console.error(err)
        }
    }
})
router.delete('/mypage/resvdetail/:logid', async (req : Request, res : Response) =>{
    if(!req.session.isLogined){
        res.send("<script>alert('로그인 후 이용해주세요.');document.location.href='/user/login'</script>")
    }
    else{
        // 포인트 환불
        // movieentity에서 좌석 정보 수정
        // paylogdb에서 삭제
        let logid : string = req.body.logid;
        let sql_paylogdb : string = 'select payment,seat,userid,entityid from paylogdb where logid = ?; ';
        let params_paylogdb : Array<string> = [logid];
        let conn
        try{
            conn = await pool.getConnection();
            let [rows] = await conn.query(sql_paylogdb, params_paylogdb);
            let payment = rows[0].payment;
            let seat = rows[0].seat;
            let userid = rows[0].userid;
            let entityid = rows[0].entityid;
            
            let sql_movieentity : string = 'select seatStatus from movieentity where entityid = ?'
            let params_movieentity : Array<string> = [entityid];
            let [rows2] = await conn.query(sql_movieentity, params_movieentity);
            let seatStatus = JSON.parse(rows2[0].seatStatus);
            seat.split(',').forEach((s : string) => {
                seatStatus[s.charCodeAt(0) - 65][Number(s.charCodeAt(1) - 49)] = 0
            })
            
            let sql_point : string = 'update userdb set point = point + ? where userid = ?; ';
            let params_point : Array<string> = [payment, userid];

            let sql_seat : string = 'update movieentity set seatStatus = ? where entityid = ?; ';
            let params_seat : Array<string> = [JSON.stringify(seatStatus), entityid];

            let sql_paylogdb2 : string = 'delete from paylogdb where logid = ?; ';
            let params_paylogdb2 : Array<string> = [logid];
            
            await conn.beginTransaction();
            await conn.query(sql_point + sql_seat + sql_paylogdb2, params_point.concat(params_seat).concat(params_paylogdb2));
            await conn.commit();
            conn.release();

            return res.send("<script>alert('예매가 취소되었습니다.');document.location.href='/user/mypage'</script>");
        }
        catch(err){
            console.error(err)
            if(conn){
                try{
                    await conn.rollback();
                    conn.release();
                }
                catch(err){
                    console.error(err)
                }
            }
        }
    }

})

router.get('/mypage/resvdetail/ticket/:logid', async (req : Request, res : Response) =>{
    // 예매 번호
    // 영화 제목
    // 극장
    // 상영 일시
    // 상영 시간
    // 좌석
    // 인원

    let logid : string = req.params.logid;
    let sql : string = 'select logid,title,placename,date,runningTime,start_time, seat,num_adult,num_teen from paylogdb, moviedetail, movieentity,places where logid = ? and movieentity.placeid = places.placeid and movieentity.movieid = moviedetail.movieid and paylogdb.entityid = movieentity.entityid;';
    let params : Array<string> = [logid];
    res.header('Cache-Control', 'no-store')
    let conn
    try {
        conn = await pool.getConnection();
        let [rows] = await conn.query(sql, params);
        conn.release();
        console.log(rows)
        return res.render('ticket', { log : rows[0]});
    } catch(err){
        if(conn){
            conn.release();
        }
        console.error(err)
    }
})

// 로그아웃 시 세션 초기화
router.get('/logout', (req : Request, res : Response) =>{
    if(req.session.isLogined){
        req.session.destroy( () => {
           req.session;
        })
        res.redirect('/');
    }
    else res.send("<script>alert('잘못된 접근입니다.');document.location.href='/'</script>");
})



// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', async (req: Request, res : Response) =>{
    for (let key of Object.keys(req.body))
    {
        if(!(check.checkExist(req.body[key])))
        {
            return res.send("<script>alert('" + key + "가 입력되지 않았습니다.');document.location.href='/user/signin'</script>")
        }
    }
    if (!(check.checkId(req.body['id'])))
    {
        return res.send("<script>alert('아이디가 올바르지 않은 형식입니다. ');document.location.href='/user/signin'</script>")
    }
    else if (req.body['password']!==req.body['passwordv'])
    {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkPw(req.body['password']))
    {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/signin'</script>");
    }
    else if (!check.checkBirth(req.body['year']))
    {
        return res.send("<script>alert('올바른 생년월일을 입력하세요.');document.location.href='/user/signin'</script>");
    }
    else if(!(await check.checkDup(req.body['id'])))
    {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else{
        

        let sql : string = 'insert into userdb (userid, password, birth, point) values (?,?,?,?)';
        let params : Array<User> = [req.body['id'], req.body['password'], (req.body['year']+'-'+req.body['month']+'-' +req.body['day']),100000];
        let conn
        try{
            conn = await pool.getConnection();
            let [result] = await conn.query(sql,params)
            conn.release();
            return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
        } catch (err){
            if(conn){
                conn.release();
            }
            conn.release();
        }
    }

})

router.post('/authentication', async(req : Request, res : Response) => {
    if(!req.body['id'] || !req.body['password'])
    {
        return res.send("<script>alert('아이디와 비밀번호를 입력하세요.');document.location.href='/user/login'</script>");
    }
    let sql :string= "select * from userdb where userid = ?";
    let params : Array<string> = [req.body['id']]
    let conn 
    
    try{
        conn = await pool.getConnection();
        let [rows] = await conn.query(sql, params)
        if(!rows[0])
        {
            conn.release();
            return res.send("<script>alert('등록된 아이디가 존재하지 않습니다.');document.location.href='/user/login'</script>");
        }
        else if (rows[0].password !== req.body['password'])
        {
            conn.release();
            return res.send("<script>alert('잘못된 비밀번호 입니다.');document.location.href='/user/login'</script>"); 
        }
        else {
            conn.release();
            req.session.user_id = req.body['id'];
            req.session.isLogined = true;
            req.session.save( ()=> {
                res.redirect('/')
            })
        }

    }catch(err) {
        console.error(err)
        if(conn){
            conn.release();
        }
    }
})
router.post('/edit', async(req : Request, res: Response) => {
    let sql : string = "select password from userdb where userid = ?"
    let params : Array<string> = [req.session.user_id]
    let conn
    


    if(!req.body['ppassword'] || !req.body['npassword'] || !req.body['passwordv'])
    {
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/mypage'</script>");
    }
    else if (req.body['npassword'] !== req.body['passwordv'])
    {
        return res.send("<script>alert('확인 비밀번호가 일치하지 않습니다.');document.location.href='/user/mypage'</script>"); 
    }
    else if (!check.checkPw(req.body['npassword']))
    {
        return res.send("<script>alert('올바른 비밀번호 형식을 사용하세요. ');document.location.href='/user/mypage'</script>");
    }
    else {
        try {
            conn = await pool.getConnection();
            let [rows] = await conn.query(sql, params)
            if (rows[0].password !== req.body['ppassword'])
            {
                conn.release();
                return res.send("<script>alert('현재 비밀번호와 일치하지 않습니다.');document.location.href='/user/mypage'</script>"); 
            }
            else
            {
                let sql : string = "update userdb set password = ? where userid = ?";
                let params : Array<string> = [req.body['npassword'], req.session.user_id];
                let [result] = await conn.query(sql, params)
                conn.release();
                return res.send("<script>alert('수정이 완료되었습니다.');document.location.href='/user/mypage'</script>");
            }
        } catch(err) {
            console.error(err)
            if(conn){
                conn.release();
            }
        }
    }
})


module.exports = router;
