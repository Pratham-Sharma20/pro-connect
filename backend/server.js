import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postsRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';   
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to load from cross origin

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { status: "error", message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(limiter);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.static('uploads'));

// Routes
app.use(postsRoutes);
app.use(userRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 9090;

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
}

start();

