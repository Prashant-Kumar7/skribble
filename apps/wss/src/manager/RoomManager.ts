import { WebSocket } from "ws"

interface RoomState {
    strokes  : string
    messages : string[]
}

interface Users {
    [key : string] : WebSocket | null
}


interface Host {
    socket : WebSocket | null
    username : string
}

interface GameSettings {
    timeSlot : number,
    diffuclty : "hard" | "easy" | "medium",
    noOfRounds : number
}

interface GameState {
    currentDrawing : WebSocket | null,
    timer : NodeJS.Timeout | null,
    currentTime : number,
    wordToGuess : string
}


export class RoomManager {
    private participants : Users
    public roomId : string
    private host : Host
    // private admin : WebSocket | null
    private GameState : GameState
    private usernames : string[]
    constructor(roomId : string, username : string){
        this.participants = {}
        this.roomId = roomId
        this.host = {
            username : username,
            socket : null
        }
        this.usernames = []
        this.GameState = {
            currentDrawing : null,
            timer : null,
            currentTime : 0,
            wordToGuess : ""
        }
    }

    joinHttp(username : string){
        this.usernames.push(username)
        this.participants = {
            ...this.participants,
            [username] : null
        }
    }

    randomizePlayers() {
        this.usernames.sort(function(){return 0.5 - Math.random()})
    }

    startGame(){
        this.randomizePlayers()
    }


    join( username : string, socket : WebSocket){
        // if(this.host.username === username){
        //     this.host.socket = socket
        //     // this.participants.push({socket : this.host.socket, username : this.host.username})
        //     this.participants = {
        //         ...this.participants,
        //         [username] : socket
        //     }
        // } else{

        //     this.participants = {
        //         ...this.participants,
        //         [username] : socket
        //     }
        //     // console.log("user found", user)


        //     // this.participants.push({socket : socket , username : username})
            
        //     // if(user){
        //     // }
        // }
        this.participants = {
            ...this.participants,
            [username] : socket
        }

        console.log(this.participants)
    }

    message(ws : WebSocket, message : string){

        // const sender = this.participants.find((user)=>{
        //     return user.socket === ws
        // })
        // this.participants.map((user)=>{
        //     user.socket?.send(JSON.stringify({type : "MESSAGE", payload : `${sender?.username} : ${message}`}))
        // })
    }

    

    getRoomState(socket: WebSocket){
        
    }

    drawEvent(socket: WebSocket, parsedMessage : any){
        
        this.usernames.forEach((user)=>{
            if(socket != this.participants[user]){
                this.participants[user]?.send(JSON.stringify(parsedMessage))
            }
        })
    }

    
    
    leave(socket : WebSocket , username : string){
        // const index = this.participants.indexOf({socket : socket , username : username})
        // this.participants.splice(index, 1);
        // socket.close(1000 , "you left the room")
    }

    
}
