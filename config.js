import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

let redisClient;
let redisStore;
let redisEnabled = true; // Flag to check if Redis should be used

try {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || 'session-db',
        port: process.env.REDIS_PORT || 6379,
    });

    redisClient.on('error', (err) => {
        if (redisEnabled) { // Only log the error and fall back on the first occurrence
            console.error('Redis connection error:', err);
            console.log('Falling back to in-memory session store.');
            redisEnabled = false; // Disable further Redis attempts
            redisClient.disconnect(); // Disconnect the client gracefully
            redisClient = null; // Nullify the client to avoid reconnection attempts
        }
    });

    redisStore = new RedisStore({ client: redisClient });
} catch (error) {
    console.error('Failed to initialize Redis. Using in-memory session store:', error);
    redisClient = null;
    redisEnabled = false;
}

const config = {
    session: {
        name: 'md.sid',
        secret: 'sooper secret',
        resave: false,
        saveUninitialized: true,
    },

    session_redis: redisEnabled ? {
        store: redisStore,
        name: 'md.sid',
        secret: 'sooper secret',
        resave: false,
        saveUninitialized: true,
    } : {
        name: 'md.sid',
        secret: 'sooper secret',
        resave: false,
        saveUninitialized: true,
    }
};

export default config;
