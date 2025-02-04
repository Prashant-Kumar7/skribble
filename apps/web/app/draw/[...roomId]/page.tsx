"use client";

import GameOptions from "@/components/game-options";
import { Modal } from "@/components/modal";
import { Players } from "@/components/players";
import { Dialog, DialogContent, DialogTitle } from "@/components/scoreCard";
import { Message } from "@/components/ui/message";
import { WordToGuess } from "@/components/wordToGuess";
import axios from "axios";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState, useEffect, useMemo } from "react";

interface PlayersType {
  name : string,
  score : number,
  wordGuessed : boolean
}

interface LetterReveled {
  index : number
  letter : string
}


export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#000000");
  const [size, setSize] = useState<number>(5);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const params = useParams<{ roomId: string}>()
  const [name, setName] = useState("")
  const [rounds, setRounds] = useState(3)
  const [timeSlot, setTimeSlot] = useState(30)
  const [difficulty, setDifficulty] = useState("easy")
  const [startClick, setStartClick] = useState(false)
  const [counter, setCounter] = useState(0)
  const [word, setWord] = useState("")
  const [wordLength, setWordLength] = useState(0)
  const [players, setPlayers] = useState<PlayersType[]>([])
  const [letterArray, setLetterArray] = useState<string[]>([])
  const [isDrawingDisabled, setIsDrawingDisabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [roundOver, setRoundOver] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [currentUser, setCurrentUser] = useState("")
  const [input, setInput] = useState("")
  const [messageArray, setMessageArray] = useState<string[]>([])
  // const [wordMatched, setWordMatched] = useState(false)
  // const [letterReveled, setLetterReveled] = useState<LetterReveled[]>([])

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    const username = localStorage.getItem("username");
    if(username)setName(username)

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
      newSocket.send(JSON.stringify({type : "JOIN_ROOM", roomId : params.roomId[0], name : username}))
      setSocket(newSocket);
    };

    

    newSocket.onmessage = async(event) => {
      const data = JSON.parse(event.data);

      if (!ctxRef.current) return;

      switch (data.type) {
        case "START_DRAWING":
          ctxRef.current.beginPath();
          ctxRef.current.moveTo(data.x, data.y);
          break;
        case "DRAW":
          drawOnCanvas(data.x, data.y, data.color, data.size);
          break;
        case "STOP_DRAWING":
          ctxRef.current.closePath();
          break;
        case  "CLEAR":
          if(canvasRef.current)
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          break
        case "START_GAME" : 
          setStartClick(true)
          console.log(data.payload)
          break;
        case "TIMER":
          setCounter(timeSlot - data.time)
          break;
        case "SECOND_TIMER_STOPPED": 
          // setIsDrawingDisabled(false)
          setCurrentUser("")
          setIsModalOpen(true)
          setRoundOver(true)
          setWord("")
          setLetterArray([])
          setWordLength(0)
          setIsDrawingDisabled(true)
          setPlayers((prev: any)=>{
            return prev.map((player : PlayersType)=>{
              player.wordGuessed = false
              return player
            })
          })
          console.log("Round end")
          if(canvasRef.current)ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          break;
        case "GET_WORD":
          console.log(data)
          setCurrentRound(data.currentRoundNo)
          // setGameStarted(true)
          setRoundOver(false)
          setCurrentUser(data.currentUser)
          setIsModalOpen(true)
          setWord(data.word)
          setIsDrawingDisabled(false)
          const gameSettings = data.gameSetting
          setDifficulty(gameSettings.diffuclty)
          setTimeSlot(Number(gameSettings.timeSlot))
          setRounds(Number(gameSettings.rounds))
          socket?.send(JSON.stringify({type : "TIMER", roomId : params.roomId[0]}))
          break;
        case "WORD":
          setWord(data.word)
          setCurrentRound(data.currentRoundNo)
          setCurrentUser(data.currentUser)
          setIsModalOpen(true)
          setRoundOver(false)
          setIsDrawingDisabled(false)
          console.log(data)
          break;
        case "SECOND_TIMER":
          // console.log(data)
          setIsModalOpen(false)
          setCounter(data.time)
          // if(data.word){
          //   setWord(data.word)
          // }
          if(data.reveledIndex && data.letterReveled){
            console.log(data.reveledIndex , data.letterReveled)
            setLetterArray((items)=>{
              const newArray = [...items]; // Create a shallow copy
              newArray[data.reveledIndex] = data.letterReveled; // Modify the copy
              return newArray
            })
          }
          break
        case "PLAYERS":
          setPlayers(data.players)
          break;
        case "WORD_LENGTH":
          setRoundOver(false)
          setCurrentRound(data.currentRoundNo)
          setCurrentUser(data.currentUser)
          setWordLength(data.wordLength)
          setLetterArray(new Array(data.wordLength).fill(""))
          break;
        case "MESSAGE":
          setMessageArray((prev)=>{
            return [...prev, data.message]
          })
          break;
        case "WORD_MATCHED":
          setMessageArray((prev)=>{
            return [...prev, data.message]
          })
          
          setPlayers((prev: any)=>{
            console.log(prev)
            return prev.map((user: PlayersType)=>{
              console.log(user)
              if(user.name===data.username){
                user.wordGuessed = true
              }
              return user
            })
          })
          break;
        case "GAME_OVER":
          console.log(data)
          setWordLength(0)
          setCurrentUser("")
          setWord("")
          setRoundOver(false)
          setCurrentRound(0)
          break;

      }
    };

    return () =>{
      newSocket.close();
    }

  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 955; // 60rem * 16 (assuming 1rem = 16px)
      canvas.height = 640; // 40rem * 16 (assuming 1rem = 16px)
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctxRef.current = ctx;
      }
    }
  }, []);


  useEffect(()=>{
    if(startClick)
    socket?.send(JSON.stringify({type : "START_GAME", roomId : params.roomId[0]}))
  },[startClick])

  useEffect(()=>{
    if(timeSlot-counter <= 0){
      socket?.send(JSON.stringify({type : "ROUND_END", roomId : params.roomId[0]}))
    }    
  },[counter])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctxRef.current || isDrawingDisabled) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setDrawing(true);

    socket?.send(
      JSON.stringify({
        type: "START_DRAWING",
        roomId : params.roomId[0],
        x,
        y,
      })
    );
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !ctxRef.current || !socket || isDrawingDisabled) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    drawOnCanvas(x, y, color, size);

    socket.send(
      JSON.stringify({
        type: "DRAW",
        x,
        y,
        color,
        size,
        roomId : params.roomId[0]
      })
    );
  };

  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.closePath();
    }
    setDrawing(false);

    socket?.send(
      JSON.stringify({
        type: "STOP_DRAWING",
        roomId : params.roomId[0]

      })
    );
  };

  const drawOnCanvas = (x: number, y: number, strokeColor: string, strokeSize: number) => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = strokeColor;
    ctxRef.current.lineWidth = strokeSize;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const clearCanvas = () => {
    if (ctxRef.current && canvasRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    socket?.send(JSON.stringify({type : "CLEAR", roomId : params.roomId[0]}))
  };

  const sendMessage = () =>{
    socket?.send(JSON.stringify({type : "MESSAGE", roomId : params.roomId[0], message : input, username : name}))
    setInput("")
  }

  return (
    <div className="w-screen h-screen grid grid-cols-12">
      <div className="col-span-2 p-4">
        <div className="text-xl flex justify-between">
          <span>Players</span>
          <span>Round No. {currentRound}</span>
        </div>

        {players.map((player, index)=>{
          return (
            <Players
            key={index}
            player={player.name}
            wordGuessed={player.wordGuessed}
            score={player.score}
            currentUser={currentUser}
            />
          )
        })}


      </div>
      <div style={{height : "40rem" , width : "60rem"}} className="flex flex-col col-span-6 mt-10 justify-center items-center flex-col-reverse">
      <div className="mb-2">
        <label>Color: </label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <label className="ml-4">Size: </label>
        <input
          type="number"
          value={size}
          min="1"
          max="50"
          onChange={(e) => setSize(Number(e.target.value))}
        />
        <button onClick={clearCanvas} className="ml-4 px-3 py-1 bg-red-500 text-white rounded">
          Clear
        </button>
        

      </div>
      <canvas
        ref={canvasRef}
        style={{ backgroundColor: "white"}}
        className="border-2 border-gray-500"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}

      />
      <div className="w-full">
        <div style={{marginBottom : "-2rem"}} className="text-left mt-10"> Timer : {timeSlot - counter} Sec</div>
        {/* <div className="w-full text-2xl text-center">{isDrawingDisabled? `Word length : ${wordLength}` : `Word : ${word}`}</div> */}
        <div className="flex w-full justify-center">
          {isDrawingDisabled? 
            <div className="flex gap-1 mb-2">
              {letterArray.map((item , index)=>{
                return (
                  <WordToGuess
                  key={index}
                  letter={item}
                  />
                )
              })}
            </div>
            : <span className="font-semibold text-2xl">{word}</span> 
          }
        </div>
      </div>
    </div>
    <div className="col-span-1">

    </div>
    <div className=" col-span-3 mt-10">
      {/* <span>chat</span> */}
      {currentRound !=0 ? 
       <div className="w-full h-full pr-4 grid grid-rows-12">
        <div className="row-span-10 bg-zinc-800 p-2">
          <div style={{borderRadius : "0.25rem", height : "37rem"}} className="h-full bg-zinc-900 flex flex-col w-full bg-red-500 overflow-y-auto">
            {messageArray.map((item, index)=>{
              return (
                <Message
                key={index}
                index={index}
                message={item}
                />
              )
            })}
          </div>
        </div>
        <div className="row-span-1 px-2 pb-2 bg-zinc-800">
          <div style={{	borderRadius : "0.33rem"}} className="flex bg-zinc-900 h-full w-full">
            <input onKeyDown={(e)=>{
              if(e.key === "Enter")sendMessage()
            }} onChange={(e)=>setInput(e.target.value)} value={input} className="px-1  w-full bg-transparent h-full  border-x-0 border-y-0 focus:ring-0 focus:outline-none" type="text" placeholder="Enter you guess"/>
            <button onClick={sendMessage} className=" p-2 ">send</button>
          </div>
        </div>
       </div>
       : 
       <div className="w-full h-full flex flex-col">
       <div className="flex justify-between items-center m-2">
         <span>Diffuclty :</span>
         <select onChange={(e)=>setDifficulty(e.target.value)} name="Level" id="">
           <option value="easy">easy</option>
           <option value="medium">medium</option>
           <option value="hard">hard</option>
         </select>
       </div>
       <div className="flex justify-between items-center m-2">
         <span>No. of Rounds :</span>
         <select onChange={(e)=>setRounds(Number(e.target.value))} name="Rounds" id="">
           <option value="3">3</option>
           <option value="4">4</option>
           <option value="5">5</option>
           <option value="6">6</option>
           <option value="7">7</option>
         </select>
       </div>
       <div className="flex justify-between items-center m-2">
         <span>Time to guess :</span>
         <select onChange={(e)=>setTimeSlot(Number(e.target.value))} name="TimeSlot" id="">
           <option value="30">30</option>
           <option value="50">50</option>
           <option value="80">80</option>
           <option value="100">100</option>
           <option value="120">120</option>
         </select>
       </div>
       <button onClick={()=>{
         
         socket?.send(JSON.stringify({
           type : "GET_WORD", 
           roomId : params.roomId[0],
           gameSettings : {
             difficulty : difficulty, 
             timeSlot : timeSlot, 
             rounds : rounds
           }
         }))
         
       }} className="ml-4 px-3 py-1 bg-green-500 text-white rounded">
         Start
       </button>
     </div>}
      
    </div>
    <Dialog open={isModalOpen} onOpenChange={()=>setIsModalOpen(false)}>
      <DialogContent  className="border-0 w-full h-full  flex justify-center items-center">
        {roundOver? <div className="flex w-full flex-col px-12 gap-10">
        <DialogTitle style={{marginTop : "-10rem"}} className="text-center text-4xl">Round Over</DialogTitle>
          <div className="w-full h-full flex flex-col">
            <div className="flex justify-between w-full text-2xl">
              <span>Player</span>
              <span>points</span>
            </div>
          </div>
        </div>: word != "" ? <DialogTitle>your word is {word}</DialogTitle> : wordLength != 0 ? <DialogTitle>{currentUser} is drawing</DialogTitle>
         : <div className="flex w-full flex-col px-12 gap-10">
          <X onClick={()=>setIsModalOpen(false)} className="h-4 w-4" />
          <DialogTitle>
            Game Over      
          </DialogTitle>
         </div> }
      </DialogContent>
    </Dialog>
    
    </div>
  );
}




