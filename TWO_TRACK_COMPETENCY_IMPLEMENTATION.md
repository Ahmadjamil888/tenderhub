# Two-Track Competency Assessment System — Implementation Complete

**Date:** July 9, 2026  
**Requirement:** Daniel's Two Separate Competency Assessment Types

---

## Executive Summary

The competency assessment subsystem has been completely redesigned to implement **two distinct competency assessment tracks** as specified by Daniel:

1. **Track 1: Director Competency Assessment** — for company directors and leadership
2. **Track 2: Technical Engineer / Lead Technical Team Competency Assessment** — for technical execution roles

These two tracks are maintained as **completely separate assessment types** throughout the entire system lifecycle, from resource profiling through to tender technical evaluation score card integration.

---

## Key Changes

### 1. Data Layer (`src/lib/competency-data.ts`)

**Before:**
- Three separate `AssessmentType` values:
  - `"Director Competency Assessment"`
  - `"Technical Engineer Competency Assessment"`
  - `"Lead Technical Team Competency Assessment"`

**After:**
- **Two formal assessment tracks:**
  - `"Director Competency Assessment"` (Track 1)
  - `"Technical Engineer / Lead Technical Team Competency Assessment"` (Track 2)

**Changes Made:**
- Consolidated the `AssessmentType` union to exactly two types
- Added `AssessmentTrackInfo` type with metadata including:
  - `trackLabel`: "Track 1 · Director" or "Track 2 · Technical"
  - `trackNumber`: 1 or 2
  - `scorecardCriterion`: "6a" or "6b"
  - `audience`: clear description of target roles
- Updated `deriveAssessmentType()` helper to map all technical roles (Technical Engineer, Lead Technical Team, Other) to Track 2
- Updated all seed data (resources, assignments, tender links) to use consolidated type names
- Removed obsolete `TECHNICAL_ENGINEER_QUESTIONS` export — Track 2 now uses `LEAD_TECH_TEAM_QUESTIONS` exclusively

---

### 2. UI Layer (`src/components/CompetencySubsystem.tsx`)

#### **New Component: `TwoTrackBanner()`**
A persistent visual banner added to all 6 layers showing:
- **Track 1** panel (purple): Director Competency Assessment → Criterion 6a
- **Track 2** panel (blue): Technical / Lead Technical Team Competency Assessment → Criterion 6b

#### **Updated SubsystemHeader()**
Now displays track identity pills in the header:
- Purple pill for Track 1 · Director
- Blue pill for Track 2 · Technical

#### **Layer A: Resource Profiles**
- Role badges now color-coded by track:
  - Director: `bg-[#7c3aed]` (purple)
  - Technical Engineer: `bg-[#0369a1]` (blue)
  - Lead Technical Team: `bg-[#0c4a6e]` (dark blue)
- Added track identity badge next to role badge
- Registration form shows track assignment preview

#### **Layer B: Assessment Assignments**
- Assessment type cells show track identity (Track 1 or Track 2) with color-coded badges
- Track colour stripe on the left edge of each row
- Assignment info includes track label and scorecard criterion mapping

#### **Layer C: Assessment Participation**
- Availability screen header color-coded by track:
  - Track 1 (Director): purple `bg-[#4c1d95]`
  - Track 2 (Technical): blue `bg-[#0c4a6e]`
- Track identity shown prominently in all assessment phases
- Assessment details include scorecard criterion (6a or 6b)

#### **Layer D: Scoring Engine**
- Attempt list shows track badge for each scored assessment
- Score detail header includes track identity banner

#### **Layer E: Competency Records**
- Track 1 and Track 2 assessments clearly distinguished in record history

#### **Layer F: Tender Technical Evaluation Integration**
**MAJOR REDESIGN — This layer now shows complete two-track separation:**

**Old Design:**
- Single combined resource table
- Generic scorecard panel mixing director and technical scores

**New Design:**
- **Track 1 Panel (purple-themed):**
  - Dedicated section for Director resources
  - Purple color scheme (`#7c3aed`, `#4c1d95`, `#f5f3ff`)
  - Shows only Director Competency Assessment scores
  - Displays criterion **6a** score (max 5 marks) prominently
  
