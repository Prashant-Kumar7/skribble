export const WordToGuess = ({letter} : {letter : string})=>{
    return (
        <span style={{width : "17.44px", height : "34.56px", padding : "0"}} className=" font-semibold border-b-4 text-2xl text-center">{letter}</span>
    )
}