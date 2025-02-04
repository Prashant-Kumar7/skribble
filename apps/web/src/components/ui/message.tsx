export const Message = ({message,index}: {message : string, index : number})=>{
    return (
        <div className={`p-2 ${index%2===0? "bg-zinc-700" : "bg-zinc-900" }`}>
            {message}
        </div>
    )
}