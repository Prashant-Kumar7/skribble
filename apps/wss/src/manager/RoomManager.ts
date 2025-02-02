import axios from "axios"
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
    indexOfUser : number
    wordToGuess : string
    // secondTimer: null | NodeJS.Timeout
    secondTimer: any
    secondTime : number
}


export class RoomManager {
    private participants : Users
    public roomId : string
    private host : Host
    // private admin : WebSocket | null
    private GameState : GameState
    private usernames : string[]
    private GameSetting : GameSettings


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
            wordToGuess : "",
            indexOfUser : 0,
            secondTime: 0,
            secondTimer: null
        }
        this.GameSetting = {
            noOfRounds : 0,
            timeSlot : 0,
            diffuclty : "easy"
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
        this.usernames = this.usernames.sort(function(){return 0.5 - Math.random()})
    }

    startGame(socket : WebSocket, parsedMessage : any){
        if(socket === this.host.socket){
            this.randomizePlayers()
            this.GameSetting = {
                ...this.GameSetting,
                timeSlot : parsedMessage.timeSlot,
                noOfRounds : parsedMessage.noOfRounds,
                diffuclty : parsedMessage.diffuclty
            }

            // this.gameState(socket, parsedMessage)
            this.usernames.forEach((user)=>{
                if(socket != this.participants[user]){
                    this.participants[user]?.send(JSON.stringify({type : "START_GAME", payload : this.GameState}))
                }
            })
        }
    }

    gameState(socket : WebSocket, parsedMessage : any){

        this.GameState = {
            ...this.GameState,
            currentDrawing : this.participants[this.usernames[this.GameState.indexOfUser]],
            wordToGuess : parsedMessage.word,
        }
    }

    async getRandomWord(){
        const options = {
            method: 'GET',
            url: 'https://pictionary-charades-word-generator.p.rapidapi.com/pictionary',
            params: {difficulty: 'easy'},
            headers: {
              'x-rapidapi-key': '3db60b20b3mshda7fd392c482e24p164e0fjsnc133203e3533',
              'x-rapidapi-host': 'pictionary-charades-word-generator.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            this.GameState.wordToGuess = response.data.word
            
            this.usernames.forEach((user)=>{
                this.participants[user]?.send(JSON.stringify({type : "GET_WORD", word : this.GameState}))
            })
        } catch (error) {
            console.error(error);
        }
        // this.usernames.forEach((user)=>{
        //     this.participants[user]?.send(JSON.stringify({type : "GET_WORD", word : message.word}))
        // })
        // socket.send(JSON.stringify({type : "GET_WORD", word : message.word}))
        // console.log("start event tiggered")
    }


    


    join( username : string, socket : WebSocket){
        if(this.host.username === username){
            this.host.socket = socket
        }
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
        this.usernames.forEach((user)=>{
            this.participants[user]?.send(JSON.stringify({type : "PLAYERS", players : this.usernames}))
        })
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


    async secondTimerOfGame(socket : WebSocket, message : any){
        console.log("second timer started")
        const gameSettings = message.gameSettings

        this.GameSetting.diffuclty = gameSettings.diffuclty
        this.GameSetting.timeSlot = gameSettings.timeSlot
        this.GameSetting.noOfRounds = gameSettings.rounds

        const options = {
            method: 'GET',
            url: 'https://pictionary-charades-word-generator.p.rapidapi.com/charades',
            params: {difficulty: 'easy'},
            headers: {
              'x-rapidapi-key': 'd45294517dmsh2552cb4e52f16d3p1baaf1jsn54f81eb192ce',
              'x-rapidapi-host': 'pictionary-charades-word-generator.p.rapidapi.com'
            }
        };

        const result = await axios.request(options)
        this.GameState.wordToGuess = result.data.word
        this.usernames.forEach((user)=>{
            this.participants[user]?.send(JSON.stringify({type : "GET_WORD", word : this.GameState.wordToGuess, gameSetting : this.GameSetting}))
        })
        this.GameState.secondTimer = setInterval(() => {
            this.GameState.secondTime = this.GameState.secondTime + 1
            this.usernames.forEach((user)=>{
                this.participants[user]?.send(JSON.stringify({type : "SECOND_TIMER", time: this.GameState.secondTime}))
            })
        }, 1000);
    }

    // Stop the second timer if needed
    async stopSecondTimer(socket: WebSocket) {
        if (this.GameState.secondTimer) {
            console.log("Time stopped");
            clearInterval(this.GameState.secondTimer);
            this.GameState.secondTimer = null;
            this.GameState.secondTime = 0;
    
            // Notify clients that the timer has stopped
            this.usernames.forEach((user) => {
                this.participants[user]?.send(
                    JSON.stringify({ type: "SECOND_TIMER_STOPPED", time: 0 })
                );
            });
            const options = {
                method: 'GET',
                url: 'https://pictionary-charades-word-generator.p.rapidapi.com/charades',
                params: {difficulty: 'easy'},
                headers: {
                  'x-rapidapi-key': 'd45294517dmsh2552cb4e52f16d3p1baaf1jsn54f81eb192ce',
                  'x-rapidapi-host': 'pictionary-charades-word-generator.p.rapidapi.com'
                }
            };

            const result = await axios.request(options)
            this.GameState.wordToGuess = result.data.word
            setTimeout(()=>{
                this.usernames.forEach((user) => {
                    this.participants[user]?.send(
                        JSON.stringify({ type: "WORD", word : this.GameState.wordToGuess })
                    );
                });
            },2000)

            // Restart the timer after a 2-second delay
            setTimeout(() => {
                console.log("Restarting timer...");
                this.GameState.secondTimer = setInterval(() => {
                    this.GameState.secondTime += 1;
                    this.usernames.forEach((user) => {
                        this.participants[user]?.send(
                            JSON.stringify({ type: "SECOND_TIMER", time: this.GameState.secondTime, word : this.GameState.wordToGuess })
                        );
                    });
                }, 1000);
            }, 5000); // 2-second delay before restarting
        }
    }

    // Start both timers (or individually if needed)
    

    // Reset both timers
    resetTimers(socket: WebSocket) {
        
        if (this.GameState.secondTimer) {
            clearInterval(this.GameState.secondTimer);
            this.GameState.secondTimer = null;
            this.GameState.secondTime = 0;
        }
        socket.send(JSON.stringify({type: "TIMER_RESET"}));
    }
    
}
