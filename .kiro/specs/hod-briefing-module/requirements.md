# Requirements Document

## Introduction

The HOD Briefing Module extends the existing Briefing module (`/briefing`) in the APPOIS government
procurement platform (Zimbabwe) by adding a dedicated **HOD Briefing** tab. The tab gives Heads of
Department a structured, hierarchical view of all briefing reports across eight functional domains,
each segmented by four reporting periods (Weekly, Monthly, Quarterly, Annual). Each period level
exposes individual time-boxed report slots that an HOD can open, review, and navigate.

The feature is purely a frontend navigation and display feature built on top of the existing React +
TypeScript + Tailwind CSS + shadcn/ui stack used throughout the platform.

---

## Glossary

- **HOD**: Head of Department — a senior government official who oversees a functional department.
- **HOD_Briefing_Tab**: The new top-level tab added to the existing Briefing module tab strip.
- **Sub_Tab**: One of the eight domain-specific sections within the HOD_Briefing_Tab (e.g., "H.O.D Briefing Reports", "Projects Briefing Reports").
- **Reporting_Period**: One of the four time-based groupings — Weekly, Monthly, Quarterly, or Annual.
- **Period_Folder**: A collapsible/expandable container within a Sub_Tab that holds individual Report_Slots for a given Reporting_Period.
- **Report_Slot**: An individual, selectable entry representing a single time-boxed report (e.g., "Week 12", "Month 3", "Quarter 2", "Annual Report").
- **BriefingPage**: The existing React page component at `src/pages/BriefingPage.tsx`.
- **TABS**: The array of tab definitions rendered in the BriefingPage tab strip.
- **Active_Sub_Tab**: The currently selected Sub_Tab within the HOD_Briefing_Tab.
- **Active_Period_Folder**: The currently expanded Period_Folder within the Active_Sub_Tab.
- **Active_Report_Slot**: The currently selected Report_Slot within the Active_Period_Folder.
- **HOD_Briefing_Component**: The new React component that renders the entire HOD_Briefing_Tab content (`src/components/HodBriefingTab.tsx`).

---

## Requirements

### Requirement 1: HOD Briefing Tab Registration

**User Story:** As an HOD, I want a dedicated "HOD Briefing" tab in the Briefing module, so that I can access all my department briefing reports from a single, clearly labelled entry point.

#### Acceptance Criteria

1. THE BriefingPage SHALL render the HOD_Briefing_Tab as one additional tab entry in the TABS collection, positioned after all pre-existing tabs.
2. WHEN the HOD_Briefing_Tab is clicked, THE BriefingPage SHALL set exactly one active tab (the HOD_Briefing_Tab) and render the HOD_Briefing_Component as the sole tab content panel, with no other tab content panel visible at the same time.
3. THE HOD_Briefing_Tab SHALL display the label "HOD Briefing" and the `Building2` icon from lucide-react, rendered at the same size and spacing as icons on all other tabs in the TABS collection.
4. WHEN a tab other than the HOD_Briefing_Tab is the active tab, THE BriefingPage SHALL NOT include the HOD_Briefing_Component in the rendered output.

---

### Requirement 2: Eight Domain Sub-Tabs

**User Story:** As an HOD, I want eight domain-specific sub-tabs inside the HOD Briefing tab, so that I can navigate directly to the briefing category relevant to my work.

#### Acceptance Criteria

1. THE HOD_Briefing_Component SHALL render exactly eight Sub_Tabs in the following fixed order:
   1. H.O.D Briefing Reports
   2. Projects Briefing Reports
   3. Operations Briefing Reports
   4. Key Performance Briefing Reports
   5. Contracts Briefing Reports
   6. Service Delivery Briefing Reports
   7. Compliance and Risk Briefing Reports
   8. Minutes and Resolutions Briefing Reports
2. WHEN a Sub_Tab is clicked, THE HOD_Briefing_Component SHALL set that Sub_Tab as the Active_Sub_Tab and render its Period_Folder list in the default collapsed state.
3. WHEN the HOD_Briefing_Component mounts, THE HOD_Briefing_Component SHALL set Sub_Tab 1 ("H.O.D Briefing Reports") as the Active_Sub_Tab.
4. IF a Sub_Tab is the Active_Sub_Tab, THEN THE HOD_Briefing_Component SHALL apply a blue-600 background with white text to that Sub_Tab button within the same render cycle as the activation.
5. IF a Sub_Tab is not the Active_Sub_Tab, THEN THE HOD_Briefing_Component SHALL apply a gray-50 background with gray-700 text to that Sub_Tab button.
6. THE HOD_Briefing_Component SHALL render Sub_Tabs in a horizontally scrollable strip so that all eight labels remain reachable on screens 768 px wide or below without layout overflow.

