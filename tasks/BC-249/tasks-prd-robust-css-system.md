## Relevant Files

- `tailwind.config.ts` - Central configuration file for Tailwind CSS. This will be the primary file for defining all design tokens (colors, fonts, radii, etc.).
- `src/app/globals.css` - Global stylesheet where base styles and font definitions are often configured.
- `src/components/**/*.tsx` - All existing UI components will need to be audited and refactored to use the new design system tokens and classes.
- `src/app/**/*.tsx` - Pages may contain UI elements or layout styling that also needs to be refactored.
- `src/lib/utils.ts` - This file (related to `shadcn/ui`) will be updated by the CLI, but good to be aware of.
- `Cursor rules / LLM documentation` - The internal documentation that guides the AI assistant needs to be updated to enforce the new styling rules.

### Notes

- This is a large-scale refactoring task. It's recommended to create a separate Git branch for this work.
- After updating `tailwind.config.ts`, the Tailwind CSS language server in your editor might need a restart to pick up the new tokens.

## Tasks

- [ ] 1.0 **Configure Tailwind CSS with Design Tokens**
    - [ ] 1.1 Add the primary color palette (`primary`, `text-default`, `text-muted`, `accent`, `overlay-dark`, `surface`) to `tailwind.config.ts`.
    - [ ] 1.2 Add the full set of status colors (e.g., `status-blue-bg`, `status-green-text`) for backgrounds, text, and borders.
    - [ ] 1.3 Define the `border-radius` tokens (`rounded-2xl`, `rounded-xl`, `rounded-lg`) in the config. Make a consistent choice for the pixel values based on the PRD.
    - [ ] 1.4 Configure the `fontFamily` tokens to link the `Lora` and `Montserrat` fonts.
    - [ ] 1.5 Define the `fontSize` and `lineHeight` utilities for all text styles (h1-h4, p, small, span).
    - [ ] 1.6 Add `font-smoothing: antialiased` to a base style layer in `globals.css` for better text rendering.
- [ ] 2.0 **Refactor Existing Components to Use the New Design System**
    - [ ] 2.1 Audit all files in `src/components` and `src/app` to identify and list all instances of ad-hoc styling (e.g., inline styles, hex values in `className`).
    - [ ] 2.2 Systematically replace hardcoded colors with the new Tailwind color tokens (e.g., `bg-primary`, `text-muted`).
    - [ ] 2.3 Update all text elements to use the new typography utilities (e.g., `text-h1`, `text-p`).
    - [ ] 2.4 Replace hardcoded `rounded-` classes with the new tokens (e.g., `rounded-xl`).
    - [ ] 2.5 Refactor component variants using `cva` where applicable to align with `shadcn/ui` best practices.
- [ ] 3.0 **Analyze, Document, and Implement Missing Styles**
    - [ ] 3.1 Review the application and identify all interactive elements (buttons, inputs, links) that lack defined `hover`, `focus`, or `disabled` states in the design system.
    - [ ] 3.2 Propose a consistent set of styles for these missing states and document them in the PRD's "Open Questions" section for approval.
    - [ ] 3.3 Define a standard spacing scale (e.g., based on a 4pt grid) in `tailwind.config.ts` to be used for margins and paddings, and document this decision.
    - [ ] 3.4 Implement the approved styles for the missing states using the new tokens.
- [ ] 4.0 **Update LLM and Developer Guidelines**
    - [ ] 4.1 Draft the new rule for the "cursor rules" document that mandates the use of the design system.
    - [ ] 4.2 The rule must explicitly forbid ad-hoc styling and direct the LLM to modify `tailwind.config.ts` for any new, globally applicable styles.
    - [ ] 4.3 Submit the updated rule for review and inclusion in the active guidelines.
- [ ] 5.0 **Final Verification and Cleanup**
    - [ ] 5.1 Perform a full visual regression test of the application to ensure all components are rendered correctly and consistently.
    - [ ] 5.2 Run a codebase search to ensure no hardcoded color values or non-tokenized styles remain.
    - [ ] 5.3 Delete any unused CSS files or styles that have been made redundant by the new system.
    - [ ] 5.4 Merge the feature branch into the main development branch after successful review.
