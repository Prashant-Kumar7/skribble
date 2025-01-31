import { NextRequest, NextResponse } from "next/server";
import jwt  from "jsonwebtoken"
import { redisClient } from "../../../../lib/functions";


const secretKey = "secret";


export const POST = async(req : NextRequest)=>{
    const {roomId , name} = await req.json()
    
    const processId = crypto.randomUUID()
    
    // const decoded = jwt.verify(token as string, secretKey);

    await redisClient.lPush("room", JSON.stringify({type: "JOIN", roomId : roomId, name : name, processId : processId}))
    await redisClient.brPop(processId, 0)
    return NextResponse.json({
        roomId : roomId
    })
}
