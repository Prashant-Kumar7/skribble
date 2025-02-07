'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Modal } from '@/components/modal'
import { CreateRoomForm } from '@/components/create-room-form'
import { JoinRoomForm } from '@/components/join-room-form'
import axios from 'axios'
import parse from 'html-react-parser';


export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<'create' | 'join' | null>(null)
  const [svg, setSvg] = useState<string>("")
  const [count, setCount] = useState<number>(0)
  const [avatar, setAvatar] = useState<string>("")
  const [randomNumber, setRandomNumber] = useState<number>()

  const openModal = (content: 'create' | 'join') => {
    setModalContent(content)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  useEffect(()=>{
    setRandomNumber(Math.random())
  },[])

  useEffect(()=>{
    axios.get("https://api.dicebear.com/7.x/bottts/svg?seed="+ count+randomNumber).then((response)=>{
    const smallAvatar = response.data.slice(0,4) + ` style="width:3rem;height:3rem;" ` + response.data.slice(5, response.data.length)
    const largeAvatar = response.data.slice(0,4) + ` style="width:7rem;height:7rem;" ` + response.data.slice(5, response.data.length)
      setSvg(smallAvatar)
      setAvatar(largeAvatar)
    })
  },[count])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-4xl font-bold text-white mb-8">Welcome to Video Chat</h1>
      <div className="flex justify-center items-center">
      <div className="flex">
        <div onClick={()=>setCount((prerv)=>prerv-1)} className=" flex items-center p-4">
          <span className="text-4xl cursor-pointer hover:text-gray-300 font-semibold">
            {"<"}
          </span>
        </div>
        <div style={{width : "7rem", height : "7rem"}}>
          {parse(avatar)}
        </div>
        <div onClick={()=>setCount((prerv)=>prerv+1)} className="flex items-center p-4">
          <span className="text-4xl cursor-pointer hover:text-gray-300 font-semibold">
            {">"}
          </span>
        </div>
      </div>
    </div>
    <span className="text-2xl font-semibold text-white mb-8">Choose your Avatar</span>
      <div className="space-x-4">
        <Button onClick={() => openModal('create')} size="lg">
          Create Room
        </Button>
        <Button onClick={() => openModal('join')} size="lg" variant="secondary">
          Join Room
        </Button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={modalContent === 'create' ? 'Create a Room' : 'Join a Room'}
      >
        {modalContent === 'create' && <CreateRoomForm onClose={closeModal} avatar={svg} />}
        {modalContent === 'join' && <JoinRoomForm onClose={closeModal} avatar={svg} />}
      </Modal>
    </div>
  )
}

