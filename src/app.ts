import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 8080;
const userRouter = require('./user')
const homeRouter = require('./home')

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json())
app.use('/static_image',express.static('static_image'));


app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', userRouter);


app.get('/detail', (req : Request, res : Response) =>{
  res.render('detail', {login : false});
})
app.get('/pay', (req : Request, res : Response) =>{
  res.render('pay' , {login : false});
})



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});