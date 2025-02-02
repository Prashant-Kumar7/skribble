"use client";

import GameOptions from "@/components/game-options";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  const [players, setPlayes] = useState<any[]>([])

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
          console.log("Round end")
          // setCounter(timeSlot)
          // await delay(3000)
          // console.log("Round Started")
          // const options = {
          //   method: 'GET',
          //   url: 'https://pictionary-charades-word-generator.p.rapidapi.com/pictionary',
          //   params: {difficulty: difficulty},
          //   headers: {
          //     'x-rapidapi-key': '3db60b20b3mshda7fd392c482e24p164e0fjsnc133203e3533',
          //     'x-rapidapi-host': 'pictionary-charades-word-generator.p.rapidapi.com'
          //   }
          // };
          // axios.request(options).then((res)=>{
          //   socket?.send(JSON.stringify({
          //     type : "GET_WORD", 
          //     roomId : params.roomId[0], 
          //     word : res.data.word, 
          //     gameSettings : {
          //       difficulty : difficulty, 
          //       timeSlot : timeSlot,
          //       rounds : rounds
          //     }
          //   }))            
          // })

          break;
        case "GET_WORD":
          console.log(data)
          setWord(data.word)
          const gameSettings = data.gameSetting
          setDifficulty(gameSettings.diffuclty)
          setTimeSlot(Number(gameSettings.timeSlot))
          setRounds(Number(gameSettings.rounds))
          socket?.send(JSON.stringify({type : "TIMER", roomId : params.roomId[0]}))
          break;
        case "WORD":
          setWord(data.word)
          console.log(data.word)
          break;
        case "SECOND_TIMER":
          // console.log(data)
          setCounter(data.time)
          if(data.word){
            setWord(data.word)
          }
          break
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
    if (!ctxRef.current) return;
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
    if (!drawing || !ctxRef.current || !socket) return;
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

  return (
    <div className="w-screen h-screen grid grid-cols-12">
      <div className="col-span-2 p-4">
        <span className="text-xl">Participants</span>

        <div className="flex p-2 bg-gray-200 text-lg text-black justify-between">
          <span>prashant</span>
          <span>points 0</span>
        </div>


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
        <div className="w-full text-2xl text-center"> Word : {word}</div>
      </div>
    </div>
    <div className="col-span-1">

    </div>
    <div className=" col-span-2 mt-16">
      {/* <span>chat</span> */}
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
      </div>
      {/* <GameOptions
      timeSlot={timeSlot}
      rounds={rounds}
      difficulty={difficulty}
      setRounds={setRounds}
      setTimeSlot={setTimeSlot}
      setDifficulty={setDifficulty}
      setStartClick = {setStartClick}
      /> */}
    </div>
    </div>
  );
}
