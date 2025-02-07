// "use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { useRouter } from 'next/navigation'
interface CreateRoomFormProps {
  onClose: () => void
  avatar : string
}

export function CreateRoomForm({ onClose, avatar }: CreateRoomFormProps) {
    const [name, setName] = useState('')
    // const [roomId , setRoomId] = useState("")
    const router = useRouter()
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle room creation logic here
    console.log('Creating room for:', name)
    localStorage.setItem("username", name);
    axios.post("http://localhost:3000/api/v1/create-room", {name : name, avatar : avatar}).then((res)=>{
        // setRoomId(res.data.roomId)
        router.push(`/draw/${res.data.roomId}`)
    })

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="create-name">Your Name</Label>
        <Input
          id="create-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <Button type="submit">Create Room</Button>
    </form>
  )
}

