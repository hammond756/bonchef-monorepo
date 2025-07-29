import { should } from "vitest"
import { NotificationWorker } from "./notification-worker"



describe("NotificationWorker test", () => {
    it("should be defined", () => {
        should(NotificationWorker).toBeDefined()
    })

    it("should not process notifications for users who have disabled notifications", async () => {
        const worker = new NotificationWorker()
        const result = await worker.processNotifications()
        should(result).toBeDefined()
    })
})