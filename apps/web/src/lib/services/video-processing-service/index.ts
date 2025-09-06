// Re-export shared types and utilities
export * from "./shared"

// Export server-side functions (primary usage)
export { processVideoUrl, validateVideoUrlServer } from "./server"

// Default export for convenience
export { processVideoUrl as default } from "./server"
