import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const defaultOrigins = ["http://localhost:5173"]
const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])]

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
})

const userSocketMap = {};

const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
    console.log("User connected: ", socket.id)
    
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server, getReceiverSocketId }

