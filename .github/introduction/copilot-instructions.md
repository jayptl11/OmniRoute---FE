# GitHub Copilot Instructions

> Đây là file hướng dẫn chính cho GitHub Copilot. Mọi code sinh ra phải tuân thủ các quy tắc dưới đây.

## Stack & Runtime

- **Framework**: React 18+ với Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3 + CSS Modules khi cần scoped styles
- **State Management**: Zustand (global) + React Query / TanStack Query (server state)
- **Routing**: React Router v6
- **Form**: React Hook Form + Zod validation
- **HTTP**: Axios với custom instance
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Quy tắc bắt buộc

### 1. TypeScript

- **KHÔNG dùng `any`** — dùng `unknown` rồi narrow type, hoặc define interface/type rõ ràng.
- Mọi props component phải có interface/type tường minh.
- Dùng `satisfies` khi cần type-check object literal mà không mất inference.
- Prefer `type` cho union/intersection, `interface` cho object shape có thể extend.

```ts
// ✅ Đúng
interface UserCardProps {
  user: User;
  onSelect?: (id: string) => void;
}

// ❌ Sai
const MyComp = (props: any) => { ... }
```

### 2. Component

- **Functional component** duy nhất — không dùng class component.
- Export **named export** (không dùng default export cho component).
- Tên file = tên component, viết **PascalCase**: `UserCard.tsx`.
- Mỗi component nằm trong folder riêng kèm `index.ts` re-export.

```tsx
// ✅ Đúng — src/components/UserCard/UserCard.tsx
export function UserCard({ user, onSelect }: UserCardProps) { ... }

// src/components/UserCard/index.ts
export { UserCard } from './UserCard';
```

### 3. Hooks

- Custom hook bắt đầu bằng `use`, nằm trong `src/hooks/`.
- Không gọi hook bên trong điều kiện / vòng lặp.
- Khi fetch data: dùng TanStack Query, không dùng `useEffect` + `fetch` trực tiếp.

### 4. State

- **Local state**: `useState` / `useReducer`.
- **Global UI state**: Zustand store trong `src/stores/`.
- **Server/async state**: TanStack Query — cache, invalidate, optimistic update.
- Không đặt server data vào Zustand.

### 5. Styling

- Ưu tiên **Tailwind utility classes**.
- Class name phức tạp / dynamic: dùng `clsx` hoặc `cn()` (shadcn util).
- Scoped styles phức tạp: CSS Modules (`Component.module.css`).
- **Không dùng inline style** trừ giá trị dynamic thực sự (vd: `style={{ width: pct + '%' }}`).

### 6. File & Folder

- Tham khảo `docs/PROJECT_STRUCTURE.md` cho cấu trúc thư mục.
- Import dùng **alias path** `@/` (map tới `src/`): `import { Button } from '@/components/ui/Button'`.
- Barrel file (`index.ts`) ở mỗi folder public API.

### 7. Error Handling

- Mọi async function phải có try/catch hoặc `.catch()`.
- Dùng **Error Boundary** cho feature-level component.
- API error: map về `AppError` type, không throw raw AxiosError ra UI.

### 8. Performance

- `React.memo` chỉ khi đo thấy re-render thừa.
- `useMemo` / `useCallback` chỉ khi dependency thực sự expensive.
- Lazy load route với `React.lazy` + `Suspense`.
- Image: dùng `loading="lazy"` và đúng `width`/`height`.

### 9. Accessibility

- Mọi `<img>` phải có `alt`.
- Interactive element phải focusable và có `aria-label` khi cần.
- Không dùng `div` / `span` làm button — dùng `<button>`.

### 10. Test

- Mỗi component có file test `Component.test.tsx` cùng folder.
- Test theo hành vi người dùng (RTL `getByRole`, `getByText`) — không test implementation detail.
- Mock API bằng `msw` (Mock Service Worker).

---

## Tham khảo thêm

| File | Nội dung |
|------|----------|
| `docs/PROJECT_STRUCTURE.md` | Cấu trúc thư mục chi tiết |
| `docs/CODING_CONVENTIONS.md` | Convention đặt tên, import order, comment |
| `docs/COMPONENT_GUIDE.md` | Pattern tạo component, form, modal |
| `docs/API_GUIDE.md` | Cách gọi API, error handling, React Query |
| `docs/STATE_GUIDE.md` | Zustand store pattern |
