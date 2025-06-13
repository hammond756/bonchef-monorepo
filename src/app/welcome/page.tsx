"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
                <Image
                    src="/icon.png"
                    alt="Bonchef logo"
                    width={120}
                    height={120}
                    className="mb-2"
                />
                <h1 className="text-center text-3xl font-bold">Welkom bij Bonchef</h1>
                <p className="mb-4 text-center text-lg font-bold text-slate-600">
                    Jouw sociale kookboek
                </p>
                <ul className="mb-6 space-y-2 text-left text-slate-700">
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
