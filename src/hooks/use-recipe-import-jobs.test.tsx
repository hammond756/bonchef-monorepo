import { renderHook, act, waitFor } from "@testing-library/react"
import { useRecipeImportJobs } from "./use-recipe-import-jobs"
import { vi } from "vitest"
import * as recipeImportsActions from "@/actions/recipe-imports"
import * as recipeImportsJobClient from "@/lib/services/recipe-imports-job/client"
import { SWRConfig } from "swr"
import * as useOwnRecipesHook from "@/hooks/use-own-recipes"

const mockJobs = [
    { id: "1", status: "pending", source_data: "url1" },
    { id: "2", status: "pending", source_data: "url2" },
]

vi.mock("@/actions/recipe-imports")
vi.mock("@/lib/services/recipe-imports-job/client")
vi.mock("@/hooks/use-user", () => ({
    useUser: () => ({ user: { id: "user-123" } }),
}))

// helper to wrap hooks with isolated SWR cache
const withSWRConfig = (hookFn: () => any) =>
    renderHook(hookFn, {
        wrapper: ({ children }: { children: React.ReactNode }) => (
            <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
        ),
    })

describe("useRecipeImportJobs", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("should fetch and return jobs", async () => {
        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: mockJobs,
        })

        const { result } = withSWRConfig(() => useRecipeImportJobs())

        await waitFor(() => {
            expect(result.current.jobs).toEqual(mockJobs)
            expect(result.current.isLoading).toBe(false)
        })
    })

    it("should optimistically add a job and then handle successful creation", async () => {
        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: [],
        })
        // @ts-ignore
        recipeImportsActions.startRecipeImportJob.mockResolvedValue({})

        const { result } = withSWRConfig(() => useRecipeImportJobs())

        await act(async () => {
            result.current.addJob("url", "new-url")
        })

        expect(result.current.jobs).toHaveLength(1)
        expect(result.current.jobs[0].source_data).toBe("new-url")
        expect(result.current.jobs[0].status).toBe("pending")

        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: [{ id: "3", status: "pending", source_data: "new-url" }],
        })

        await waitFor(() => {
            expect(recipeImportsActions.startRecipeImportJob).toHaveBeenCalledWith(
                "url",
                "new-url",
                undefined
            )
        })
    })

    it("should rollback optimistic update on failure", async () => {
        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: [],
        })
        const testError = new Error("Failed to create job")
        // @ts-ignore
        recipeImportsActions.startRecipeImportJob.mockRejectedValue(testError)

        const { result } = withSWRConfig(() => useRecipeImportJobs())

        await act(async () => {
            try {
                await result.current.addJob("url", "fail-url")
            } catch (e) {
                expect(e).toEqual(testError)
            }
        })

        expect(result.current.jobs).toHaveLength(0)
    })

    it("should revalidate the collection when a job is completed", async () => {
        const mutateOwnRecipesSpy = vi.fn()
        vi.spyOn(useOwnRecipesHook, "useOwnRecipes").mockReturnValue({
            recipes: [],
            isLoading: false,
            error: null,
            mutate: mutateOwnRecipesSpy,
        })

        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: mockJobs,
        })

        const { result, rerender } = withSWRConfig(() => useRecipeImportJobs())

        await waitFor(() => expect(result.current.jobs).not.toHaveLength(0))

        // Simulate job completion by returning one less job
        // @ts-ignore
        recipeImportsJobClient.listJobs.mockResolvedValue({
            success: true,
            data: [mockJobs[0]],
        })

        // Manually trigger a re-fetch with the new data
        await act(async () => {
            await result.current.mutate()
        })

        await waitFor(() => {
            expect(mutateOwnRecipesSpy).toHaveBeenCalled()
        })
    })
})
