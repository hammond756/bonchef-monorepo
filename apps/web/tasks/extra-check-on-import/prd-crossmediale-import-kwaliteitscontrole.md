# PRD: Cross-Media Import Quality Control

### 0. Online Resources

- **Jira Ticket:** [BC-XXX](https://bonchef.atlassian.net/browse/BC-XXX)

### 1. Introduction/Overview

Currently, recipes are imported via URL, image, or text without any quality control. This leads to:

- Recipes that do not contain food (e.g., images of cars or buildings)
- Content with insufficient context to generate a good recipe
- An inconsistent user experience across different import methods

This feature introduces an intelligent quality control system that validates content before recipe generation is initiated, applying different validation rules for different import methods.

### 2. Goals

- **Quality Improvement**: Ensure that only relevant, recipe-related content is processed
- **Consistent User Experience**: Uniform validation for all import methods
- **Smart Validation**: Distinguish between critical errors and warnings
- **Better Error Messages**: Provide friendly and informative feedback to users

### 3. User Stories

- **As a user**, I want images of non-food content (like cars) to be rejected, so I don't start unnecessary import jobs
- **As a user**, I want URL imports with insufficient context to still be processed, as I can often create a recipe with limited information
- **As a user**, I want to receive clear feedback on why an import failed, so I can understand what went wrong
- **As a user**, I want failed imports to be shown at the top of my collection, so I can review or retry them

### 4. Functional Requirements

#### 4.1 Content Validation Criteria

**ContainsFood (boolean)**

- **True**: Content clearly contains information about food, ingredients, dishes, cooking processes, or culinary instructions
- **False**: Content has no relation to food, cooking, or recipes

**EnoughContext (boolean)**

- **True**: Content contains sufficient detail to generate a complete recipe, including:
    - Ingredients (at least 2 main ingredients)
    - Cooking instructions or preparation method
- **False**:
    - Only 1 ingredient
    - No cooking instructions or preparation method found

#### 4.2 Validation Rules per Import Method

**Images (WriteImagePrompt)**

- **ContainsFood = false** → **ERROR** (no food in the image)
- **EnoughContext = false** → **ERROR** (image too vague for recipe generation)

**Text/URLs (ExtractRecipeFromWebcontent)**

- **ContainsFood = false** → **ERROR** (no recipe-related content)
- **EnoughContext = false** → **PROCEED** (try to generate a recipe with limited context)

#### 4.3 Error Handling

- Specific error messages for quality issues
- Distinction between "critical errors" and "warnings"
- Error messages are stored in `recipe_import_jobs.error_message`
- Failed jobs are displayed at the top of the collection

#### 4.4 User Interface

- Friendly error messages in the InProgressRecipeCard
- Clear indication of why an import failed
- Option to review or retry failed imports

### 5. Non-Goals (Out of Scope)

- Changes to the GenerateRecipe prompt (used for chat-based generation)
- Complex retry mechanisms or job queues
- Automatic content improvement or suggestions
- Changes to the existing import flow UI

### 6. Design Considerations

- **Consistency**: All import methods use the same validation criteria
- **Flexibility**: Text/URL imports are given more leeway than images
- **User-Friendliness**: Error messages must be clear and actionable
- **Performance**: Validation should not significantly impact import speed

### 7. Technical Considerations

- **Langfuse Integration**: The ContentQualityValidator prompt will be added to existing prompts
- **Type Safety**: New fields will be added to TypeScript types
- **Backward Compatibility**: Existing functionality will remain intact
- **Error Logging**: All validation failures will be logged for debugging

### 8. Success Metrics

- **Quality Improvement**: Reduction in failed imports due to quality issues
- **User Satisfaction**: Positive feedback on error messages
- **Import Success Rate**: Increase in successful recipe generation
- **Error Reduction**: Decrease in unclear import errors

### 9. Open Questions

- Should we implement a retry mechanism for failed imports?
- Can we help users improve content before they retry?
- Should we implement different validation levels (strict vs. relaxed)?

### 10. Implementation Phases

#### **Phase 1: Foundation**

- Update Langfuse prompts
- Extend TypeScript types
- Implement basic validation logic

#### **Phase 2: Smart Validation**

- Differentiate between import methods
- Improve error handling
- Store error messages

#### **Phase 3: User Experience**

- Improve frontend error display
- Sort failed jobs
- Testing and optimization
