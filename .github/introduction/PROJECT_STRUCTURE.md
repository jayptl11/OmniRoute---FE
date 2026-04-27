# Cấu trúc thư mục dự án

```
my-app/
├── .github/
│   └── copilot-instructions.md     # Hướng dẫn cho GitHub Copilot
│
├── docs/                           # Tài liệu nội bộ cho dev + Copilot
│   ├── PROJECT_STRUCTURE.md        # File này
│   ├── CODING_CONVENTIONS.md
│   ├── COMPONENT_GUIDE.md
│   ├── API_GUIDE.md
│   └── STATE_GUIDE.md
│
├── public/                         # Static assets (favicon, robots.txt…)
│
├── src/
│   ├── assets/                     # Ảnh, font, icon tĩnh
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                 # Shared/reusable UI components
│   │   ├── ui/                     # Primitive components (Button, Input, Modal…)
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.module.css   # (nếu cần)
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   │
│   │   └── common/                 # Composite components dùng nhiều nơi
│   │       ├── PageHeader/
│   │       ├── DataTable/
│   │       └── ErrorBoundary/
│   │
│   ├── features/                   # Feature-based modules (domain logic)
│   │   ├── auth/
│   │   │   ├── components/         # Components chỉ dùng trong feature này
│   │   │   ├── hooks/              # Hooks của feature
│   │   │   ├── stores/             # Zustand slice của feature
│   │   │   ├── api/                # API calls liên quan
│   │   │   ├── types.ts            # Types của feature
│   │   │   └── index.ts            # Public API của feature
│   │   │
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── ...
│   │
│   ├── hooks/                      # Global custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── layouts/                    # Layout wrappers
│   │   ├── MainLayout/
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.ts
│   │   └── AuthLayout/
│   │
│   ├── lib/                        # Third-party setup & utilities
│   │   ├── axios.ts                # Axios instance với interceptors
│   │   ├── queryClient.ts          # TanStack Query client config
│   │   └── utils.ts                # cn(), formatDate()…
│   │
│   ├── pages/                      # Route-level components (thin, chỉ compose)
│   │   ├── HomePage/
│   │   │   ├── HomePage.tsx
│   │   │   └── index.ts
│   │   ├── LoginPage/
│   │   └── ...
│   │
│   ├── routes/                     # Routing config
│   │   ├── index.tsx               # Route definitions
│   │   ├── PrivateRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── stores/                     # Zustand global stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                      # Global TypeScript types
│   │   ├── api.ts                  # API response types
│   │   ├── common.ts               # Shared types
│   │   └── env.d.ts                # Vite env type augmentation
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.example                    # Template env vars (commit lên git)
├── .env.local                      # Env thực (KHÔNG commit)
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Nguyên tắc tổ chức

### Feature-first, không Layer-first

```
# ❌ Layer-first (tránh)
src/
  components/UserList.tsx
  hooks/useUsers.ts
  services/userService.ts

# ✅ Feature-first (áp dụng)
src/features/users/
  components/UserList.tsx
  hooks/useUsers.ts
  api/userApi.ts
```

Mọi logic liên quan đến một domain nằm cùng một folder `features/<name>/`.  
Chỉ những gì cần **share giữa các features** mới nằm ở `src/components/`, `src/hooks/`, `src/stores/`.

### Barrel exports

Mỗi folder expose public API qua `index.ts`:

```ts
// src/features/users/index.ts
export { UserList } from './components/UserList';
export { useUsers } from './hooks/useUsers';
export type { User } from './types';
// Không export internal helpers
```

Bên ngoài chỉ import từ barrel:

```ts
import { UserList, useUsers } from '@/features/users';
```

### Pages mỏng — Features dày

`pages/` chỉ compose layout + feature components, không chứa business logic:

```tsx
// src/pages/UsersPage/UsersPage.tsx
export function UsersPage() {
  return (
    <MainLayout>
      <PageHeader title="Users" />
      <UserList />
    </MainLayout>
  );
}
```

---

## Path Aliases (`vite.config.ts` + `tsconfig.json`)

```ts
// vite.config.ts
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}

// tsconfig.json
"paths": { "@/*": ["./src/*"] }
```

Dùng alias thay relative path dài:

```ts
// ✅
import { Button } from '@/components/ui/Button';

// ❌
import { Button } from '../../../components/ui/Button';
```
