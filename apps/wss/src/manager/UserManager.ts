import {WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { client } from "..";



export class UserManager {

    private rooms : RoomManager[]


    constructor(){
        this.rooms = []
    }


    addUser(socket : WebSocket){
        this.addHandler(socket)
    }


    async joinRoom(message: string) {
        const parsedMessage = JSON.parse(message);
        const username = parsedMessage.name;
        const room = this.rooms.find((rm)=>{
            return rm.roomId === parsedMessage.roomId
        });
        if (room) {
            room.joinHttp(username);
            await client.lPush(parsedMessage.processId, message)
        } else {
            console.error("Room not found for roomId:", parsedMessage.roomId);
        }

    }


    async createRoom(message: string) {
        const parsedMessage = JSON.parse(message);
        const username = parsedMessage.name
        const room = new RoomManager(parsedMessage.roomId, username);
        room.joinHttp(username);
        this.rooms.push(room);
        await client.lPush(parsedMessage.processId, message)
    }


    private addHandler(socket: WebSocket) {
        socket.on("message", async(message) => {
            const parsedMessage = await JSON.parse(message.toString());
            const username = parsedMessage.name
            const room = this.rooms.find((rm) => rm.roomId === parsedMessage.roomId);
            switch (parsedMessage.type) {
                case "JOIN_ROOM":
                    room?.join(username, socket);
                    break;
                case "GET_ROOM_STATE":
                    room?.getRoomState(socket);
                    break;
                case "MESSAGE" : 
                    room?.message(socket, parsedMessage.payload)
                    break;
                case "START_DRAWING" : 
                    room?.drawEvent(socket, parsedMessage)
                    break;
                case "STOP_DRAWING" :
                    room?.drawEvent(socket, parsedMessage)
                    break;
                case "DRAW":
                    room?.drawEvent(socket, parsedMessage)
                    break;
                case  "CLEAR" : 
                    room?.drawEvent(socket, parsedMessage)
                    break;
                default:
                    console.warn("Unhandled message type:", parsedMessage.type);
                    break;
            }
            
        });
    }
    


}