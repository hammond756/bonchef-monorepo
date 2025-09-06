interface PhotoDisplayProps {
    photo: {
        id: string
        dataUrl: string
        file: File
    }
}

/**
 * Displays the captured photo with a back button overlay
 * Pure UI component that receives all data and callbacks via props
 */
export function PhotoDisplay({ photo }: Readonly<PhotoDisplayProps>) {
    return (
        <div className="relative w-full">
            <div className="aspect-square w-full">
                <img
                    src={photo.dataUrl}
                    alt="Captured dish"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    )
}
