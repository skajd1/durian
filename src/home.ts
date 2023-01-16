import express, { Express, Request, Response } from 'express';
const router = express.Router()
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
    //
    if(!req.session.isLogined)
    {
        res.render('home', {login : false})
    }
    else
    {
        res.render('home', {login : true})
    }
})

module.exports = router;
