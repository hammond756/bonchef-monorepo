import { describe, it, expect, vi, beforeEach } from "vitest"
import { EmailService } from "./email-service"
import { ServerClient } from "postmark"

// Mock nodemailer
vi.mock("nodemailer", () => ({
    default: {
        createTransport: vi.fn(() => ({
            sendMail: vi.fn(),
            verify: vi.fn(),
        })),
    },
}))

vi.mock("postmark", () => ({
    ServerClient: vi.fn(() => ({
        sendEmail: vi.fn(),
        getServer: vi.fn(),
    })),
}))

describe("EmailService", () => {
    let emailService: EmailService
    let mockClient: ServerClient

    beforeEach(() => {
        vi.clearAllMocks()

        mockClient = {
            sendEmail: vi.fn(),
            getServer: vi.fn(),
        } as unknown as ServerClient

        emailService = new EmailService(mockClient)
    })

    describe("sendCommentNotification", () => {
        it("should send email successfully", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            const result = await emailService.sendCommentNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                comment: {
                    commenterName: "Commenter",
                    recipeTitle: "Test Recipe",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe(null)
            }
            expect(mockSendEmail).toHaveBeenCalled()
            const text = mockSendEmail.mock.calls[0][0].TextBody
            expect(text).toContain("Hoi Test User")
            expect(text).toContain("Commenter heeft gereageerd op je recept")

            const html = mockSendEmail.mock.calls[0][0].HtmlBody
            expect(html).toContain("Hoi Test User")
            expect(html).toContain("<strong>Commenter</strong> heeft gereageerd op je recept")
        })

        it("should handle missing names gracefully", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            const result = await emailService.sendCommentNotification({
                recipientEmail: "test@example.com",
                recipientName: "",
                comment: {
                    commenterName: "",
                    recipeTitle: "Test Recipe",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(true)
            expect(mockSendEmail).toHaveBeenCalled()
            const text = mockSendEmail.mock.calls[0][0].TextBody
            expect(text).toContain("Hoi Chef")
            expect(text).toContain("Iemand heeft gereageerd op je recept")

            const html = mockSendEmail.mock.calls[0][0].HtmlBody
            expect(html).toContain("Hoi Chef")
            expect(html).toContain("<strong>Iemand</strong> heeft gereageerd op je recept ")
        })

        it("should handle SMTP errors", async () => {
            const mockSendEmail = vi.fn().mockRejectedValue(new Error("SMTP error"))
            mockClient.sendEmail = mockSendEmail

            const result = await emailService.sendCommentNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                    comment: {
                    commenterName: "Commenter",
                    recipeTitle: "Test Recipe",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain("Failed to send email")
            }
        })

        it("should include all required elements in email template", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            await emailService.sendCommentNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                comment: {
                    commenterName: "Commenter",
                    recipeTitle: "Test Recipe",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            const callArgs = mockSendEmail.mock.calls[0]
            const html = callArgs[0]?.HtmlBody

            // Check for required elements
            expect(html).toContain("Bonchef")
            expect(html).toContain("Test User")
            expect(html).toContain("Commenter")
            expect(html).toContain("Test Recipe")
            expect(html).toContain("Great recipe!")
            expect(html).toContain("https://bonchef.app/recepten/123")
            expect(html).toContain("https://bonchef.app/unsubscribe?u=456&t=recipe_comment")
            expect(html).toContain("#385940") // Brand color
        })
    })

    describe("sendCommentSummaryNotification", () => {
        it("should send summary email successfully", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            const comments = [
                {
                    commenterName: "Alice",
                    recipeTitle: "Pasta Carbonara",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
                {
                    commenterName: "Bob",
                    recipeTitle: "Chicken Curry",
                    commentText: "Delicious!",
                    recipeUrl: "https://bonchef.app/recepten/456",
                },
            ]

            const result = await emailService.sendCommentSummaryNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                comments: comments,
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe(null)
            }
            expect(mockSendEmail).toHaveBeenCalled()
            
            const callArgs = mockSendEmail.mock.calls[0][0]
            expect(callArgs.Subject).toBe("Je hebt 2 nieuwe reacties!")
            
            const text = callArgs.TextBody
            expect(text).toContain("Hoi Test User")
            expect(text).toContain("Je hebt 2 nieuwe reacties op je recepten:")
            expect(text).toContain("* Alice op \"Pasta Carbonara\": \"Great recipe!\"")
            expect(text).toContain("* Bob op \"Chicken Curry\": \"Delicious!\"")

            const html = callArgs.HtmlBody
            expect(html).toContain("Je hebt 2 nieuwe reacties!")
            expect(html).toContain("<strong>Alice</strong> op")
            expect(html).toContain("<strong>Bob</strong> op")
        })

        it("should handle single comment correctly", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            const comments = [
                {
                    commenterName: "Alice",
                    recipeTitle: "Pasta Carbonara",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
            ]

            const result = await emailService.sendCommentSummaryNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                comments: comments,
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(true)
            
            const callArgs = mockSendEmail.mock.calls[0][0]
            expect(callArgs.Subject).toBe("Je hebt 1 nieuwe reacties!")
            
            const text = callArgs.TextBody
            expect(text).toContain("Je hebt 1 nieuwe reactie op je recepten:")
        })

        it("should handle missing names gracefully", async () => {
            const mockSendEmail = vi.fn().mockResolvedValue({ messageId: "test-id" })
            mockClient.sendEmail = mockSendEmail

            const comments = [
                {
                    commenterName: "",
                    recipeTitle: "Pasta Carbonara",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
            ]

            const result = await emailService.sendCommentSummaryNotification({
                recipientEmail: "test@example.com",
                recipientName: "",
                comments: comments,
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(true)
            
            const text = mockSendEmail.mock.calls[0][0].TextBody
            expect(text).toContain("Hoi Chef")
            expect(text).toContain("* Iemand op \"Pasta Carbonara\"")

            const html = mockSendEmail.mock.calls[0][0].HtmlBody
            expect(html).toContain("Hoi Chef")
            expect(html).toContain("<strong>Iemand</strong> op")
        })

        it("should handle email sending errors", async () => {
            const mockSendEmail = vi.fn().mockRejectedValue(new Error("SMTP error"))
            mockClient.sendEmail = mockSendEmail

            const comments = [
                {
                    commenterName: "Alice",
                    recipeTitle: "Pasta Carbonara",
                    commentText: "Great recipe!",
                    recipeUrl: "https://bonchef.app/recepten/123",
                },
            ]

            const result = await emailService.sendCommentSummaryNotification({
                recipientEmail: "test@example.com",
                recipientName: "Test User",
                comments: comments,
                unsubscribeUrl: "https://bonchef.app/unsubscribe?u=456&t=recipe_comment",
            })

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain("Failed to send summary email")
            }
        })
    })

    describe("verifyConnection", () => {
        it("should verify connection successfully", async () => {
            const mockVerify = vi.fn().mockResolvedValue(true)
            mockClient.getServer = mockVerify

            const result = await emailService.verifyConnection()

            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data).toBe(null)
            }
            expect(mockVerify).toHaveBeenCalled()
        })

        it("should handle verification errors", async () => {
            const mockVerify = vi.fn().mockRejectedValue(new Error("Connection failed"))
            mockClient.getServer = mockVerify

            const result = await emailService.verifyConnection()

            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error).toContain("Postmark connection failed")
            }
        })
    })
})
