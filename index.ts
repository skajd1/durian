import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 5000;

app.get('/', (req: Request, res: Response) => {
  res.sendFile(__dirname + '/home.html');
});
app.get('/index', (req : Request, res : Response) =>{
  res.sendFile(__dirname + '/index.html');
})
 












app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});