import express, { Response } from 'express'
import empRoutes from './router/empRoutes'
import userRoutes from './router/userRoutes'
import apiRoutes from './router/apiRoutes'
import cookieParser from 'cookie-parser'
import { Requests } from './utils/def'
import { Server } from "socket.io"
import connectDB from './config/db'
import 'dotenv/config'
import cors from 'cors'
// import session from 'express-session'
// import connectRedis from 'connect-redis'
// import redisClient from './config/redis'


// const RedisStore = new connectRedis({
//     client: redisClient,
//     prefix: "myapp"
// })

connectDB()
const app = express()


app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())

// app.use(session({
//     store: RedisStore,
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
// }))

app.use('/user', userRoutes)
app.use('/emp', empRoutes)
app.use('/api', apiRoutes)

app.get('/', (req: Requests, res: Response): Response => {
  return res.status(201).json({ msg: "Server is Live!!🚀" })
})

const port: number = Number(process.env.PORT) || 5000

const server = app.listen(port, () => {
  console.log(`Server is up and Running at http://localhost:${port}`)
})

const io = new Server(server, {
  cors: {
    credentials: true,
    origin: ["https://hackathon-client-livid.vercel.app", "http://localhost:3000"]
  }
});

const emailToSocketIdMap = new Map()
const socketIdToEmailMap = new Map()

io.on("connection", function connection(socket) {
  console.log("Socket Connected: ", socket.id)
  socket.on('message',function message(data,isBinary){
        socket.send("Acknoledged")
      }
  )
  socket.on("room:join", (data) => {
    console.log(data)
    const { email, room } = data
    emailToSocketIdMap.set(email, socket.id)
    socketIdToEmailMap.set(socket.id, email)
    console.log(emailToSocketIdMap)
    console.log(socketIdToEmailMap)
    io.to(room).emit("user:joined", { email, id: socket.id })
    socket.join(room)
    io.to(socket.id).emit("room:join", data)
  })

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer })
  })

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans })
  })

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer)
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer })
  })

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans)
    io.to(to).emit("peer:nego:final", { from: socket.id, ans })
  })
})


