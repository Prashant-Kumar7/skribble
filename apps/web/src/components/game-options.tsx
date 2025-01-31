"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { toast } from "@/components/ui/use-toast"

export default function GameOptions({
    rounds,
    setRounds,
    timeSlot,
    setTimeSlot,
    difficulty,
    setDifficulty,
    setStartClick

}: {
    rounds : string,
    setRounds : any,
    timeSlot : string,
    setTimeSlot : any,
    difficulty : string,
    setDifficulty : any
    setStartClick : any
}) {
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStartClick(true)
    if (!rounds || !timeSlot || !difficulty) {
    //   toast({
    //     title: "Error",
    //     description: "Please select all options before submitting.",
    //     variant: "destructive",
    //   })
      return
    }

    // Here you would typically send this data to your game logic or API

    // toast({
    //   title: "Game Options Set",
    //   description: `Rounds: ${rounds}, Time: ${timeSlot}, Difficulty: ${difficulty}`,
    // })
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Game Options</CardTitle>
        <CardDescription>Set up your game parameters</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="rounds"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Number of Rounds
            </label>
            <Select onValueChange={setRounds} value={rounds}>
              <SelectTrigger id="rounds">
                <SelectValue placeholder="Select rounds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Rounds</SelectItem>
                <SelectItem value="5">5 Rounds</SelectItem>
                <SelectItem value="7">7 Rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="timeSlot"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Time Slot
            </label>
            <Select onValueChange={setTimeSlot} value={timeSlot}>
              <SelectTrigger id="timeSlot">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="difficulty"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Difficulty
            </label>
            <Select onValueChange={setDifficulty} value={difficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Start Game
        </Button>
      </CardFooter>
    </Card>
  )
}

