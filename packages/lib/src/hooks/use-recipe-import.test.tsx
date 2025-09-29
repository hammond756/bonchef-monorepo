import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { useRecipeImport } from "./use-recipe-import";

// Mock the pending imports storage
vi.mock("@/lib/utils/mmkv/pending-imports", () => ({
	pendingImportsStorage: {
		add: vi.fn(),
	},
}));

// Mock the useOwnRecipes hook
vi.mock("./use-own-recipes", () => ({
	useOwnRecipes: () => ({
		refetch: vi.fn(),
	}),
}));

// Mock the API_URL
vi.mock("@/config/environment", () => ({
	API_URL: "http://localhost:3000",
}));

const createMockSupabaseClient = (
	response: {
		data?: unknown;
		error?: unknown;
	} = { data: [], error: null },
	authResponse: {
		session?: { access_token: string } | null;
		error?: unknown;
	} = { session: { access_token: "mock-token" }, error: null },
): SupabaseClient => {
	const result = {
		data: response.data,
		error: response.error,
	};

	const chainable = new Proxy(
		{},
		{
			get(_target, prop) {
				if (prop === "then") {
					return (resolve: (value: unknown) => void) => resolve(result);
				}
				if (prop === "select") {
					return () => chainable;
				}
				if (prop === "eq") {
					return () => chainable;
				}
				if (prop === "in") {
					return () => chainable;
				}
				if (prop === "order") {
					return () => chainable;
				}
				if (prop === "delete") {
					return () => chainable;
				}
				return () => chainable;
			},
		},
	);

	return {
		from: vi.fn().mockReturnValue(chainable),
		auth: {
			getSession: vi.fn().mockResolvedValue({
				data: authResponse,
				error: authResponse.error,
			}),
		},
	} as unknown as SupabaseClient;
};

// Test wrapper component that provides QueryClient
const createTestWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
};

describe("useRecipeImport", () => {
	describe("handleSubmit", () => {
		it("should still submit when there is an authentication error", async () => {
			const mockSupabaseClient = createMockSupabaseClient(
				{ data: [], error: null },
				{ session: null, error: null }, // No session = auth error
			);
			
			const wrapper = createTestWrapper();
			const { result } = renderHook(
				() => useRecipeImport({
					supabaseClient: mockSupabaseClient,
					userId: "mock-user-id",
				}),
				{ wrapper }
			);

			// This should not throw because the hook handles auth errors by storing in pending imports
			await expect(
				result.current.handleSubmit("url", "https://example.com"),
			).resolves.not.toThrow();
		});

		it("should successfully submit when the server returns a 401 error", async () => {
			const mockSupabaseClient = createMockSupabaseClient(
				{ data: [], error: null },
				{ session: { access_token: "mock-token" }, error: null },
			);

			// Mock fetch for the API call
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 401,
			});

			const wrapper = createTestWrapper();
			const { result } = renderHook(
				() => useRecipeImport({
					supabaseClient: mockSupabaseClient,
					userId: "mock-user-id",
				}),
				{ wrapper }
			);

			await expect(
				result.current.handleSubmit("url", "https://example.com"),
			).resolves.not.toThrow();
		});

		it("should successfully submit when there is an authenticated session", async () => {
			const mockSupabaseClient = createMockSupabaseClient(
				{ data: [], error: null },
				{ session: { access_token: "mock-token" }, error: null },
			);

			// Mock fetch for the API call
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ jobId: "test-job-id" }),
			});

			const wrapper = createTestWrapper();
			const { result } = renderHook(
				() => useRecipeImport({
					supabaseClient: mockSupabaseClient,
					userId: "mock-user-id",
				}),
				{ wrapper }
			);

			await expect(
				result.current.handleSubmit("url", "https://example.com"),
			).resolves.not.toThrow();
		});
	});
});
