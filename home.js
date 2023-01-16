"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const session = require('express-session');
const mysqlStore = require('express-mysql-session')(session);
const options = {
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'admin',
    database: 'moviedb'
};
const sessionStore = new mysqlStore(options);
router.use(session({
    secret: "keykey",
    resave: false,
    saveUnitialized: true,
    store: sessionStore
}));
router.get("/", (req, res) => {
    // res.sendFile(__dirname + '/html/home.html');
    //
    if (!req.session.isLogined) {
        res.render('home', { login: false });
    }
    else {
        res.render('home', { login: true });
    }
});
module.exports = router;
