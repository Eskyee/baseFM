---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript & React Guidelines for baseFM

## TypeScript Rules

### No Unsafe Types
```typescript
// ❌ Avoid any
const data: any = response.json();

// ✅ Use proper types or unknown with narrowing
const data: unknown = response.json();
if (typeof data === 'object' && data !== null && 'streams' in data) { ... }
```

### Non-null Assertions
Only use `!` when you have verified the value cannot be null/undefined at that point in code. Add a comment explaining why if it's not obvious:
```typescript
// ✅ With context
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Required env var, validated at startup

// ❌ Lazy assertion
const stream = streams.find(s => s.id === id)!; // Could be undefined
```

### Exported Function Return Types
```typescript
// ✅ Explicit return type on exported functions
export async function getStream(id: string): Promise<Stream | null> { ... }

// ⚠️ Inferred return type acceptable for simple cases
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}
```

## React Patterns

### Server vs Client Components
- Default to server components. Only add `'use client'` when the component needs:
  - Browser APIs (`window`, `document`, `localStorage`)
  - Event handlers (`onClick`, `onChange`)
  - React hooks (`useState`, `useEffect`, `useContext`)
  - wagmi/OnchainKit hooks

### useEffect Cleanup
```typescript
// ✅ Always clean up subscriptions
useEffect(() => {
  const subscription = supabase
    .channel('chat')
    .on('postgres_changes', { ... }, handler)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Error Handling in Components
- All async operations in `useEffect` must handle errors.
- Never let an unhandled promise rejection reach the user.
- Use the `ErrorBoundary` component for graceful error recovery on pages.

### wagmi Hooks
```typescript
// ✅ Always handle all states
const { data, isLoading, isError, error } = useReadContract({ ... });

if (isLoading) return <Skeleton />;
if (isError) return <p>Failed to load: {error?.message}</p>;
```

### Performance
- Large lists (DJ roster, schedule, chat) should use virtualization or pagination.
- Images must use `next/image` with proper `width`/`height` or `fill` props.
- Don't import entire icon libraries — import only the icons you use from `lucide-react`.

## Tailwind CSS

- Use design system colors: `base-blue` (#0052FF), `base-dark` (#0A0B0D).
- Responsive: `sm:`, `md:`, `lg:` prefixes — design mobile-first without prefix, then enhance for larger screens.
- No magic numbers in classnames for spacing/colors if a Tailwind token exists.
- For conditional classes, use template literals or `clsx`/`cn`, not string concatenation.

## File Structure Conventions

- One component per file.
- Co-locate types with the file that uses them, unless shared across 3+ files (then move to `types/`).
- Database types belong in `lib/db/*.ts` alongside the CRUD functions.
