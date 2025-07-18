"use client"

import { useImportStatusStore } from "@/lib/store/import-status-store"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { UrlImportPopup } from "./import/url-import-popup"
import { TextImportPopup } from "./import/text-import-popup"
import { PhotoImportView } from "./import/photo-import-view"

export function ModalProvider() {
    const [isMounted, setIsMounted] = useState(false)
    const { activeModal, closeModal } = useImportStatusStore()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return null
    }

    const portalRoot = document.getElementById("modal-portal")
    if (!portalRoot) {
        // This should not happen in a normal flow
        console.error("The modal-portal element was not found in the DOM.")
        return null
    }

    return createPortal(
        <>
            <UrlImportPopup isOpen={activeModal === "url"} onClose={closeModal} />
            <TextImportPopup isOpen={activeModal === "text"} onClose={closeModal} />
            <PhotoImportView isOpen={activeModal === "photo"} onClose={closeModal} />
        </>,
        portalRoot
    )
}
