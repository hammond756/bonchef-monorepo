"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useState } from "react"

interface ImageGenerationModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (settings: { camera_angle?: string; keukenstijl?: string }) => void
}

const CAMERA_ANGLES = [
    {
        label: "Top-down perspectief",
        value: "Maak de foto vanuit een volledig top-down perspectief, recht van boven. Dit benadrukt de symmetrie, kleuren en de presentatie van het gerecht. Zorg dat de randen van het bord aan elke zijde worden uitgesneden",
    },
    {
        label: "Close-up perspectief",
        value: "Maak de foto vanuit een close-up perspectief, waarbij je inzoomt op het gerecht om de textuur, ingrediënten en fijne details duidelijk naar voren te laten komen.",
    },
    {
        label: "Extreme close-up",
        value: "Maak een foto van het gerecht van extreem dichtbij. Het gerecht en de texturen en ingrediënten zijn hierdoor beeldvullend en we zien geen omgeving meer.",
    },
    {
        label: "Totaalshot met omgeving",
        value: "Maak de foto als een totaalshot, waarbij je het hele gerecht in beeld brengt samen met de tafelschikking en de sfeer van de omgeving, om een compleet beeld van de setting te geven.",
    },
]

const KITCHEN_STYLES = [
    {
        label: "Minimalistisch wit",
        value: "Plaats het gerecht in een minimalistische keuken met greeploze witte kasten en een effen wit aanrechtblad. Vrij van decoratie, met netjes weggewerkte apparatuur, biedt deze keuken een open en serene ruimte, verlicht door natuurlijk licht en subtiele ingebouwde LED-verlichting.",
    },
    {
        label: "Landelijk & gezellig",
        value: "Plaats het gerecht in een gezellige, landelijke keuken met houten elementen, open planken en een warme, huiselijke sfeer die uitnodigt tot comfort.",
    },
    {
        label: "Industrieel",
        value: "Plaats het gerecht in een industriële keukenomgeving met ruwe materialen zoals baksteen, metaal en hout, en een stoere, functionele uitstraling.",
    },
    {
        label: "Scandinavisch",
        value: "Plaats het gerecht in een scandinavische keuken met lichte kleuren, natuurlijke materialen en een minimalistisch design, wat zorgt voor een frisse en moderne sfeer.",
    },
    {
        label: "Modern luxe",
        value: "Plaats het gerecht in een keuken met een high-end design, gekenmerkt door strakke lijnen, unieke vormen en hoogwaardige materialen zoals marmer, glas en roestvrij staal. De keuken heeft een minimalistische uitstraling met geïntegreerde apparatuur en subtiele verlichting die de luxe en moderne sfeer benadrukken.",
    },
    {
        label: "Klassiek elegant",
        value: "Plaats het gerecht in een elegante, klassieke keuken met verfijnde details, houten kasten en een tijdloze uitstraling die traditie en stijl combineert.",
    },
    {
        label: "Buitenkeuken",
        value: "Plaats het gerecht in een buitenkeuken, omringd door natuurlijke elementen zoals hout, steen en groen. De keuken heeft een open, frisse uitstraling en is ontworpen om te koken en te eten in de buitenlucht. Denk aan een robuust werkblad, een barbecue of houtoven, en ruime tafels voor een informele, ontspannen sfeer. Zachte verlichting en de omgeving van natuur versterken het gevoel van gezelligheid en verbinding met de buitenomgeving.",
    },
]

export function ImageGenerationModal({ isOpen, onClose, onSubmit }: ImageGenerationModalProps) {
    const [cameraAngle, setCameraAngle] = useState<string | undefined>()
    const [kitchenStyle, setKitchenStyle] = useState<string | undefined>()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Afbeelding instellingen</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">Camera hoek</h3>
                        <RadioGroup
                            value={cameraAngle}
                            onValueChange={setCameraAngle}
                            className="space-y-2"
                        >
                            {CAMERA_ANGLES.map((angle) => (
                                <div key={angle.label} className="flex items-center space-x-2">
                                    <RadioGroupItem value={angle.value} id={angle.label} />
                                    <Label htmlFor={angle.label}>{angle.label}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCameraAngle(undefined)}
                                >
                                    Wissen
                                </Button>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium">Keukensetting</h3>
                        <RadioGroup
                            value={kitchenStyle}
                            onValueChange={setKitchenStyle}
                            className="space-y-2"
                        >
                            {KITCHEN_STYLES.map((style) => (
                                <div key={style.label} className="flex items-center space-x-2">
                                    <RadioGroupItem value={style.value} id={style.label} />
                                    <Label htmlFor={style.label}>{style.label}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setKitchenStyle(undefined)}
                                >
                                    Wissen
                                </Button>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Annuleren
                        </Button>
                        <Button
                            onClick={() => {
                                onSubmit({
                                    camera_angle: cameraAngle,
                                    keukenstijl: kitchenStyle,
                                })
                                onClose()
                            }}
                        >
                            Genereer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
