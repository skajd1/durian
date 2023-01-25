"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 8080;
const userRouter = require('./user');
const homeRouter = require('./home');
const adminRouter = require('./admin');
app.set('view engine', 'ejs');
app.set('views', ['./views', './views/admin/movie', './views/admin/user', './views/admin/entity']);
app.use(express_1.default.json());
app.use('/static_image', express_1.default.static('static_image'));
//라우팅
app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.get('/detail', (req, res) => {
    res.render('detail', { login: false });
});
app.get('/pay', (req, res) => {
    res.render('pay', { login: false });
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
