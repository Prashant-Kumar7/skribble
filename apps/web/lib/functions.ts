
import { createClient } from "redis";
// export const redisClient = createClient();
import dotenv from "dotenv"

dotenv.config()

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-14424.c83.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 14424
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

