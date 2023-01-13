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
app.use(express_1.default.json());
app.use('/static_image', express_1.default.static('static_image'));
app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', userRouter);
app.get('/detail', (req, res) => {
    res.sendFile(__dirname + '/html/detail.html');
});
app.get('/pay', (req, res) => {
    res.sendFile(__dirname + '/html/pay.html');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
