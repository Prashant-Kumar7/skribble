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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle room joining logic here
    console.log('Joining room:', roomId, 'as:', name)
    localStorage.setItem("username", name);
    axios.post("http://localhost:3000/api/v1/join-room", {name : name, roomId : roomId}).then((res)=>{
        router.push(`/draw/${res.data.roomId}`)
    })
    onClose()
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
      <Button type="submit">Join Room</Button>
    </form>
  )
}

