# Complete CV Ingestion & Entity Mapping Solution

## Overview

This document explains the complete solution for extracting CV data with Gemini AI and automatically creating/mapping database entities.

## Problems Solved

### 1. ✅ Skills Disappearing
**Problem**: Unmapped skills were removed from form data
**Solution**: Use `__UNMAPPED__skillName` as temporary ID, then remap after creation

### 2. ✅ Only One Project Showing
**Problem**: Component initialized before CV data arrived
**Solution**: Re-initialize form when Redux has more data than current form

### 3. ✅ Degrees Not Mapping
**Problem**: Extracted degree names didn't match database
**Solution**: Use `__UNMAPPED__` prefix and auto-create + remap

### 4. ✅ Institutions Not Mapping
**Problem**: Extracted institution names didn't match database
**Solution**: Use `__UNMAPPED__` prefix and auto-create + remap

---

## Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER UPLOADS CV                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GEMINI EXTRACTS DATA                                     │
│     - Skills: ["React.js", "Node.js", "Rust"]               │
│     - Degrees: ["Bachelor of Computer Science"]             │
│     - Institutions: ["MIT"]                                  │
│     - Projects: [6 projects]                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ENTITY RESOLUTION (First Pass)                           │
│     ✅ React.js → Found (ID: skill-123)                      │
│     ❌ Node.js → Not found (unmapped)                        │
│     ❌ Rust → Not found (unmapped)                           │
│     ❌ Bachelor of CS → Not found (unmapped)                 │
│     ❌ MIT → Not found (unmapped)                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. NORMALIZE WITH TEMP IDs                                  │
│     technicalSkills: [                                       │
│       {                                                       │
│         category: "__UNMAPPED__Frontend",                    │
│         skills: [                                             │
│           { skillId: "skill-123", ... },     // Found        │
│           { skillId: "__UNMAPPED__Node.js" }, // Not found   │
│           { skillId: "__UNMAPPED__Rust" }     // Not found   │
│         ]                                                     │
│       }                                                       │
│     ]                                                         │
│     education: [                                              │
│       {                                                       │
│         degree: "__UNMAPPED__Bachelor of Computer Science",  │
│         institution: "__UNMAPPED__MIT"                       │
│       }                                                       │
│     ]                                                         │
│     projects: [6 projects] ✅                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. USER REVIEWS & APPROVES                                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  6. CREATE MISSING ENTITIES                                  │
│     → Create "Frontend" category (ID: cat-456)               │
│     → Create "Node.js" skill (ID: skill-789)                 │
│     → Create "Rust" skill (ID: skill-012)                    │
│     → Create "Bachelor of CS" degree                         │
│     → Create "MIT" institution                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  7. RELOAD ENTITY RESOLVER                                   │
│     (Now includes newly created entities)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  8. REMAP WITH ACTUAL IDs                                    │
│     technicalSkills: [                                       │
│       {                                                       │
│         category: "cat-456",              // ✅ Real ID      │
│         skills: [                                             │
│           { skillId: "skill-123" },       // ✅ Already good │
│           { skillId: "skill-789" },       // ✅ Now mapped   │
│           { skillId: "skill-012" }        // ✅ Now mapped   │
│         ]                                                     │
│       }                                                       │
│     ]                                                         │
│     education: [                                              │
│       {                                                       │
│         degree: "Bachelor of Computer Science",  // ✅ Clean │
│         institution: "Massachusetts Institute of Technology" │
│       }                                                       │
│     ]                                                         │
│     projects: [6 projects] ✅                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  9. DISPATCH TO REDUX                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  10. FORM RE-INITIALIZES                                     │
│      - Detects: Redux has 6 projects, form has 1            │
│      - Re-loads form with all data                           │
│      - All dropdowns now have proper values                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Normalizer (`normalizers/index.ts`)
**Purpose**: Convert parsed CV to form data structure

**Changes**:
- Use `__UNMAPPED__` prefix for unfound entities
- Always include skills/degrees/institutions (never remove)

