# Coding Conventions

## Đặt tên

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component | PascalCase | `UserCard`, `DataTable` |
| Hook | camelCase + prefix `use` | `useAuth`, `useDebounce` |
| Store | camelCase + suffix `Store` | `authStore`, `uiStore` |
| Utility fn | camelCase | `formatDate`, `cn` |
| Constant | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Type / Interface | PascalCase | `User`, `ApiResponse<T>` |
| Enum | PascalCase (key PascalCase) | `Role.Admin`, `Status.Active` |
| File component | PascalCase | `UserCard.tsx` |
| File hook/util | camelCase | `useAuth.ts`, `formatDate.ts` |
| CSS Module | camelCase class | `.cardWrapper`, `.primaryBtn` |

---

## Import Order

ESLint `import/order` enforce thứ tự sau (cách nhau bởi blank line):

```ts
// 1. Node built-ins
import path from 'path';

// 2. Third-party packages
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal alias (@/)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth';

// 4. Relative imports
import { formatDate } from './utils';
import type { UserCardProps } from './types';
```

---

## TypeScript Patterns

### API Response wrapper

```ts
// src/types/api.ts
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### AppError

```ts
// src/types/common.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Discriminated union cho state

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: AppError };
```

### Type guard

```ts
function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
```

---

## Comment & JSDoc

- Comment giải thích **tại sao**, không giải thích **cái gì** (code tự nói điều đó).
- Public component/hook/util: viết JSDoc tóm tắt.

```ts
/**
 * Debounce một value — hữu ích để tránh gọi API mỗi keystroke.
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian chờ (ms), mặc định 300
 */
export function useDebounce<T>(value: T, delay = 300): T { ... }
```

- `// TODO:` cho việc cần làm sau.
- `// FIXME:` cho bug đã biết.
- `// HACK:` cho workaround tạm thời (kèm lý do).

---

## Async / Error Handling

```ts
// ✅ Đúng — wrap lỗi thành AppError
async function fetchUser(id: string): Promise<User> {
  try {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`);
    return data.data;
  } catch (err) {
    if (isAxiosError(err)) {
      throw new AppError(
        err.response?.data?.message ?? 'Không thể tải user',
        'FETCH_USER_FAILED',
        err.response?.status,
      );
    }
    throw err;
  }
}

// ❌ Sai — throw raw error ra ngoài
async function fetchUser(id: string) {
  const { data } = await axios.get(`/users/${id}`); // unhandled
  return data;
}
```

---

## Conditional Rendering

```tsx
// ✅ Ngắn gọn với &&
{isLoading && <Spinner />}

// ✅ Ternary cho 2 nhánh rõ ràng
{user ? <UserCard user={user} /> : <EmptyState />}

// ✅ Extract ra variable nếu phức tạp
const content = (() => {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <UserList users={data} />;
})();

return <div>{content}</div>;
```

---

## Không làm

```ts
// ❌ Mutation trực tiếp state
state.users.push(newUser);          // dùng setState / store action

// ❌ Magic number
setTimeout(fn, 86400000);           // dùng const DAY_MS = 24 * 60 * 60 * 1000

// ❌ Nested ternary
a ? b ? c : d : e                   // extract ra if/else hoặc component

// ❌ console.log trong production code
console.log('debug');               // dùng logger utility hoặc xoá đi

// ❌ Hardcode URL/string nhạy cảm
const url = 'https://api.prod.com'; // dùng import.meta.env.VITE_API_URL
```
