import parse from 'html-react-parser';

export const Players = ({player, currentUser, wordGuessed, score, avatar} : {player : string, currentUser : string, wordGuessed:boolean, score : number, avatar : string})=>{
    return (
        <div className={`flex sm:text-lg p-2 bg-gray-200 text-sm text-black justify-between items-center ${wordGuessed? "bg-green-400" : ""}`}>
          <div className="flex items-center gap-2 justify-center">
            <div>
              {parse(avatar)}
            </div>
            <div className='flex flex-col gap-2 justify-center'>
              <span>{player}</span>
              <span>points {score} </span>
            </div>
          </div>
          <div className="flex">
            <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={player===currentUser?`size-6`: "hidden"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </div>
        </div>
    )
}