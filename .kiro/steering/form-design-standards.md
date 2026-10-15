# Form & Process Design Standards

All forms and multi-step processes in this system must follow the design pattern described below. This applies to supplier registration, tender evaluation, competency assessments, award notices, and any other workflow-driven forms.

---

## Layout Structure

Every form page has three sections stacked vertically:

1. **Form Header** — title, subtitle description, and an info/warning banner if applicable
2. **Step Navigation Bar** — horizontal scrollable stepper showing all steps
3. **Step Content Area** — the active step's fields rendered below the stepper

---

## Form Header

- **Title**: Bold, uppercase, large font (e.g. `text-2xl font-bold tracking-wide text-gray-900`)
- **Subtitle**: Plain sentence describing the form's purpose and who reviews it
- **Info Banner**: Light blue background (`bg-blue-50 border border-blue-200`), amber warning icon on the left, italic or normal text explaining standardisation or important context. Use this when the form is standardised or has regulatory alignment.
- **Application Type Selector**: When applicable, show radio buttons for form mode (e.g. "NEW APPLICATION" / "NOTIFICATION OF CHANGE OF STATUS") in bold uppercase labels directly below the banner.

---

## Step Navigation Bar (Stepper)

- Horizontal scrollable bar with left/right scroll arrows at each end
- Each step is a pill/tab with:
  - A checkmark icon (✓) for **completed** steps — green background (`bg-emerald-600 text-white`)
  - A number for the **current/active** step — dark background (`bg-gray-900 text-white`)
  - Outlined style for **upcoming** steps — white background with border
- Steps are connected by a thin horizontal line
- The bar scrolls horizontally when steps overflow the visible width
- Step labels are concise (e.g. "Business Codes", "Directors & Shareholders", "Banking Details", "Review & Submit")

### Stepper Component Pattern

```tsx
// Step states: 'completed' | 'active' | 'upcoming'
// Completed: bg-emerald-600 text-white with CheckCircle icon
// Active: bg-gray-900 text-white with step number
// Upcoming: border border-gray-300 text-gray-500 with step number
```

---

## Step Content Area

- White card with subtle border (`border border-gray-200 rounded-lg`)
- Step heading: `Step N: Step Title` in medium-weight heading (`text-lg font-semibold text-gray-800`)
- Fields are arranged in a **2-column grid** on desktop, collapsing to 1-column on mobile (`grid grid-cols-1 md:grid-cols-2 gap-4`)

### Field Style

Each field is rendered as a bordered box:

```tsx
// Field container
<div className="border border-gray-200 rounded p-3 bg-white">
  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
    FIELD LABEL
  </label>
  <div className="text-sm text-gray-800 min-h-[20px]">
    {value || "—"}  {/* Show em dash when empty */}
  </div>
</div>
```

- Labels: ALL CAPS, small, muted (`text-xs font-semibold uppercase tracking-wide text-gray-400`)
- Values: Normal weight, readable size (`text-sm text-gray-800`)
- Empty values: Show `—` (em dash), never blank
- Input fields: Standard height, full width, with border on focus (`border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`)

---

## Navigation Buttons

At the bottom of each step:

- **Back** button: Ghost/outline style, left-aligned or in a flex row
- **Next / Save & Continue** button: Solid green (`bg-emerald-600 hover:bg-emerald-700 text-white`), right-aligned
- **Submit** button (final step): Same solid green, labelled "Submit Application" or equivalent
- Button row uses `flex justify-between` or `flex justify-end gap-3`

---

## Colour Palette for Forms

| Element | Class |
|---|---|
| Stepper completed | `bg-emerald-600` |
| Stepper active | `bg-gray-900` |
| Primary action button | `bg-emerald-600 hover:bg-emerald-700` |
| Info banner background | `bg-blue-50 border-blue-200` |
| Info banner icon | Amber / `text-amber-500` |
| Field border | `border-gray-200` |
| Field label | `text-gray-400` uppercase |
| Section heading | `text-gray-800 font-semibold` |

---

## Review & Submit Step

The final step summarises all entered data:

- Display each field as a read-only labelled box (same bordered-box style as input fields)
- Group fields by section with a section sub-heading
- Full 2-column grid layout
- A declaration/checkbox at the bottom before the Submit button
- Submission triggers a confirmation toast or modal

---

## Responsiveness

- All forms are mobile-first
- The stepper scrolls horizontally on small screens with visible scroll arrows
- Field grids collapse to single column below `md` breakpoint
- Buttons stack vertically on mobile

---

## Accessibility

- All inputs have associated `<label>` elements or `aria-label`
- Required fields marked with `*` in the label
- Focus styles visible on all interactive elements
- Error messages rendered inline below the relevant field in red (`text-red-600 text-xs`)

---

## When to Apply This Pattern

Use this form structure for **every** process that involves:
- Multi-step data capture (registration, application, evaluation)
- Review-and-submit workflows
- Status change notifications
- Any procurement or administrative form in the system

Do not invent alternative form layouts. All new forms must follow this standard.
