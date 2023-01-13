import express, { Express, Request, Response } from 'express';
const router = express.Router()

router.get("/", (req : Request, res : Response) =>{
    res.sendFile(__dirname + '/html/home.html');
})

module.exports = router;
