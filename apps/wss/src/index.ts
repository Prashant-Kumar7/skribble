import express from "express"
import { WebSocketServer, WebSocket } from "ws";
import { createClient } from "redis";
import { UserManager } from "./manager/UserManager";

const app = express()

export const client = createClient({
    username: 'default',
    password: 'sHyvGNlJNQyPof6qaQSrBvpv0k6pxwv3',
    socket: {
        host: 'redis-12075.c114.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 12075
    }
});

export const options = {
    method: 'GET',
    url: 'https://pictionary-charades-word-generator.p.rapidapi.com/charades',
    params: {difficulty: 'easy'},
    headers: {
      'x-rapidapi-key': '63153625d8mshc221c319a429628p1793d7jsn7c2583c26a49',
      'x-rapidapi-host': 'pictionary-charades-word-generator.p.rapidapi.com'
    }
  };

client.on('error', err => console.log('Redis Client Error', err));


const httpServer = app.listen(8080)

const wss = new WebSocketServer({ server: httpServer });

const users = new UserManager()

wss.on("connection" , async function connection(ws : WebSocket){
    users.addUser(ws)

    // ws.on("message" , (message)=>{
    //     const parsedMessage = JSON.parse(message.toString())
    //     wss.clients.forEach((socket)=>{
    //         if(socket != ws){
    //             socket.send(JSON.stringify(parsedMessage))
    //         }
    //     })
    // })

})


async function StartQueue(){
    try {
        await client.connect();
        console.log("ws connected to Redis.");
  
        // Main loop
        while (true) {
            try {
                const submission = await client.brPop("room", 0);
                if(submission){
  
                  const parsedMessage = JSON.parse(submission.element.toString())
                  if(parsedMessage.type === "JOIN"){
                    console.log(submission.element)
                    users.joinRoom(submission.element)
                  }
  
                  if(parsedMessage.type === "CREATE"){
                    console.log(submission.element)
                    users.createRoom(submission.element)
                  }
  
                }
  
                // users.redisQueue(submission)
            } catch (error) {
                console.error("Error processing submission:", error);
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
  }
  
  StartQueue()