---

### Requirement 3: Four Reporting Period Folders per Sub-Tab

**User Story:** As an HOD, I want each domain sub-tab to show four reporting period folders (Weekly, Monthly, Quarterly, Annual), so that I can locate reports by the time frame they cover.

#### Acceptance Criteria

1. WHEN a Sub_Tab is the Active_Sub_Tab, THE HOD_Briefing_Component SHALL render exactly four Period_Folders in the order: Weekly, Monthly, Quarterly, Annual.
2. THE HOD_Briefing_Component SHALL label the Period_Folders with the `Calendar` icon for Weekly and Monthly, the `BarChart3` icon for Quarterly, and the `TrendingUp` icon for Annual (all icons from lucide-react).
3. WHEN an collapsed Period_Folder is clicked, THE HOD_Briefing_Component SHALL expand that folder to reveal its Report_Slots and collapse any other Period_Folder that was previously expanded within the same Sub_Tab.
4. WHEN an expanded Period_Folder is clicked, THE HOD_Briefing_Component SHALL collapse that folder and render all four Period_Folders in the collapsed state.
5. WHEN a Sub_Tab becomes the Active_Sub_Tab, THE HOD_Briefing_Component SHALL render all four of its Period_Folders in the collapsed state unless the user has previously expanded one in that Sub_Tab.
6. THE HOD_Briefing_Component SHALL display a numeric badge on each Period_Folder label showing the exact count of Report_Slots it contains: 48 for Weekly, 12 for Monthly, 4 for Quarterly, and 1 for Annual.

---

### Requirement 4: Weekly Report Slots (Week 1 – Week 48)

**User Story:** As an HOD, I want to see 48 weekly report slots inside the Weekly folder, so that I can access a report for any week of the full year.

#### Acceptance Criteria

1. WHEN the Weekly Period_Folder is expanded, THE HOD_Briefing_Component SHALL render exactly 48 Report_Slots labelled "Week 1" through "Week 48" in ascending numeric order.
2. THE HOD_Briefing_Component SHALL render the 48 weekly Report_Slots inside a vertically scrollable container so that all slots are reachable without causing layout overflow.
3. WHEN a weekly Report_Slot is clicked, THE HOD_Briefing_Component SHALL set that slot as the Active_Report_Slot and display a detail panel showing the slot label, the domain name, the period name, a status badge reading "Unavailable", and Download and Print action buttons.
4. IF a Report_Slot is the Active_Report_Slot, THEN THE HOD_Briefing_Component SHALL apply a blue-600 background with white text to that slot's list item.

---

### Requirement 5: Monthly Report Slots (Month 1 – Month 12)

**User Story:** As an HOD, I want to see 12 monthly report slots inside the Monthly folder, so that I can access a report for any calendar month.

#### Acceptance Criteria

1. WHEN the Monthly Period_Folder is expanded, THE HOD_Briefing_Component SHALL render exactly 12 Report_Slots labelled "Month 1" through "Month 12" in ascending numeric order.
2. IF the data source provides more than 12 monthly entries, THEN THE HOD_Briefing_Component SHALL truncate the list to show only the first 12 entries.
3. IF the data source provides fewer than 12 monthly entries, THEN THE HOD_Briefing_Component SHALL render only the available entries without padding the list to 12.
4. WHEN a monthly Report_Slot is clicked, THE HOD_Briefing_Component SHALL set that slot as the Active_Report_Slot and display the detail panel as defined in Requirement 8.
5. IF a Report_Slot is the Active_Report_Slot, THEN THE HOD_Briefing_Component SHALL apply a blue-600 background with white text to that slot's list item.

---

### Requirement 6: Quarterly Report Slots (Quarter 1 – Quarter 4)

**User Story:** As an HOD, I want to see 4 quarterly report slots inside the Quarterly folder, so that I can access a report for any quarter of the year.

#### Acceptance Criteria

1. WHEN the Quarterly Period_Folder is expanded, THE HOD_Briefing_Component SHALL render exactly 4 Report_Slots labelled "Quarter 1" through "Quarter 4" in ascending numeric order.
2. WHEN a quarterly Report_Slot is clicked, THE HOD_Briefing_Component SHALL set that slot as the Active_Report_Slot and display the detail panel as defined in Requirement 8.
3. IF a Report_Slot is the Active_Report_Slot, THEN THE HOD_Briefing_Component SHALL apply a blue-600 background with white text to that slot's list item.

---

### Requirement 7: Annual Report Slot

**User Story:** As an HOD, I want a single annual report slot inside the Annual folder, so that I can access the full-year summary report.

