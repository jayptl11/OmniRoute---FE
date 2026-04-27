# State Management Guide

## Nguyên tắc chọn state

```
Câu hỏi                                   → Dùng
─────────────────────────────────────────────────────────────────
Chỉ dùng trong 1 component?              → useState / useReducer
Chia sẻ giữa vài component liền kề?     → Lift state up + props
Dữ liệu từ server / async?              → TanStack Query
UI state toàn cục (modal, theme, toast)? → Zustand
Auth / session?                          → Zustand (persist)
```

**Không đặt server data vào Zustand** — đó là việc của TanStack Query.

---

## Zustand — Store Pattern

### Store cơ bản

```ts
// src/stores/uiStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  toasts: Toast[];
  // Actions
  toggleSidebar: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      toasts: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

      addToast: (toast) =>
        set(
          (state) => ({
            toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
          }),
          false,
          'addToast',
        ),

      removeToast: (id) =>
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'removeToast',
        ),
    }),
    { name: 'ui-store' },
  ),
);
```

### Auth Store với persist

```ts
// src/stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,

        setAuth: (user, token) =>
          set({ user, token, isAuthenticated: true }, false, 'setAuth'),

        logout: () =>
          set({ user: null, token: null, isAuthenticated: false }, false, 'logout'),
      }),
      {
        name: 'auth-storage',          // localStorage key
        partialize: (state) => ({      // Chỉ persist token, không persist toàn bộ
          token: state.token,
          user: state.user,
        }),
      },
    ),
    { name: 'auth-store' },
  ),
);

// Selector helpers (tránh re-render không cần thiết)
export const selectUser = (state: AuthState) => state.user;
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
```

### Dùng selector để tối ưu re-render

```tsx
// ✅ Chỉ re-render khi token thay đổi
const token = useAuthStore((s) => s.token);

// ✅ Lấy action — action không thay đổi nên không gây re-render
const logout = useAuthStore((s) => s.logout);

// ❌ Subscribe toàn bộ store → re-render mỗi khi bất kỳ field thay đổi
const store = useAuthStore();
```

### Slice pattern cho store lớn

```ts
// src/stores/slices/filterSlice.ts
import type { StateCreator } from 'zustand';

export interface FilterSlice {
  search: string;
  status: 'all' | 'active' | 'inactive';
  setSearch: (search: string) => void;
  setStatus: (status: FilterSlice['status']) => void;
  resetFilters: () => void;
}

const initialFilters = { search: '', status: 'all' as const };

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
  ...initialFilters,

  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  resetFilters: () => set(initialFilters),
});

// Combine trong store chính:
// src/stores/appStore.ts
import { create } from 'zustand';
import { createFilterSlice, type FilterSlice } from './slices/filterSlice';

type AppStore = FilterSlice /* & OtherSlice */;

export const useAppStore = create<AppStore>()((...a) => ({
  ...createFilterSlice(...a),
}));
```

---

## useReducer — Local complex state

Khi component có nhiều state liên quan và transition phức tạp:

```ts
type State =
  | { phase: 'idle' }
  | { phase: 'editing'; draft: string }
  | { phase: 'saving' }
  | { phase: 'error'; error: string };

type Action =
  | { type: 'START_EDIT'; initial: string }
  | { type: 'UPDATE_DRAFT'; draft: string }
  | { type: 'SAVE' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'CANCEL' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_EDIT': return { phase: 'editing', draft: action.initial };
    case 'UPDATE_DRAFT':
      return state.phase === 'editing' ? { ...state, draft: action.draft } : state;
    case 'SAVE': return { phase: 'saving' };
    case 'SAVE_SUCCESS': return { phase: 'idle' };
    case 'SAVE_ERROR': return { phase: 'error', error: action.error };
    case 'CANCEL': return { phase: 'idle' };
    default: return state;
  }
}

// Dùng trong component:
const [state, dispatch] = useReducer(reducer, { phase: 'idle' });
```

---

## Tóm tắt Flow

```
User Action
    │
    ▼
Component dispatch / call mutation
    │
    ├─► Zustand action   ──► UI updates globally (sidebar, toast…)
    │
    └─► TanStack Query mutation
            │
            ▼
          API call
            │
            ├─ onSuccess ──► invalidateQueries ──► refetch ──► UI update
            └─ onError   ──► show toast (via Zustand addToast)
```
