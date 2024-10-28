import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import userRouter from './src/routers/user.js'
import taskRouter from './src/routers/task.js'

dotenv.config()
const app = express();

app.use(cors({origin: true, credentials: true}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
app.use(cookieParser());

// routes
app.use('/tasks', taskRouter)
app.use('/user', userRouter)

// mongodb setup 
connectDB();

const {PORT} = process.env;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})

export default app