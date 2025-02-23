"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, Pencil, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

const Spinner = () => <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>

export default function Home() {
  const [roomId, setRoomId] = useState("")
  const [name, setName] = useState("")
  const [avatarSeed, setAvatarSeed] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const router = useRouter()

  const generateAvatar = useCallback(async () => {
    setIsAvatarLoading(true)
    try {
      const response = await axios.get(`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed + Math.random()}`)
      setAvatarUrl(response.data)
    } catch (error) {
      console.error("Failed to fetch avatar:", error)
    } finally {
      setIsAvatarLoading(false)
    }
  }, [avatarSeed])

  const handlePrevAvatar = () => {
    setAvatarSeed((prev) => Math.max(1, prev - 1))
  }

  const handleNextAvatar = () => {
    setAvatarSeed((prev) => prev + 1)
  }

  const handleCreateRoom = async(e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("username", name);
    const res = await axios.post("https://skribble.tumsab.xyz/api/v1/create-room", {name : name, avatar : avatarUrl})
    router.push(`/draw/${res.data.roomId}`)
    // console.log("Creating room:", { name, avatarUrl })
  }

  const handleJoinRoom = async(e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("username", name);
    const res =await axios.post("https://skribble.tumsab.xyz/api/v1/join-room", {name : name, roomId : roomId, avatar : avatarUrl})
    if(res.data.err){
      console.log(res.data.err)
    }else{
      router.push(`/draw/${res.data.roomId}`)
    }
    console.log("Joining room:", { roomId, name, avatarUrl })
  }

  useEffect(() => {
    generateAvatar()
  }, [generateAvatar])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-600">Pictionary</h1>
        <div className="flex justify-center">
          <div className="w-24 h-24">
            <Pencil className="w-full h-full text-blue-500" />
          </div>
        </div>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Room</TabsTrigger>
            <TabsTrigger value="join">Join Room</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-32 h-32">
                  {isAvatarLoading ? (
                    <Spinner />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: avatarUrl }} className="w-full h-full" />
                  )}
                  <Button
                    type="button"
                    onClick={handlePrevAvatar}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2"
                    size="icon"
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextAvatar}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    size="icon"
                    variant="outline"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">Select your avatar</span>
              </div>
              <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                Create Room
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="join">
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <Input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="w-full"
              />
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="relative w-32 h-32">
                  {isAvatarLoading ? (
                    <Spinner />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: avatarUrl }} className="w-full h-full" />
                  )}
                  <Button
                    type="button"
                    onClick={handlePrevAvatar}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2"
                    size="icon"
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextAvatar}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    size="icon"
                    variant="outline"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">Select your avatar</span>
              </div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                Join Room
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="text-center text-sm text-gray-500">
          <p>Draw, guess, and have fun with friends!</p>
          <div className="flex items-center justify-center mt-2">
            <Users className="w-4 h-4 mr-1" />
            <span>2-8 players recommended</span>
          </div>
        </div>
      </div>
    </div>
  )
}

