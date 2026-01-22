import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {connectDB} from './lib/db.js'

import fs from 'fs'
import path from 'path'
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import cors from 'cors'
import { app ,server} from './lib/socket.js'


const __dirname = path.resolve()

dotenv.config({ path: path.join(__dirname, '..', '.env') })
dotenv.config({ path: path.join(__dirname, '.env') })


const PORT = process.env.PORT || 5001

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow local network IPs for mobile testing (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLocalNetwork = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(origin);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, "")) || isLocalNetwork) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin); // Debug log for troubleshooting
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))



app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)


const frontendDistPath = path.join(__dirname,'../frontend/dist')
if(process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)){
    app.use(express.static(frontendDistPath))
    app.get('*',(req,res) => {
        res.sendFile(path.join(frontendDistPath,'index.html'))
    })
}

server.listen(PORT, () => {
    console.log('Server is running on PORT:'+PORT)
    connectDB()
})
