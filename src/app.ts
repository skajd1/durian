import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 8080;
const userRouter = require('./user')
const homeRouter = require('./home')
const adminRouter = require('./admin')
const payRouter = require('./pay')
app.set('port', process.env.PORT || 8080);
app.set('view engine', 'ejs');
app.set('views', ['./views','./views/admin/movie', './views/admin/user', './views/admin/entity','./views/css']);


app.use(express.json())
app.use('/static_image',express.static('static_image'));

//라우팅
app.use('/', homeRouter);
app.use('/home', homeRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/pay', payRouter);




app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});