#### Acceptance Criteria

1. WHEN the Annual Period_Folder is expanded, THE HOD_Briefing_Component SHALL render exactly 1 Report_Slot labelled "Annual Report".
2. IF the data source contains more than one annual entry, THEN THE HOD_Briefing_Component SHALL deduplicate and display only the first annual entry labelled "Annual Report".
3. WHEN the Annual Report_Slot is clicked, THE HOD_Briefing_Component SHALL set it as the Active_Report_Slot and display the detail panel as defined in Requirement 8.
4. IF the Annual Report_Slot is the Active_Report_Slot, THEN THE HOD_Briefing_Component SHALL apply a blue-600 background with white text to that slot's list item.

---

### Requirement 8: Report Detail Panel

**User Story:** As an HOD, I want a detail panel to appear when I select a report slot, so that I can see the report's metadata and take actions such as download or print.

#### Acceptance Criteria

1. WHEN a Report_Slot is set as the Active_Report_Slot, THE HOD_Briefing_Component SHALL render a detail panel containing: the Sub_Tab domain name, the Reporting_Period name, the report label (e.g., "Week 12"), a status badge with the text "Unavailable", and two action buttons labelled "Download" and "Print".
2. WHEN the Download button is clicked in the detail panel, THE HOD_Briefing_Component SHALL display a toast notification with the text "Download not yet available".
3. WHEN the Print button is clicked in the detail panel, THE HOD_Briefing_Component SHALL display a toast notification with the text "Print not yet available".
4. WHILE no Report_Slot is selected, THE HOD_Briefing_Component SHALL render the text "Select a report from the list to view details" in the detail panel area.
5. THE HOD_Briefing_Component SHALL render the report list and detail panel in a two-column layout (list left, panel right) on screens wider than 768 px.
6. WHEN the screen width drops to 768 px or below, THE HOD_Briefing_Component SHALL switch to a single-column layout stacking the report list above the detail panel.
7. WHEN the screen width rises above 768 px, THE HOD_Briefing_Component SHALL restore the two-column layout.

---

### Requirement 9: Navigation State Isolation

**User Story:** As an HOD, I want my navigation state within the HOD Briefing tab to be independent of other tabs, so that switching to another Briefing tab and returning does not reset my place.

#### Acceptance Criteria

1. THE HOD_Briefing_Component SHALL store Active_Sub_Tab, Active_Period_Folder, and Active_Report_Slot exclusively in component-level React state (useState hooks).
2. WHEN the user activates a different BriefingPage tab and then re-activates the HOD_Briefing_Tab, THE HOD_Briefing_Component SHALL display the same Active_Sub_Tab, Active_Period_Folder, and Active_Report_Slot that were set before the tab switch.
3. THE HOD_Briefing_Component SHALL NOT read from or write to the URL, sessionStorage, localStorage, or any external store for Sub_Tab or Report_Slot navigation state.

---

### Requirement 10: Accessibility and Visual Consistency

**User Story:** As an HOD, I want the HOD Briefing module to match the visual language of the existing platform, so that the experience feels integrated and professional.

#### Acceptance Criteria

1. THE HOD_Briefing_Component SHALL use Tailwind CSS utility classes and colour tokens exclusively from the existing palette (blue-600/700 for active states, gray-50/100 for backgrounds) and SHALL compose layout using the same shadcn/ui components (e.g., `ScrollArea`) as found in BriefingPage and sibling components.
2. THE HOD_Briefing_Component SHALL render all interactive elements (Sub_Tab buttons, Period_Folder expand triggers, Report_Slot items, Download button, Print button) as `<button>` elements with a visible focus ring (e.g., `focus:ring-2 focus:ring-blue-500`).
3. WHEN a Period_Folder is expanded, THE HOD_Briefing_Component SHALL render its chevron icon with a `rotate-90` CSS transform; WHEN collapsed, the chevron SHALL have no rotation transform applied.
4. THE HOD_Briefing_Component SHALL render the chevron icon on every Period_Folder regardless of its expanded or collapsed state.
5. WHEN an Active_Sub_Tab button is present in the DOM, THE HOD_Briefing_Component SHALL set `aria-selected="true"` on that button and `aria-selected="false"` on all other Sub_Tab buttons.
6. WHEN a Period_Folder toggle button is present in the DOM, THE HOD_Briefing_Component SHALL set `aria-expanded="true"` on the expanded folder's button and `aria-expanded="false"` on all collapsed folder buttons.
7. THE HOD_Briefing_Component SHALL NOT add any entry to `package.json` dependencies or devDependencies beyond those already present (React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react).
