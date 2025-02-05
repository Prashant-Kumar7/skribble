"use client"

import { useRef, useState, useEffect } from "react";
import parse from 'html-react-parser';
import axios from "axios";

export default function Home() {

  const [svg, setSvg] = useState<React.ReactNode>()
  const [count, setCount] = useState<number>(0)

  useEffect(()=>{
    axios.get("https://api.dicebear.com/7.x/bottts/svg?seed="+ count).then((res)=>{
      setSvg(parse(res.data))
    })
  },[count])


  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="flex">
        <div onClick={()=>setCount((prerv)=>prerv-1)} className="text-4xl cursor-pointer hover:text-gray-500 font-semibold flex items-center">
          <span>
            {"<"}
          </span>
        </div>
        {svg}
        <div onClick={()=>setCount((prerv)=>prerv+1)} className="text-4xl cursor-pointer hover:text-gray-500 font-semibold flex items-center">
          <span>
            {">"}
          </span>
        </div>
      </div>
    </div>
  );
}
