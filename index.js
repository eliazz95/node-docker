const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const redis = require('redis')
let RedisStore = require('connect-redis')(session)
const cors = require('cors')

const { 
    MONGO_USER, 
    MONGO_PWD, 
    MONGO_IP, 
    MONGO_PORT, 
    REDIS_URL, 
    SESSION_SECRET,
    REDIS_PORT
} = require('./config/config')

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT,
})

const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()
app.use(express.json())

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () => {
    mongoose.connect(mongoURL)
    .then(() => console.log('Succesfully connected to database'))
    .catch((e) => {
        console.log(e)
        setTimeout(connectWithRetry, 5000)
    })
}
connectWithRetry()

app.enable('trust proxy')
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        saveUninitialized: false,
        resave: false,
        httpOnly: true,
        maxAge: 60000
    }
}))



app.get('/', (req, res) => {
    res.send('<h2> Hello World! </h2>')
    console.log('Yes, it ran')
})

app.use('/posts', postRouter)
app.use('/users', userRouter)
const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Listening on ${port}`))