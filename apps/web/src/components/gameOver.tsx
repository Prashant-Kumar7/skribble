import parse from 'html-react-parser';


export const GameOver = ({player, score, avatar, rank} : {player : string, score : number, avatar : string,rank: number})=>{

    const char = avatar.replace(`style="width:3rem;height:3rem;"`, `${rank=== 1 ? `style="width:11rem;height:11rem;"` : rank === 2 ? `style="width:7rem;height:7rem;"` : `style="width:4rem;height:4rem;"`}`);

    return (
        <>  
            {rank === 1? 
                    <>
                        <div></div>
                            <div className={`flex justify-center mb-6 flex-col items-center w-full span-col-1`}>
                            {parse(char)}
                            <div className='flex text-3xl gap-2 items-center'>
                                <div className=''>#{rank}st</div>
                                <div className=''>{player}</div>
                            </div>
                            <div className='text-lg'>{score} points</div>
                        </div>
                        <div></div>
                    </>
            : rank===2 ? 
            <>
                <div className={`flex justify-center mb-6 flex-col items-center w-full span-col-1`}>
                    {parse(char)}
                    <div className='flex text-2xl gap-2 items-center'>
                        <div className=''>#{rank}nd</div>
                        <div className=''>{player}</div>
                    </div>
                <div className='text-lg'>{score} points</div>
                </div>
                <div></div>
            </>
            : rank===3 ? 
                <div className={`flex justify-center mb-6 flex-col items-center w-full span-col-1`}>
                    {parse(char)}
                    <div className={`flex text-xl gap-2 items-center`}>
                        <div className=''>#{rank}rd</div>
                        <div className=''>{player}</div>
                    </div>
                <div className='text-lg'>{score} points</div>
                </div>
            : 
            <div className={`flex justify-center mb-6 p-6 flex-col items-center w-full span-col-1`}>
                {parse(char)}
                <div className={`flex text-xl gap-2 items-center`}>
                    <div className=''>#{rank}</div>
                    <div className=''>{player}</div>
                </div>
                <div className='text-lg'>{score} points</div>
            </div> }
            
        </>
    )
}