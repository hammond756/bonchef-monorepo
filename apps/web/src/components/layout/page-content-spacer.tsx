import React from "react"

interface PageContentSpacerProps {
    className?: string
}

/**
 * Use this component at the top of a page's content (inside a BaseLayout)
 * when the BackButton would otherwise overlap the initial content.
 * This is typically needed on pages that do not start with a full-bleed image.
 */
export function PageContentSpacer({ className }: PageContentSpacerProps) {
    // BackButton is h-10 (40px) and positioned top-4 (16px).
    // Total space occupied by button from top: 40px + 16px = 56px.
    // h-16 (64px) provides 8px clearance below the button.
    return <div className={`h-16 ${className || ""}`} aria-hidden="true" />
}
