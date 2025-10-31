import { describe, it, expect } from "vitest";
import supabaseImageLoader from "./supabase-image-loader";

describe("supabaseImageLoader", () => {
    it("should return the original image if it is not a supabase image", () => {
        const result = supabaseImageLoader({ src: "https://example.com/image.jpg", width: 100 });
        expect(result).toBe("https://example.com/image.jpg");
    });
    
    it("should return the resize url if the image is a supabase image", () => {
        const result = supabaseImageLoader({ src: "https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg", width: 100 });
        expect(result).toBe("https://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });

    it("should return the original image if the image is a supabase image but the width is not provided", () => {
        const result = supabaseImageLoader({ src: "https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg", width: 100 });
        expect(result).toBe("https://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });

    it("should handle https hosts", () => {
        const result = supabaseImageLoader({ src: "https://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg", width: 100 });
        expect(result).toBe("https://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });

    it("should handle http hosts", () => {
        const result = supabaseImageLoader({ src: "http://lwnjybqifrnppmahxera.supabase.co/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg", width: 100 });
        expect(result).toBe("http://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });

    it("should handle localhost hosts", () => {
        const result = supabaseImageLoader({ src: "http://localhost:54321/storage/v1/object/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg", width: 100 });
        expect(result).toBe("http://localhost:54321/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });

    it("should return the render api for render api in the src", () => {
        const result = supabaseImageLoader({ src: "https://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75", width: 100 });
        expect(result).toBe("https://lwnjybqifrnppmahxera.supabase.co/storage/v1/render/image/public/recipe-images/39f559ae-cc4f-411c-ac98-74fb78c4e9ee.jpeg?width=100&resize=contain&quality=75");
    });
    
});
