import { render, screen } from "@testing-library/react"
import { FailedJob } from "@/components/recipe/failed-job"
import { RecipeImportJob } from "@/lib/types"
import { vi } from "vitest"

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
}))

vi.mock("@/hooks/use-recipe-import-jobs", () => ({
    useRecipeImportJobs: () => ({
        isDeleting: null,
        removeJob: vi.fn(),
    }),
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

describe("FailedJob", () => {
    test("renders failed job with error message correctly", () => {
        const failedJob = {
            ...mockImportJob,
            status: "failed" as const,
            error_message: "Het lijkt erop dat deze afbeelding niet over eten ging",
        }
        render(<FailedJob job={failedJob} />)

        // Check that both error state and title show "Import mislukt"
        const importMisluktElements = screen.getAllByText("Import mislukt")
        expect(importMisluktElements).toHaveLength(2)

        expect(
            screen.getByText("Het lijkt erop dat deze afbeelding niet over eten ging")
        ).toBeInTheDocument()
        expect(screen.getByTestId("delete-import-button")).toBeInTheDocument()
        expect(screen.getByText("×")).toBeInTheDocument()

        // Check that the title shows the error status
        const titleElement = screen.getByRole("heading", { name: /Import mislukt/i })
        expect(titleElement).toBeInTheDocument()
    })

    test("renders failed job without error message correctly", () => {
        const failedJob = {
            ...mockImportJob,
            status: "failed" as const,
            error_message: null,
        }
        render(<FailedJob job={failedJob} />)

        // Check that both error state and title show "Import mislukt"
        const importMisluktElements = screen.getAllByText("Import mislukt")
        expect(importMisluktElements).toHaveLength(2)

        expect(screen.getByTestId("delete-import-button")).toBeInTheDocument()
        expect(screen.getByText("×")).toBeInTheDocument()

        // Check that the title shows the error status
        const titleElement = screen.getByRole("heading", { name: /Import mislukt/i })
        expect(titleElement).toBeInTheDocument()
    })
})
