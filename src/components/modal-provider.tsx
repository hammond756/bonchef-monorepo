"use client"

import { useImportStatusStore } from "@/lib/store/import-status-store"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { UrlImportPopup } from "./import/url-import-popup"
import { TextImportPopup } from "./import/text-import-popup"
import { PhotoImportView } from "./import/photo-import-view"

export function ModalProvider() {
    const [isMounted, setIsMounted] = useState(false)
    const { activeModal } = useImportStatusStore()

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
            {activeModal === "url" && <UrlImportPopup />}
            {activeModal === "text" && <TextImportPopup />}
            {activeModal === "photo" && <PhotoImportView />}
        </>,
        portalRoot
    )
}
