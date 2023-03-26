import express from 'express';
import path from 'path';
import userRouter from './routes/users';
import bodyParser from 'body-parser';
import config from 'config';
import { PrismaClient } from '@prisma/client';

const app = express();
export const prisma = new PrismaClient();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/users', userRouter);

app.listen(3000, () => {
  console.log('Server is running');
  console.log('mongo db', config.get('mongo.db'));
});