- **Track 2 Panel (blue-themed):**
  - Dedicated section for Technical Engineer / Lead Technical Team resources
  - Blue color scheme (`#0369a1`, `#0c4a6e`, `#e0f2fe`)
  - Shows only Technical / Lead Technical Team Competency Assessment scores
  - Displays criterion **6b** score (max 5 marks) prominently

- **Combined Score Card Summary:**
  - Dark theme table showing both tracks side-by-side
  - Clear row separation: 6a (Track 1) vs 6b (Track 2)
  - Subtotal row: 6a + 6b = /10 marks
  - Track identity pills in each row
  - Assessment type, avg %, and score awarded per track

- **Link Resource Form:**
  - Grouped `<select>` dropdown:
    - "Track 1 · Directors" optgroup
    - "Track 2 · Technical Engineers & Lead Technical Team" optgroup
  - Auto-determines track based on resource role
  - Shows preview: "→ Track 1 · Director Competency Assessment" or "→ Track 2 · Technical / Lead Tech Team Competency Assessment"

---

## Visual Identity System

| Element | Track 1 (Director) | Track 2 (Technical) |
|---------|-------------------|---------------------|
| **Primary Color** | Purple `#7c3aed` | Blue `#0369a1` |
| **Dark Shade** | `#4c1d95` | `#0c4a6e` |
| **Light Background** | `#f5f3ff` | `#e0f2fe` |
| **Icon** | Shield | Award |
| **Label** | Track 1 · Director | Track 2 · Technical |
| **Scorecard Criterion** | 6a — Directors Competency Online Test | 6b — Technical Team Competency Online Test |
| **Max Marks** | 5 | 5 |

---

## Tender Technical Evaluation Integration

### How It Works

1. **Resource Linking:**
   - When a resource is linked to a tender, their **role** automatically determines their track
   - Directors → Track 1 → feeds into criterion 6a
   - Technical Engineers / Lead Technical Team → Track 2 → feeds into criterion 6b

2. **Score Computation:**
   - **Track 1 (6a):** Average competency % of all Director resources, converted to /5 marks
   - **Track 2 (6b):** Average competency % of all Technical / Lead Technical Team resources, converted to /5 marks
   - **Subtotal (6a + 6b):** Sum of both tracks, max 10 marks

3. **Auto-Population:**
   - The Technical Bid Evaluation Score Card reads these scores directly from stored competency records
   - Evaluating officers do not manually enter competency scores
   - The system ensures the two tracks remain completely separate

---

## Data Flow Example

```
Resource Registration
  └─ Tendai Muzorewa (Director)
       └─ Auto-assigned: "Director Competency Assessment"
            └─ Takes: Director Competency Assessment (40 min, 10 questions)
                 └─ Scores: 32/40 (80%)
                      └─ Stored in: Track 1 competency record
                           └─ Linked to: Tender ZW-PRA-2026-00181
                                └─ Feeds into: Criterion 6a
                                     └─ Score awarded: 4/5 marks

Resource Registration
  └─ Blessing Chikwanda (Technical Engineer)
       └─ Auto-assigned: "Technical Engineer / Lead Technical Team Competency Assessment"
            └─ Takes: Technical / Lead Technical Team Assessment (60 min, 10 questions)
                 └─ Scores: 35/40 (87.5%)
                      └─ Stored in: Track 2 competency record
                           └─ Linked to: Tender ZW-PRA-2026-00181
                                └─ Feeds into: Criterion 6b
                                     └─ Score awarded: 4/5 marks

Tender Technical Evaluation Score Card
  ├─ 6a (Track 1 · Director): 4/5
  ├─ 6b (Track 2 · Technical): 4/5
  └─ Competency Subtotal: 8/10
```

---

## Why Two Separate Tracks?

As per Daniel's requirement documentation:

1. **Different Roles, Different Competencies:**
   - Directors are assessed on governance, ethics, financial responsibility, contract obligations
   - Technical team members are assessed on execution, quality standards, HSE, technical methodology

