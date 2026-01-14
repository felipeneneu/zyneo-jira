# UI/UX Specification: Workspace Creation Onboarding Wizard

## 1. Overview
This document specifies the design and architecture for the Workspace Creation Onboarding Wizard. The goal is to provide a clean, professional, and progressive onboarding experience for new users, strictly adhering to the project's existing design system and strict TypeScript standards.

## 2. Design System Integration
The wizard will use the existing architectural tokens defined in `globals.css` (Tailwind v4).

- **Colors**:
  - Background: `bg-background` (Clean white/dark base)
  - Primary Actions: `bg-primary` text `text-primary-foreground`
  - Cards/Surfaces: `bg-card` with `border-border`
  - Secondary/Muted: `bg-muted` for unselected states or secondary info
- **Typography**:
  - Headings: `font-sans font-semibold tracking-tight`
  - Body: `font-sans text-muted-foreground`
- **Spacing**:
  - Standard container padding: `p-6` or `p-8`
  - Gap between options: `gap-4`

## 3. Component Architecture
Located in `src/features/workspaces/components/onboarding/`.

### 3.1. Container Component: `WorkspaceWizard`
- **Responsibility**: Manages the overall state (current step, form data) and renders the appropriate step component.
- **Layout**: Centered modal-like card or full-page focused layout (depending on route).
- **Props**: `initialStep?: number`, `onComplete: (data: WorkspaceData) => void`.

### 3.2. Layout Component: `WizardStep`
- **Responsibility**: Common layout for every step (Header, Content, Footer).
- **Props**:
  - `title`: string
  - `description`: string
  - `children`: ReactNode
  - `footer`: ReactNode (Back/Next buttons)

### 3.3. Reusable Atoms
- **`OptionCard`**:
  - Used for Step 1 (Purpose) and Step 2 (Type).
  - Visuals: Bordered card, hover effect (`hover:border-primary`), selected state (`border-primary bg-primary/5 ring-2 ring-primary/20`).
  - Props: `title`, `icon?`, `selected: boolean`, `onClick: () => void`.

### 3.4. Step Components
1.  `StepPurpose`: Select "Work", "Personal", "School".
2.  `StepType`: Select "Software Dev", "Design", "Operations", "Sales".
3.  `StepMethodology`: Workflow style inputs (Select/Radio Group).
4.  `StepIdentity`: Workspace Name + Icon picker.

## 4. State Management (Strict TypeScript)
We will use a localized specialized hook `useWorkspaceWizard` (context or simple state depending on scope) to avoid prop drilling.

```typescript
// types.ts
export type WorkspacePurpose = 'work' | 'personal' | 'school';
export type WorkspaceType = 'development' | 'design' | 'operations' | 'sales';
export type TeamSize = 'solo' | '2-5' | '6-15' | '16+';
export type MainGoal = 'organize' | 'deliver' | 'sell' | 'standardize';

export interface WorkspaceOnboardingState {
  step: number;
  purpose: WorkspacePurpose | null;
  type: WorkspaceType | null;
  teamSize: TeamSize; // Default 'solo'
  mainGoal: MainGoal; // Default 'organize'
  name: string;
  icon?: string;
}

export interface WizardActions {
  setPurpose: (purpose: WorkspacePurpose) => void;
  setType: (type: WorkspaceType) => void;
  setMethodology: (size: TeamSize, goal: MainGoal) => void;
  setName: (name: string) => void;
  nextStep: () => void;
  prevStep: () => void;
}
```

## 5. Validation Rules (Zod)
Each step must pass validation before "Next" is enabled.

```typescript
// schemas.ts
import { z } from 'zod';

export const step1Schema = z.object({
  purpose: z.enum(['work', 'personal', 'school'])
});

export const step4Schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name too long"),
    // check for restricted names (admin, root, etc)
});
```

## 6. UX Details & Micro-interactions
- **Progress**: A visual stepper (e.g., "Step 2 of 4") at the top right or center.
- **Transitions**: `framer-motion` or Tailwind `transition-all` for smooth step switching.
- **Empty States**: Next button disabled until selection is made (or visually distinct).
- **Auto-advance**: purely optional, but for single-selection cards (Step 1 & 2), identifying if user clicks a card could auto-advance for smoother flow (experimental, nice to have).

## 7. Accessibility
- **Keyboard Navigation**: All `OptionCard` elements must be buttons (`type="button"`) or have `role="radio"` with keyboard handling.
- **Focus Management**: Focus should move to the definition of the new step when transition happens.
- **Contrast**: Ensure selected states have enough contrast (`ring-2` helps here).
- **Labels**: All form inputs must have associated labels.

## 8. File Structure Proposal
```
src/features/workspaces/
  components/
    onboarding/
      wizard-container.tsx   // Main orchestration
      wizard-step-layout.tsx // UI shell
      option-card.tsx        // Reusable card
      step-purpose.tsx       // Step 1
      step-type.tsx          // Step 2
      step-methodology.tsx   // Step 3
      step-identity.tsx      // Step 4
      store.ts               // State logic
      schemas.ts             // Zod validation
```
