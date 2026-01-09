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

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, ""),
    credentials: true
}))

app.use((req, res, next) => {
    console.log(`Request from origin: ${req.headers.origin}`);
    console.log(`Cookies:`, req.cookies);
    next();
});

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
