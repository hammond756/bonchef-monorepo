import { useEffect } from "react";

import { useRef, useState } from "react";

export const useFileUpload = ({ initialFilePath }: { initialFilePath?: string | null }) => {
    /**
     * Manages the state of a file upload input. Supports showing a preview, removing the file, and resetting the input.
     */
    const [preview, setPreview] = useState<string | null>(initialFilePath || null);
    const [file, setFile] = useState<File | null>(null);
    const [shouldRemove, setShouldRemove] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log(file)
    }, [file])

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleChange", e.target.files)
        const file = e.target.files?.[0] || null;
        setFile(file);
        if (file) {
            setShouldRemove(true);
            setPreview(URL.createObjectURL(file));
        } else {
            setShouldRemove(!!initialFilePath);
            setPreview(null);
        }
        return file;
    }

    const handleRemove = () => {
        /**
         * Should trigger when the user clicks the remove button
         */
        setFile(null);
        setPreview(null);
        setShouldRemove(!!initialFilePath);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const reset = () => {
        /**
         * Should trigger when the file upload should reset, for example when the user closes the dialog
         * This will reset the file, preview and shouldRemove state
         */
        setFile(null);
        setPreview(initialFilePath || null);
        setShouldRemove(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return {
        preview,
        file,
        fileInputRef,
        shouldRemove,
        handleChange,
        handleRemove,
        reset,
        setPreview,
    }
}