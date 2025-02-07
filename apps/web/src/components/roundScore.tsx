export const RoundScore = ({name , points} : {name : string,  points : number | undefined})=>{
    return (
        <div className="flex justify-between w-full text-2xl">
            <span>{name}</span>
            <span className={`${typeof(points)==="number"? points>0? "text-green-500": "text-red-600" : ""}`} >+{points}</span>
        </div>
    )
}