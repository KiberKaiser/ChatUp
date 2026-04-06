import { Server } from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const normalizeOrigin = (value) => value?.trim().replace(/\/$/, "")
const defaultOrigins = ["http://localhost:5173"]
const envOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean)
const allowedOrigins = [...new Set([...defaultOrigins.map(normalizeOrigin), ...envOrigins])]

const isAllowedOrigin = (origin) => {
    if (!origin) return true

    const normalized = normalizeOrigin(origin)
    if (allowedOrigins.includes(normalized)) return true

    try {
        const hostname = new URL(normalized).hostname
        return hostname.endsWith(".vercel.app")
    } catch {
        return false
    }
}

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                return callback(null, true)
            }
            return callback(null, false)
        },
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

