import axios from "axios"
import { WebSocket } from "ws"
import { options } from ".."

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
    currentRoundNo : number
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
            secondTimer: null,
            currentRoundNo : 0
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
        
    }


    


    join( username : string, socket : WebSocket){
        if(this.host.username === username){
            this.host.socket = socket
        }
        
        this.participants = {
            ...this.participants,
            [username] : socket
        }

        this.usernames.forEach((user)=>{
            this.participants[user]?.send(JSON.stringify({type : "PLAYERS", players : this.usernames}))
        })
    }

    message(ws : WebSocket, message : string){

        
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
        // this.usernames = this.usernames.sort(function(){return 0.5 - Math.random()})
        const gameSettings = message.gameSettings
        this.GameSetting.diffuclty = gameSettings.diffuclty
        this.GameSetting.timeSlot = gameSettings.timeSlot
        this.GameSetting.noOfRounds = gameSettings.rounds
        this.GameState.currentRoundNo =  1
        

        

        const result = await axios.request(options)
        this.GameState.wordToGuess = result.data.word
        this.usernames.forEach((user)=>{
            if(user===this.usernames[this.GameState.indexOfUser]){
                this.participants[user]?.send(JSON.stringify({type : "GET_WORD", word : this.GameState.wordToGuess, gameSetting : this.GameSetting, currentRoundNo : this.GameState.currentRoundNo, currentUser : this.usernames[this.GameState.indexOfUser]}))
            }else{
                this.participants[user]?.send(JSON.stringify({type : "WORD_LENGTH", wordLength : this.GameState.wordToGuess.length, gameSetting : this.GameSetting, currentRoundNo : this.GameState.currentRoundNo, currentUser : this.usernames[this.GameState.indexOfUser]}))
            }
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


            
            if(this.GameState.indexOfUser < this.usernames.length - 1){
                this.GameState.indexOfUser = this.GameState.indexOfUser + 1 
            }else {
                this.GameState.indexOfUser = 0
                this.GameState.currentRoundNo = this.GameState.currentRoundNo + 1
                if(this.GameState.currentRoundNo > this.GameSetting.noOfRounds){
                    console.log("game Over")
                    clearInterval(this.GameState.secondTimer);
                    this.GameState.secondTimer = null;
                    this.GameState.secondTime = 0;
                    setTimeout(()=>{
                        this.usernames.forEach((user)=>{
                            this.participants[user]?.send(JSON.stringify({type: "GAME_OVER", time: 0}))
                        })
                    },5000)
                    
                    return
                }
            }



            

            const result = await axios.request(options)
            this.GameState.wordToGuess = result.data.word
            setTimeout(()=>{
                this.usernames.forEach((user) => {
                    if(user===this.usernames[this.GameState.indexOfUser]){
                        this.participants[user]?.send(JSON.stringify({ type: "WORD", word : this.GameState.wordToGuess, currentRoundNo : this.GameState.currentRoundNo, currentUser : this.usernames[this.GameState.indexOfUser] }));
                    }else{
                        this.participants[user]?.send(JSON.stringify({ type: "WORD_LENGTH", wordLength : this.GameState.wordToGuess.length, currentRoundNo : this.GameState.currentRoundNo, currentUser : this.usernames[this.GameState.indexOfUser] }));
                    }
                });
            },4000)

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
            }, 10000); // 2-second delay before restarting
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

    gameOver(){
        if (this.GameState.secondTimer) {
            console.log("game Over")
            clearInterval(this.GameState.secondTimer);
            this.GameState.secondTimer = null;
            this.GameState.secondTime = 0;
            this.usernames.forEach((user)=>{
                this.participants[user]?.send(JSON.stringify({type: "GAME_OVER", time: 0}))
            })
        }
    }
    
}
