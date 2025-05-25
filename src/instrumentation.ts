// instrumentation.ts
import { captureRequestError } from "@sentry/nextjs";

export async function register() {
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  }
}

export const onRequestError = async (...args: [any, any, any]) => {
  if (process.env.NODE_ENV === "production") {
    captureRequestError(...args);
  }
};