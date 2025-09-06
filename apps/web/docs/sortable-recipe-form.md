# Sortable Groups in Recipe Editor

This document explains the implementation of the drag-and-drop functionality for ingredient groups, ingredients, and preparation steps in the recipe editor. The primary goal is to provide a seamless user experience while maintaining a consistent state.

## State Management

The core of the functionality lies in how the state is managed within the `EditRecipeForm` component.

### Stable IDs

To ensure that `dnd-kit` can track items correctly across re-renders and that the UI state (like expanded/collapsed groups) is preserved, we generate stable, unique IDs for each group, ingredient, and preparation step.

- **Initialization**: When the `EditRecipeForm` component mounts, it creates a local state for `ingredientGroups` and `preparationSteps` using `useState`. The initial value is derived from the recipe data passed down from the context, and each item is assigned a unique ID using `uuidv4()`.

    ```typescript
    // src/components/recipe/edit-recipe-form.tsx

    const [ingredientGroups, setIngredientGroups] = useState(() =>
        currentRecipe.ingredients.map((group) => ({
            id: uuidv4(), // Stable ID for the group
            title: group.name,
            ingredients: group.ingredients.map((ingredient) => ({
                id: uuidv4(), // Stable ID for the ingredient
                quantity: ingredient.quantity.low || ingredient.quantity.high || 0,
                unit: ingredient.unit,
                name: ingredient.description,
            })),
        }))
    )

    const [preparationSteps, setPreparationSteps] = useState(() =>
        currentRecipe.instructions.map((instruction) => ({
            id: uuidv4(), // Stable ID for the step
            content: instruction,
        }))
    )
    ```

- **State Updates**: The `ingredientGroups` and `preparationSteps` are passed down to the `IngredientGroupManager` and `PreparationSteps` components, respectively. Any changes to these (reordering, adding, deleting) are handled by calling the `setIngredientGroups` and `setPreparationSteps` state setters.

- **Synchronization with Context**: The local state is synchronized back to the main recipe context using `useEffect` hooks. This ensures that the rest of the application has access to the updated data.

    ```typescript
    // src/components/recipe/edit-recipe-form.tsx

    useEffect(() => {
        const newIngredients = ingredientGroups.map(...)
        updateIngredients(newIngredients)
    }, [ingredientGroups, updateIngredients])

    useEffect(() => {
        const newInstructions = preparationSteps.map(...)
        updateInstructions(newInstructions)
    }, [preparationSteps, updateInstructions])
    ```

## Drag-and-Drop Implementation (`dnd-kit`)

We use `@dnd-kit` for all drag-and-drop interactions.

### Ingredient Group Manager

The `IngredientGroupManager` component is responsible for managing both the list of ingredient groups and the list of ingredients within each group.

- **Group Reordering**:
    - A `DndContext` wraps the list of `SortableGroup` components.
    - `onDragEnd` handles the reordering logic using `arrayMove` from `@dnd-kit/sortable`.
    - A `DragOverlay` shows a snapshot of the group being dragged, improving visual feedback.

- **Ingredient Reordering**:
    - Each `SortableGroup` contains a `SortableIngredientList`.
    - This list has its own `DndContext` to manage the reordering of ingredients _within_ that group. This nested context prevents conflicts between group dragging and ingredient dragging.

- **Expanded/Collapsed State**:
    - The `IngredientGroupManager` maintains a `Set` of `expandedGroups` IDs in its local state.
    - Since the group IDs are stable, the expanded state is preserved even when the groups are reordered.
    - When a group is dragged, the `DragOverlay` renders a `SortableGroup` component that reflects the correct expanded or collapsed state.

    ```typescript
    // src/components/recipe/ingredient-group-manager.tsx

    // State for managing expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
        () => new Set(groups.map((group) => group.id))
    )

    // ...

    // The DragOverlay renders the active group with its current state
    <DragOverlay>
        {activeGroup ? (
            <SortableGroup
                group={activeGroup}
                isExpanded={expandedGroups.has(activeGroup.id)}
                // ... props
            />
        ) : null}
    </DragOverlay>
    ```

### Preparation Steps

The `PreparationSteps` component follows a similar pattern to the `IngredientGroupManager` for reordering steps.

- It uses a single `DndContext` to manage the list of `SortableStep` components.
- A `DragOverlay` is used to display the step being dragged.

## Summary

By using stable IDs initialized in the parent form component's state, we ensure that the identity of each item is preserved across re-renders. This allows child components like `IngredientGroupManager` to manage their own UI state (like expanded groups) reliably, even when the data is being manipulated. The use of nested `DndContext` for ingredients within groups isolates drag-and-drop behavior and prevents conflicts.
