# CV Skill ID Mapping Fix

## The Problem

When extracting skills from a CV, if a skill didn't exist in the database, it was **completely removed** from the form data. This caused skills to disappear entirely.

### Before (Broken)
```typescript
// CV extracts: "React.js", "Node.js"
// Database has: "React.js" ✅ but NOT "Node.js" ❌

// Result in form:
technicalSkills: [{
  category: "...",
  skills: [
    { skillId: "skill-id-123", proficiency: "Advanced" }  // Only React
    // Node.js is MISSING!
  ]
}]
```

## The Root Cause

In `normalizers/index.ts` line 223-226:

```typescript
// OLD CODE (BROKEN)
if (skillMatch.matched && skillMatch.entity) {
  skillsForCategory.push({
    skillId: skillMatch.entity.id,
    proficiency: skill.proficiency || 'Intermediate',
  });
} else {
  // ❌ Skill added to unmappedFields but NOT to skillsForCategory
  unmappedFields.skills.push(skill.name);
  warnings.push(`Skill "${skill.name}" not found in database`);
}
```

## The Solution

### 1. Use Temporary IDs with `__UNMAPPED__` Prefix

**Updated normalizer** (`normalizers/index.ts`):
```typescript
// NEW CODE (FIXED)
if (skillMatch.matched && skillMatch.entity) {
  // Found - use database ID
  skillsForCategory.push({
    skillId: skillMatch.entity.id,
    proficiency: skill.proficiency || 'Intermediate',
  });
} else {
  // ✅ Not found - add with temporary ID
  skillsForCategory.push({
    skillId: `__UNMAPPED__${skill.name}`,  // Will be remapped later
    proficiency: skill.proficiency || 'Intermediate',
  });
  unmappedFields.skills.push(skill.name);
}
```

### 2. Remap After Entity Creation

**Entity remapper** (`entity-remapper.ts`):
```typescript
// Extract skill name from temporary ID
const skillName = skill.skillId.startsWith('__UNMAPPED__')
  ? skill.skillId.replace('__UNMAPPED__', '')  // "React.js"
  : skill.skillId;

// Re-resolve with fresh entity resolver (now has newly created skills)
const skillMatch = await entityResolver.resolveSkill(skillName, categoryName);

if (skillMatch.matched && skillMatch.entity) {
  // ✅ Replace temporary ID with real database ID
  updatedSkills.push({
    ...skill,
    skillId: skillMatch.entity.id  // "skill-id-456"
  });
}
```

## Complete Flow

```
1. CV Extract
   ↓
   "React.js", "Node.js"

2. Normalize (Initial)
   ↓
   technicalSkills: [{
     skills: [
       { skillId: "skill-id-123" },           // React found
       { skillId: "__UNMAPPED__Node.js" }    // Node not found (temp ID)
     ]
   }]

3. User Approves → Create Missing Entities
   ↓
   - Create "Node.js" in database → gets ID "skill-id-456"

4. Remap with Fresh Resolver
   ↓
   - Find "__UNMAPPED__Node.js"
   - Extract "Node.js"
   - Resolve again → finds "skill-id-456"
   - Replace temporary ID

5. Final Result
   ↓
   technicalSkills: [{
     skills: [
       { skillId: "skill-id-123" },    // React
       { skillId: "skill-id-456" }     // Node (now with real ID)
     ]
   }]
```

## What Changed

### File 1: `normalizers/index.ts`
- **Line 225-232**: Always add skill to array, use `__UNMAPPED__` prefix when not found
- **Line 244**: Use `__UNMAPPED__` prefix for categories too

### File 2: `entity-remapper.ts`
- **Line 101-103**: Extract category name from `__UNMAPPED__` prefix
- **Line 142-144**: Extract skill name from `__UNMAPPED__` prefix
- **Line 147-149**: Find parsed skill by extracted name
- **Line 153-165**: Re-resolve skills with `__UNMAPPED__` prefix

## Testing

After this fix, check:

1. **Console logs**:
   ```
   Created entities: { skills: 5, categories: 2, ... }
   Remapping complete. Remaining unmapped: { skills: [], categories: [] }
   ```

2. **Redux DevTools** - check `technicalSkills`:
   ```typescript
   {
     category: "abc123",  // ✅ Database ID, not "__UNMAPPED__Frontend"
     skills: [{
       skillId: "def456"  // ✅ Database ID, not "__UNMAPPED__React.js"
     }]
   }
   ```

3. **Form display**: All skills should be visible in dropdown

## Why This Works

1. **No Data Loss**: Skills are never removed, even if not found initially
2. **Clear Marker**: `__UNMAPPED__` prefix clearly indicates what needs remapping
3. **Two-Phase Approach**:
   - Phase 1: Keep everything with temporary IDs
   - Phase 2: Replace temporary IDs with real ones after creation
4. **Name Preservation**: Original skill name is embedded in the temporary ID for easy extraction

## Edge Cases Handled

- **Skill exists but category doesn't**: Category gets `__UNMAPPED__` prefix, skill might have real ID
- **Multiple skills unmapped**: Each gets unique `__UNMAPPED__` prefix with its name
- **Remapping fails**: Skill keeps `__UNMAPPED__` prefix (better than disappearing)
- **No entity resolver**: All skills get `__UNMAPPED__` prefix
