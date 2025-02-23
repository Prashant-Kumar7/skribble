import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface JoinRoomFormProps {
  onClose: () => void
  avatar : string
}

export function JoinRoomForm({ onClose, avatar }: JoinRoomFormProps) {
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const router = useRouter()
  const [errMsg, setErrMsg] = useState("")
  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    // Handle room joining logic here
    console.log('Joining room:', roomId, 'as:', name)
    localStorage.setItem("username", name);
    const res =await axios.post("https://skribble.tumsab.xyz/api/v1/join-room", {name : name, roomId : roomId, avatar : avatar})
    if(res.data.err){
      setErrMsg(res.data.err)
    }else{
      onClose()
      router.push(`/draw/${res.data.roomId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="join-name">Your Name</Label>
        <Input
          id="join-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div>
        <Label htmlFor="room-id">Room ID</Label>
        <Input
          id="room-id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
          required
        />
      </div>
      <span className='text-red-500 my-2'>{errMsg}</span>
      <Button type="submit">Join Room</Button>
    </form>
  )
}

