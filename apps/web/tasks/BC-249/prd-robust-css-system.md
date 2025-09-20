# PRD: Implementation of a Robust Design System

> This document describes the requirements for implementing a central and scalable design system within the Bonchef application, with the goal of improving UI consistency and the efficiency of the development workflow.

### 0. Online Resources

- **Jira Ticket:** [BC-249](https://bonchef.atlassian.net/browse/BC-249)

### 1. Introduction/Overview

Currently, the styling of the Bonchef application is largely defined on an ad-hoc, per-component basis. This leads to inconsistencies in the user interface (e.g., in navigation tabs, fonts on the collection page) and makes the maintenance and further development of the frontend unnecessarily complex.

This project aims to implement a robust and central design system based on existing visual guidelines. We will define design tokens for colors, typography, spacing, and other style elements and integrate them into the Tailwind CSS configuration. All existing components will be refactored to use this new system, creating a consistent and maintainable codebase.

### 2. Goals

- **Consistency:** Ensure a visually consistent user experience across the entire application.
- **Maintainability:** Centralize styling logic, making it easier to manage and update styles.
- **Efficiency:** Accelerate the development of new features by providing a reusable set of styled components and utilities.
- **Clarity:** Create a "single source of truth" for all styling decisions.

### 3. User Stories

- **As a developer,** I want to have access to a predefined set of Tailwind CSS utilities and styled components so that I can build new UI elements quickly and consistently without having to invent styling myself.
- **As a designer,** I want the implemented application to exactly match the established visual guidelines to ensure Bonchef's brand identity is preserved.
- **As a user,** I want to experience a coherent and predictable interface, which increases my ease of use and trust in the application.

### 4. Functional Requirements

#### 4.1. Design Tokens in Tailwind CSS

All values below must be defined as design tokens in `tailwind.config.js`.

**Color Palette:**

- `primary`: `#1E4D37` (CTA buttons, navigation, accents)
- `text-default`: `#2B2B2B` (Body text)
- `text-muted`: `#6F6F6F` (Subtext, explanations)
- `accent`: `#268A40` (Active tab underline, highlights)
- `overlay-dark`: `rgba(0, 0, 0, 0.5)` (Text overlay on images)
- `surface`: `#FFFFFF` (Background, cards)

**Status Colors (for labels/badges):**

- `status-blue-bg`: `#E7F3FB`
- `status-blue-text`: `#264E76`
- `status-blue-border`: `#B3D8F2`
- `status-green-bg`: `#E5F7EB`
- `status-green-text`: `#1E4D37`
- `status-green-border`: `#B9E7CA`
- `status-yellow-bg`: `#FFF9D9`
- `status-yellow-text`: `#8A5A00`
- `status-yellow-border`: `#FFEEAA`
- `status-red-bg`: `#FCE7E7`
- `status-red-text`: `#8F1D1D`
- `status-red-border`: `#F5B5B5`

**Border Radius:**

- `rounded-2xl`: `20px` (or `24px`, choose consistently) - For search bars.
- `rounded-xl`: `12px` - For recipe cards.
- `rounded-lg`: `8px` - Alternative for recipe cards, choose consistently.

**Typography (Base Styles & Utilities):**

- **Fonts:** `Lora` and `Montserrat` are already available and must be linked to the text utilities.
- **h1:** Font: Lora, Weight: Bold, Size: 24px, Line Height: 32px.
- **h2:** Font: Lora, Weight: Semibold, Size: 20px, Line Height: 25px.
- **h3:** Font: Montserrat, Weight: Semibold, Size: 14px, Line Height: 22px.
- **h4:** Font: Montserrat, Weight: Medium, Size: 14px, Line Height: 20px.
- **p:** Font: Montserrat, Weight: Regular, Size: 16px, Line Height: 24px.
- **small:** Font: Montserrat, Weight: Regular, Size: 14px, Line Height: 20px.
- **span:** Font: Montserrat, Weight: Regular, Size: 12px, Line Height: 19px.
- **Navigation (Tab):** Define variants for `active` (Bold), `hover` (Semi-Bold), and `inactive` (Regular) for `small` elements.

#### 4.2. Refactoring Existing Components

- All existing components and pages in the codebase must be converted to the new design system.
- All inline styles and ad-hoc CSS classes not originating from the new Tailwind configuration must be removed and replaced.
- Components should, where possible, be styled using `shadcn/ui` conventions, utilizing the defined tokens.

#### 4.3. Analysis of Missing Styles

- Identify UI elements and states not defined in the current designs (e.g., focus-states, disabled-states, specific hover effects for buttons and links).
- Document these "gaps" and propose a consistent approach.

#### 4.4. Updating Developer Guidelines

- The cursor rules (guidance document for the LLM assistant) must be updated to mandate that all future styling-related requests use the newly established design system tokens and components.
- The new rule should explicitly forbid ad-hoc styling (e.g., direct use of hex codes or pixel values in component files) and direct the LLM to modify the central `tailwind.config.js` if new styles are needed.

### 5. Non-Goals (Out of Scope)

- **Full Dark Mode:** Although the system should be flexible, the full implementation of a dark mode is not part of this project. The existing "dark mode" like-button is considered a standalone theme and not part of a global dark mode.
- **New Components:** This project focuses on refactoring the existing UI, not on building new components.
- **Animations:** Complex animations are out of scope unless they are already part of existing components.

### 6. Design Considerations

- The implementation must be a pixel-perfect translation of the provided design screenshots.
- `font-smoothing` should be set to `antialiased` for better readability.

### 7. Technical Considerations

- **Tailwind CSS:** All design tokens will be defined in `tailwind.config.js` under the `theme.extend` section.
- **Fonts:** It is assumed that the 'Lora' and 'Montserrat' fonts are correctly configured via `next/font`.
- **Components:** Use `cva` (Class Variance Authority) for creating component variants, in line with `shadcn/ui` best practices.

### 8. Success Metrics

- **100% Refactored:** All relevant components and pages use the new design system.
- **No Ad-Hoc Styling:** No custom CSS classes or inline styles are present for the defined tokens.
- **Visual Consistency:** A visual inspection shows that the application is consistent and matches the designs.
- **Code Quality:** The amount of CSS-related code is reduced and centralized.
- **Developer Guidelines Updated:** The cursor rules for the LLM have been updated to enforce the use of the new design system.

### 9. Open Questions

1.  **Dark Mode Strategy:** What is the long-term vision for a dark mode? Should we prepare the token names for a themable setup now (e.g., `bg-primary` vs. `bg-primary-light`)?
2.  **Missing States:** How do we define `hover`, `focus`, `active`, and `disabled` states for elements not specified in the designs (such as input fields, checkboxes, etc.)?
3.  **Spacing System:** The designs do not specify an explicit spacing system (e.g., 4pt grid). Should we define a standard `spacing` scale in Tailwind for margins and paddings?
4.  **Component Library:** Is there a need to set up a tool like Storybook for documenting and visualizing the components?
