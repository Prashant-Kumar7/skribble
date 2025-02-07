import { NextRequest, NextResponse } from "next/server";
import jwt  from "jsonwebtoken"
import { redisClient } from "../../../../lib/functions";

const secretKey = "secret";


export const POST = async(req : NextRequest)=>{
    const {name , avatar} = await req.json()
    const roomId = generateId()
    const processId =  crypto.randomUUID()
    // const payload = `${roomId}_HOST`
    // const token: string = jwt.sign(payload, secretKey);
    // const roomToken: string = jwt.sign(payload, secretKey);
    
    await redisClient.lPush("room", JSON.stringify({type: "CREATE", roomId : roomId, avatar:avatar, name : name, processId : processId}))
    await redisClient.brPop(processId, 0)
    console.log(roomId)
    return NextResponse.json({
        roomId : roomId,
    })
}


function generateId (){
    const generateSegment = () => {
        return Array.from({ length: 3 }, () =>
            String.fromCharCode(97 + Math.floor(Math.random() * 26))
        ).join('');
    };
  
    return `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}
