import express from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cors from "cors"

import { connectDB } from './lib/db.js'

import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { app, server } from './lib/socket.js'

dotenv.config()

const PORT = process.env.PORT || 5001

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
        if (hostname.endsWith(".vercel.app")) return true
    } catch {
        return false
    }

    return false
}

app.use(express.json({ limit: "20mb" }))
app.use(express.urlencoded({ extended: true, limit: "20mb" }))
app.use(cookieParser())

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    },
    credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

server.listen(PORT, () => {
    console.log('Server is running on PORT' + PORT)
    connectDB()
})