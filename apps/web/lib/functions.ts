
import { createClient } from "redis";
// export const redisClient = createClient();


export const redisClient = createClient({
    username: 'default',
    password: 'sHyvGNlJNQyPof6qaQSrBvpv0k6pxwv3',
    socket: {
        host: 'redis-12075.c114.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 12075
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

