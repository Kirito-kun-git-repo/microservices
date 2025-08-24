const dotenv=require('dotenv').config();
const mongoose = require('mongoose');
const logger= require('./utils/logger');
const express=require('express');
const app=express();
const helmet= require('helmet');
const cors = require('cors');
const {RateLimiterRedis}=require('rate-limiter-flexible');
const Redis=require('ioredis');
const {rateLimit}=require('express-rate-limit');
const {RedisStore}=require('rate-limit-redis');
const identityroutes=require('./routes/identity-service');
const errorHandler = require('./middleware/errorHandler');









//connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        logger.info('Connected to MongoDB');
        })
    .catch((err) => {
        logger.error('Error connecting to MongoDB:', err);});

//connect to redis
const redisClient = new Redis(process.env.REDIS_URL,{
    tls:{}
});
redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});






//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`  Recieved ${req.method} Request to  ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
}
);

//DDos Protection
const rateLimiter = new  RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rateLimiter',
    points: 5, // 5 requests
    duration: 1, // per minute
})
app.use((req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ message: 'Too many requests, please try again later.' });
        });
    });



//Ip based rate limiting for sensitive routes/endpoints
const sensitiveRateLimiter =rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max :50,
    standardHeaders:true,
    legacyHeaders:false,
    handler : (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for ip: ${req.ip}`);
        res.status(429).json({message: 'Too many requests, please try again later.'});
        
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

//apply this to sensitive routes/endpoints
app.use('/api/sensitive', sensitiveRateLimiter);

//routes
app.use('/api/auth', identityroutes);
//
//error handling middleware

app.use(errorHandler);
app.listen(process.env.PORT || 3001, () => {
    logger.info(`Server is running on port ${process.env.PORT || 3001}`);
}
);

//unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', promise,"reason:", reason);
   
});



   