## Relevant Files

- `src/hooks/use-scroll-direction.ts` - New custom hook to detect the vertical scroll direction.
- `src/components/layouts/tab-layout.tsx` - The main layout component where the hook will be implemented and animations will be applied.
- `src/tests/e2e/navigation-visibility.spec.ts` - New end-to-end test to verify the hiding/showing behavior of the navigation bars.

### Notes

- Use `npx playwright test` to run the end-to-end tests.

## Tasks

- [x] 1.0 Implement `useScrollDirection` Hook
    - [x] 1.1 Create the file `src/hooks/use-scroll-direction.ts`.
    - [x] 1.2 Add state to track the last scroll position (`scrollY`).
    - [x] 1.3 Implement a `useEffect` hook to add and clean up a scroll event listener on the `window` object.
    - [x] 1.4 In the scroll handler, compare the current scroll position with the last scroll position to determine direction ('up' or 'down').
    - [x] 1.5 Add a small threshold (e.g., 10px) to prevent the state from changing on minor scroll movements.
    - [x] 1.6 Return the current scroll direction from the hook.
- [x] 2.0 Integrate Scroll Hook into `TabLayout`
    - [x] 2.1 Import `useScrollDirection` into `src/components/layouts/tab-layout.tsx`.
    - [x] 2.2 Call the hook within the `TabLayout` component to get the scroll direction.
    - [x] 2.3 Add a state variable to manage the visibility of the navigation bars based on the hook's return value.
- [x] 3.0 Animate `TopBar` and `TabBar` Visibility
    - [x] 3.1 Use the visibility state to conditionally apply CSS classes or inline styles to the `TopBar` and `TabBar` wrappers.
    - [x] 3.2 For the `TopBar`, apply a `transform: translateY(-100%)` when hidden and `translateY(0)` when visible.
    - [x] 3.3 For the `TabBar`, apply a `transform: translateY(100%)` when hidden and `translateY(0)` when visible.
    - [x] 3.4 Add a CSS `transition` property to smoothly animate the `transform` change.
- [x] 4.0 End-to-End Testing and Refinement
    - [x] 4.1 Create a new Playwright test file at `src/tests/e2e/navigation-visibility.spec.ts`.
    - [x] 4.2 Write a test that navigates to a page with the `TabLayout`.
    - [x] 4.3 Simulate scrolling down and assert that the `TopBar` and `TabBar` are no longer visible.
    - [x] 4.4 Simulate scrolling up and assert that the `TopBar` and `TabBar` are visible again.
    - [x] 4.5 Manually test the feature across different pages and screen sizes to ensure smooth animation and correct behavior.
