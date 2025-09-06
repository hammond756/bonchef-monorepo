import { AnalyticsEvents } from "./events"
import posthog from "posthog-js"
import { z } from "zod"

// Make the AnalyticsEvents type more specific for better type inference
type AnalyticsEventsType = typeof AnalyticsEvents
type EventName = keyof AnalyticsEventsType

// Helper types for better type inference
type EventVersion<N extends EventName> = AnalyticsEventsType[N]["current"]
type EventSchema<N extends EventName> = AnalyticsEventsType[N]["versions"][EventVersion<N>]
type EventProps<N extends EventName> = z.infer<EventSchema<N>>

/**
 * Track an analytics event with the current version of its schema
 * @param name - The name of the event to track
 * @param props - The event properties (excluding version which is auto-filled)
 */
export function trackEvent<N extends EventName>(name: N, props: Omit<EventProps<N>, "version">) {
    const currentVersion = AnalyticsEvents[name].current

    // We use a non-generic implementation function with `as any` to work around a
    // TypeScript limitation with indexed access on generic union types.
    // The public-facing `trackEvent` is strictly typed, ensuring call-site safety.
    trackEventWithVersion(name, currentVersion, props)
}

/**
 * Implementation detail for tracking an analytics event with a specific version.
 * This function is not generic to avoid TypeScript compilation issues.
 * It should not be exported.
 *
 * @param name The name of the event
 * @param version The version of the event
 * @param props The properties of the event
 */
function trackEventWithVersion(name: EventName, version: number, props: object) {
    const versions = AnalyticsEvents[name].versions
    const schema = versions[version]

    if (!schema) {
        console.error(`Schema not found for event "${name}" version "${version}"`)
        return
    }

    const parsed = schema.parse(props)
    posthog.capture(name, parsed)
}
