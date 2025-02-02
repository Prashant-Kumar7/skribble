export const Players = ({player} : {player : string})=>{
    return (
        <div className="flex p-2 bg-gray-200 text-lg text-black justify-between">
          <span>{player}</span>
          <span>points 0</span>
        </div>
    )
} 