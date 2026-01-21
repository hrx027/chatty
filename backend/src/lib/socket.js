import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import Message from '../models/message.model.js';



const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = [
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
            ];
            
            if (process.env.CLIENT_URL) {
                allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
            }

            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
                callback(null, true);
            } else {
                console.log("Blocked by CORS (Socket):", origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}


const userSocketMap = {}; //{userId:socketId}

io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    const userId = socket.handshake.query.userId

    if(userId) userSocketMap[userId] = socket.id

    //io.emit is used to send events to all the connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId: userId });
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
        }
    });

    socket.on("markMessagesAsSeen", async ({ senderId }) => {
        try {
            // Update in DB
            await Message.updateMany(
                { senderId: senderId, receiverId: userId, status: { $ne: "seen" } },
                { $set: { status: "seen" } }
            );

            // Notify sender
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { receiverId: userId });
            }
        } catch (error) {
            console.log("Error in markMessagesAsSeen: ", error);
        }
    });

    socket.on("disconnect",()=>{
        console.log(" a user disconnected",socket.id);

        delete userSocketMap[userId];

        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
});

    
export {io, server,app};

