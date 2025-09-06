"use client"
import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface StateShareModalProps {
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
    readonly onChoose: (includeState: boolean) => void
}

export function StateShareModal({ open, onOpenChange, onChoose }: Readonly<StateShareModalProps>) {
    const [value, setValue] = React.useState("yes")
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Voortgang delen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Wil je je huidige porties en aangevinkte items toevoegen aan de link?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <RadioGroup value={value} onValueChange={setValue} className="mt-2">
                    <div className="flex items-center gap-2">
                        <RadioGroupItem id="share-no" value="no" />
                        <Label htmlFor="share-no">Zonder voortgang</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem id="share-yes" value="yes" />
                        <Label htmlFor="share-yes">Met voortgang</Label>
                    </div>
                </RadioGroup>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onChoose(value === "yes")}>
                        Delen
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
