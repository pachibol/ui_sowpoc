"use client"
import { Wizard } from "@/components/wizard"
import Image from "next/image"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-end justify-between mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ey_logo-8a0DYdd8Ab7AQz242yzrXQkOk6UTRX.png"
            alt="EY - Building a better working world"
            width={100}
            height={50}
            className="object-contain ml-4"
          />
          <h1 className="text-2xl font-bold text-center flex-1 ml-4">SOW Creator Wizard</h1>
          <div className="w-[100px]"></div> {/* Spacer to center the title */}
        </div>
      </div>
      <Wizard />
    </main>
  )
}