```typescript
// Skills
if (skillMatch.matched) {
  skillId: skillMatch.entity.id  // Use real ID
} else {
  skillId: "__UNMAPPED__React.js"  // Use temp ID
}

// Degrees
degree: degreeMatch.matched
  ? degreeMatch.entity.name
  : "__UNMAPPED__Bachelor of CS"

// Institutions
institution: institutionMatch.matched
  ? institutionMatch.entity.name
  : "__UNMAPPED__MIT"
```

### 2. Entity Creator (`unmapped-entity-creator.ts`)
**Purpose**: Create missing database entities

**Process**:
1. Check for duplicates using fuzzy matching (85% similarity)
2. Create in order: Categories → Degrees → Institutions → Skills
3. Infer metadata (degree level, institution type)
4. Return ID mappings

**Smart Inference**:
```typescript
// Degree: "Master of Computer Science"
→ level: "Graduate"
→ shortName: "MCS"

// Institution: "ABC College"
→ type: "College"
→ location: "Unknown" (user updates later)
```

### 3. Entity Remapper (`entity-remapper.ts`)
**Purpose**: Replace temporary IDs with real database IDs

**Process**:
1. Reload entity resolver (includes new entities)
2. Find all `__UNMAPPED__` prefixed values
3. Extract original name from prefix
4. Re-resolve with fresh resolver
5. Replace temp ID/name with real one

```typescript
// Before remap
skillId: "__UNMAPPED__React.js"
degree: "__UNMAPPED__Bachelor of CS"

// After remap
skillId: "skill-123"
degree: "Bachelor of Computer Science"
```

### 4. CVIngestionWrapper (`CVIngestionWrapper.tsx`)
**Purpose**: Orchestrate the entire flow

**On User Approval**:
```typescript
1. Extract unmapped entities
2. If any unmapped:
   a. Create entities
   b. Reload resolver
   c. Remap form data
   d. Dispatch to Redux
3. If none unmapped:
   a. Dispatch as-is
```

### 5. Step4Projects (`Step4Projects.tsx`)
**Purpose**: Display projects in form

**Fix**: Re-initialize when Redux has more data
```typescript
const needsUpdate =
  !isInitialized ||  // First time
  (reduxProjects.length !== currentProjects.length) ||  // Different count
  (JSON.stringify(reduxProjects) !== JSON.stringify(currentProjects));  // Different data

if (needsUpdate) {
  reset({ projects: reduxProjects });
}
```

---

## Console Logs for Debugging

When testing, check these logs:

```javascript
// 1. CV Extraction
📄 CV parsed. Projects extracted: 6
📄 Projects data: [...]

// 2. Initial Normalization
📋 Initial formData projects: 6
📋 Initial formData education: [...]
🎓 Degrees: ["__UNMAPPED__Bachelor of CS"]
🏫 Institutions: ["__UNMAPPED__MIT"]

// 3. Entity Creation
Created entities: {
  degrees: 1,
  institutions: 1,
  skills: 5,
  categories: 2
}

// 4. After Remapping
✅ AFTER REMAP - Degrees: ["Bachelor of Computer Science"]
✅ AFTER REMAP - Institutions: ["Massachusetts Institute of Technology"]
Remapping complete. Remaining unmapped: {
  skills: [],
  categories: [],
  degrees: [],
  institutions: []
}

// 5. Dispatch
📊 Projects being dispatched: 6 projects
```

---

## Data Structures

### Before CV Upload
```typescript
// Empty form
{
  education: [{ degree: "", institution: "", passingYear: 2024 }],
  technicalSkills: [{ category: "", skills: [{ skillId: "", proficiency: "" }] }],
  projects: [{ name: "", description: "", ... }]
}
```

