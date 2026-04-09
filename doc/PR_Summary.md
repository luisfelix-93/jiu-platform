# PR: fix(student): load enrolled academies on StudentLayout mount

## Summary

Fixes a bug where a student's enrolled academies were not rendering in the **"Minhas Academias"** section of the `StudentProfile` page, even when the student had an active academy enrollment in the database.

---

## Problem

The `StudentProfile.tsx` component reads `myAcademies` from `useAcademyStore`, but neither the component itself nor the parent `StudentLayout.tsx` ever called `fetchMyAcademies()` to load the data from the API.

Because the Zustand persist middleware is configured to only persist `activeAcademy` (not `myAcademies`), the list would always start as an empty array `[]` on every page load, causing the profile to incorrectly display:

> *"Você não está matriculado em nenhuma academia no momento."*

The enrollment existed correctly in the database — only the frontend data-fetching step was missing.

---

## Root Cause

```
useAcademyStore.ts
  └── partialize: (state) => ({ activeAcademy: state.activeAcademy })
       ↑ myAcademies is NOT persisted — must be fetched on mount

StudentLayout.tsx  ❌ (before fix)
  └── No fetchMyAcademies() call

ProfessorLayout.tsx  ✅ (reference implementation)
  └── useEffect(() => { fetchMyAcademies(); }, [fetchMyAcademies]);
```

---

## Fix

Added `fetchMyAcademies()` call inside a `useEffect` in `StudentLayout.tsx`, mirroring the same pattern already used in `ProfessorLayout.tsx`.

**File changed:** `jiu-app/src/pages/student/StudentLayout.tsx`

```diff
+import { useEffect } from 'react';
 import { Outlet } from 'react-router-dom';
 import { DashboardLayout } from '../../components/layout/DashboardLayout';
 import { Home, Calendar, BookOpen, Trophy, User } from 'lucide-react';
+import { useAcademyStore } from '../../stores/useAcademyStore';

 export const StudentLayout = () => {
+    const { fetchMyAcademies } = useAcademyStore();
+
+    useEffect(() => {
+        fetchMyAcademies();
+    }, [fetchMyAcademies]);
+
     const navItems = [
```

By placing the fetch at the **Layout** level (the common parent), `myAcademies` is guaranteed to be available across all student pages — `StudentProfile`, `StudentHome`, `StudentCalendar`, etc. — without requiring each page to independently trigger the load.

---

## Affected Pages

| Page | Impact |
|---|---|
| `StudentProfile.tsx` | ✅ Now correctly renders the "Minhas Academias" list |
| `StudentHome.tsx` | ✅ Benefits from pre-loaded academies |
| `StudentCalendar.tsx` | ✅ Benefits from pre-loaded academies |
| `StudentProgress.tsx` | ✅ Benefits from pre-loaded academies |

---

## Type of Change

- [x] Bug fix (non-breaking)

## Testing

1. Log in as a student who is enrolled in at least one academy.
2. Navigate to **Perfil** (`/aluno/perfil`).
3. Verify the **"Minhas Academias"** section lists the correct academies.
4. Confirm the "Você não está matriculado..." message no longer appears for enrolled students.
