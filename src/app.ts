import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 8080;
const userRouter = require('./user')
const homeRouter = require('./home')

app.use(express.json())
app.use('/static_image',express.static('static_image'));


app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', userRouter);


app.get('/detail', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/detail.html');
})
app.get('/pay', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/pay.html');
})



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});