### After CV Parse (Unmapped)
```typescript
{
  education: [{
    degree: "__UNMAPPED__Bachelor of Computer Science",
    institution: "__UNMAPPED__MIT",
    passingYear: 2020
  }],
  technicalSkills: [{
    category: "__UNMAPPED__Frontend",
    skills: [
      { skillId: "skill-existing-123", proficiency: "Advanced" },
      { skillId: "__UNMAPPED__React.js", proficiency: "Expert" }
    ]
  }],
  projects: [
    { name: "Project 1", ... },
    { name: "Project 2", ... },
    // ... 6 total
  ]
}
```

### After Entity Creation & Remapping (Clean)
```typescript
{
  education: [{
    degree: "Bachelor of Computer Science",  // ✅ Clean name
    institution: "Massachusetts Institute of Technology",  // ✅ Full name
    passingYear: 2020
  }],
  technicalSkills: [{
    category: "cat-frontend-456",  // ✅ Database ID
    skills: [
      { skillId: "skill-existing-123", proficiency: "Advanced" },
      { skillId: "skill-new-789", proficiency: "Expert" }  // ✅ New ID
    ]
  }],
  projects: [
    { name: "Project 1", ... },
    { name: "Project 2", ... },
    // ... 6 total ✅
  ]
}
```

---

## Testing Checklist

✅ **Upload CV with:**
- Known skills (should map to existing)
- Unknown skills (should create + map)
- Known degrees (should map)
- Unknown degrees (should create + map)
- Known institutions (should map)
- Unknown institutions (should create + map)
- Multiple projects (all should appear)

✅ **Check Console:**
- All 6 categories of logs appear
- No errors
- Remaining unmapped is empty

✅ **Check Form:**
- Step 1: Personal info filled
- Step 2: All education entries, dropdowns work
- Step 3: All skills visible, category dropdown works
- Step 4: All 6 projects visible

✅ **Check Database:**
- New skills created
- New categories created
- New degrees created
- New institutions created (marked unverified)

---

## Edge Cases Handled

### 1. Fuzzy Matching
```
CV: "MIT"
DB: "Massachusetts Institute of Technology"
→ Matches via fuzzy match (85%+ similarity)
→ No duplication
```

### 2. Duplicate Detection
```
CV: "React.js", "React JS", "ReactJS"
→ Fuzzy match finds they're similar
→ Only creates once
```

### 3. Partial Mapping
```
CV: Skills ["React.js" (exists), "Rust" (new)]
→ React.js gets real ID immediately
→ Rust gets temp ID, then real ID after creation
→ Both work in form
```

### 4. Creation Failures
```
If skill creation fails:
→ Added to result.failed[]
→ Other skills still process
→ Form uses temp ID as fallback
```

### 5. No Entity Resolver
```
If resolver unavailable:
→ All entities get __UNMAPPED__ prefix
→ Fallback mapping used
→ Still functional, less accurate
```

---

## Future Enhancements

1. **User Confirmation UI**: Show list of entities to be created before approval
2. **Bulk Edit**: Let users edit inferred data (institution location, etc.)
3. **Admin Queue**: Queue entity creation for admin approval
4. **Duplicate Merge UI**: Show similar entities, let user choose
5. **Better Inference**: Use AI to better infer degree levels, institution types
6. **Undo/Redo**: Allow users to undo CV data import

---

## Troubleshooting

### Skills not showing
**Check**: Console shows `__UNMAPPED__` in skillId
**Fix**: Ensure remapper is running (check logs)

### Projects show only 1
**Check**: Console shows "Projects being dispatched: 6"
**Fix**: Step4Projects needs to re-initialize (already fixed)

### Degrees not in dropdown
**Check**: Console shows `__UNMAPPED__` in degree
**Fix**: Ensure entity creator ran and remapper processed degrees

### Institutions not in dropdown
**Check**: Console shows `__UNMAPPED__` in institution
**Fix**: Ensure entity creator ran and remapper processed institutions

### Duplicate entities created
**Check**: Fuzzy match threshold (85%)
**Fix**: Adjust threshold or improve matching algorithm
