import { render, screen } from "@testing-library/react"
import { PendingJob } from "@/components/recipe/pending-job"
import { RecipeImportJob } from "@/lib/types"
import { vi } from "vitest"

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}))

const mockImportJob: RecipeImportJob = {
    id: "job1",
    user_id: "user1",
    source_type: "url",
    source_data: "https://example.com/recipe",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    recipe_id: null,
    error_message: null,
}

describe("PendingJob", () => {
    test("renders pending URL import job correctly", () => {
        render(<PendingJob job={mockImportJob} />)
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()
        expect(screen.getByText("example.com")).toBeInTheDocument()
    })

    test("renders pending image import job correctly", () => {
        const imageJob = {
            ...mockImportJob,
            source_type: "image" as const,
            source_data: "https://example.com/image.jpg",
        }
        render(<PendingJob job={imageJob} />)
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()
        expect(screen.getByAltText("Bezig met importeren van afbeelding")).toBeInTheDocument()
    })

    test("renders pending text import job correctly", () => {
        const textJob = {
            ...mockImportJob,
            source_type: "text" as const,
            source_data: "Voeg 2 eieren toe aan het beslag",
        }
        render(<PendingJob job={textJob} />)
        expect(screen.getByText("Recept wordt gemaakt...")).toBeInTheDocument()
        expect(screen.getByText('"Voeg 2 eieren toe aan het beslag"')).toBeInTheDocument()
    })
})
