import express from 'express'
import {config} from 'dotenv'
import conncetDB from './DB/db.js'
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import dashboardRouter from './routes/dashboard.routes.js';
import adminRouter from './routes/admin.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import studentRouter from './routes/student.routes.js';
import classRouter from './routes/class.routes.js';

config()
conncetDB()
const app = express()


//middlewaee
app.use(cookieParser());
app.use(express.json());
//routes
app.use("/auth" , authRouter)
app.use("/dashboard" , dashboardRouter)
app.use("/admin" , adminRouter);
app.use("/teacher" , teacherRouter)
app.use("/student" , studentRouter)
app.use("/class" , classRouter)

//Home route this was just for testing
app.get('/' , (req , res) => {
    res.send("Welcome to SatyaDesk Speccially made for only Colleges with Cheap Price!!!")
})

app.listen(process.env.PORT || 5000  , () => {
    console.log(`Listening at port ${process.env.PORT}`);
} )