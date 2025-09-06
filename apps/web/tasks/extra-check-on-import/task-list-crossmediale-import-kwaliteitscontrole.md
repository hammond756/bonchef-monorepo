# Task List: Cross-Media Import Quality Control

## **Relevant Files**

- `src/lib/services/web-service.ts` - Contains the main logic for recipe import and needs to be updated with new validation fields
- `src/actions/recipe-imports.ts` - Contains the import job logic and needs to be updated for better error handling
- `src/lib/types.ts` - Needs to be updated with new types for quality validation
- `src/components/recipe/in-progress-recipe-card.tsx` - Needs to be updated to display friendly error messages
- `src/components/recipe/in-progress-recipe-card.test.tsx` - Unit tests for the updated component

## **Notes**

- Unit tests must be written for all new functionality
- The validation logic must distinguish between images (strict validation) and text/URLs (flexible validation)
- Error messages must be friendly and informative for end-users

## **Tasks**

- [x] **1.0 Update Langfuse Prompts**
    - [x] 1.1 Create ContentQualityValidator prompt in Langfuse
    - [x] 1.2 Update WriteImagePrompt with ContentQualityValidator reference
    - [x] 1.3 Update ExtractRecipeFromWebcontent with ContentQualityValidator reference

- [x] **2.0 Update TypeScript Types**
    - [x] 2.1 Extend GeneratedRecipeWithSource type with containsFood and enoughContext
    - [x] 2.2 Update Zod schemas in the formatRecipe function
    - [x] 2.3 Update types in generateRecipeFromImage and generateRecipeFromSnippet

- [x] **3.0 Update Import Logic with Smart Validation**
    - [x] 3.1 Implement validation logic for images (strict validation)
    - [x] 3.2 Implement validation logic for text/URLs (flexible validation)
    - [x] 3.3 Update error handling in \_processJobInBackground

- [x] **4.0 Improve Error Handling**
    - [x] 4.1 Implement friendly error messages for quality issues
    - [x] 4.2 Distinguish between critical errors and warnings
    - [x] 4.3 Store error messages in the recipe_import_jobs table

- [x] **5.0 Frontend Error Display**
    - [x] 5.1 Update InProgressRecipeCard for better error display
    - [x] 5.2 Display failed jobs at the top of the collection
    - [x] 5.3 Add retry functionality if desired

## **Validation Rules**

### **Images (Strict Validation)**

- `ContainsFood: false` → ERROR (no recipe possible)
- `EnoughContext: false` → ERROR (insufficient context for recipe generation)

### **Text/URLs (Flexible Validation)**

- `ContainsFood: false` → ERROR (no recipe possible)
- `EnoughContext: false` → CONTINUE (generate recipe with limited context)

## **Error Message Examples**

### **Critical Errors (Stop)**

- "This image does not contain food or recipes"
- "This text does not contain recipe-related information"

### **Warnings (Continue)**

- "Limited context available - generating recipe with available information"
