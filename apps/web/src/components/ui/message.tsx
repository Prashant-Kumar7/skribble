export const Message = ({message,index}: {message : string, index : number})=>{
    return (
        <div className={`p-2 ${index%2===0? "bg-zinc-700" : "bg-zinc-900" } ${message.includes("Guessed the word")? "text-green-600 font-semibold" : message.includes("Close guess")? "text-orange-600 font-semibold" : ""}`}>
            {message}
        </div>
    )
}