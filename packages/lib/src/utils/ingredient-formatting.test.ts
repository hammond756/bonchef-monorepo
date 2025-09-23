import { describe, it, expect } from "vitest";
import { formatIngredientLine, type Ingredient } from "./ingredient-formatting";

describe("formatIngredientLine", () => {
  describe("basic functionality", () => {
    it("should format ingredient with quantity and unit", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "cups"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "2 cups",
        description: "flour"
      });
    });

    it("should format ingredient with decimal quantity for kg/l units", () => {
      const ingredient: Ingredient = {
        description: "sugar",
        quantity: { low: 1.5 },
        unit: "kg"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1.5 kg",
        description: "sugar"
      });
    });

    it("should format ingredient with fraction for non-decimal units", () => {
      const ingredient: Ingredient = {
        description: "salt",
        quantity: { low: 0.5 },
        unit: "tsp"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1/2 tsp",
        description: "salt"
      });
    });

    it("should apply multiplier correctly", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "cups"
      };

      const result = formatIngredientLine(ingredient, 2);
      
      expect(result).toEqual({
        quantity: "4 cups",
        description: "flour"
      });
    });
  });

  describe("edge cases", () => {
    it("should handle ingredient without quantity", () => {
      const ingredient: Ingredient = {
        description: "salt to taste",
        quantity: { low: 0 },
        unit: "none"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "",
        description: "salt to taste"
      });
    });

    it("should handle ingredient with missing quantity object", () => {
      const ingredient = {
        description: "salt to taste"
      } as Ingredient;

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "",
        description: "salt to taste"
      });
    });

    it("should handle ingredient with null/undefined", () => {
      expect(formatIngredientLine(null as unknown as Ingredient)).toBeNull();
      expect(formatIngredientLine(undefined as unknown as Ingredient)).toBeNull();
    });

    it("should handle ingredient with invalid description", () => {
      const ingredient = {
        description: 123,
        quantity: { low: 1 },
        unit: "cup"
      } as unknown as Ingredient;

      expect(formatIngredientLine(ingredient)).toBeNull();
    });

    it("should handle unit 'none' by not displaying it", () => {
      const ingredient: Ingredient = {
        description: "salt to taste",
        quantity: { low: 1 },
        unit: "none"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1",
        description: "salt to taste"
      });
    });

    it("should handle empty unit string", () => {
      const ingredient: Ingredient = {
        description: "salt to taste",
        quantity: { low: 1 },
        unit: ""
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1",
        description: "salt to taste"
      });
    });

    it("should handle whitespace-only unit", () => {
      const ingredient: Ingredient = {
        description: "salt to taste",
        quantity: { low: 1 },
        unit: "   "
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1",
        description: "salt to taste"
      });
    });
  });

  describe("fraction conversion", () => {
    it("should convert common fractions correctly", () => {
      const testCases = [
        { input: 0.25, expected: "1/4" },
        { input: 0.5, expected: "1/2" },
        { input: 0.75, expected: "3/4" },
        { input: 0.333, expected: "1/3" },
        { input: 0.667, expected: "2/3" },
        { input: 1.5, expected: "1 1/2" },
        { input: 2.25, expected: "2 1/4" },
        { input: 0.125, expected: "1/8" },
        { input: 0.375, expected: "3/8" },
        { input: 0.625, expected: "5/8" },
        { input: 0.875, expected: "7/8" }
      ];

      testCases.forEach(({ input, expected }) => {
        const ingredient: Ingredient = {
          description: "test ingredient",
          quantity: { low: input },
          unit: "tsp"
        };

        const result = formatIngredientLine(ingredient);
        expect(result?.quantity).toBe(`${expected} tsp`);
      });
    });

    it("should handle whole numbers without fractions", () => {
      const ingredient: Ingredient = {
        description: "eggs",
        quantity: { low: 3 },
        unit: "pieces"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "3 pieces",
        description: "eggs"
      });
    });

    it("should handle zero quantity", () => {
      const ingredient: Ingredient = {
        description: "optional ingredient",
        quantity: { low: 0 },
        unit: "tsp"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "",
        description: "optional ingredient"
      });
    });
  });

  describe("decimal units (kg, l)", () => {
    it("should use decimal format for kg units", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 1.25 },
        unit: "kg"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1.25 kg",
        description: "flour"
      });
    });

    it("should use decimal format for l units", () => {
      const ingredient: Ingredient = {
        description: "milk",
        quantity: { low: 0.5 },
        unit: "l"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "0.5 l",
        description: "milk"
      });
    });

    it("should round decimals to 2 decimal places", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 1.234567 },
        unit: "kg"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "1.23 kg",
        description: "flour"
      });
    });

    it("should handle whole numbers in decimal units", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "kg"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "2 kg",
        description: "flour"
      });
    });
  });

  describe("spacing and formatting", () => {
    it("should handle multiple spaces in unit", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "  cups  "
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "2 cups",
        description: "flour"
      });
    });

    it("should handle quantity without unit", () => {
      const ingredient: Ingredient = {
        description: "eggs",
        quantity: { low: 3 },
        unit: ""
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "3",
        description: "eggs"
      });
    });

    it("should handle description with special characters", () => {
      const ingredient: Ingredient = {
        description: "olive oil (extra virgin)",
        quantity: { low: 2 },
        unit: "tbsp"
      };

      const result = formatIngredientLine(ingredient);
      
      expect(result).toEqual({
        quantity: "2 tbsp",
        description: "olive oil (extra virgin)"
      });
    });
  });

  describe("multiplier validation", () => {
    it("should throw error for zero multiplier", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "cups"
      };

      expect(() => formatIngredientLine(ingredient, 0)).toThrow("Multiplier must be a positive number");
    });

    it("should throw error for negative multiplier", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 2 },
        unit: "cups"
      };

      expect(() => formatIngredientLine(ingredient, -1)).toThrow("Multiplier must be a positive number");
    });

    it("should handle fractional multiplier", () => {
      const ingredient: Ingredient = {
        description: "flour",
        quantity: { low: 4 },
        unit: "cups"
      };

      const result = formatIngredientLine(ingredient, 0.5);
      
      expect(result).toEqual({
        quantity: "2 cups",
        description: "flour"
      });
    });
  });
});
