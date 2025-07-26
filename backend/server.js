import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postsRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';   

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(postsRoutes);
app.use(userRoutes);
app.use(express.static('uploads'));

const start = async()=>{
    const connectedDb = await mongoose.connect("mongodb+srv://sharmapratham2006:pratham_thor200@pro-connect.nx8irw7.mongodb.net/?retryWrites=true&w=majority&appName=pro-connect" );
    
    app.listen(9090,()=>{
        console.log("Server is running on port 9090");
    })
}

start();
