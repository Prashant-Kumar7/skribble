import axios from "axios"
import { NextResponse } from "next/server"

export const GET = async()=>{
    const response = await axios.get("https://api.dicebear.com/7.x/bottts/svg?seed="+ Math.random())
    console.log(response.data)
    return NextResponse.json(response.data)
}