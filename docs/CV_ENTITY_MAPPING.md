# CV Entity Mapping & Auto-Creation

## Overview

When extracting data from CVs using Gemini AI, we get plain text values (e.g., "React.js", "Bachelor of Computer Science", "MIT"). However, our forms use **key-value pairs** where:
- **Key** = Database ID (e.g., `skill-id-123`)
- **Value** = Display name (e.g., "React.js")

This system automatically handles the mapping from CV text values to database IDs, creating missing entities as needed.

## Flow Diagram

```
┌─────────────────┐
│  Upload CV      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Extract Data with Gemini   │
│  (Plain text values)        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Entity Resolution          │
│  Try to match with DB       │
└────────┬────────────────────┘
         │
         ├─── Matched ────────────► Use existing ID
         │
         └─── Not Matched ────────► Add to unmappedFields
                                    │
                                    ▼
                          ┌───────────────────────┐
                          │  User Reviews CV      │
                          │  & Approves           │
                          └──────────┬────────────┘
                                     │
                                     ▼
                          ┌───────────────────────┐
                          │  Create Missing       │
                          │  Entities             │
                          └──────────┬────────────┘
                                     │
                                     ▼
                          ┌───────────────────────┐
                          │  Reload Entity        │
                          │  Resolver             │
                          └──────────┬────────────┘
                                     │
                                     ▼
                          ┌───────────────────────┐
                          │  Re-map Form Data     │
                          │  with IDs             │
                          └──────────┬────────────┘
                                     │
                                     ▼
                          ┌───────────────────────┐
                          │  Dispatch to Form     │
                          │  (Ready to use!)      │
                          └───────────────────────┘
```

## Components

### 1. Entity Resolver (`entity-resolver.ts`)

**Purpose**: Match CV text values to existing database entities

**Methods**:
- `resolveDegree(degreeName)` - Find degree by name/shortName
- `resolveInstitution(institutionName)` - Find institution by name
- `resolveSkill(skillName, categoryHint?)` - Find skill by name
- `resolveSkillCategory(categoryName)` - Find category by name

**Matching Strategy**:
1. **Exact match** - Direct string comparison
2. **Fuzzy match** - Levenshtein distance (75%+ similarity)
3. **Category mapping** - Common aliases (e.g., "frontend" → "Frontend")

### 2. Unmapped Entity Creator (`unmapped-entity-creator.ts`)

**Purpose**: Create missing entities that weren't found in the database

**Process**:
1. **Check duplicates** - Use fuzzy matching to avoid creating duplicates
2. **Create in order**:
   - Skill Categories (needed for skills)
   - Degrees (with inferred metadata)
   - Institutions (marked as unverified)
   - Skills (assigned to categories)
3. **Return ID mappings** - Map original names to new IDs

**Example**:
```typescript
// Input
unmappedFields.skills = ["React.js", "Node.js", "Rust"]

// Output
skillMap = {
  "React.js" => "skill-id-123",
  "Node.js" => "skill-id-456",
  "Rust" => "skill-id-789"
}
```

**Smart Inference**:
- **Degrees**: Infers level (Undergraduate/Graduate/PhD) and short name
- **Institutions**: Infers type (University/College/School) based on name
- **Skills**: Assigns to "Other" category by default

### 3. Entity Remapper (`entity-remapper.ts`)

**Purpose**: Re-resolve all entities after creation to get proper IDs

**Why Needed**:
During initial normalization, unmapped skills are stored as:
```typescript
{
  skillId: "React.js",  // ❌ This is a name, not an ID!
  proficiency: "Advanced"
}
```

The remapper fixes this by:
1. **Reloading** the entity resolver (to get newly created entities)
2. **Re-matching** each skill/degree/institution
3. **Updating** form data with actual IDs:
```typescript
{
  skillId: "skill-id-123",  // ✅ Proper database ID!
  proficiency: "Advanced"
}
```

### 4. CVIngestionWrapper (`CVIngestionWrapper.tsx`)

**Purpose**: Orchestrate the entire CV ingestion flow

**On User Approval**:
```typescript
1. Extract unmapped categories from parsed CV
2. Check if there are any unmapped entities
3. If yes:
   a. Call createUnmappedEntities()
   b. Call remapFormDataWithEntities()
   c. Dispatch remapped data to Redux
4. If no:
   a. Dispatch original data to Redux
```

## Data Structure Examples

### Input (from Gemini CV extraction)
```json
{
  "skills": {
    "categories": [
      {
        "categoryName": "Frontend Development",
        "skills": [
          { "name": "React.js", "proficiency": "Advanced" },
          { "name": "Vue.js", "proficiency": "Intermediate" }
        ]
      }
    ]
  },
  "education": [
    {
      "degree": "Bachelor of Computer Science",
      "institution": "MIT",
      "graduationYear": 2020
    }
  ]
}
```

### After Entity Creation & Remapping
```json
{
  "technicalSkills": [
    {
      "category": "category-id-123",  // ✅ Database ID
      "skills": [
        {
          "skillId": "skill-id-456",  // ✅ Database ID
          "proficiency": "Advanced"
        },
        {
          "skillId": "skill-id-789",  // ✅ Database ID
          "proficiency": "Intermediate"
        }
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Computer Science",  // ✅ Matched name
      "institution": "Massachusetts Institute of Technology",  // ✅ Full name
      "passingYear": 2020
    }
  ]
}
```

## Error Handling

### Failed Entity Creation
If an entity fails to create:
- It's added to `result.failed[]`
- The system continues with other entities
- Form data uses the original text value as fallback

### Missing Entity Resolver
If entity resolver is not available:
- Falls back to `updateFormDataWithEntityIds()` (basic mapping)
- Uses string matching instead of re-resolution
- Still functional but less accurate

## Console Logs

When debugging, check these logs:

```typescript
// 1. Entities created
"Created entities: { degrees: 2, institutions: 1, skills: 5, categories: 2 }"

// 2. Remapping result
"Remapping complete. Remaining unmapped: { skills: [], categories: [], ... }"

// 3. If entities still unmapped
"Remaining unmapped: { skills: ['Obscure-Framework-v1'], ... }"
```

## Form Integration

The multi-step form components automatically work with IDs:

### Education Form
```typescript
// Uses degree and institution NAMES (not IDs)
education.degree = "Bachelor of Computer Science"  // ✅
education.institution = "MIT"  // ✅
```

### Skills Form
```typescript
// Uses category and skill IDs
technicalSkills[0].category = "category-id-123"  // ✅
technicalSkills[0].skills[0].skillId = "skill-id-456"  // ✅
```

## Future Enhancements

1. **User Confirmation** - Show a list of entities that will be created before approval
2. **Bulk Edit** - Allow users to edit inferred data (e.g., institution location)
3. **Admin Approval** - Queue institution/degree creation for admin review
4. **Duplicate Detection UI** - Show similar existing entities and let users choose
5. **Entity Merging** - Merge duplicate entities created by different users

## Troubleshooting

### Skills not showing in form
**Check**: Is `skillId` a valid database ID or a name string?
```typescript
// ❌ Wrong
{ skillId: "React.js" }

// ✅ Correct
{ skillId: "skill-id-123" }
```
**Solution**: Ensure `remapFormDataWithEntities()` is being called

### Duplicate entities created
**Check**: Fuzzy matching threshold (currently 85%)
**Solution**: Adjust `matchThreshold` in entity-resolver.ts

### Institution marked as unverified
**Expected**: All auto-created institutions need admin verification
**Solution**: Admin should review and verify institutions in admin panel
