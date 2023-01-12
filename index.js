"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 8080;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/home.html');
});
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/html/home.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/html/login.html');
});
app.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/html/signin.html');
});
app.get('/detail', (req, res) => {
    res.sendFile(__dirname + '/html/detail.html');
});
app.get('/pay', (req, res) => {
    res.sendFile(__dirname + '/html/pay.html');
});
app.get('/mypage', (req, res) => {
    res.sendFile(__dirname + '/html/mypage.html');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
