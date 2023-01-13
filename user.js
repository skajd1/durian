"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// 임시 유저 데이터베이스
const users = [];
const router = express_1.default.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.get("/", (req, res) => {
    res.sendFile(__dirname + '/html/login.html');
});
router.get("/login", (req, res) => {
    res.sendFile(__dirname + '/html/login.html');
});
router.get("/signin", (req, res) => {
    res.sendFile(__dirname + '/html/signin.html');
});
router.get('/mypage', (req, res) => {
    res.sendFile(__dirname + '/html/mypage.html');
});
// 가입버튼 눌렀을 때 유효성 검사 + DB에 유저데이터 등록
router.post('/register', (req, res) => {
    // res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    const user = req.body;
    if (!user.id || !user.password || !user.passwordv || !user.year || !user.month || !user.day) {
        return res.send("<script>alert('입력되지 않은 사항이 있습니다.');document.location.href='/user/signin'</script>");
    }
    else if (users.find(user_in_db => user_in_db.id === user.id)) {
        return res.send("<script>alert('중복된 아이디 입니다.');document.location.href='/user/signin'</script>");
    }
    else if (user.password !== user.passwordv) {
        return res.send("<script>alert('비밀번호가 일치하지 않습니다.');document.location.href='/user/signin'</script>");
    }
    else if ((user.year).length !== 4) {
        return res.send("<script>alert('올바른 생년월일을 입력해주세요.');document.location.href='/user/signin'</script>");
    }
    else {
        user.point = 100000;
        users.push(user);
        console.log(user);
        return res.send("<script>alert('회원가입이 완료되었습니다.');document.location.href='/home'</script>");
    }
});
module.exports = router;
