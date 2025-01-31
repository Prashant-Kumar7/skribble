"use client"

import { useRef, useState, useEffect } from "react";

export default function Home() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [context , setContext] = useState<string>("")



    const clearDrawing = () => {
        if (canvasRef.current && contextRef.current) {
          const canvas = canvasRef.current;
          const context = contextRef.current;
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if(!false) return
    if (!contextRef.current) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    const canvas = canvasRef.current;
    if(canvas){
        const dataURL = canvas.toDataURL();
        setContext(dataURL)
    }
    setIsDrawing(false);
  };


  return (
    <div
    style={{height : "100vh", width : "100%", backgroundColor : "white"}}
    className="w-screen h-screen ">
      <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
    </div>
  );
}
