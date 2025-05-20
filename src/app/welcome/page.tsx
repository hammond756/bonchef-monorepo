"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <Image
          src="/icon.png"
          alt="Bonchef logo"
          width={120}
          height={120}
          className="mb-2"
        />
        <h1 className="text-3xl font-bold text-center">Bonchef</h1>
        <p className="text-lg text-center text-slate-600 mb-4">
          Jouw sociale kookboek
        </p>
        <ul className="text-left text-slate-700 mb-6 space-y-2">
          <li>• Bewaar al jouw recepten op één plek</li>
          <li>• Laat je inspireren door enthousiaste koks</li>
          <li>• Deel jouw recepten met je vrienden</li>
        </ul>
        <div className="flex flex-col items-center gap-2">
          <span className="text-base text-slate-700">Wil je mee doen? Plaats dan je eerste recept</span>
          <Link href="/first-recipe">
            <Button className="w-32">Begin</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
