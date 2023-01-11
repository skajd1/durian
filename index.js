"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 5000;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});
app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
