"use client";

import GameOptions from "@/components/game-options";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>("#000000");
  const [size, setSize] = useState<number>(5);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const params = useParams<{ roomId: string}>()
  const [name, setName] = useState("")
  const [rounds, setRounds] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [startClick, setStartClick] = useState(false)
  
  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    const username = localStorage.getItem("username");
    if(username)setName(username)

    newSocket.onopen = () => {
      console.log("Connected to WebSocket server");
      newSocket.send(JSON.stringify({type : "JOIN_ROOM", roomId : params.roomId[0], name : username}))
      setSocket(newSocket);
    };

    

    newSocket.onmessage = (event) => {
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
    </div>
    <div className="col-span-1">

    </div>
    <div className=" col-span-2 mt-16">
      {/* <span>chat</span> */}
      {/* <div className="w-full h-full">
        <select name="Level" id="">
          <option value="easy">easy</option>
          <option value="medium">medium</option>
          <option value="hard">hard</option>
        </select>
        <select name="Rounds" id="">
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select>
        <select name="Time to Guess" id="">
          <option value="30">30</option>
          <option value="50">50</option>
          <option value="80">80</option>
          <option value="100">100</option>
          <option value="120">120</option>
        </select>
      </div> */}
      <GameOptions
      timeSlot={timeSlot}
      rounds={rounds}
      difficulty={difficulty}
      setRounds={setRounds}
      setTimeSlot={setTimeSlot}
      setDifficulty={setDifficulty}
      setStartClick = {setStartClick}
      />
    </div>
    </div>
  );
}
