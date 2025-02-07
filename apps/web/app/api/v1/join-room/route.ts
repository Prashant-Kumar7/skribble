import { NextRequest, NextResponse } from "next/server";
import jwt  from "jsonwebtoken"
import { redisClient } from "../../../../lib/functions";


const secretKey = "secret";


export const POST = async(req : NextRequest)=>{
    const {roomId , name, avatar} = await req.json()
    
    const processId = crypto.randomUUID()
    
    // const decoded = jwt.verify(token as string, secretKey);

    await redisClient.lPush("room", JSON.stringify({type: "JOIN", roomId : roomId, avatar:avatar, name : name, processId : processId}))
    const submission = await redisClient.brPop(processId, 0)

    if(submission?.element === "name exists"){
        return NextResponse.json({
            err : "name is taken exists"
        })
    }

    if(submission?.element === "room doesn't exists"){
        return NextResponse.json({
            err : "room doesn't exists"
        })
    }

    return NextResponse.json({
        roomId : roomId
    })
}
