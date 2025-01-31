'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Modal } from '@/components/modal'
import { CreateRoomForm } from '@/components/create-room-form'
import { JoinRoomForm } from '@/components/join-room-form'

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<'create' | 'join' | null>(null)

  const openModal = (content: 'create' | 'join') => {
    setModalContent(content)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <h1 className="text-4xl font-bold text-white mb-8">Welcome to Video Chat</h1>
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
        {modalContent === 'create' && <CreateRoomForm onClose={closeModal} />}
        {modalContent === 'join' && <JoinRoomForm onClose={closeModal} />}
      </Modal>
    </div>
  )
}

