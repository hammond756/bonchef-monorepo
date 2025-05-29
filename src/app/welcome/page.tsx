"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 bg-white border border-slate-200 rounded-xl shadow-lg p-8 max-w-md w-full">
        <Image
          src="/icon.png"
          alt="Bonchef logo"
          width={120}
          height={120}
          className="mb-2"
        />
        <h1 className="text-3xl font-bold text-center">Welkom bij Bonchef</h1>
        <p className="text-lg text-center text-slate-600 mb-4 font-bold">
          Jouw sociale kookboek
        </p>
        <ul className="text-left text-slate-700 mb-6 space-y-2">
          <li>• Bewaar al je favoriete recepten op één plek</li>
          <li>• Ontdek inspiratie van gepassioneerde koks</li>
          <li>• Deel je eigen creaties met vrienden</li>
        </ul>
        <div className="flex flex-col items-center gap-2">
          <Link href="/first-recipe">
            <Button>Voeg je eerste recept toe</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
