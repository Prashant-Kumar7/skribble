import axios from "axios"
import { NextResponse } from "next/server"

export const GET = async()=>{
    const response = await axios.get("https://api.dicebear.com/7.x/bottts/svg?seed="+ Math.random())
    let smallAvatar = response.data.slice(0,4) + ` style="width:3rem;height:3rem;" ` + response.data.slice(5, response.data.length)
    smallAvatar = smallAvatar.replace(`style="width:3rem;height:3rem;"`, `style="width:17rem;height:17rem;"`);

    const innerSpace = response.data.slice(0,4) + ` style={{width : "2rem", height  : "2rem"}} ` + response.data.slice(5, response.data.length)
    return NextResponse.json(smallAvatar)
}