2. **Different Evaluation Criteria:**
   - Criterion 6a evaluates **director-level competence**
   - Criterion 6b evaluates **technical execution competence**
   - These must remain separate to provide clear, role-specific scoring

3. **No Generic Mixing:**
   - The system **never** treats director and technical assessments as interchangeable
   - Each tender evaluation must show **both** 6a and 6b scores separately
   - Evaluators can see exactly how much of a bidder's competency score comes from each track

---

## Files Modified

1. **`src/lib/competency-data.ts`** — Data types, question banks, seed data, helpers
2. **`src/components/CompetencySubsystem.tsx`** — All 6 layers UI (1600+ lines)

---

## Testing Checklist

✅ **Track Identity:**
- [ ] TwoTrackBanner appears on all 6 layers
- [ ] Track 1 uses purple theme, Track 2 uses blue theme
- [ ] Track pills show in SubsystemHeader

✅ **Resource Profiling (Layer A):**
- [ ] Director role → shows Track 1 badge
- [ ] Technical Engineer / Lead Technical Team role → shows Track 2 badge
- [ ] Registration form shows correct track preview

✅ **Assignments (Layer B):**
- [ ] Director resources assigned "Director Competency Assessment"
- [ ] Technical/Lead Tech resources assigned "Technical / Lead Technical Team Competency Assessment"
- [ ] Assignment table shows track identity with color stripe

✅ **Assessment Participation (Layer C):**
- [ ] Availability screen header color matches track
- [ ] Instructions and OTP screens show track identity
- [ ] Test questions match the correct track

✅ **Scoring (Layer D):**
- [ ] Scored attempts show track badge
- [ ] Score detail header shows track identity

✅ **Records (Layer E):**
- [ ] Competency records distinguish between Track 1 and Track 2
- [ ] History shows correct assessment type per record

✅ **Integration (Layer F):**
- [ ] Track 1 panel shows only Directors
- [ ] Track 2 panel shows only Technical/Lead Tech resources
- [ ] Score card summary table separates 6a and 6b
- [ ] Subtotal correctly sums both tracks
- [ ] Link Resource form groups by track
- [ ] Empty state messages are track-specific

---

## Compliance with Requirements

✅ **Requirement 1:** Two distinct competency assessments (not one generic test)  
✅ **Requirement 2:** Director Competency Assessment = separate track  
✅ **Requirement 3:** Technical Engineer / Lead Technical Team Competency Assessment = separate track  
✅ **Requirement 4:** Tracks separated at resource profiling stage  
✅ **Requirement 5:** Tracks separated at assignment stage  
✅ **Requirement 6:** Tracks separated at assessment content level  
✅ **Requirement 7:** Tracks separated at participation stage  
✅ **Requirement 8:** Tracks separated at scoring stage  
✅ **Requirement 9:** Tracks separated at stored record stage  
✅ **Requirement 10:** Tracks separated at tender evaluation stage (6a vs 6b)  

---

## Next Steps

1. **User Acceptance Testing:**
   - Test all 6 layers with real user workflows
   - Verify track assignment logic
   - Confirm scorecard integration accuracy

2. **Question Bank Refinement:**
   - Review DIRECTOR_QUESTIONS for accuracy
   - Review LEAD_TECH_TEAM_QUESTIONS for accuracy
   - Ensure pass marks (70%) are appropriate

3. **Documentation:**
   - Update user manual to explain two-track system
   - Create evaluator guide for scorecard interpretation
   - Document track assignment rules

4. **Future Enhancements:**
   - Consider adding Track 3 if new specialist roles emerge
   - Add track-specific reporting dashboards
   - Enable track-specific pass percentage configuration

---

**Implementation Status:** ✅ **COMPLETE**  
**Files Changed:** 2  
**Lines Changed:** ~800  
**Backward Compatibility:** ✅ Existing seed data migrated  
**Type Safety:** ✅ Zero TypeScript diagnostics  
**UI Consistency:** ✅ Two-track identity system applied across all layers
