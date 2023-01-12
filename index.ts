import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 8080;

app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/html/home.html');
});
app.get('/home', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/html/home.html');
});
app.get('/login', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/login.html');
})
app.get('/signin', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/signin.html');
})
app.get('/detail', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/detail.html');
})
app.get('/pay', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/pay.html');
})
app.get('/mypage', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/html/mypage.html');
})


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});