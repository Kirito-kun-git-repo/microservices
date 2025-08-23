require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const Redis = require('redis');
const { createClient } = require('redis');
const cors= require('cors');
const logger = require('./utils/logger');
const helmet= require('helmet');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const {RedisStore} = require('rate-limit-redis');
const { connectToRabbitMQ,consumeEvent } = require('./utils/rabbitmq');
const searchRoutes=require('./routes/search-routes');
const { handlePostCreated, handlePostDeleted } = require('./eventHandlers/search-event-handlers');

const app = express();
const PORT= process.env.PORT || 3004;
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    logger.info('Connected to MongoDB');
})
.catch((error) => {
    logger.error('Error connecting to MongoDB:', error);
});




const redisClient =  createClient({
    url: process.env.REDIS_URL
});
redisClient.connect();
redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});
redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
}); 


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`  Recieved ${req.method} Request to  ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
}
);

const sensitiveRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // Limit each IP to 5 requests per minute
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler : (req,res)=>{
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ message: 'Too many requests, please try again later.' });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    })
        
});
app.use(sensitiveRateLimiter);
app.use('/api/search', (req, res, next) => {
    req.redisClient = redisClient; // Attach Redis client to request object
    next();
},searchRoutes);

app.use("/api/search",searchRoutes);

app.use(errorHandler);
async function startServer() {
    try{
        await connectToRabbitMQ();
        //consume the events / subscribe to events
        await consumeEvent('post.created',handlePostCreated);
        await consumeEvent('post.deleted',handlePostDeleted);
        app.listen(PORT,()=>{
            logger.info(`Search service is running on port ${PORT}`);
        });

    }
    catch(err){
        logger.error("Error starting search Service:",err);
        process.exit(1);
    }   
}
startServer();





